import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { OfflineDB } from '../services/offlineDB';

/**
 * ResultsScreen - Comprehensive screening results display and recommendations
 * Shows vision and hearing test results with pass/refer status and referral recommendations
 */
export const ResultsScreen = ({ route, navigation }) => {
  const { childId, screeningId } = route.params || {};
  const [screeningResult, setScreeningResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState(null);

  // Initialize database and load results
  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);

      if (!childId || !screeningId) {
        throw new Error('Missing child or screening ID');
      }

      // Initialize database
      const db = new OfflineDB(':memory:');
      db.initialize();

      // Load child and screening data
      const childData = db.getChildById(childId);
      if (!childData) {
        throw new Error('Child profile not found');
      }

      setChild(childData);

      // Get specific screening result
      const allResults = db.getChildScreenings(childId);
      const result = allResults.find((r) => r.id === screeningId);

      if (!result) {
        throw new Error('Screening result not found');
      }

      setScreeningResult(result);
    } catch (error) {
      console.error('Error loading results:', error);
      Alert.alert('Error', `Failed to load results: ${error.message}`);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Determine vision pass/refer status
   */
  const getVisionStatus = () => {
    if (!screeningResult) return null;
    
    const visionPass = screeningResult.vision_pass;
    const visionLogMAR = screeningResult.vision_logmar;
    const visionSnellen = screeningResult.vision_snellen;
    const confidence = screeningResult.vision_confidence;

    return {
      status: visionPass ? 'PASS' : 'REFER',
      color: visionPass ? '#27AE60' : '#E74C3C',
      logMAR: visionLogMAR?.toFixed(3),
      snellen: visionSnellen || 'N/A',
      confidence: confidence ? `${(confidence * 100).toFixed(0)}%` : 'N/A',
    };
  };

  /**
   * Determine hearing pass/refer status
   */
  const getHearingStatus = () => {
    if (!screeningResult) return null;

    const hearingPass = screeningResult.hearing_pass;
    const freq1k = screeningResult.hearing_1000hz;
    const freq2k = screeningResult.hearing_2000hz;
    const freq4k = screeningResult.hearing_4000hz;

    return {
      status: hearingPass ? 'PASS' : 'REFER',
      color: hearingPass ? '#27AE60' : '#E74C3C',
      frequencies: [
        { freq: '1000 Hz', detected: freq1k },
        { freq: '2000 Hz', detected: freq2k },
        { freq: '4000 Hz', detected: freq4k },
      ],
    };
  };

  /**
   * Generate referral recommendations based on results
   */
  const getReferralReasons = () => {
    if (!screeningResult?.referral_reasons) return [];

    return screeningResult.referral_reasons.split(',').map((r) => r.trim());
  };

  /**
   * Export results as PDF/CSV
   */
  const handleExport = (format) => {
    navigation.navigate('Export', {
      childId,
      screeningId,
      format,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6fa5" />
        <Text style={styles.loadingText}>Loading results...</Text>
      </View>
    );
  }

  if (!screeningResult || !child) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load screening results</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const visionStatus = getVisionStatus();
  const hearingStatus = getHearingStatus();
  const referralReasons = getReferralReasons();
  const needsReferral = screeningResult.referral_needed;

  return (
    <ScrollView style={styles.container}>
      {/* Header - Child Info */}
      <View style={styles.header}>
        <Text style={styles.childName}>{child.name}</Text>
        <Text style={styles.childId}>ID: {child.child_id}</Text>
        <Text style={styles.childDOB}>DOB: {child.date_of_birth}</Text>
        {child.school_code && (
          <Text style={styles.schoolCode}>School: {child.school_code}</Text>
        )}
      </View>

      {/* Screening Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>📋 Screening Summary</Text>
        <Text style={styles.screeningDate}>
          Date: {new Date(screeningResult.screening_date).toLocaleDateString()}
        </Text>
        <Text style={styles.screenerInfo}>
          Screener: {screeningResult.screener_name || 'Unknown'}
        </Text>
        <View
          style={[
            styles.overallStatusBadge,
            {
              backgroundColor: needsReferral ? '#FFE5E5' : '#E5F5E5',
            },
          ]}
        >
          <Text
            style={[
              styles.overallStatusText,
              { color: needsReferral ? '#E74C3C' : '#27AE60' },
            ]}
          >
            {needsReferral
              ? '🔴 REFERRAL RECOMMENDED'
              : '🟢 SCREENING PASSED'}
          </Text>
        </View>
      </View>

      {/* Vision Results */}
      <View style={styles.resultsSection}>
        <Text style={styles.sectionTitle}>👁️ Vision Testing Results</Text>
        <View style={[styles.resultCard, { borderLeftColor: visionStatus.color }]}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultLabel}>Visual Acuity Test</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: visionStatus.color },
              ]}
            >
              <Text style={styles.statusBadgeText}>{visionStatus.status}</Text>
            </View>
          </View>

          <View style={styles.resultDetails}>
            <View style={styles.resultRow}>
              <Text style={styles.resultKey}>LogMAR Value:</Text>
              <Text style={styles.resultValue}>{visionStatus.logMAR}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultKey}>Snellen Equivalent:</Text>
              <Text style={styles.resultValue}>{visionStatus.snellen}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultKey}>Confidence:</Text>
              <Text style={styles.resultValue}>{visionStatus.confidence}</Text>
            </View>
          </View>

          {!visionStatus.status === 'PASS' && (
            <View style={styles.recommendationBox}>
              <Text style={styles.recommendationTitle}>📌 Recommendation</Text>
              <Text style={styles.recommendationText}>
                Vision screening indicated referral to eye care specialist for
                comprehensive evaluation.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Hearing Results */}
      <View style={styles.resultsSection}>
        <Text style={styles.sectionTitle}>🔊 Hearing Testing Results</Text>
        <View style={[styles.resultCard, { borderLeftColor: hearingStatus.color }]}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultLabel}>Play Audiometry Test</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: hearingStatus.color },
              ]}
            >
              <Text style={styles.statusBadgeText}>{hearingStatus.status}</Text>
            </View>
          </View>

          <View style={styles.frequencyGrid}>
            {hearingStatus.frequencies.map((item, idx) => (
              <View key={idx} style={styles.frequencyCard}>
                <Text style={styles.frequencyLabel}>{item.freq}</Text>
                <Text
                  style={[
                    styles.frequencyValue,
                    {
                      color: item.detected ? '#27AE60' : '#E74C3C',
                    },
                  ]}
                >
                  {item.detected ? '✓ Detected' : '✗ No Response'}
                </Text>
              </View>
            ))}
          </View>

          {hearingStatus.status === 'REFER' && (
            <View style={styles.recommendationBox}>
              <Text style={styles.recommendationTitle}>📌 Recommendation</Text>
              <Text style={styles.recommendationText}>
                Hearing screening indicated referral to audiologist for
                comprehensive evaluation.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Referral Section */}
      {needsReferral && (
        <View style={styles.referralSection}>
          <Text style={styles.sectionTitle}>⚠️ Referral Information</Text>
          <View style={styles.referralCard}>
            <Text style={styles.referralTitle}>
              Recommended Actions for Parent/Guardian:
            </Text>
            {referralReasons.length > 0 ? (
              referralReasons.map((reason, idx) => (
                <View key={idx} style={styles.referralItem}>
                  <Text style={styles.referralBullet}>•</Text>
                  <Text style={styles.referralText}>{reason}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.referralText}>
                Schedule comprehensive eye care and/or hearing evaluation with
                appropriate specialists.
              </Text>
            )}
          </View>

          <View style={styles.resourcesBox}>
            <Text style={styles.resourcesTitle}>💡 Resources</Text>
            <Text style={styles.resourcesText}>
              • Local ophthalmology clinic finder{'\n'}
              • Audiology referral network{'\n'}
              • Insurance coverage information{'\n'}• Follow-up appointment
              scheduling
            </Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => handleExport('pdf')}
        >
          <Text style={styles.exportButtonText}>📄 Export as PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.csvButton}
          onPress={() => handleExport('csv')}
        >
          <Text style={styles.csvButtonText}>📊 Export as CSV</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.homeButtonText}>🏠 Home</Text>
        </TouchableOpacity>
      </View>

      {/* Footer Spacing */}
      <View style={styles.spacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4a6fa5',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#4a6fa5',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  childName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 6,
  },
  childId: {
    fontSize: 14,
    color: '#E0E7FF',
    marginBottom: 4,
  },
  childDOB: {
    fontSize: 14,
    color: '#E0E7FF',
    marginBottom: 4,
  },
  schoolCode: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  summarySection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  screeningDate: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  screenerInfo: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  overallStatusBadge: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  overallStatusText: {
    fontSize: 16,
    fontWeight: '700',
  },
  resultsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  resultDetails: {
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  resultKey: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  frequencyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  frequencyCard: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  frequencyLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  frequencyValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  recommendationBox: {
    backgroundColor: '#FFF9E6',
    borderLeftWidth: 3,
    borderLeftColor: '#F39C12',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 12,
  },
  recommendationTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E67E22',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  referralSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  referralCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  referralTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E74C3C',
    marginBottom: 12,
  },
  referralItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  referralBullet: {
    fontSize: 14,
    color: '#E74C3C',
    marginRight: 8,
    fontWeight: '600',
  },
  referralText: {
    fontSize: 13,
    color: '#555',
    flex: 1,
    lineHeight: 18,
  },
  resourcesBox: {
    backgroundColor: '#E8F4F8',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  resourcesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16A085',
    marginBottom: 6,
  },
  resourcesText: {
    fontSize: 12,
    color: '#555',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  exportButton: {
    backgroundColor: '#4a6fa5',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  csvButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  csvButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  homeButton: {
    backgroundColor: '#7F8C8D',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  spacing: {
    height: 40,
  },
});

export default ResultsScreen;
