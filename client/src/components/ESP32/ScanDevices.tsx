import { BleManager } from 'react-native-ble-plx';

const manager = new BleManager();

const scanDevices = () => {
  manager.startDeviceScan(null, null, (error, device) => {
    if (error) {
      console.error(error);
      return;
    }
    if (device?.name?.includes('ESP32')) {
      console.log('Dispositivo encontrado:', device);
    }
  });
};

// Detener escaneo cuando el componente se desmonte
manager.stopDeviceScan();