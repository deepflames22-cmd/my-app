import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppWrapper } from '@/components/AppWrapper';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <AppWrapper>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </AppWrapper>
    </AuthProvider>
  );
}