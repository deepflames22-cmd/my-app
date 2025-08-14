import React, { useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export function LoginModal() {
  const [isLogin, setIsLogin] = useState(true);
  const { showAuthModal, setShowAuthModal } = useAuth();

  const handleClose = () => {
    setShowAuthModal(false);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <Modal
      visible={showAuthModal}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#374151" strokeWidth={2} />
          </TouchableOpacity>
          
          {isLogin ? (
            <LoginForm onSwitchToRegister={switchMode} />
          ) : (
            <RegisterForm onSwitchToLogin={switchMode} />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
});