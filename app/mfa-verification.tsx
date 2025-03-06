
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import MfaVerificationScreen from '@/components/auth/MfaVerificationScreen';

export default function MfaVerification() {
  return (
    <>
      <StatusBar style="auto" />
      <MfaVerificationScreen />
    </>
  );
}
