import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Navigation, Search } from 'lucide-react-native';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9CA3AF" strokeWidth={2} />
          <Text style={styles.searchText}>Search locations...</Text>
        </View>
      </View>

      <View style={styles.mapPlaceholder}>
        <MapPin size={64} color="#DC2626" strokeWidth={2} />
        <Text style={styles.mapText}>Interactive Map</Text>
        <Text style={styles.mapSubtext}>Map functionality will be integrated here</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton}>
          <Navigation size={20} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.controlText}>Get Directions</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.controlButton, styles.secondaryButton]}>
          <MapPin size={20} color="#DC2626" strokeWidth={2} />
          <Text style={[styles.controlText, styles.secondaryText]}>Find Nearby</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 0,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#9CA3AF',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mapText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  controls: {
    padding: 20,
    gap: 12,
  },
  controlButton: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  controlText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryText: {
    color: '#DC2626',
  },
});