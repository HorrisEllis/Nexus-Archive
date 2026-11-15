param([string]$Src, [string]$Out)
Add-Type -AssemblyName System.IO.Compression.FileSystem
$files = Get-ChildItem -LiteralPath $Src -File | Sort-Object Name
$rows = $files | ForEach-Object -ThrottleLimit 6 -Parallel {
    $f = $_
    $row = [ordered]@{ name = $f.Name; size = $f.Length; mtime = $f.LastWriteTime.ToString('s') }
    $row.sha256 = (Get-FileHash -LiteralPath $f.FullName -Algorithm SHA256).Hash.ToLower()
    if ($f.Extension -ieq '.zip') {
        try {
            $z = [System.IO.Compression.ZipFile]::OpenRead($f.FullName)
            try {
                $ents = @($z.Entries | Where-Object { -not $_.FullName.EndsWith('/') -and -not $_.FullName.EndsWith('\') })
                $row.entries = $ents.Count
                $row.unc = ($ents | Measure-Object Length -Sum).Sum
                $tops = @{}
                $nm = 0; $git = $false
                $newest = [datetime]::MinValue; $oldest = [datetime]::MaxValue
                $sb = [System.Text.StringBuilder]::new()
                $vers = [System.Collections.Generic.List[object]]::new()
                $docs = [System.Collections.Generic.List[string]]::new()
                foreach ($e in ($ents | Sort-Object FullName)) {
                    $p = $e.FullName.Replace('\', '/')
                    $t = $p.Split('/')[0]
                    $tops[$t] = 1 + [int]$tops[$t]
                    $isNm = $p.Contains('node_modules/')
                    $isGit = ('/' + $p).Contains('/.git/')
                    if ($isNm) { $nm++ }
                    if ($isGit) { $git = $true }
                    $d = $e.LastWriteTime.DateTime
                    if ($d.Year -gt 1980) { if ($d -gt $newest) { $newest = $d }; if ($d -lt $oldest) { $oldest = $d } }
                    [void]$sb.Append($p).Append('|').Append($e.Crc32.ToString('x8')).Append('|').Append($e.Length).Append("`n")
                    if ($isNm -or $isGit) { continue }
                    $depth = $p.Split('/').Count - 1
                    $base = $p.Split('/')[-1]
                    if ($depth -le 2 -and $base -eq 'package.json' -and $e.Length -lt 200000) {
                        try {
                            $sr = [System.IO.StreamReader]::new($e.Open()); $txt = $sr.ReadToEnd(); $sr.Dispose()
                            $j = $txt | ConvertFrom-Json
                            $vers.Add(@($p, [string]$j.name, [string]$j.version))
                        } catch { $vers.Add(@($p, 'ERR', '')) }
                    } elseif ($depth -le 2 -and $base -match '^VERSION(\.txt|\.md)?$' -and $e.Length -lt 5000) {
                        $sr = [System.IO.StreamReader]::new($e.Open()); $txt = $sr.ReadToEnd().Trim(); $sr.Dispose()
                        $vers.Add(@($p, 'VERSIONFILE', $txt.Substring(0, [Math]::Min(80, $txt.Length))))
                    }
                    if ($base -match '(?i)(changelog|handoff|decision|idea|roadmap|todo|session|backlog|history|release)' -and $base -match '(?i)\.(md|txt)$') { $docs.Add($p) }
                }
                $row.tops = ($tops.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 20 | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join '; '
                $row.ntops = $tops.Count
                $row.has_git = $git
                $row.node_modules = $nm
                if ($newest -ne [datetime]::MinValue) { $row.newest = $newest.ToString('s'); $row.oldest = $oldest.ToString('s') }
                $sha = [System.Security.Cryptography.SHA256]::Create()
                $row.content_hash = ([BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($sb.ToString()))) -replace '-', '').Substring(0, 16).ToLower()
                $row.vers = @($vers | Select-Object -First 12)
                $row.ndocs = $docs.Count
                $row.docs = @($docs | Select-Object -First 40)
            } finally { $z.Dispose() }
        } catch { $row.error = $_.Exception.Message }
    }
    [pscustomobject]$row
}
$rows | Sort-Object name | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $Out -Encoding utf8
"done $($rows.Count)"
