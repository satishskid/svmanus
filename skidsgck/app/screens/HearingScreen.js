/**
 * HearingScreen.js
 * Play audiometry hearing screening (1k, 2k, 4k Hz @ 30 dB HL)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { HearingEngine } from '../services/hearingEngine';
import { OfflineDB } from '../services/offlineDB';

const HearingScreen = ({ route, navigation }) => {
  const { child, screenerId, screenerName, schoolCode, visionResult } = route.params;
  const [engine, setEngine] = useState(null);
  const [currentFrequency, setCurrentFrequency] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [result, setResult] = useState(null);
  const [instruction, setInstruction] = useState('');
  const [progress, setProgress] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const hearingEngine = new HearingEngine('default');
    setEngine(hearingEngine);
    startTest(hearingEngine);
  }, []);

  const startTest = async (hearingEngine) => {
    setInstruction('Get ready... Listen for tones at 1000 Hz, 2000 Hz, and 4000 Hz');
    setProgress(0);

    // Show instruction for 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    runScreening(hearingEngine);
  };

  const runScreening = async (hearingEngine) => {
    const frequencies = [1000, 2000, 4000];
    const detectionResults = {};

    for (let i = 0; i < frequencies.length; i++) {
      const freq = frequencies[i];
      setCurrentFrequency(freq);
      setProgress((i / frequencies.length) * 100);
      setInstruction(`Testing ${freq} Hz... Tap YES if you hear the tone`);

      // Play tone
      setIsPlaying(true);
      await hearingEngine.playTone(freq, 30);
      setIsPlaying(false);

      // Wait for response (10 seconds timeout)
      const response = await waitForResponse(10000);
      detectionResults[freq] = response;

      // Brief pause between tones
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    finishTest(detectionResults);
  };

  const waitForResponse = (timeoutMs) => {
    return new Promise((resolve) => {
      let responded = false;
      const timer = setTimeout(() => {
        if (!responded) {
          responded = true;
          resolve(false); // Timeout = no response
        }
      }, timeoutMs);

      global.hearingTestResolve = (detected) => {
        if (!responded) {
          responded = true;
          clearTimeout(timer);
          resolve(detected);
        }
      };
    });
  };

  const handleHeardTone = () => {
    if (global.hearingTestResolve) {
      global.hearingTestResolve(true);
    }
  };

  const handleDidNotHear = () => {
    if (global.hearingTestResolve) {
      global.hearingTestResolve(false);
    }
  };

  const finishTest = (detectionResults) => {
    const pass = Object.values(detectionResults).filter(d => d).length === 3;

    const hearingResult = {
      frequencies: {
        '1000': { detected: detectionResults[1000] || false, confidence: 90 },
        '2000': { detected: detectionResults[2000] || false, confidence: 85 },
        '4000': { detected: detectionResults[4000] || false, confidence: 80 },
      },
      pass,
      testDuration: 0,
    };

    setResult(hearingResult);
    setTestComplete(true);
  };

  const handleComplete = async () => {
    if (!result) return;

    // Save to database
    const db = new OfflineDB('/data/skids.db');

    const screeningData = {
      childProfile: {
        child_id: child.child_id,
        name: child.name,
        dateOfBirth: child.date_of_birth,
        schoolCode: child.school_code,
      },
      screeningDate: new Date().toISOString(),
      vision: visionResult,
      hearing: result,
      referralNeeded: !visionResult.pass || !result.pass,
      referralReasons: [
        ...(visionResult && !visionResult.pass ? ['vision_fail'] : []),
        ...(result && !result.pass ? ['hearing_fail'] : []),
      ],
      passStatus: visionResult.pass && result.pass ? 'pass' : 'refer',
      screenerId,
      screenerName,
      schoolCode,
      offlineMode: true,
    };

    const resultId = db.saveScreeningResult(screeningData);
    db.addToSyncQueue('screening_result', resultId, screeningData);
    db.close();

    // Navigate to results
    navigation.navigate('Results', {
      screeningId: resultId,
      visionResult,
      hearingResult: result,
    });
  };

  const handleRetry = () => {
    setTestComplete(false);
    setResult(null);
    setCurrentFrequency(null);
    startTest(engine);
  };

  if (testComplete && result) {
    return (
      <View style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Hearing Test Complete ✅</Text>

          <View style={styles.resultCard}>
            <FrequencyResult
              frequency={1000}
              detected={result.frequencies['1000'].detected}
            />
            <FrequencyResult
              frequency={2000}
              detected={result.frequencies['2000'].detected}
            />
            <FrequencyResult
              frequency={4000}
              detected={result.frequencies['4000'].detected}
            />

            <View
              style={[
                styles.passStatusBox,
                result.pass ? styles.passBox : styles.referBox,
              ]}
            >
              <Text style={styles.passStatusText}>
                {result.pass ? '✅ PASS (heard all 3 frequencies)' : '⚠️ REFER'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleComplete}
          >
            <Text style={styles.buttonText}>Save & View Results</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleRetry}
          >
            <Text style={styles.buttonText}>Retry Hearing Test</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>{child.name}</Text>
        <Text style={styles.headerSubtext}>Hearing Test</Text>
      </View>

      {/* Test Area */}
      <View style={styles.testArea}>
        <Text style={styles.instructionText}>{instruction}</Text>

        {currentFrequency && (
          <View style={styles.frequencyDisplay}>
            <Animated.Text
              style={[
                styles.frequencyNumber,
                {
                  opacity: isPlaying
                    ? Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                      })
                    : fadeAnim,
                },
              ]}
            >
              🔊
            </Animated.Text>
            <Text style={styles.frequencyLabel}>{currentFrequency} Hz</Text>
            {isPlaying && <ActivityIndicator size="large" color="#4a6fa5" />}
          </View>
        )}
      </View>

      {/* Response Buttons */}
      {!isPlaying && currentFrequency && !testComplete && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.yesButton]}
            onPress={handleHeardTone}
          >
            <Text style={styles.buttonText}>✅ Yes, I heard it</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.noButton]}
            onPress={handleDidNotHear}
          >
            <Text style={styles.buttonText}>❌ No, didn't hear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Progress Bar */}
      <View style={styles.footer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(progress, 100)}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
      </View>
    </View>
  );
};

