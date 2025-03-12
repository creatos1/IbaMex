
import React from 'react';
import { StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import PassengerCounterScreen from './src/screens/PassengerCounterScreen';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <PassengerCounterScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});
