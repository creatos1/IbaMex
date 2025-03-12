import { UsbSerial } from 'react-native-usb-serialport';

const connectToESP32 = async () => {
  const devices = await UsbSerial.listDevices();
  const esp32Device = devices.find(d => d.productId === 12345); // Reemplaza con PID real
  
  if (esp32Device) {
    await UsbSerial.tryRequestPermission(esp32Device.deviceId);
    await UsbSerial.open(esp32Device.deviceId, 9600); // Mismo baud rate que el ESP32
  }
};