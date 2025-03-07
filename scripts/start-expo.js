
#!/usr/bin/env node

const { spawn } = require('child_process');
const os = require('os');

// Obtener la dirección IP local
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if ('IPv4' === iface.family && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '0.0.0.0';
}

const ip = getLocalIP();
console.log(`Iniciando Expo en IP: ${ip}`);

// Iniciamos expo con modo túnel para mejorar la conectividad
const expo = spawn('npx', ['expo', 'start', '--tunnel', '--clear'], {
  stdio: 'inherit',
  shell: true
});

expo.on('error', (error) => {
  console.error(`Error al iniciar Expo: ${error.message}`);
});
