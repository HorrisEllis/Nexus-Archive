# Applies the single version line (records2.json) to the local history repo and to the archives on disk.
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$src = 'D:\Projects\Nexus\Nexus Orchastrator'; $repo = Join-Path $src 'nexus-history'
$r = Get-Content (Join-Path $here 'records2.json') -Raw | ConvertFrom-Json -DateKind String
$bySeq = @{}; foreach ($x in $r) { if ($x.kind -ne 'non-archive') { $bySeq['{0:0000}' -f [int]$x.seq] = $x } }

# 1. drop the docs commit and every tag (all local, nothing was pushed)
$tip = (git -C $repo log main --format='%H %s' | Where-Object { $_ -match '^\w+ snap 0792:' }) -split ' ' | Select-Object -First 1
if (-not $tip) { throw 'snap 0792 not found' }
git -C $repo update-ref refs/heads/main $tip
$del = git -C $repo for-each-ref refs/tags --format='delete %(refname)'
if ($del) { [IO.File]::WriteAllText((Join-Path $here 'del.txt'), (($del -join "`n") + "`n")); cmd /c "git -C `"$repo`" update-ref --stdin < `"$here\del.txt`"" }

# 2. rewrite commit messages (commit objects only; file contents are untouched)
$stream = Join-Path $here 'export.fi'
cmd /c "git -C `"$repo`" fast-export main artifacts --no-data > `"$stream`""
$L = [Text.Encoding]::Latin1; $U = [Text.UTF8Encoding]::new($false)
$txt = $L.GetString([IO.File]::ReadAllBytes($stream)); $sb = [Text.StringBuilder]::new($txt.Length + 200000)
$rx = [regex]'(?m)^committer [^\n]*\ndata (\d+)\n'; $pos = 0; $n = 0
foreach ($m in $rx.Matches($txt)) {
    if ($m.Index -lt $pos) { continue }
    $len = [int]$m.Groups[1].Value; $start = $m.Index + $m.Length
    $headEnd = $m.Groups[1].Index - 5   # start of the "data N" line
    [void]$sb.Append([string]$txt.Substring($pos, $headEnd - $pos))
    $msg = $U.GetString($L.GetBytes($txt.Substring($start, $len)))
    if ($msg -match '^snap (\d{4}):') {
        $x = $bySeq[$matches[1]]; if (-not $x) { throw "unknown seq $($matches[1])" }
        $msg = [regex]::Replace($msg, '^snap (\d{4}): Nexus (\(unversioned\)|v\S+)', "snap `$1: Nexus v$($x.canon)")
        $msg = [regex]::Replace($msg, '(?m)^Renamed-To: .*$', "Renamed-To: $($x.newName2)")
        $ins = "Version: $($x.canon)" + $(if ($x.declared) { "`nVersion-Claimed: $($x.declared)" })
        $msg = [regex]::Replace($msg, '(?m)^(Snapshot-Kind: .*)$', "`$1`n$ins")
        $n++
    }
    $out = $L.GetString($U.GetBytes($msg))
    [void]$sb.Append([string]"data $($out.Length)`n"); [void]$sb.Append([string]$out)
    $pos = $start + $len
}
[void]$sb.Append([string]$txt.Substring($pos))
[IO.File]::WriteAllBytes($stream, $L.GetBytes($sb.ToString()))
cmd /c "git -C `"$repo`" fast-import --force --quiet < `"$stream`""
if ($LASTEXITCODE) { throw 'fast-import failed' }
Remove-Item $stream
"messages rewritten: $n   main: $(git -C $repo rev-list --count main)  artifacts: $(git -C $repo rev-list --count artifacts)"
git -C $repo checkout -q -f main; git -C $repo clean -qfd

# 3. rename and refile the archives
$cur = @{}; Import-Csv (Join-Path $src '_provenance\MANIFEST.csv') | Where-Object folder | ForEach-Object { $cur[$_.original_name] = Join-Path $_.folder $_.new_name }
function Folder($x, $dup) { if ($dup) { 'archives\_duplicates' } elseif ($x.kind -in 'empty', 'git-only') { 'archives\_empty' } else { $null = $x.canonBase -match '^(\d+)\.(\d+)'; "archives\v$($matches[1]).$($matches[2])" } }
$moves = foreach ($x in $r) { if ($x.kind -eq 'non-archive') { continue }
    [pscustomobject]@{ from = $cur[$x.name]; to = (Join-Path (Folder $x $false) $x.newName2) }
    for ($i = 0; $i -lt $x.dupes.Count; $i++) { [pscustomobject]@{ from = $cur[$x.dupes[$i]]; to = (Join-Path (Folder $x $true) $x.dupeNewNames2[$i]) } } }
$bad = @($moves | Where-Object { -not $_.from -or -not (Test-Path -LiteralPath (Join-Path $src $_.from)) })
if ($bad.Count -or ($moves.to | Sort-Object -Unique).Count -ne $moves.Count) { throw "move check failed: $($bad.Count) missing" }
# two passes so a new name can never collide with a not-yet-moved file
$stage = Join-Path $src 'archives\_staging'; New-Item -ItemType Directory -Force $stage | Out-Null
$i = 0; foreach ($mv in $moves) { $mv | Add-Member tmp (Join-Path $stage ("{0:00000}.zip" -f $i++)); Move-Item -LiteralPath (Join-Path $src $mv.from) -Destination $mv.tmp }
foreach ($mv in $moves) { $d = Join-Path $src (Split-Path $mv.to); if (-not (Test-Path $d)) { New-Item -ItemType Directory -Force $d | Out-Null }; Move-Item -LiteralPath $mv.tmp -Destination (Join-Path $src $mv.to) }
Remove-Item $stage
Get-ChildItem (Join-Path $src 'archives') -Directory | Where-Object { -not (Get-ChildItem $_.FullName -Force) } | Remove-Item
"archives refiled: $($moves.Count)   zips under archives: $((Get-ChildItem (Join-Path $src 'archives') -Recurse -File -Filter *.zip).Count)   folders: $((Get-ChildItem (Join-Path $src 'archives') -Directory).Count)"

# 4. records3.json: the shape the doc generators read
foreach ($x in $r) { if ($x.kind -eq 'non-archive') { continue }; $x.version = $x.canonBase; $x.newName = $x.newName2; $x.dupeNewNames = $x.dupeNewNames2 }
$r | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $here 'records3.json') -Encoding utf8
'records3.json written'
