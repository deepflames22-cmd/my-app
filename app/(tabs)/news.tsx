import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Clock, User as UserIcon } from 'lucide-react-native';

const newsItems = [
  {
    id: 1,
    title: 'Latest Technology Trends in 2025',
    summary: 'Discover the most innovative technologies shaping the future...',
    author: 'Tech Reporter',
    time: '2 hours ago',
    image: 'https://images.pexels.com/photos/355948/pexels-photo-355948.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 2,
    title: 'Mobile App Development Best Practices',
    summary: 'Learn the essential practices for creating outstanding mobile applications...',
    author: 'Dev Team',
    time: '4 hours ago',
    image: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 3,
    title: 'Cybersecurity Updates and Alerts',
    summary: 'Stay informed about the latest security measures and threats...',
    author: 'Security Team',
    time: '6 hours ago',
    image: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

export default function NewsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Latest News</Text>
        <Text style={styles.subtitle}>Stay updated with the latest developments</Text>
        
        <View style={styles.newsContainer}>
          {newsItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.newsCard}>
              <Image source={{ uri: item.image }} style={styles.newsImage} />
              <View style={styles.newsContent}>
                <Text style={styles.newsTitle}>{item.title}</Text>
                <Text style={styles.newsSummary}>{item.summary}</Text>
                <View style={styles.newsFooter}>
                  <View style={styles.authorContainer}>
                    <UserIcon size={14} color="#9CA3AF" strokeWidth={2} />
                    <Text style={styles.authorText}>{item.author}</Text>
                  </View>
                  <View style={styles.timeContainer}>
                    <Clock size={14} color="#9CA3AF" strokeWidth={2} />
                    <Text style={styles.timeText}>{item.time}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  newsContainer: {
    gap: 20,
  },
  newsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  newsImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  newsContent: {
    padding: 20,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  newsSummary: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#9CA3AF',
  },
});