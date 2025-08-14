import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Menu, User, LogOut, Settings } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function TopNavigation() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  return (
    <>
      <View style={[styles.topNav, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
          <Menu size={24} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>SmartApp</Text>
        </View>
        
        <TouchableOpacity style={styles.userButton} onPress={toggleUserDropdown}>
          <User size={24} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Sidebar Modal */}
      <Modal
        visible={showSidebar}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSidebar(false)}
      >
        <View style={styles.sidebarOverlay}>
          <TouchableOpacity 
            style={styles.sidebarBackground} 
            onPress={() => setShowSidebar(false)}
          />
          <View style={[styles.sidebar, { paddingTop: insets.top + 60 }]}>
            <TouchableOpacity style={styles.sidebarItem}>
              <Settings size={20} color="#DC2626" strokeWidth={2} />
              <Text style={styles.sidebarText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sidebarItem}>
              <User size={20} color="#DC2626" strokeWidth={2} />
              <Text style={styles.sidebarText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* User Dropdown */}
      {showUserDropdown && (
        <View style={[styles.dropdown, { top: insets.top + 60 }]}>
          <View style={styles.dropdownContent}>
            <Text style={styles.dropdownHeader}>Welcome, {user?.name}</Text>
            <TouchableOpacity style={styles.dropdownItem} onPress={logout}>
              <LogOut size={16} color="#DC2626" strokeWidth={2} />
              <Text style={styles.dropdownText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {showUserDropdown && (
        <TouchableOpacity 
          style={styles.dropdownOverlay} 
          onPress={() => setShowUserDropdown(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  topNav: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuButton: {
    padding: 8,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userButton: {
    padding: 8,
  },
  sidebarOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    backgroundColor: '#FFFFFF',
    width: 280,
    paddingHorizontal: 20,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sidebarText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  dropdown: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 1000,
  },
  dropdownContent: {
    padding: 8,
    minWidth: 200,
  },
  dropdownHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
  },
  dropdownText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
});