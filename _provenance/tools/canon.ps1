# Computes one ordered version line for all snapshots. Writes records2.json (records.json + canon fields).
param([string]$In, [string]$Out)
$r = Get-Content $In -Raw | ConvertFrom-Json -DateKind String
$snaps = @($r | Where-Object { $_.kind -ne 'non-archive' } | Sort-Object { [int]$_.seq })
$main = @($snaps | Where-Object { $_.kind -in 'full', 'overlay', 'identical' })
function Key($v) { if ($v -match '^0\.(\d+)\.(\d+)') { $b = [int]$matches[1]; $c = [int]$matches[2]; if ($b -ge 4 -and ($b * 100000 + $c) -le (60 * 100000 + 320)) { return $b * 100000 + $c } }; return -1 }
# longest non-decreasing subsequence over eligible declared versions (patience, O(n log n))
# the version a build claims: the higher of its registry (lib/version.js, VERSION, package.json) and its file name, when both are on the 0.x line
foreach ($x in $snaps) { $ki = Key $x.verInternal; $kn = Key $x.verName; $x | Add-Member claimed $(if ($kn -gt $ki) { $x.verName } elseif ($x.verInternal) { $x.verInternal } else { $x.verName }) -Force }
$keys = $main | ForEach-Object { Key $_.claimed }
$tails = [System.Collections.Generic.List[int]]::new(); $tailIdx = [System.Collections.Generic.List[int]]::new(); $prev = New-Object int[] $main.Count
for ($i = 0; $i -lt $main.Count; $i++) {
    $k = $keys[$i]; $prev[$i] = -1; if ($k -lt 0) { continue }
    $lo = 0; $hi = $tails.Count
    while ($lo -lt $hi) { $mid = [int][Math]::Floor(($lo + $hi) / 2); if ($tails[$mid] -le $k) { $lo = $mid + 1 } else { $hi = $mid } }
    if ($lo -gt 0) { $prev[$i] = $tailIdx[$lo - 1] }
    if ($lo -eq $tails.Count) { $tails.Add($k); $tailIdx.Add($i) } else { $tails[$lo] = $k; $tailIdx[$lo] = $i }
}
$anchor = New-Object bool[] $main.Count; $j = $tailIdx[$tailIdx.Count - 1]; while ($j -ge 0) { $anchor[$j] = $true; $j = $prev[$j] }
# base version per main-line snapshot
$base = $null; $legacy = 0
for ($i = 0; $i -lt $main.Count; $i++) {
    $x = $main[$i]
    if ($anchor[$i]) { $null = $x.claimed -match '^(0\.\d+\.\d+)'; $base = $matches[1] }
    elseif (-not $base) { $legacy++; $x | Add-Member canonBase "0.0.$legacy" -Force; $x | Add-Member anchor $false -Force; continue }
    $x | Add-Member canonBase $base -Force; $x | Add-Member anchor ([bool]$anchor[$i]) -Force
}
# revisions among committed snapshots sharing a base
foreach ($g in ($main | Group-Object canonBase)) {
    $c = @($g.Group | Where-Object { $_.kind -ne 'identical' }); $n = 0
    foreach ($x in $c) { $n++; $x | Add-Member rev $n -Force; $x | Add-Member revCount $c.Count -Force; $x | Add-Member canon ($(if ($c.Count -gt 1) { "$($g.Name)-r$n" } else { $g.Name })) -Force }
}
# everything else takes the version current at its place in the order
$cur = '0.0.0'; $lastSeq = @{}
foreach ($x in $snaps) {
    if ($x.kind -in 'full', 'overlay') { $cur = $x.canonBase; $lastSeq[[int]$x.seq] = $x.canon; continue }
    if ($x.kind -eq 'identical') { $same = $main | Where-Object { [int]$_.seq -eq [int]$x.identicalTo } | Select-Object -First 1; $x | Add-Member canon $same.canon -Force; $x | Add-Member canonBase $same.canonBase -Force; continue }
    $x | Add-Member canonBase $cur -Force; $x | Add-Member canon $cur -Force
}
foreach ($x in $snaps) { $x | Add-Member declared $x.claimed -Force }
# new names: swap the version segment, note a differing declared version, mark the kind
function Rename($x, $old) {
    $suffix = switch ($x.kind) { 'artifact' { '-side' } 'identical' { '' } default { '' } }
    $n = [regex]::Replace($old, '^(nexus-\d{4}_\d{4}-\d\d-\d\d)_(unversioned|v[^_]+?)(?=(_|\.zip$))', { param($m) $m.Groups[1].Value + '_v' + $x.canon + $suffix })
    $decl = $x.declared; if ($decl -and ($decl -replace '-pre$', '') -ne $x.canonBase -and $n -notmatch [regex]::Escape("named-$decl")) { $n = $n -replace '\.zip$', "_declared-$($decl -replace '[^0-9A-Za-z.+-]','').zip" }
    if ($x.kind -eq 'identical') { $n = $n -replace '\.zip$', "_same-as-$($x.identicalTo).zip" }
    if ($x.kind -in 'empty', 'git-only') { $n = $n -replace '\.zip$', "_$($x.kind).zip" }
    $n
}
foreach ($x in $snaps) {
    $x | Add-Member newName2 (Rename $x $x.newName) -Force
    $x | Add-Member dupeNewNames2 @($x.dupeNewNames | ForEach-Object { Rename $x $_ }) -Force
}
$all = @($snaps) + @($r | Where-Object { $_.kind -eq 'non-archive' })
$all | ConvertTo-Json -Depth 8 | Set-Content $Out -Encoding utf8
"main-line: $($main.Count)  anchors: $(($anchor | Where-Object { $_ }).Count)  legacy 0.0.N: $legacy  versions: $((($main | Where-Object { $_.kind -ne 'identical' }).canonBase | Sort-Object -Unique).Count)"
