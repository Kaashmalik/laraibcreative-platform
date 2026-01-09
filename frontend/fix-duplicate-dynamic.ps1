# Script to remove duplicate dynamic exports
$files = Get-ChildItem -Path "src\app" -Recurse -File | Where-Object { $_.Name -eq "page.tsx" -or $_.Name -eq "page.js" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -ErrorAction SilentlyContinue | Out-String
    
    if ($content -and $content -match "export const dynamic = 'force-dynamic';") {
        # Remove all occurrences of the dynamic export
        $content = $content -replace "export const dynamic = 'force-dynamic';\s*", ""
        
        # Add dynamic export after "use client" directive (if present)
        if ($content -match "'use client';") {
            $content = $content -replace "'use client';", "'use client';`r`nexport const dynamic = 'force-dynamic';"
        } else {
            # If no "use client", add at the beginning
            $content = "export const dynamic = 'force-dynamic';`r`n" + $content
        }
        
        Set-Content -Path $file.FullName -Value $content.Trim() -NoNewline
        Write-Host "Fixed duplicate dynamic exports in: $($file.FullName)"
    }
}

Write-Host "Done fixing duplicate dynamic exports in all page files."
