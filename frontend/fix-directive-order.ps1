# Script to fix "use client" directive placement
$files = Get-ChildItem -Path "src\app" -Recurse -File | Where-Object { $_.Name -eq "page.tsx" -or $_.Name -eq "page.js" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -ErrorAction SilentlyContinue | Out-String
    
    if ($content -and $content -match "export const dynamic = 'force-dynamic';" -and $content -match "'use client'") {
        # Remove the dynamic export from the beginning
        $content = $content -replace "^export const dynamic = 'force-dynamic';\s*", ""
        
        # Add dynamic export after "use client" directive
        $content = $content -replace "'use client';", "'use client';`r`nexport const dynamic = 'force-dynamic';"
        
        Set-Content -Path $file.FullName -Value $content.Trim() -NoNewline
        Write-Host "Fixed directive order in: $($file.FullName)"
    }
}

Write-Host "Done fixing directive order in all page files."
