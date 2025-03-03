
// Este archivo determina qué implementación usar
import { Platform } from 'react-native';

let localStorage: any;

// Evitamos el error de localStorage no disponible
if (Platform.OS === 'web') {
  // En web, usamos la implementación web
  const WebStorage = require('./localStorage.web').default;
  localStorage = WebStorage;
} else {
  // En nativo, usamos AsyncStorage
  const NativeStorage = require('./localStorage.native').default;
  localStorage = NativeStorage;
}

export default localStorage;
