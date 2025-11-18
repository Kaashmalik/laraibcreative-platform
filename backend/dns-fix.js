// DNS Resolution Fix for Windows + MongoDB Atlas
// This helps Node.js resolve MongoDB SRV records faster on Windows
const dns = require('dns');

// Set DNS to use system DNS with longer timeout
dns.setDefaultResultOrder('ipv4first');

// Set DNS server explicitly to Google's DNS for faster resolution
dns.setServers([
  '8.8.8.8',      // Google Primary DNS
  '8.8.4.4',      // Google Secondary DNS
  '1.1.1.1',      // Cloudflare DNS
]);

console.log('✅ DNS: Configured for faster MongoDB Atlas resolution');
console.log('📡 DNS Servers:', dns.getServers());

module.exports = dns;
