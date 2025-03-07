import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/hooks/useAuth';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack />
    </AuthProvider>
  );
}