param([string]$Records, [string]$Repo, [string]$Out)
$ErrorActionPreference = 'Stop'
$r = Get-Content $Records -Raw | ConvertFrom-Json -DateKind String
New-Item -ItemType Directory -Force $Out | Out-Null
$enc = [System.Text.UTF8Encoding]::new($false)
function Save($name, $text) { [IO.File]::WriteAllText((Join-Path $Out $name), ($text -replace "`r`n", "`n"), $enc) }
function Seq($x) { '{0:0000}' -f [int]$x.seq }

# seq -> commit sha (from the Snapshot-Seq trailer)
$sha = @{}
$cur = $null
git -C $Repo log main artifacts --format='%H %s' | ForEach-Object { if ($_ -match '^(\w+) snap (\d{4}):') { $sha[$matches[2]] = $matches[1] } }

$snaps = $r | Where-Object { $_.kind -ne 'non-archive' } | Sort-Object { [int]$_.seq }
$committed = $snaps | Where-Object { $_.kind -in 'full', 'overlay', 'artifact' }

# ---------- MANIFEST ----------
$rows = foreach ($x in $r) {
    if ($x.kind -eq 'non-archive') { [pscustomobject]@{ seq = ''; original_name = $x.name; new_name = $x.name; role = 'non-archive'; kind = 'non-archive'; version = ''; version_claimed = ''; version_internal = ''; version_filename = ''; content_date = ''; archive_mtime = $x.mtime; size = $x.size; sha256 = $x.sha256; files = ''; branch = ''; commit = ''; tag = ''; note = 'not a zip; left untouched' }; continue }
    $s = Seq $x; $tag = if ($x.kind -in 'full', 'overlay', 'artifact') { "snap-$s" } else { '' }
    $note = switch ($x.kind) { 'identical' { "tree identical to snap-$($x.identicalTo); no commit" } 'empty' { 'archive has no files; no commit' } 'git-only' { "archive holds only a .git directory ($($x.gitFiles) files, HEAD $($x.gitHead)); no commit" } default { '' } }
    [pscustomobject]@{ seq = $s; original_name = $x.name; new_name = $x.newName; role = 'primary'; kind = $x.kind; version = $x.canon; version_claimed = $x.declared; version_internal = $x.verInternal; version_filename = $x.verName; content_date = $x.key; archive_mtime = $x.mtime; size = $x.size; sha256 = $x.sha256; files = $x.files; branch = $x.branch; commit = $sha[$s]; tag = $tag; note = $note }
    for ($i = 0; $i -lt $x.dupes.Count; $i++) {
        [pscustomobject]@{ seq = $s; original_name = $x.dupes[$i]; new_name = $x.dupeNewNames[$i]; role = 'duplicate'; kind = $x.kind; version = $x.canon; version_claimed = $x.declared; version_internal = $x.verInternal; version_filename = $x.verName; content_date = $x.key; archive_mtime = ''; size = $x.size; sha256 = $x.sha256; files = $x.files; branch = $x.branch; commit = $sha[$s]; tag = $tag; note = "byte-identical to $($x.name)" }
    }
}
$rows = $rows | ForEach-Object {
    $f = if ($_.role -eq 'non-archive') { '' } elseif ($_.role -eq 'duplicate') { 'archives/_duplicates' } elseif ($_.kind -in 'empty', 'git-only') { 'archives/_empty' } elseif ($_.version -match '^(\d+)\.(\d+)') { "archives/v$($matches[1]).$($matches[2])" } else { 'archives/unversioned' }
    $_ | Add-Member -NotePropertyName folder -NotePropertyValue $f -PassThru
}
$rows | Export-Csv (Join-Path $Out 'MANIFEST.csv') -NoTypeInformation -Encoding utf8
$rows | Where-Object { $_.original_name -ne $_.new_name } | Select-Object original_name, new_name, folder, sha256 | Export-Csv (Join-Path $Out 'rename-map.csv') -NoTypeInformation -Encoding utf8

# ---------- DIFFMAP ----------
$committed | ForEach-Object { [pscustomobject]@{ seq = (Seq $_); tag = "snap-$(Seq $_)"; build = $_.canon; date = $_.key; version = $_.version; kind = $_.kind; files = $_.files; added = $_.added; modified = $_.modified; deleted = $_.deleted; systems = (($_.systems.PSObject.Properties | Sort-Object Value -Descending | ForEach-Object { "$($_.Name)=$($_.Value)" }) -join '; '); source = $_.name } } | Export-Csv (Join-Path $Out 'DIFFMAP.csv') -NoTypeInformation -Encoding utf8

