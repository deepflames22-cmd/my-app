
import { MapPin, Navigation, Search } from 'lucide-react-native';
import  { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';

interface Service {
  id: string;
  name: string;
  type: string;
  color: string;
}

interface LocationData {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
  phone?: string;
  serviceId: string;
  service?: Service;
}

interface UserSession {
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
}

const { width, height } = Dimensions.get('window');

export default function MapScreen() {

  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [services, setServices] = useState<Service[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<LocationData[]>([]);
  const [savedLocations, setSavedLocations] = useState<string[]>([]);
  const [savingLocation, setSavingLocation] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMarker, setSelectedMarker] = useState<LocationData | null>(null);

  const mapRef = useRef<MapView>(null);
  
  // Mock session - replace with your actual session management
  const session: UserSession | null = null; // Replace with actual session

  const BASE_URL = 'https://canada-newcomers.vercel.app/api';

  const serviceColors: Record<string, string> = {
    government: '#DC2626',
    banks: '#059669',
    shopping: '#7C3AED',
    groceries: '#D97706',
    transport: '#2563EB',
    telecom: '#0D9488',
    drivetest: '#CA8A04',
    other: '#6B7280',
  };

  const initialRegion: Region = {
    latitude: 56.1304,
    longitude: -106.3468,
    latitudeDelta: 30,
    longitudeDelta: 30,
  };

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (selectedService) {
      fetchProvinces(selectedService);
    } else {
      setProvinces([]);
      setSelectedProvince('');
      setSelectedCity('');
      setCities([]);
    }
  }, [selectedService]);

  useEffect(() => {
    if (selectedProvince && selectedService) {
      fetchCities(selectedService, selectedProvince);
    } else {
      setCities([]);
      setSelectedCity('');
    }
  }, [selectedProvince, selectedService]);

  useEffect(() => {
    filterLocations();
  }, [selectedService, selectedProvince, selectedCity, locations]);

  const initializeData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchServices(),
        fetchLocations(),
        getUserLocation(),
      ]);
      
      if (session?.user) {
        await fetchSavedLocations();
      }
    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async (): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/services`);
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchLocations = async (): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/locations`);
      if (response.ok) {
        const data = await response.json();
        setLocations(data.locations || []);
        setFilteredLocations(data.locations || []);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchProvinces = async (serviceId: string): Promise<void> => {
    try {
      const response = await fetch(
        `${BASE_URL}/locations/provinces?serviceId=${serviceId}`
      );
      if (response.ok) {
        const data = await response.json();
        setProvinces(data);
      }
    } catch (error) {
      console.error('Error fetching provinces:', error);
    }
  };

  const fetchCities = async (serviceId: string, province: string): Promise<void> => {
    try {
      const response = await fetch(
        `${BASE_URL}/locations/cities?serviceId=${serviceId}&province=${province}`
      );
      if (response.ok) {
        const data = await response.json();
        setCities(data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchSavedLocations = async (): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/locations/save`);
      const data = await response.json();
      if (response.ok) {
        setSavedLocations(data.map((item: any) => item.locationId));
      }
    } catch (error) {
      console.error('Error fetching saved locations:', error);
    }
  };

  const handleSaveLocation = async (locationId: string): Promise<void> => {
    if (!session?.user) {
      Alert.alert('Authentication Required', 'Please login to save locations');
      return;
    }

    setSavingLocation(true);
    try {
      const isAlreadySaved = savedLocations.includes(locationId);
      const method = isAlreadySaved ? 'DELETE' : 'POST';

      const response = await fetch(`${BASE_URL}/locations/save`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId }),
      });

      if (response.ok) {
        if (isAlreadySaved) {
          setSavedLocations(prev => prev.filter(id => id !== locationId));
          Alert.alert('Success', 'Location removed from saved list');
        } else {
          setSavedLocations(prev => [...prev, locationId]);
          Alert.alert('Success', 'Location saved successfully');
        }
      }
    } catch (error) {
      console.error('Error saving location:', error);
      Alert.alert('Error', 'Failed to save location');
    } finally {
      setSavingLocation(false);
    }
  };

  const getUserLocation = async (): Promise<void> => {
    setIsLocating(true);
    setLocationError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        setIsLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setUserLocation(location);
      
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
      }
    } catch (error) {
      setLocationError('Could not access your location');
    } finally {
      setIsLocating(false);
    }
  };

  const showUserLocation = (): void => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    } else {
      getUserLocation();
    }
  };

  const filterLocations = (): void => {
    let filtered = locations;

    if (selectedService) {
      filtered = filtered.filter(
        location => location.serviceId === selectedService
      );
    }
    if (selectedProvince) {
      filtered = filtered.filter(
        location => location.province === selectedProvince
      );
    }
    if (selectedCity) {
      filtered = filtered.filter(location => location.city === selectedCity);
    }

    setFilteredLocations(filtered);
  };

  const handleMarkerPress = (location: LocationData): void => {
    setSelectedMarker(location);
  };

  const closeMarkerDetails = (): void => {
    setSelectedMarker(null);
  };

  const fitToMarkers = (): void => {
    if (filteredLocations.length > 0 && mapRef.current) {
      const coordinates = filteredLocations.map(location => ({
        latitude: location.lat,
        longitude: location.lng,
      }));
      
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50,
        },
        animated: true,
      });
    }
  };

  useEffect(() => {
    if (filteredLocations.length > 0) {
      setTimeout(fitToMarkers, 500);
    }
  }, [filteredLocations]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D52B1E" />
        <Text style={styles.loadingText}>Loading map data...</Text>
      </SafeAreaView>
    );
  }





  return (
    <SafeAreaView style={styles.container}>
    <ScrollView style={styles.filtersContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Interactive Service Map</Text>
        <Text style={styles.subtitle}>
          Find essential services across Canada
        </Text>
      </View>

      <View style={styles.filtersCard}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Select Service</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedService}
              onValueChange={setSelectedService}
              style={styles.picker}
            >
              <Picker.Item label="All Services" value="" />
              {services.map(service => (
                <Picker.Item
                  key={service.id}
                  label={service.name}
                  value={service.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        {selectedService && (
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Select Province</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedProvince}
                onValueChange={setSelectedProvince}
                style={styles.picker}
              >
                <Picker.Item label="All Provinces" value="" />
                {provinces.map(province => (
                  <Picker.Item
                    key={province}
                    label={province}
                    value={province}
                  />
                ))}
              </Picker>
            </View>
          </View>
        )}

        {selectedProvince && (
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Select City</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedCity}
                onValueChange={setSelectedCity}
                style={styles.picker}
              >
                <Picker.Item label="All Cities" value="" />
                {cities.map(city => (
                  <Picker.Item key={city} label={city} value={city} />
                ))}
              </Picker>
            </View>
          </View>
        )}

        <Text style={styles.locationCount}>
          Showing {filteredLocations.length} location
          {filteredLocations.length !== 1 ? 's' : ''}
        </Text>
      </View>
       </ScrollView>
       

       {/* the reset */}
       {/* <View style={styles.mapContainer}>
   <MapView
     ref={mapRef}
     style={styles.map}
     provider={PROVIDER_GOOGLE}
     initialRegion={initialRegion}
     showsUserLocation={true}
     showsMyLocationButton={false}
   >
     {userLocation && (
       <Marker
         coordinate={{
           latitude: userLocation.coords.latitude,
           longitude: userLocation.coords.longitude,
         }}
         title="Your Location"
         pinColor="#3B82F6"
       />
     )}

     {filteredLocations.map((location) => (
       <Marker
         key={location.id}
         coordinate={{
           latitude: location.lat,
           longitude: location.lng,
         }}
         title={location.name}
         description={location.address}
         pinColor={location.service?.color || serviceColors.other}
         onPress={() => handleMarkerPress(location)}
       />
     ))}
   </MapView>

   <TouchableOpacity
     style={styles.locationButton}
     onPress={showUserLocation}
     disabled={isLocating}
   >
     {isLocating ? (
       <ActivityIndicator size="small" color="white" />
     ) : (
       <Text style={styles.locationButtonText}>📍</Text>
     )}
   </TouchableOpacity>

   {locationError && (
     <View style={styles.errorContainer}>
       <Text style={styles.errorText}>{locationError}</Text>
     </View>
   )}
 </View>; */}


   
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({

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
  // //////////////////////////////
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  filtersContainer: {
    maxHeight: height * 0.4,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: '#D52B1E',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  filtersCard: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 2,
    borderBottomColor: '#D52B1E',
  },
  filterRow: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: '#D52B1E',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#374151',
  },
  locationCount: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  locationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#D52B1E',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  locationButtonText: {
    color: 'white',
    fontSize: 18,
  },
  errorContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    elevation: 3,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  markerDetails: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: height * 0.4,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  markerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    marginRight: 40,
  },
  markerAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  markerLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  markerPhone: {
    fontSize: 14,
    color: '#DC2626',
    marginBottom: 16,
  },
  saveButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  loginPrompt: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
});

