# One changelog per version, each with a ledger of every build filed under it, plus a full file-level ledger CSV.
param([string]$Records, [string]$Repo, [string]$Out)
$ErrorActionPreference = 'Stop'
$r = Get-Content $Records -Raw | ConvertFrom-Json -DateKind String
$enc = [Text.UTF8Encoding]::new($false)
$cl = Join-Path $Out 'changelogs'; $lg = Join-Path $Out 'ledger'
foreach ($d in $cl, $lg) { if (Test-Path $d) { Remove-Item $d -Recurse -Force }; New-Item -ItemType Directory -Force $d | Out-Null }
$sha = @{}; git -C $Repo log main artifacts --format='%H %s' | ForEach-Object { if ($_ -match '^(\w+) snap (\d{4}):') { $sha[$matches[2]] = $matches[1] } }
function Seq($x) { '{0:0000}' -f [int]$x.seq }
function Sys($p) { $i = $p.IndexOf('/'); if ($i -lt 0) { '(root)' } else { $p.Substring(0, $i) } }
$isData = [regex]'(^|/)(data|_archive|logs?|snapshots|chunks|node-index|nodes)/|\.(jsonl|ndjson|graph|nex)$'

$snaps = @($r | Where-Object { $_.kind -ne 'non-archive' } | Sort-Object { [int]$_.seq })
$order = [System.Collections.Generic.List[string]]::new(); $byV = @{}
foreach ($x in $snaps) { if (-not $byV.ContainsKey($x.canonBase)) { $byV[$x.canonBase] = [System.Collections.Generic.List[object]]::new(); $order.Add($x.canonBase) }; $byV[$x.canonBase].Add($x) }
$index = [Text.StringBuilder]::new()
[void]$index.AppendLine("# Nexus — versions`n`nOne row per version, oldest first. Each links to its changelog and ledger.`n`n| Version | Dates | Builds | Files at last build | Changelog | Ledger | Title |`n|---|---|---|---|---|---|---|")
$tagInfo = [System.Collections.Generic.List[object]]::new()