# ---------- CHANGELOG ----------
$sb = [Text.StringBuilder]::new()
[void]$sb.AppendLine("# Nexus — reconstructed changelog`n")
[void]$sb.AppendLine("Every archived build of Nexus, oldest first. One entry per unique archive; each committed entry is a git commit tagged ``snap-NNNN``. Counts are files added / modified / deleted against the previous snapshot on ``main``. Titles and quotes come from the build's own ``CHANGELOG-<version>.md`` where one exists; nothing here is invented. See README.md for method and limits.`n")
$main = $snaps | Where-Object { $_.kind -in 'full', 'overlay', 'identical' }
$groups = [System.Collections.Generic.List[object]]::new(); $cv = '<none>'; $g = $null
foreach ($x in $main) { $v = if ($x.version) { $x.version } else { 'unversioned' }; if ($v -ne $cv) { $g = [pscustomobject]@{ v = $v; items = [System.Collections.Generic.List[object]]::new() }; $groups.Add($g); $cv = $v }; $g.items.Add($x) }
[void]$sb.AppendLine("## Version runs`n"); [void]$sb.AppendLine("| Version | Snapshots | First | Last | Builds |`n|---|---|---|---|---|")
foreach ($g in $groups) { [void]$sb.AppendLine("| $($g.v) | snap-$(Seq $g.items[0])…snap-$(Seq $g.items[-1]) | $($g.items[0].key.Substring(0,10)) | $($g.items[-1].key.Substring(0,10)) | $($g.items.Count) |") }
[void]$sb.AppendLine("`n## Entries`n")
foreach ($g in $groups) {
    [void]$sb.AppendLine("### v$($g.v) — $($g.items[0].key.Substring(0,10))$(if ($g.items.Count -gt 1) { ' → ' + $g.items[-1].key.Substring(0,10) })`n`n[Changelog and ledger for $($g.v)](changelogs/CHANGELOG-$($g.v).md)`n")
    $t = $g.items | Where-Object { $_.title } | Select-Object -First 1
    if ($t) { [void]$sb.AppendLine("**$($t.title)**`n"); if ($t.quote) { [void]$sb.AppendLine("> $($t.quote)`n") } }
    foreach ($x in $g.items) {
        $s = Seq $x
        if ($x.kind -eq 'identical') { [void]$sb.AppendLine("- ``$s`` $($x.key.Replace('T',' ')) — ``$($x.name)`` — identical to snap-$($x.identicalTo), not committed"); continue }
        $sys = ($x.systems.PSObject.Properties | Sort-Object Value -Descending | Select-Object -First 8 | ForEach-Object { "$($_.Name) $($_.Value)" }) -join ', '
        $extra = @(); if ($x.kind -eq 'overlay') { $extra += 'patch overlay' }; if ($x.declared -and ($x.declared -replace '-pre$','') -ne $x.version) { $extra += "claimed $($x.declared)" }; if ($x.dupes.Count) { $extra += "$($x.dupes.Count) duplicate archive(s)" }; if ($x.redactions.Count) { $extra += "$($x.redactions.Count) file(s) redacted" }; if ($x.large.Count) { $extra += "$($x.large.Count) large file(s) excluded" }
        [void]$sb.AppendLine("- ``snap-$s`` **$($x.canon)** $($x.key.Replace('T',' ')) — ``$($x.name)`` — $($x.files) files, **+$($x.added) ~$($x.modified) −$($x.deleted)**$(if ($sys) { " — $sys" })$(if ($extra) { ' — ' + ($extra -join '; ') })")
    }
    [void]$sb.AppendLine('')
}
[void]$sb.AppendLine("## Side artifacts (branch ``artifacts``)`n`nPartial bundles that did not match the main tree layout. Each is committed under its own folder on the ``artifacts`` branch.`n")
foreach ($x in ($snaps | Where-Object kind -eq 'artifact')) { [void]$sb.AppendLine("- ``snap-$(Seq $x)`` $($x.key.Replace('T',' ')) — ``$($x.name)`` — $($x.files) files$(if ($x.version) { ", v$($x.version)" })") }
[void]$sb.AppendLine("`n## Not committed`n")
foreach ($x in ($snaps | Where-Object { $_.kind -in 'empty', 'git-only' })) { [void]$sb.AppendLine("- ``$(Seq $x)`` $($x.key.Replace('T',' ')) — ``$($x.name)`` — $(if ($x.kind -eq 'empty') { 'empty archive' } else { "only a .git directory, HEAD $($x.gitHead)" })") }
Save 'CHANGELOG.md' $sb.ToString()

