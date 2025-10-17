/**
 * Gamified Screening Module - Stage 1
 *
 * Interactive assessment tasks for autism screening including:
 * - Social engagement games
 * - Visual stimulus presentation
 * - Motor activity assessment
 * - Camera-based data capture
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Animated
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { ChildProfile, VideoAnalysisData } from '../types';
import { morphokineticAnalyzer } from '../services/morphokineticAnalyzer';
import { aiAnalysisService } from '../services/aiAnalysisService';

type ScreeningModuleNavigationProp = StackNavigationProp<RootStackParamList, 'Screening'>;
type ScreeningModuleRouteProp = RouteProp<RootStackParamList, 'Screening'>;

interface Props {
  navigation: ScreeningModuleNavigationProp;
  route: ScreeningModuleRouteProp;
}

interface GameTask {
  id: string;
  name: string;
  description: string;
  duration: number; // seconds
  type: 'social' | 'visual' | 'motor' | 'attention';
  instructions: string;
}

const ScreeningModule: React.FC<Props> = ({ navigation, route }) => {
  const { childProfile } = route.params;

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isTaskActive, setIsTaskActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const timerRef = useRef<NodeJS.Timeout>();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const gameTasks: GameTask[] = [
    {
      id: 'bubble_game',
      name: 'Bubble Pop Game',
      description: 'Interactive bubble popping for response tracking',
      duration: 60,
      type: 'social',
      instructions: 'Pop the bubbles by touching them! See if your child responds to the social cues.'
    },
    {
      id: 'character_interaction',
      name: 'Friend Time',
      description: 'Animated character interactions for joint attention',
      duration: 90,
      type: 'attention',
      instructions: 'Watch the friendly character! See how your child engages with the animation.'
    },
    {
      id: 'peek_a_boo',
      name: 'Peek-a-Boo',
      description: 'Social reciprocity game',
      duration: 45,
      type: 'social',
      instructions: 'Play peek-a-boo with the character! Observe social responses.'
    },
    {
      id: 'name_calling',
      name: 'Name Game',
      description: 'Response to name calling',
      duration: 30,
      type: 'attention',
      instructions: 'We\'ll call your child\'s name. Watch for their response!'
    },
    {
      id: 'face_preference',
      name: 'Face vs Object',
      description: 'Social vs non-social scene preference',
      duration: 60,
      type: 'visual',
      instructions: 'Different scenes will appear. See what captures attention.'
    },
    {
      id: 'motion_perception',
      name: 'Motion Detection',
      duration: 45,
      type: 'visual',
      instructions: 'Watch for different types of movement patterns.'
    }
  ];

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      morphokineticAnalyzer.stopAnalysis();
    };
  }, []);

  const startTask = async () => {
    const currentTask = gameTasks[currentTaskIndex];

    setIsTaskActive(true);
    setTimeRemaining(currentTask.duration);

    // Start camera analysis
    try {
      await morphokineticAnalyzer.initialize({} as any);
      await morphokineticAnalyzer.startAnalysis({} as any);
      setIsAnalyzing(true);
    } catch (error) {
      console.error('Failed to start camera analysis:', error);
      Alert.alert('Error', 'Failed to start camera analysis');
    }

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          endTask();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Animate task start
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
  };

  const endTask = async () => {
    setIsTaskActive(false);
    setIsAnalyzing(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Stop camera analysis and get results
    const videoData = morphokineticAnalyzer.stopAnalysis();

    // Move to next task or complete screening
    if (currentTaskIndex < gameTasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    } else {
      // Complete screening and run AI analysis
      await completeScreening(videoData);
    }
  };

  const completeScreening = async (videoData: VideoAnalysisData) => {
    try {
      setIsAnalyzing(true);

      // Run AI analysis on collected data
      const screeningResult = await aiAnalysisService.performScreeningAnalysis(videoData, childProfile);

      // Generate clinical report
      const report = await aiAnalysisService.generateClinicalReport(
        screeningResult,
        childProfile,
        [] // video clips would be populated here
      );

      setAnalysisResults({ screeningResult, report });

      // Navigate to results
      navigation.navigate('Results', { assessmentId: report.id });

    } catch (error) {
      console.error('Screening completion failed:', error);
      Alert.alert('Error', 'Failed to complete screening analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const skipTask = () => {
    if (currentTaskIndex < gameTasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    } else {
      Alert.alert('Complete', 'This was the final task.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderGameContent = () => {
    const task = gameTasks[currentTaskIndex];

    return (
      <Animated.View style={[styles.gameContainer, { opacity: fadeAnim }]}>
        {task.id === 'bubble_game' && <BubbleGame />}
        {task.id === 'character_interaction' && <CharacterInteraction />}
        {task.id === 'peek_a_boo' && <PeekABooGame />}
        {task.id === 'name_calling' && <NameCallingGame />}
        {task.id === 'face_preference' && <FacePreferenceTest />}
        {task.id === 'motion_perception' && <MotionPerceptionTest />}

        <View style={styles.gameOverlay}>
          <Text style={styles.taskName}>{task.name}</Text>
          <Text style={styles.taskDescription}>{task.instructions}</Text>
          {isTaskActive && (
            <Text style={styles.timer}>{formatTime(timeRemaining)}</Text>
          )}
        </View>
      </Animated.View>
    );
  };

  const currentTask = gameTasks[currentTaskIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progress}>
          Task {currentTaskIndex + 1} of {gameTasks.length}
        </Text>
        <Text style={styles.taskType}>{currentTask.type.toUpperCase()}</Text>
      </View>

      <View style={styles.content}>
        {renderGameContent()}
      </View>

      <View style={styles.controls}>
        {!isTaskActive ? (
          <TouchableOpacity style={styles.startButton} onPress={startTask}>
            <Text style={styles.startButtonText}>Start Task</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.skipButton} onPress={skipTask}>
            <Text style={styles.skipButtonText}>Skip Task</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.status}>
          {isAnalyzing ? '🎥 Recording and analyzing...' : 'Ready to start'}
        </Text>
      </View>
    </View>
  );
};

// Individual game components (simplified for this demo)
const BubbleGame: React.FC = () => (
  <View style={styles.gamePlaceholder}>
    <Text style={styles.gameText}>🌊 Bubble Pop Game</Text>
    <Text style={styles.gameSubtext}>Touch the bubbles to pop them!</Text>
  </View>
);

const CharacterInteraction: React.FC = () => (
  <View style={styles.gamePlaceholder}>
    <Text style={styles.gameText}>👋 Friendly Character</Text>
    <Text style={styles.gameSubtext}>Watch the character wave and play!</Text>
  </View>
);

const PeekABooGame: React.FC = () => (
  <View style={styles.gamePlaceholder}>
    <Text style={styles.gameText}>🙈 Peek-a-Boo</Text>
    <Text style={styles.gameSubtext}>Let's play peek-a-boo together!</Text>
  </View>
);

const NameCallingGame: React.FC = () => (
  <View style={styles.gamePlaceholder}>
    <Text style={styles.gameText}>📢 Name Game</Text>
    <Text style={styles.gameSubtext}>Listening for name response...</Text>
  </View>
);

const FacePreferenceTest: React.FC = () => (
  <View style={styles.gamePlaceholder}>
    <Text style={styles.gameText}>😊 Face vs Object</Text>
    <Text style={styles.gameSubtext}>Different scenes will appear</Text>
  </View>
);

const MotionPerceptionTest: React.FC = () => (
  <View style={styles.gamePlaceholder}>
    <Text style={styles.gameText}>🌟 Motion Patterns</Text>
    <Text style={styles.gameSubtext}>Watch the moving patterns</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
  },
  progress: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 5,
  },
  taskType: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gamePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 40,
    width: '100%',
  },
  gameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  gameSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  gameOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  taskName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  controls: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  startButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A90E2',
    marginBottom: 10,
  },
  skipButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default ScreeningModule;