foreach ($v in $order) {
    $items = $byV[$v]; $revs = @($items | Where-Object { $_.kind -in 'full', 'overlay' }); $others = @($items | Where-Object { $_.kind -notin 'full', 'overlay' })
    $first = $items[0]; $last = $items[-1]
    $md = [Text.StringBuilder]::new(); $csv = [System.Collections.Generic.List[string]]::new(); $csv.Add('seq,tag,build,status,path,old_blob,new_blob')
    $title = ($revs | Where-Object title | Select-Object -Last 1).title
    [void]$md.AppendLine("# Nexus $v`n")
    if ($title) { [void]$md.AppendLine("**$title**`n") }
    $claims = @($items | ForEach-Object { $_.declared } | Where-Object { $_ } | Sort-Object -Unique)
    [void]$md.AppendLine("| | |`n|---|---|`n| Built | $($first.key.Replace('T',' ')) → $($last.key.Replace('T',' ')) |`n| Builds on the main line | $($revs.Count) |`n| Other archives filed here | $($others.Count) |`n| Versions the builds claimed | $(if ($claims) { $claims -join ', ' } else { 'none' }) |`n| Tag | $(if ($revs.Count) { '`v' + $v + '` → snap-' + (Seq $revs[-1]) } else { 'none (no committed build)' }) |`n| Full file ledger | [LEDGER-$v.csv](../ledger/LEDGER-$v.csv) |`n")
    if ($v -like '0.0.*') { [void]$md.AppendLine("This build predates the 0.x numbering. ``0.0.N`` is its place in the order; the number it carried at the time is in the row above.`n") }

    # the build's own release notes, verbatim
    if ($revs.Count) {
        $c = $sha[(Seq $revs[-1])]; $want = @(@($v) + $claims | Sort-Object -Unique | ForEach-Object { "CHANGELOG-$_.md" })
        $paths = @(git -C $Repo -c core.quotepath=off ls-tree -r --name-only $c | Where-Object { $want -contains ($_ -split '/')[-1] })
        $seenNote = @{}
        foreach ($p in $paths) { $bn = ($p -split '/')[-1]; if ($seenNote[$bn]) { continue }; $seenNote[$bn] = 1
            $body = (git -C $Repo show "${c}:$p") -join "`n"
            [void]$md.AppendLine("## Release notes — ``$p```n`nCopied unchanged from the build.`n")
            [void]$md.AppendLine((($body -split "`n") | ForEach-Object { if ($_ -match '^#{1,5}\s') { '##' + $_ } else { $_ } }) -join "`n"); [void]$md.AppendLine('')
        }
    }

    [void]$md.AppendLine("## Ledger`n")
    foreach ($x in $items) {
        $s = Seq $x
        $head = if ($x.kind -in 'full', 'overlay') { "Build $($x.canon) — snap-$s" } else { "$($x.kind) — $s" }
        [void]$md.AppendLine("### $head — $($x.key.Replace('T',' '))`n")
        [void]$md.AppendLine("- Archive: ``$($x.newName)`` (was ``$($x.name)``)")
        [void]$md.AppendLine("- SHA-256: ``$($x.sha256)``, $([math]::Round($x.size/1MB,1)) MB, downloaded $($x.mtime.Replace('T',' '))")
        [void]$md.AppendLine("- Kind: $($x.kind)$(if ($x.kind -eq 'overlay') { ' (a patch laid over the build before it)' } elseif ($x.kind -eq 'artifact') { ' (side bundle, on the artifacts branch)' } elseif ($x.kind -eq 'identical') { " (same tree as snap-$($x.identicalTo); no commit)" } elseif ($x.kind -in 'empty','git-only') { ' (no commit)' })")
        if ($x.declared -and ($x.declared -replace '-pre$', '') -ne $v) { [void]$md.AppendLine("- Claimed version: $($x.declared) (registry $(if ($x.verInternal) { $x.verInternal } else { 'none' }), file name $(if ($x.verName) { $x.verName } else { 'none' })); filed under $v to keep the line in order") }
        if ($sha[$s]) { [void]$md.AppendLine("- Commit: ``$($sha[$s])``, tag ``snap-$s``") }
        for ($i = 0; $i -lt $x.dupes.Count; $i++) { [void]$md.AppendLine("- Identical copy: ``$($x.dupeNewNames[$i])`` (was ``$($x.dupes[$i])``)") }
        if ($x.gitFiles -gt 0) { [void]$md.AppendLine("- Left out: embedded .git ($($x.gitFiles) files, HEAD $($x.gitHead))") }
        if ($x.nmFiles -gt 0) { [void]$md.AppendLine("- Left out: node_modules ($($x.nmFiles) files)") }
        foreach ($l in $x.large) { [void]$md.AppendLine("- Left out (50 MB or more): ``$l``") }
        foreach ($l in $x.redactions) { [void]$md.AppendLine("- Redacted: ``$l``") }
        if ($x.kind -notin 'full', 'overlay', 'artifact') { [void]$md.AppendLine(''); continue }
        # file-level changes from git
        $rows = @(git -C $Repo -c core.quotepath=off diff-tree -r --no-renames --root --no-commit-id $sha[$s] | ForEach-Object { $t = $_ -split "`t", 2; $f = $t[0] -split ' '; [pscustomobject]@{ st = $f[4]; path = $t[1]; old = $f[2].Substring(0, 10); new = $f[3].Substring(0, 10) } })
        foreach ($w in $rows) { $csv.Add("$s,snap-$s,$($x.canon),$($w.st),`"$($w.path.Replace('"','""'))`",$($w.old),$($w.new)") }
        $a = @($rows | Where-Object st -eq 'A').Count; $mo = @($rows | Where-Object st -eq 'M').Count; $de = @($rows | Where-Object st -eq 'D').Count
        [void]$md.AppendLine("- Files in archive: $($x.files). Changes against the build before it: **$a added, $mo modified, $de deleted**`n")
        if (-not $rows.Count) { continue }
        [void]$md.AppendLine("| System | Added | Modified | Deleted |`n|---|---|---|---|")
        foreach ($g in ($rows | Group-Object { Sys $_.path } | Sort-Object Count -Descending)) { [void]$md.AppendLine("| $($g.Name) | $(@($g.Group | Where-Object st -eq 'A').Count) | $(@($g.Group | Where-Object st -eq 'M').Count) | $(@($g.Group | Where-Object st -eq 'D').Count) |") }
        [void]$md.AppendLine('')
        $show = if ($rows.Count -le 150) { $rows } else { @($rows | Where-Object { -not $isData.IsMatch($_.path) } | Select-Object -First 150) }
        if ($show.Count) { [void]$md.AppendLine('```'); foreach ($w in $show) { [void]$md.AppendLine("$($w.st) $($w.path)") }; [void]$md.AppendLine('```') }
        if ($show.Count -lt $rows.Count) { [void]$md.AppendLine("`n$($rows.Count - $show.Count) more (mostly data, logs and archived files) are in the ledger file.") }
        [void]$md.AppendLine('')
    }
    [IO.File]::WriteAllText((Join-Path $cl "CHANGELOG-$v.md"), ($md.ToString() -replace "`r`n", "`n"), $enc)
    [IO.File]::WriteAllText((Join-Path $lg "LEDGER-$v.csv"), (($csv -join "`n") + "`n"), $enc)
    $dates = if ($first.key.Substring(0, 10) -eq $last.key.Substring(0, 10)) { $first.key.Substring(0, 10) } else { "$($first.key.Substring(0,10)) → $($last.key.Substring(0,10))" }
    [void]$index.AppendLine("| $v | $dates | $($revs.Count) | $(if ($revs.Count) { $revs[-1].files }) | [changelog](changelogs/CHANGELOG-$v.md) | [csv](ledger/LEDGER-$v.csv) | $(if ($title) { $title -replace '\|','/' }) |")
    if ($revs.Count) { $tagInfo.Add([pscustomobject]@{ v = $v; commit = $sha[(Seq $revs[-1])]; date = $revs[-1].key; title = $title; builds = $revs.Count; firstSeq = (Seq $revs[0]); lastSeq = (Seq $revs[-1]) }) }
}
[IO.File]::WriteAllText((Join-Path $Out 'VERSIONS.md'), ($index.ToString() -replace "`r`n", "`n"), $enc)
$tagInfo | ConvertTo-Json | Set-Content (Join-Path (Split-Path $Records) 'taginfo.json') -Encoding utf8
"versions: $($order.Count)  changelogs: $((Get-ChildItem $cl).Count) ($([math]::Round(((Get-ChildItem $cl | Measure-Object Length -Sum).Sum)/1MB,1)) MB)  ledgers: $([math]::Round(((Get-ChildItem $lg | Measure-Object Length -Sum).Sum)/1MB,1)) MB"
