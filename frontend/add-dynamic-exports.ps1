# Script to add dynamic export to all page files that don't have it
$files = Get-ChildItem -Path "src\app" -Recurse -File | Where-Object { $_.Name -eq "page.tsx" -or $_.Name -eq "page.js" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    
    if ($content -and $content -notmatch "export const dynamic") {
        # Add the dynamic export at the beginning of the file
        $newContent = "export const dynamic = 'force-dynamic';`r`n" + $content
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Added dynamic export to: $($file.FullName)"
    }
}

Write-Host "Done adding dynamic exports to all page files."