# ---------- DECISIONS / IDEAS ----------
function DocSection($kind, $title, $intro, $prop) {
    $o = [Text.StringBuilder]::new(); [void]$o.AppendLine("# $title`n"); [void]$o.AppendLine("$intro`n")
    [void]$o.AppendLine("## Documents, by first appearance`n")
    [void]$o.AppendLine("| First seen | Version | Document | Title |`n|---|---|---|---|")
    $seen = @{}
    foreach ($x in $committed) { foreach ($d in $x.docsAdded) { if ($d[0] -eq $kind -and -not $seen.ContainsKey($d[1]) -and $d[1] -notmatch '(^|/)idearium/(data|repo)/|/chunks/|node-index') { $seen[$d[1]] = 1; [void]$o.AppendLine("| snap-$(Seq $x) $($x.key.Substring(0,10)) | $($x.version) | ``$($d[1])`` | $(($d[2] -replace '\|','/') -replace '^-+$','') |") } } }
    [void]$o.AppendLine("`n## Recorded in release notes and handoffs, by version`n")
    [void]$o.AppendLine("Sections lifted verbatim (trimmed) from changelog, handoff and session files at the snapshot where each file first appeared.`n")
    $dedupe = @{}
    foreach ($x in $committed) {
        $items = @($x.$prop | Where-Object { $k = $_[1] + '|' + $_[2]; if ($dedupe.ContainsKey($k)) { $false } else { $dedupe[$k] = 1; $true } })
        if (-not $items.Count) { continue }
        [void]$o.AppendLine("### snap-$(Seq $x) — v$($x.canon) — $($x.key.Substring(0,10))`n")
        foreach ($d in $items) { [void]$o.AppendLine("**$($d[1])** — ``$($d[0])```n"); [void]$o.AppendLine((($d[2] -split "`n") | ForEach-Object { "> $_" }) -join "`n"); [void]$o.AppendLine('') }
    }
    $o.ToString()
}
$curD = if (Test-Path (Join-Path $Out '_curated-decisions.md')) { Get-Content (Join-Path $Out '_curated-decisions.md') -Raw } else { '' }
$curI = if (Test-Path (Join-Path $Out '_curated-ideas.md')) { Get-Content (Join-Path $Out '_curated-ideas.md') -Raw } else { '' }
Save 'DECISIONS.md' (DocSection 'decision' 'Nexus — decisions across versions' ("Where decisions were written down in the archived builds, and when each first appeared.`n`n" + $curD) 'decisions')
Save 'IDEAS.md' (DocSection 'idea' 'Nexus — ideas, roadmaps and deferred work across versions' ("Roadmaps, proposals, backlogs and 'next / deferred / not built' notes found in the archived builds, and when each first appeared.`n`n" + $curI) 'ideas')
Remove-Item (Join-Path $Out '_curated-decisions.md'), (Join-Path $Out '_curated-ideas.md') -ErrorAction SilentlyContinue

# ---------- REDACTIONS / EXCLUSIONS ----------
$o = [Text.StringBuilder]::new(); [void]$o.AppendLine("# Redactions and exclusions`n`nWhat the git history deliberately does not contain. The original archives are unchanged.`n`n## Redacted secrets`n`nKey-shaped strings were replaced with ``[REDACTED:<type>:<first 8 hex of SHA-256 of the value>]`` the first time each file version entered history.`n")
foreach ($x in $committed) { foreach ($d in $x.redactions) { [void]$o.AppendLine("- snap-$(Seq $x) — $d") } }
[void]$o.AppendLine("`n## Files of 50 MB or more (excluded)`n"); foreach ($x in $committed) { foreach ($d in $x.large) { [void]$o.AppendLine("- snap-$(Seq $x) — $d") } }
[void]$o.AppendLine("`n## Embedded git repositories and node_modules (excluded)`n`n| Snapshot | Archive | .git files | Embedded HEAD | node_modules files |`n|---|---|---|---|---|")
foreach ($x in $snaps) { if ($x.gitFiles -gt 0 -or $x.nmFiles -gt 0) { [void]$o.AppendLine("| $(Seq $x) | ``$($x.name)`` | $($x.gitFiles) | $($x.gitHead) | $($x.nmFiles) |") } }
Save 'EXCLUSIONS.md' $o.ToString()

"docs written to $Out : " + ((Get-ChildItem $Out -File | ForEach-Object { "$($_.Name) ($([int]($_.Length/1KB)) KB)" }) -join ', ')
