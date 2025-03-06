
import React from 'react';
import { Stack } from 'expo-router';
import AdminDashboard from '@/components/auth/AdminDashboard';

export default function AdminHome() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AdminDashboard />
    </>
  );
}
