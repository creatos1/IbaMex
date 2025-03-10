
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage wrapper for React Native
const localStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error accessing AsyncStorage:', error);
      return null;
    }
  },
  
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error writing to AsyncStorage:', error);
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from AsyncStorage:', error);
    }
  },
  
  // Synchronous version for API compatibility
  getItemSync: (key: string): string | null => {
    // Warning: this is a placeholder that returns null since AsyncStorage is async-only
    console.warn('localStorage.getItemSync is not fully supported in React Native');
    return null;
  },
  
  setItemSync: (key: string, value: string): void => {
    // Schedule the async operation but don't wait for it
    AsyncStorage.setItem(key, value).catch(err => 
      console.error('Error in setItemSync:', err)
    );
  },
  
  removeItemSync: (key: string): void => {
    // Schedule the async operation but don't wait for it
    AsyncStorage.removeItem(key).catch(err => 
      console.error('Error in removeItemSync:', err)
    );
  }
};

export default localStorage;
