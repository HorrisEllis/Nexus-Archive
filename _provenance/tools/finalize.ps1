param([Parameter(Mandatory)][string]$User, [string]$AuthorName = 'James Brooks')
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$src = 'D:\Projects\Nexus\Nexus Orchastrator'; $repo = Join-Path $src 'nexus-history'
$email = "$User@users.noreply.github.com"

# 1. author identity: re-import commit objects only (blobs stay as they are)
$stream = Join-Path $here 'export.fi'
cmd /c "git -C `"$repo`" fast-export --all --no-data --signed-tags=strip > `"$stream`""
$bytes = [IO.File]::ReadAllBytes($stream); $txt = [Text.Encoding]::Latin1.GetString($bytes)

$txt = $txt.Replace('James Brooks <pending@users.noreply.github.com>', "$AuthorName <$email>")
[IO.File]::WriteAllBytes($stream, [Text.Encoding]::Latin1.GetBytes($txt))
cmd /c "git -C `"$repo`" fast-import --force --quiet < `"$stream`""
if ($LASTEXITCODE) { throw 'fast-import failed' }
Remove-Item $stream
git -C $repo config user.name $AuthorName; git -C $repo config user.email $email
"authors on main: " + ((git -C $repo log main --format='%an <%ae>' | Sort-Object -Unique) -join '; ')

# 2. tags
$r = Get-Content (Join-Path $here 'records.json') -Raw | ConvertFrom-Json -DateKind String
$sha = @{}; git -C $repo log main artifacts --format='%H %s' | ForEach-Object { if ($_ -match '^(\w+) snap (\d{4}):') { $sha[$matches[2]] = $matches[1] } }
$lines = [System.Collections.Generic.List[string]]::new(); $vtag = [ordered]@{}
foreach ($x in ($r | Where-Object { $_.kind -in 'full', 'overlay', 'artifact' } | Sort-Object { [int]$_.seq })) {
    $s = '{0:0000}' -f [int]$x.seq; if (-not $sha[$s]) { throw "no commit for $s" }
    $lines.Add("update refs/tags/snap-$s $($sha[$s])")
    if ($x.kind -ne 'artifact' -and $x.version -and $x.version -match '^[0-9A-Za-z.+\-]+$') { $vtag["archive/v$($x.version)"] = $sha[$s] }
}
foreach ($k in $vtag.Keys) { $lines.Add("update refs/tags/$k $($vtag[$k])") }
$lines | git -C $repo update-ref --stdin
"tags: $((git -C $repo tag | Measure-Object).Count)"

# 3. provenance docs commit on main
git -C $repo checkout -q -f main
$prov = Join-Path $repo '_provenance'; New-Item -ItemType Directory -Force (Join-Path $prov 'tools') | Out-Null
Copy-Item (Join-Path $here 'curated-decisions.md') (Join-Path $prov '_curated-decisions.md'); Copy-Item (Join-Path $here 'curated-ideas.md') (Join-Path $prov '_curated-ideas.md')
& (Join-Path $here 'gen-docs.ps1') -Records (Join-Path $here 'records.json') -Repo $repo -Out $prov 3>$null
Copy-Item (Join-Path $here 'prov-README.md') (Join-Path $prov 'README.md')
Copy-Item (Join-Path $src '_provenance\undo-rename.ps1') $prov
foreach ($f in 'inventory.ps1', 'Builder.cs', 'run-builder.ps1', 'gen-docs.ps1', 'finalize.ps1') { Copy-Item (Join-Path $here $f) (Join-Path $prov 'tools') }
Copy-Item (Join-Path $prov '*') (Join-Path $src '_provenance') -Recurse -Force
git -C $repo add -f _provenance
git -C $repo commit -q -m "Provenance: manifest, changelog, diff map, decisions and ideas for snapshots 0001-0792`n`nGenerated from the 938 source archives. See _provenance/README.md.`n`nCo-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>"
git -C $repo log -1 --format='%h %s'
git -C $repo status --short | Select-Object -First 5
