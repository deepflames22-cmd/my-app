import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  ActivityIndicator,
  Alert 

} from 'react-native';
import { Search, ArrowLeft, Phone, MapPin } from 'lucide-react-native';

interface Service {
  id: string;
  name: string;
  description?: string;
  dewscription?: string;
  icon: string;
  type?: string;
}

interface Location {
  id: string;
  name: string;
  city: string;
  province: string;
  address?: string;
  phone?: string;
  serviceId: string;
  service?: Service;
}

import { useRouter } from "expo-router";

const categories = [
  { key: "all", label: "All Services", icon: "🏛️" },
  { key: "Government Agency", label: "Government Agencies", icon: "🏛️" },
  { key: "Bank", label: "Banks & Money Transfer", icon: "🏦" },
  { key: "shopping", label: "Shopping Malls", icon: "🛍️" },
  { key: "groceries", label: "Grocery Stores", icon: "🛒" },
  { key: "transport", label: "Transport", icon: "🚌" },
  { key: "telecom", label: "Telecom", icon: "📱" },
  { key: "drivetest", label: "Drive Test Centers", icon: "🚗" },
  { key: "Hospital", label: "Hospitals in the area", icon: "🏥" },
  { key: "other", label: "Other Services", icon: "🔍" },
];

export default function ServicesScreen() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 20;
  const router = useRouter();

  useEffect(() => {
    fetchServices();
    fetchLocations();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("https://canada-newcomers.vercel.app/api/services");
      const data = await response.json();
      console.log(data, "Services fetched successfully");
      setServices(data.services || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      Alert.alert("Error", "Failed to fetch services");
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch("https://canada-newcomers.vercel.app/api/locations");
      const data = await response.json();
      console.log(data, "Locations fetched successfully");
      setLocations(data.locations || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
      Alert.alert("Error", "Failed to fetch locations");
    } finally {
      setLoading(false);
    }
  };

  const handleServiceClick = (location: Location) => {
    router.push(`/location/${location.id}`);
  
  };

  const handleCategoryClick = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
    setCurrentPage(1);
  };

  const { paginatedLocations, totalPages, filteredCount } = useMemo(() => {
    let filtered = locations;

    if (selectedCategory !== "all") {
      const selectedService = services.find((s) => s.name === selectedCategory);
      if (selectedService) {
        filtered = locations.filter(
          (location) => location.serviceId === selectedService.id
        );
      } else {
        filtered = [];
      }
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (location) =>
          location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.service?.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedLocations = filtered.slice(
      startIndex,
      startIndex + itemsPerPage
    );
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    return { paginatedLocations, totalPages, filteredCount: filtered.length };
  }, [selectedCategory, searchQuery, currentPage, locations, services]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setCurrentPage(1);
  };

  const getCategoryCount = (categoryKey: string) => {
    if (categoryKey === "all") return locations.length;
    const selectedService = services.find((s) => s.name === categoryKey);
    if (!selectedService) return 0;
    return locations.filter(
      (location) => location.serviceId === selectedService.id
    ).length;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>Loading services...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Services Directory</Text>
          <Text style={styles.headerSubtitle}>Find essential services across Canada</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#9CA3AF" strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search services, locations, or cities..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          {searchQuery ? (
            <Text style={styles.searchResults}>
              Found {filteredCount} results for "{searchQuery}"
            </Text>
          ) : null}
        </View>

        {/* Service Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Service Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            <View style={styles.categoriesGrid}>
              {services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.categoryCard,
                    selectedCategory === service.name && styles.categoryCardSelected
                  ]}
                  onPress={() => handleCategoryClick(service.name)}
                >
                  {service.icon ? (
                    <Image source={{ uri: service.icon }} style={styles.categoryIcon} />
                  ) : (
                    <Text style={styles.categoryEmoji}>🏛️</Text>
                  )}
                  <Text style={[
                    styles.categoryTitle,
                    selectedCategory === service.name && styles.categoryTitleSelected
                  ]}>
                    {service.dewscription || service.description || service.name}
                  </Text>
                  <Text style={styles.categoryCount}>
                    {getCategoryCount(service.name)} locations
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Locations List */}
        <View style={styles.locationsContainer}>
          <View style={styles.locationsHeader}>
            <Text style={styles.locationsTitle}>
              {selectedCategory === "all"
                ? "All Locations"
                : `${categories.find((c) => c.key === selectedCategory)?.label || selectedCategory} Locations`}
              <Text style={styles.locationsCount}> ({filteredCount})</Text>
            </Text>
            {selectedCategory !== "all" && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedCategory("all")}
              >
                <ArrowLeft size={16} color="#DC2626" strokeWidth={2} />
                <Text style={styles.backButtonText}>Back to All</Text>
              </TouchableOpacity>
            )}
          </View>

          {paginatedLocations.length > 0 ? (
            <>
              <View style={styles.locationsList}>
                {paginatedLocations.map((location) => (
                  <TouchableOpacity
                    key={location.id}
                    style={styles.locationCard}
                    onPress={() => handleServiceClick(location)}
                  >
                    <View style={styles.locationHeader}>
                      <Text style={styles.locationName}>{location.name}</Text>
                      <View style={styles.serviceTypeTag}>
                        <Text style={styles.serviceTypeText}>
                          {location.service?.type || "service"}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.locationInfo}>
                      <MapPin size={14} color="#DC2626" strokeWidth={2} />
                      <Text style={styles.locationCity}>
                        {location.city}, {location.province}
                      </Text>
                    </View>
                    
                    {location.address && (
                      <Text style={styles.locationAddress}>{location.address}</Text>
                    )}
                    
                    {location.phone && (
                      <View style={styles.locationPhone}>
                        <Phone size={14} color="#6B7280" strokeWidth={2} />
                        <Text style={styles.locationPhoneText}>{location.phone}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Pagination */}
              {totalPages > 1 && (
                <View style={styles.pagination}>
                  <TouchableOpacity
                    style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                    onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <Text style={[styles.paginationButtonText, currentPage === 1 && styles.paginationButtonTextDisabled]}>
                      Previous
                    </Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.paginationInfo}>
                    Page {currentPage} of {totalPages}
                  </Text>
                  
                  <TouchableOpacity
                    style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
                    onPress={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <Text style={[styles.paginationButtonText, currentPage === totalPages && styles.paginationButtonTextDisabled]}>
                      Next
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🔍</Text>
              <Text style={styles.emptyStateTitle}>No locations found</Text>
              <Text style={styles.emptyStateDescription}>
                {searchQuery
                  ? `No results found for "${searchQuery}"`
                  : "No locations available in this category"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#DC2626',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  searchContainer: {
    padding: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#DC2626',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  searchResults: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 16,
  },
  categoriesScroll: {
    marginHorizontal: -20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DC2626',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 140,
  },
  categoryCardSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    marginBottom: 12,
    borderRadius: 8,
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 8,
  },
  categoryTitleSelected: {
    color: '#DC2626',
  },
  categoryCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  locationsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  locationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC2626',
    flex: 1,
  },
  locationsCount: {
    color: '#6B7280',
    fontSize: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 4,
    color: '#DC2626',
    fontWeight: '500',
  },
  locationsList: {
    gap: 16,
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#DC2626',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  serviceTypeTag: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  serviceTypeText: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '600',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationCity: {
    marginLeft: 6,
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '500',
  },
  locationAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  locationPhone: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationPhoneText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#6B7280',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 16,
  },
  paginationButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 8,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationButtonText: {
    color: '#DC2626',
    fontWeight: '500',
  },
  paginationButtonTextDisabled: {
    color: '#9CA3AF',
  },
  paginationInfo: {
    color: '#6B7280',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});