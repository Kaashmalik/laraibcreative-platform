# Enable MongoDB Atlas connections through Windows Firewall
# Run this as Administrator if MongoDB connections are being blocked

Write-Host "🔥 Checking Windows Firewall for MongoDB rules..." -ForegroundColor Yellow

# Check if MongoDB rule already exists
$existingRule = Get-NetFirewallRule -DisplayName "MongoDB Atlas Outbound" -ErrorAction SilentlyContinue

if ($existingRule) {
    Write-Host "✅ MongoDB firewall rule already exists" -ForegroundColor Green
    Write-Host "   Rule: $($existingRule.DisplayName)"
    Write-Host "   Enabled: $($existingRule.Enabled)"
    Write-Host "   Action: $($existingRule.Action)"
} else {
    Write-Host "⚠️  No MongoDB firewall rule found. Creating..." -ForegroundColor Yellow
    
    try {
        # Create outbound rule for MongoDB Atlas (port 27017)
        New-NetFirewallRule `
            -DisplayName "MongoDB Atlas Outbound" `
            -Description "Allow outbound connections to MongoDB Atlas on port 27017" `
            -Direction Outbound `
            -Action Allow `
            -Protocol TCP `
            -RemotePort 27017 `
            -Enabled True `
            -Profile Any | Out-Null
        
        Write-Host "✅ MongoDB firewall rule created successfully!" -ForegroundColor Green
        Write-Host "   Port 27017 (TCP) outbound connections are now allowed"
    } catch {
        Write-Host "❌ Failed to create firewall rule" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Please run this script as Administrator:" -ForegroundColor Yellow
        Write-Host "   Right-click PowerShell → Run as Administrator"
        Write-Host "   Then run: .\enable-mongodb-firewall.ps1"
        exit 1
    }
}

Write-Host ""
Write-Host "🧪 Testing MongoDB connectivity..." -ForegroundColor Cyan

# Test connection to MongoDB Atlas
$testResult = Test-NetConnection -ComputerName "ac-lfwgrtb-shard-00-00.nbtabul.mongodb.net" -Port 27017 -WarningAction SilentlyContinue

if ($testResult.TcpTestSucceeded) {
    Write-Host "✅ MongoDB Atlas is reachable on port 27017" -ForegroundColor Green
    Write-Host "   Remote Address: $($testResult.RemoteAddress)"
    Write-Host ""
    Write-Host "🚀 You can now restart your backend server:" -ForegroundColor Green
    Write-Host "   npm run dev"
} else {
    Write-Host "❌ Cannot reach MongoDB Atlas on port 27017" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Possible issues:" -ForegroundColor Yellow
    Write-Host "   1. Antivirus blocking connections (check Windows Defender/third-party AV)"
    Write-Host "   2. Corporate network/proxy blocking MongoDB"
    Write-Host "   3. VPN interfering with connections"
    Write-Host "   4. ISP blocking non-standard ports"
    Write-Host ""
    Write-Host "🔧 Try:" -ForegroundColor Cyan
    Write-Host "   - Disable antivirus temporarily and test"
    Write-Host "   - Disconnect from VPN and test"
    Write-Host "   - Try mobile hotspot to bypass network restrictions"
}