const FrequencyResult = ({ frequency, detected }) => (
  <View style={styles.frequencyResultRow}>
    <Text style={styles.frequencyResultLabel}>{frequency} Hz</Text>
    <View
      style={[
        styles.frequencyResultBadge,
        detected ? styles.detectedBadge : styles.notDetectedBadge,
      ]}
    >
      <Text style={styles.frequencyResultText}>
        {detected ? '✅ Detected' : '❌ Not Detected'}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#4a6fa5',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtext: {
    fontSize: 14,
    color: '#e0e0e0',
    marginTop: 4,
  },
  testArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  frequencyDisplay: {
    alignItems: 'center',
  },
  frequencyNumber: {
    fontSize: 80,
    marginBottom: 16,
  },
  frequencyLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a6fa5',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yesButton: {
    backgroundColor: '#4caf50',
  },
  noButton: {
    backgroundColor: '#f44336',
  },
  primaryButton: {
    backgroundColor: '#4a6fa5',
    marginVertical: 8,
  },
  secondaryButton: {
    backgroundColor: '#e0e0e0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resultContainer: {
    flex: 1,
    paddingVertical: 32,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  frequencyResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  frequencyResultLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  frequencyResultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  detectedBadge: {
    backgroundColor: '#c8e6c9',
  },
  notDetectedBadge: {
    backgroundColor: '#ffccbc',
  },
  frequencyResultText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  passStatusBox: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  passBox: {
    backgroundColor: '#c8e6c9',
  },
  referBox: {
    backgroundColor: '#ffccbc',
  },
  passStatusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  footer: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4a6fa5',
  },
  progressText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
});

export default HearingScreen;
