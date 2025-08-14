import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker } from 'react-native-maps';
import { useLocalSearchParams } from 'expo-router';

// Type definitions
interface Service {
  id: string;
  name: string;
  type: string;
  description: string;
}

interface Location {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  url?: string;
  lat: number;
  lng: number;
  service: Service;
}

type RootStackParamList = {
  ServiceDetail: { slug: string };
  Services: undefined;
};

type ServiceDetailRouteProp = RouteProp<RootStackParamList, 'ServiceDetail'>;
type ServiceDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ServiceDetail'>;


export default function LocationDetailScreen() {
  const { id } = useLocalSearchParams();


  const route = useRoute<ServiceDetailRouteProp>();
  const navigation = useNavigation<ServiceDetailNavigationProp>();
  const slug = id;

  const [service, setService] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServiceDetail();
  }, [slug]);

  const fetchServiceDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://canada-newcomers.vercel.app/api/locations/${slug}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch service details');
      }
      
      const data = await response.json();
      setService(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching service:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhonePress = (phone: string) => {
    const phoneUrl = `tel:${phone}`;
    Linking.canOpenURL(phoneUrl).then((supported) => {
      if (supported) {
        Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Phone calls are not supported on this device');
      }
    });
  };

  const handleWebsitePress = (url: string) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open website');
      }
    });
  };

  const handleMapPress = () => {
    if (service) {
      const url = `https://maps.google.com/?q=${service.lat},${service.lng}`;
      Linking.openURL(url);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.loadingText}>Loading service details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !service) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || 'Service not found'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchServiceDetail}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
    >
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back to Services</Text>
      </TouchableOpacity>

      {/* Main Content Card */}
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{service.name}</Text>
            <Text style={styles.city}>{service.city}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{service.service.type}</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description}>{service.service.description}</Text>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          {/* Address */}
          <View style={styles.contactItem}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📍</Text>
            </View>
            <View style={styles.contactText}>
              <Text style={styles.contactLabel}>Address</Text>
              <Text style={styles.contactValue}>{service.address}</Text>
            </View>
          </View>

          {/* Phone */}
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handlePhonePress(service.phone)}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📞</Text>
            </View>
            <View style={styles.contactText}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={[styles.contactValue, styles.linkText]}>
                {service.phone}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Hours */}
          <View style={styles.contactItem}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🕒</Text>
            </View>
            <View style={styles.contactText}>
              <Text style={styles.contactLabel}>Hours</Text>
              <Text style={styles.contactValue}>{service.hours}</Text>
            </View>
          </View>

          {/* Website */}
          {service.url && (
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleWebsitePress(service.url!)}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🌐</Text>
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Website</Text>
                <Text style={[styles.contactValue, styles.linkText]}>
                  Visit Website
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Location Map */}
        <View style={styles.section}>
  <Text style={styles.sectionTitle}>Location</Text>
  <TouchableOpacity onPress={handleMapPress} style={styles.mapContainer}>
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: service.lat,
        longitude: service.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      scrollEnabled={false}
      zoomEnabled={false}
      pitchEnabled={false}
      rotateEnabled={false}
    >
      <Marker
        coordinate={{
          latitude: service.lat,
          longitude: service.lng,
        }}
        title={service.name}
        description={service.address}
        pinColor="#DC2626"
      />
    </MapView>
    <View style={styles.mapOverlay}>
      <Text style={styles.mapOverlayText}>Tap to open in Maps</Text>
    </View>
  </TouchableOpacity>
</View>
        
      </View>
    </ScrollView>
  </SafeAreaView>
  );
}




const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F9FAFB',
    },
    scrollView: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: '#6B7280',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      fontSize: 16,
      color: '#EF4444',
      textAlign: 'center',
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: '#DC2626',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    backButton: {
      padding: 16,
    },
    backButtonText: {
      color: '#DC2626',
      fontSize: 16,
      fontWeight: '500',
    },
    card: {
      backgroundColor: 'white',
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: 24,
      paddingBottom: 16,
    },
    headerText: {
      flex: 1,
      marginRight: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: 4,
    },
    city: {
      fontSize: 18,
      color: '#DC2626',
    },
    badge: {
      backgroundColor: '#FEE2E2',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    badgeText: {
      color: '#991B1B',
      fontSize: 14,
      fontWeight: '600',
    },
    description: {
      fontSize: 16,
      color: '#374151',
      lineHeight: 24,
      paddingHorizontal: 24,
      marginBottom: 24,
    },
    section: {
      paddingHorizontal: 24,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: '#111827',
      marginBottom: 16,
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    iconContainer: {
      width: 24,
      height: 24,
      marginRight: 12,
      marginTop: 2,
    },
    icon: {
      fontSize: 18,
    },
    contactText: {
      flex: 1,
    },
    contactLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: '#111827',
      marginBottom: 2,
    },
    contactValue: {
      fontSize: 16,
      color: '#6B7280',
      lineHeight: 22,
    },
    linkText: {
      color: '#DC2626',
      textDecorationLine: 'underline',
    },
    mapContainer: {
      height: 200,
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: '#DC2626',
      position: 'relative',
    },
    map: {
      flex: 1,
    },
    mapOverlay: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    mapOverlayText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '500',
    },
  });