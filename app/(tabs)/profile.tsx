import React from 'react';
import { StatusBar } from 'expo-status-bar';
import ProfileScreen from '@/components/auth/ProfileScreen';

export default function Profile() {
  return (
    <>
      <StatusBar style="auto" />
      <ProfileScreen />
    </>
  );
}