const { spawn } = require('child_process');
const os = require('os');

/**
 * Automatically discovers the computer's REAL physical Wi-Fi / LAN IP address.
 * Bypasses virtual network adapters (VMware, VirtualBox, WSL, Hyper-V, VPNs)
 * that hijack Expo's QR code and make it unreachable from physical mobile devices.
 */
function getRealWifiIp() {
  const nets = os.networkInterfaces();
  let wifiIp = null;
  let fallbackIp = null;

  for (const name of Object.keys(nets)) {
    const lowerName = name.toLowerCase();

    // Skip virtual, tunnel, and VPN adapters
    if (
      lowerName.includes('vmware') ||
      lowerName.includes('vmnet') ||
      lowerName.includes('vethernet') ||
      lowerName.includes('wsl') ||
      lowerName.includes('virtual') ||
      lowerName.includes('nord') ||
      lowerName.includes('vpn') ||
      lowerName.includes('loopback') ||
      lowerName.includes('teredo') ||
      lowerName.includes('pseudo')
    ) {
      continue;
    }

    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        // High priority: Wi-Fi, WLAN, Wireless interfaces
        if (
          lowerName.includes('wi-fi') ||
          lowerName.includes('wifi') ||
          lowerName.includes('wireless') ||
          lowerName.includes('wlan')
        ) {
          return net.address;
        }
        if (!fallbackIp) {
          fallbackIp = net.address;
        }
      }
    }
  }

  return wifiIp || fallbackIp || '127.0.0.1';
}

const activeIp = getRealWifiIp();
const args = process.argv.slice(2);
const isTunnel = args.includes('--tunnel');

console.log('=========================================================');
console.log('🚀 [TradeFlow Mobile Auto-IP Resolver]');
console.log(`📶 Detected Physical Wi-Fi IP: ${activeIp}`);
if (isTunnel) {
  console.log('🌐 Tunnel Mode: ACTIVE (Global reachability via Ngrok)');
} else {
  console.log(`📱 QR Code Metro Host: exp://${activeIp}:8081`);
  console.log(`🔗 Backend API Endpoint: http://${activeIp}:5000`);
}
console.log('=========================================================\n');

// Force Expo Metro packager and mobile app to use this exact physical IP
const customEnv = {
  ...process.env,
  REACT_NATIVE_PACKAGER_HOSTNAME: activeIp,
  EXPO_PUBLIC_API_URL: `http://${activeIp}:5000`,
};

const expoCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const expoArgs = ['expo', 'start', ...args];

const child = spawn(expoCmd, expoArgs, {
  stdio: 'inherit',
  shell: true,
  env: customEnv,
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
