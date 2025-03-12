import { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';

export default function DeviceController() {
  const [data, setData] = useState<{ temp: number; hum: number } | null>(null);
  
  const fetchData = async () => {
    try {
      const response = await fetch('http://[IP_ESP32]/data');
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View>
      <Button title="Obtener datos" onPress={fetchData} />
      {data && (
        <Text>
          Temperatura: {data.temp}°C - Humedad: {data.hum}%
        </Text>
      )}
    </View>
  );
}