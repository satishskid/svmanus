/**
 * HomeScreen.js
 * Main entry point - shows child selection and navigation options
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, StyleSheet } from 'react-native';
import { OfflineDB } from '../services/offlineDB';

const HomeScreen = ({ navigation }) => {
  const [children, setChildren] = useState([]);
  const [db, setDb] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const database = new OfflineDB('/data/skids.db');
    setDb(database);
    loadChildren();

    return () => {
      database.close();
    };
  }, []);

  const loadChildren = () => {
    if (db) {
      const allChildren = db.getAllChildren();
      setChildren(allChildren);
      setRefreshing(false);
    }
  };

  const handleScanQR = () => {
    navigation.navigate('QRScanner');
  };

  const handleSelectChild = (child) => {
    navigation.navigate('ScreeningMenu', { child });
  };

  const handleImportRoster = () => {
    navigation.navigate('RosterImport');
  };

  const handleViewAnalytics = () => {
    navigation.navigate('Analytics');
  };

  const handleExport = () => {
    navigation.navigate('Export');
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadChildren();
  };

  const renderChildCard = ({ item }) => (
    <TouchableOpacity
      style={styles.childCard}
      onPress={() => handleSelectChild(item)}
    >
      <Text style={styles.childName}>{item.name}</Text>
      <Text style={styles.childId}>ID: {item.child_id}</Text>
      <Text style={styles.childDob}>DOB: {item.date_of_birth}</Text>
      {item.school_code && (
        <Text style={styles.childSchool}>{item.school_code}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📊 SKIDS EYEAR</Text>
        <Text style={styles.tagline}>Vision & Hearing Screening</Text>
      </View>

      {/* Action Buttons */}
      <ScrollView horizontal style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleScanQR}>
          <Text style={styles.actionBtnIcon}>📱</Text>
          <Text style={styles.actionBtnText}>Scan QR</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleImportRoster}>
          <Text style={styles.actionBtnIcon}>📋</Text>
          <Text style={styles.actionBtnText}>Import</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleExport}>
          <Text style={styles.actionBtnIcon}>📤</Text>
          <Text style={styles.actionBtnText}>Export</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleViewAnalytics}>
          <Text style={styles.actionBtnIcon}>📈</Text>
          <Text style={styles.actionBtnText}>Analytics</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Children List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Recent Children ({children.length})
        </Text>
        {children.length > 0 ? (
          <FlatList
            data={children}
            renderItem={renderChildCard}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No children yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Scan QR codes or import a roster to get started
            </Text>
          </View>
        )}
      </View>

      {/* Footer Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Offline mode: All data saved locally
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4a6fa5',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#e0e0e0',
  },
  actionButtons: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f0f4f8',
    minWidth: 80,
  },
  actionBtnIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionBtnText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  section: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  childCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4a6fa5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  childName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  childId: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  childDob: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  childSchool: {
    fontSize: 12,
    color: '#4a6fa5',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#f0f4f8',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 12,
    color: '#888',
  },
});

export default HomeScreen;
