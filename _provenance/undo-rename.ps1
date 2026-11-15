# Puts every archive back in the top folder under its original name, using rename-map.csv.
$dir = Split-Path -Parent $PSScriptRoot
Import-Csv (Join-Path $PSScriptRoot 'rename-map.csv') | ForEach-Object {
    $from = Join-Path $dir (Join-Path $_.folder $_.new_name); $to = Join-Path $dir $_.original_name
    if ((Test-Path -LiteralPath $from) -and -not (Test-Path -LiteralPath $to)) { Move-Item -LiteralPath $from -Destination $to }
    else { Write-Warning "skipped $($_.new_name)" }
}
