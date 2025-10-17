/**
 * VisionScreen.js
 * Interactive vision acuity testing (logMAR staircase)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { VisionEngine } from '../services/visionEngine';
import { OfflineDB } from '../services/offlineDB';

const { width, height } = Dimensions.get('window');

const VisionScreen = ({ route, navigation }) => {
  const { child, screenerId, screenerName, schoolCode } = route.params;
  const [engine, setEngine] = useState(null);
  const [currentTrial, setCurrentTrial] = useState(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [result, setResult] = useState(null);
  const [symbolSize] = useState(new Animated.Value(100));

  // Calculate symbol size based on logMAR
  useEffect(() => {
    if (currentTrial) {
      const baseSizeMM = 8.87; // Smallest logMAR symbol in mm
      const testDistanceMM = 4000; // 4 meters
      const sizeAtLogMAR0 = testDistanceMM / 200; // 20/20 equivalent
      const sizeAtLogMAR = sizeAtLogMAR0 * Math.pow(10, currentTrial.logmar);
      const pixelSize = (sizeAtLogMAR / baseSizeMM) * 10;

      Animated.timing(symbolSize, {
        toValue: pixelSize,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [currentTrial, symbolSize]);

  // Initialize vision engine
  useEffect(() => {
    const age = calculateAge(child.date_of_birth);
    const visionEngine = new VisionEngine(age, 4.0); // 4 meters distance
    setEngine(visionEngine);
    startTest(visionEngine);
  }, []);

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const startTest = (visionEngine) => {
    setIsTestRunning(true);
    const trial = visionEngine.getNextTrial();
    setCurrentTrial(trial);
  };

  const handleResponse = (isCorrect) => {
    if (!engine || !isTestRunning) return;

    const testFinished = engine.recordResponse(isCorrect);

    if (testFinished) {
      finishTest();
    } else {
      const nextTrial = engine.getNextTrial();
      setCurrentTrial(nextTrial);
    }
  };

  const finishTest = () => {
    const va = engine.getEstimatedVA();
    const pass = va <= 0.3; // logMAR 0.3 = 20/40

    const visionResult = {
      logMAR: va,
      snellenEquivalent: logmarToSnellen(va),
      pass,
      confidence: calculateConfidence(engine.responses),
      testDuration: 0, // Would track actual time
      reversals: engine.reversals,
    };

    setResult(visionResult);
    setTestComplete(true);
    setIsTestRunning(false);
  };

  const logmarToSnellen = (logmar) => {
    const snellenNumerator = Math.round(20 * Math.pow(10, logmar));
    return `20/${snellenNumerator}`;
  };

  const calculateConfidence = (responses) => {
    if (responses.length < 4) return 50;
    const lastFour = responses.slice(-4);
    const correctCount = lastFour.filter(r => r.correct).length;
    return (correctCount / 4) * 100;
  };

  const handleContinue = () => {
    navigation.navigate('HearingTest', {
      child,
      screenerId,
      screenerName,
      schoolCode,
      visionResult: result,
    });
  };

  const handleRetryVision = () => {
    const age = calculateAge(child.date_of_birth);
    const visionEngine = new VisionEngine(age, 4.0);
    setEngine(visionEngine);
    setTestComplete(false);
    setResult(null);
    startTest(visionEngine);
  };

  if (testComplete && result) {
    return (
      <View style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Vision Test Complete ✅</Text>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Visual Acuity (logMAR)</Text>
            <Text style={styles.resultValue}>{result.logMAR.toFixed(2)}</Text>

            <Text style={styles.resultLabel}>Snellen Equivalent</Text>
            <Text style={styles.resultValue}>{result.snellenEquivalent}</Text>

            <Text style={styles.resultLabel}>Confidence</Text>
            <Text style={styles.resultValue}>{result.confidence.toFixed(0)}%</Text>

            <View style={[styles.passStatusBox, result.pass ? styles.passBox : styles.referBox]}>
              <Text style={styles.passStatusText}>
                {result.pass ? '✅ PASS' : '⚠️ REFER'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Continue to Hearing Test →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleRetryVision}
          >
            <Text style={styles.buttonText}>Retry Vision Test</Text>
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
        <Text style={styles.headerSubtext}>Vision Acuity Test</Text>
      </View>

      {/* Test Area */}
      <View style={styles.testArea}>
        <Text style={styles.instructionText}>
          {engine ? `Is this symbol correct? (${engine.responses.length + 1}/${engine.responses.length + 20})` : 'Loading...'}
        </Text>

        {currentTrial && (
          <View style={styles.symbolContainer}>
            <Animated.Text
              style={[
                styles.symbol,
                {
                  fontSize: symbolSize,
                },
              ]}
            >
              {getSymbolEmoji(currentTrial.symbol)}
            </Animated.Text>
            <Text style={styles.symbolName}>{currentTrial.symbol}</Text>
            <Text style={styles.logmarDisplay}>logMAR: {currentTrial.logmar.toFixed(1)}</Text>
          </View>
        )}
      </View>

      {/* Response Buttons */}
      {isTestRunning && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.correctButton]}
            onPress={() => handleResponse(true)}
          >
            <Text style={styles.buttonText}>✅ Correct</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.incorrectButton]}
            onPress={() => handleResponse(false)}
          >
            <Text style={styles.buttonText}>❌ Can't See</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Progress */}
      {engine && (
        <View style={styles.footer}>
          <Text style={styles.progressText}>
            Reversals: {engine.reversals}/4 | Trials: {engine.responses.length}
          </Text>
        </View>
      )}
    </View>
  );
};

const getSymbolEmoji = (symbol) => {
  const symbols = {
    apple: '🍎',
    house: '🏠',
    circle: '●',
    square: '■',
    hand: '✋',
  };
  return symbols[symbol] || '?';
};

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
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  symbolContainer: {
    alignItems: 'center',
  },
  symbol: {
    marginBottom: 16,
    color: '#333',
  },
  symbolName: {
    fontSize: 16,
    color: '#4a6fa5',
    fontWeight: '600',
    marginBottom: 8,
  },
  logmarDisplay: {
    fontSize: 12,
    color: '#999',
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
  correctButton: {
    backgroundColor: '#4caf50',
  },
  incorrectButton: {
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
  resultLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a6fa5',
  },
  passStatusBox: {
    marginTop: 20,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  progressText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
});

export default VisionScreen;
