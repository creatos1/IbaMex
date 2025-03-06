
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import RegisterScreen from '@/components/auth/RegisterScreen';

export default function Register() {
  return (
    <>
      <StatusBar style="auto" />
      <RegisterScreen />
    </>
  );
}
