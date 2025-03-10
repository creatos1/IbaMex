
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStorage = () => {
  const getItem = async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      console.error('Error al obtener datos:', error);
      return null;
    }
  };

  const setItem = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Error al guardar datos:', error);
      return false;
    }
  };

  const removeItem = async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error al eliminar datos:', error);
      return false;
    }
  };

  return { getItem, setItem, removeItem };
};

export default useStorage;
