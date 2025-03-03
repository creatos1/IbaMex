
import AsyncStorage from '@react-native-async-storage/async-storage';

// Este archivo maneja localStorage en entornos nativos
export default {
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      // Ignorar errores
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      // Ignorar errores
    }
  }
};
