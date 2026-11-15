param([string]$Src, [string]$Repo = '', [switch]$Dry, [string]$AuthorName = 'James Brooks', [string]$AuthorEmail = 'pending@users.noreply.github.com')
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Add-Type -Path (Join-Path $here 'Builder.cs') -ReferencedAssemblies @('System.IO.Compression', 'System.IO.Compression.ZipFile', 'System.Text.Json', 'System.Text.RegularExpressions', 'System.Security.Cryptography', 'System.Diagnostics.Process', 'System.Linq', 'System.Collections', 'System.Console', 'System.Runtime', 'System.Text.Encodings.Web', 'System.ComponentModel.Primitives', 'System.Memory', 'System.Text.Encoding.Extensions', 'netstandard')
[Builder]::Run($Src, (Join-Path $here 'inventory.json'), $here, $Repo, [bool]$Dry, $AuthorName, $AuthorEmail)
