/**
 * Home Screen - Main Entry Point for NeuroKinetics AI Platform
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { ChildProfile } from '../types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load existing child profile or create new one
    loadChildProfile();
  }, []);

  const loadChildProfile = async () => {
    try {
      // In a real app, this would load from AsyncStorage or API
      // For now, we'll create a sample profile
      const sampleProfile: ChildProfile = {
        id: 'child_1',
        name: 'Alex',
        age: 24, // months
        sex: 'male',
        developmentalConcerns: ['Speech delay', 'Social interaction'],
        familyContext: {
          primaryLanguage: 'English',
          culturalBackground: 'Western',
          parentalEducation: 'College',
          availableTime: 'Moderate',
          resources: ['Local therapy center', 'Online resources']
        }
      };

      setChildProfile(sampleProfile);
    } catch (error) {
      console.error('Failed to load child profile:', error);
      Alert.alert('Error', 'Failed to load child profile');
    }
  };

  const startScreening = () => {
    if (!childProfile) {
      Alert.alert('Profile Required', 'Please set up your child\'s profile first.');
      return;
    }

    Alert.alert(
      'Start Screening',
      'This will begin a 6-10 minute gamified assessment. Make sure your child is comfortable and the environment is quiet.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start', onPress: () => navigation.navigate('Screening', { childProfile }) }
      ]
    );
  };

  const viewResults = () => {
    // Navigate to results if available
    navigation.navigate('Results', { assessmentId: 'latest' });
  };

  const openIntervention = () => {
    // Navigate to intervention plan if available
    navigation.navigate('Intervention', { planId: 'current' });
  };

  const openCopilot = () => {
    navigation.navigate('Copilot');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>NeuroKinetics AI</Text>
        <Text style={styles.subtitle}>Autism Screening & Intervention Platform</Text>
      </View>

      {childProfile && (
        <View style={styles.profileCard}>
          <Text style={styles.profileTitle}>Child Profile</Text>
          <View style={styles.profileInfo}>
            <Text style={styles.profileText}>Name: {childProfile.name}</Text>
            <Text style={styles.profileText}>Age: {Math.floor(childProfile.age / 12)} years, {childProfile.age % 12} months</Text>
            <Text style={styles.profileText}>Concerns: {childProfile.developmentalConcerns.join(', ')}</Text>
          </View>
        </View>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={startScreening}>
          <Text style={styles.primaryButtonText}>Start Screening Assessment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={viewResults}>
          <Text style={styles.secondaryButtonText}>View Assessment Results</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={openIntervention}>
          <Text style={styles.secondaryButtonText}>Intervention Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={openCopilot}>
          <Text style={styles.secondaryButtonText}>AI Assistant</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>About This Platform</Text>
        <Text style={styles.infoText}>
          NeuroKinetics AI uses camera-based analysis to screen for autism spectrum disorder
          through gamified activities. Our AI analyzes eye gaze patterns, facial expressions,
          and behavioral responses to provide clinical-grade screening results.
        </Text>

        <Text style={styles.disclaimer}>
          ⚠️ This is a screening tool only. A comprehensive evaluation by qualified
          healthcare professionals is required for diagnosis.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4A90E2',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  profileInfo: {
    gap: 5,
  },
  profileText: {
    fontSize: 16,
    color: '#666',
  },
  actionsContainer: {
    gap: 15,
    padding: 15,
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  secondaryButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 15,
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  disclaimer: {
    fontSize: 12,
    color: '#d32f2f',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 5,
  },
});

export default HomeScreen;
