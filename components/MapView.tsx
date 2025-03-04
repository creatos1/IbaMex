
import { Platform } from 'react-native';

// On web, use our web fallback component
// On native platforms, use the real react-native-maps
let MapView;
let Marker;

if (Platform.OS === 'web') {
  const WebComponents = require('./MapViewWeb');
  MapView = WebComponents.MapViewWeb;
  Marker = WebComponents.MapMarker;
} else {
  const NativeMaps = require('react-native-maps');
  MapView = NativeMaps.default;
  Marker = NativeMaps.Marker;
}

export { MapView, Marker };
export default MapView;
