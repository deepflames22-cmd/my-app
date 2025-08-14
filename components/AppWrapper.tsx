import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { TopNavigation } from './TopNavigation';
import { LoginModal } from './LoginModal';
import { useAuth } from '@/contexts/AuthContext';

interface AppWrapperProps {
  children: ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  const { showAuthModal } = useAuth();

  return (
    <View style={styles.container}>
      <TopNavigation />
      {children}
      {showAuthModal && <LoginModal />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});