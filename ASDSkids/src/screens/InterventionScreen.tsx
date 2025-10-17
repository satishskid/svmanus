/**
 * Intervention Screen - Personalized Intervention Plan Display
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { InterventionPlan } from '../types';

type InterventionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Intervention'>;
type InterventionScreenRouteProp = RouteProp<RootStackParamList, 'Intervention'>;

interface Props {
  navigation: InterventionScreenNavigationProp;
  route: InterventionScreenRouteProp;
}

const InterventionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { planId } = route.params;
  const [plan, setPlan] = useState<InterventionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'goals' | 'strategies' | 'schedule' | 'progress'>('goals');

  useEffect(() => {
    loadInterventionPlan();
  }, [planId]);

  const loadInterventionPlan = async () => {
    try {
      // In a real app, this would fetch from API or AsyncStorage
      // For demo, we'll create mock intervention plan data
      const mockPlan: InterventionPlan = {
        id: planId,
        assessment_id: `assessment_${Date.now()}`,
        child_id: 'child_1',
        created_date: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        priority_goals: [
          {
            id: 'goal_1',
            goal: 'Increase social engagement during play',
            smart_format: {
              specific: 'Make eye contact during 50% of play interactions',
              measurable: 'Count eye contact instances per play session',
              achievable: 'Start with 5-minute sessions, gradually increase',
              relevant: 'Supports social development and communication',
              time_bound: 'Achieve within 8 weeks'
            },
            rationale: 'Based on observed reduced eye contact patterns in screening',
            timeline_weeks: 8,
            current_progress: 25
          },
          {
            id: 'goal_2',
            goal: 'Improve response to name calling',
            smart_format: {
              specific: 'Respond to name within 2 seconds',
              measurable: 'Time response latency across multiple trials',
              achievable: 'Practice in quiet environments first',
              relevant: 'Essential for safety and social interaction',
              time_bound: 'Achieve within 6 weeks'
            },
            rationale: 'Screening showed delayed response to name (average 2.3 seconds)',
            timeline_weeks: 6,
            current_progress: 40
          }
        ],
        evidence_based_strategies: {
          social_communication: [
            {
              strategy: 'Joint Attention Training',
              description: 'Focus on shared attention during play activities',
              activities: [
                'Follow child\'s lead in play',
                'Use child\'s interests to build attention',
                'Narrate actions during play',
                'Point to objects and wait for response'
              ],
              frequency: 'Daily, 15-20 minutes',
              materials_needed: ['Child\'s favorite toys', 'Picture books', 'Bubbles']
            },
            {
              strategy: 'Social Stories',
              description: 'Use simple stories to teach social situations',
              activities: [
                'Read social stories about daily routines',
                'Create custom stories for challenging situations',
                'Review stories before events'
              ],
              frequency: '2-3 times per week',
              materials_needed: ['Social story books', 'Pictures', 'Drawing materials']
            }
          ],
          behavior_management: [
            {
              strategy: 'Visual Schedules',
              description: 'Use visual supports to help with transitions and routines',
              activities: [
                'Create picture schedule for daily routines',
                'Use timer for activity transitions',
                'Provide advance warnings for changes'
              ],
              frequency: 'Throughout the day',
              materials_needed: ['Picture cards', 'Timer', 'Visual schedule board']
            }
          ],
          language_development: [
            {
              strategy: 'Communication Temptations',
              description: 'Set up situations that naturally encourage communication',
              activities: [
                'Pause during favorite activities',
                'Offer choices between preferred items',
                'Wait for communication attempts before responding'
              ],
              frequency: 'Multiple times daily during routines',
              materials_needed: ['Favorite snacks or toys for motivation']
            }
          ],
          daily_living_skills: [
            {
              strategy: 'Task Analysis',
              description: 'Break down daily living skills into small, manageable steps',
              activities: [
                'Hand washing routine (6 steps)',
                'Getting dressed sequence',
                'Meal time steps',
                'Brushing teeth routine'
              ],
              frequency: 'Daily practice with hand-over-hand support',
              materials_needed: ['Visual step cards', 'Timer for each step']
            }
          ]
        },
        daily_schedule: [
          {
            time_slot: 'Morning (9:00 AM)',
            activity: 'Joint attention play',
            duration_minutes: 20,
            intervention_type: 'Social communication',
            materials: ['Favorite toys', 'Bubbles']
          },
          {
            time_slot: 'Mid-morning (10:30 AM)',
            activity: 'Communication temptations',
            duration_minutes: 15,
            intervention_type: 'Language development',
            materials: ['Snack items', 'Picture cards']
          },
          {
            time_slot: 'Afternoon (2:00 PM)',
            activity: 'Visual schedule review',
            duration_minutes: 10,
            intervention_type: 'Behavior management',
            materials: ['Visual schedule', 'Timer']
          }
        ],
        parent_training: {
          curriculum: [
            {
              week: 1,
              topic: 'Understanding Your Child\'s Profile',
              learning_objectives: [
                'Review screening results and what they mean',
                'Identify your child\'s strengths and challenges',
                'Learn about autism characteristics'
              ],
              video_url: 'https://example.com/video1',
              practice_activities: [
                'Observe your child during play',
                'Note communication attempts',
                'Identify preferred activities'
              ],
              homework: [
                'Read provided materials on autism',
                'Complete observation checklist',
                'Prepare questions for next session'
              ]
            },
            {
              week: 2,
              topic: 'Communication Strategies',
              learning_objectives: [
                'Learn to recognize communication attempts',
                'Practice communication temptations',
                'Understand visual supports'
              ],
              video_url: 'https://example.com/video2',
              practice_activities: [
                'Set up communication temptations',
                'Use picture exchange systems',
                'Practice waiting strategies'
              ],
              homework: [
                'Practice temptations 3x daily',
                'Note communication successes',
                'Create 2 visual supports'
              ]
            }
          ]
        },
        progress_monitoring: {
          data_collection: {
            frequency: ['Daily frequency counts', 'Duration of activities'],
            duration: ['Length of social interactions', 'Time to complete tasks'],
            abc_analysis: true
          },
          check_in_prompts: [
            'How many times did your child initiate social interaction today?',
            'What challenging behaviors occurred and what happened before/after?',
            'What activities seemed most engaging for your child?'
          ],
          milestone_indicators: [
            'Increased eye contact during play',
            'More frequent communication attempts',
            'Reduced challenging behaviors',
            'Improved response to name'
          ],
          adjustment_triggers: [
            'No progress after 2 weeks',
            'Increased challenging behaviors',
            'Parental stress or difficulty implementing strategies'
          ]
        },
        resource_connections: [
          {
            type: 'therapy',
            name: 'Local Early Intervention Program',
            contact_info: 'Phone: (555) 123-4567\nEmail: info@earlyintervention.org',
            description: 'Comprehensive developmental evaluation and therapy services',
            website: 'https://www.earlyintervention.org'
          },
          {
            type: 'support_group',
            name: 'Parents of Children with Autism Support Group',
            contact_info: 'Meets monthly at Community Center',
            description: 'Connect with other parents for support and information sharing',
            website: 'https://www.autismparents.org'
          },
          {
            type: 'financial',
            name: 'State Autism Assistance Program',
            contact_info: 'Phone: (555) 987-6543',
            description: 'Financial assistance for therapy and intervention services'
          }
        ],
        personalization_factors: {
          language_complexity: 'simple',
          cultural_considerations: ['Family-centered approach', 'Respect for cultural values'],
          time_resources: 'moderate',
          family_priorities: ['social skills', 'communication', 'independence'],
          child_strengths: ['visual learning', 'good motor skills', 'musical interests']
        }
      };

      setPlan(mockPlan);
    } catch (error) {
      console.error('Failed to load intervention plan:', error);
      Alert.alert('Error', 'Failed to load intervention plan');
    } finally {
      setLoading(false);
    }
  };

  const markGoalComplete = (goalId: string) => {
    // In a real app, this would update the plan
    Alert.alert('Progress Updated', 'Goal progress has been recorded!');
  };

  const logProgress = () => {
    navigation.navigate('Copilot');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading intervention plan...</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load intervention plan</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadInterventionPlan}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'goals':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Priority Goals</Text>
            {plan.priority_goals.map(goal => (
              <View key={goal.id} style={styles.goalCard}>
                <Text style={styles.goalTitle}>{goal.goal}</Text>
                <Text style={styles.goalRationale}>{goal.rationale}</Text>
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>Progress: {goal.current_progress}%</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${goal.current_progress}%` }]} />
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => markGoalComplete(goal.id)}
                >
                  <Text style={styles.completeButtonText}>Update Progress</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );

      case 'strategies':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Evidence-Based Strategies</Text>

            <Text style={styles.strategyCategory}>Social Communication</Text>
            {plan.evidence_based_strategies.social_communication.map((strategy, index) => (
              <View key={index} style={styles.strategyCard}>
                <Text style={styles.strategyTitle}>{strategy.strategy}</Text>
                <Text style={styles.strategyDescription}>{strategy.description}</Text>
                <Text style={styles.frequencyText}>Frequency: {strategy.frequency}</Text>
                <Text style={styles.activitiesTitle}>Activities:</Text>
                {strategy.activities.map((activity, i) => (
                  <Text key={i} style={styles.activityText}>• {activity}</Text>
                ))}
              </View>
            ))}

            <Text style={styles.strategyCategory}>Language Development</Text>
            {plan.evidence_based_strategies.language_development.map((strategy, index) => (
              <View key={index} style={styles.strategyCard}>
                <Text style={styles.strategyTitle}>{strategy.strategy}</Text>
                <Text style={styles.strategyDescription}>{strategy.description}</Text>
                <Text style={styles.activitiesTitle}>Activities:</Text>
                {strategy.activities.map((activity, i) => (
                  <Text key={i} style={styles.activityText}>• {activity}</Text>
                ))}
              </View>
            ))}
          </View>
        );

      case 'schedule':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Daily Schedule</Text>
            {plan.daily_schedule.map((item, index) => (
              <View key={index} style={styles.scheduleCard}>
                <Text style={styles.scheduleTime}>{item.time_slot}</Text>
                <Text style={styles.scheduleActivity}>{item.activity}</Text>
                <Text style={styles.scheduleDuration}>{item.duration_minutes} minutes</Text>
                <Text style={styles.scheduleType}>{item.intervention_type}</Text>
              </View>
            ))}
          </View>
        );

      case 'progress':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Progress Monitoring</Text>

            <Text style={styles.monitoringTitle}>Data Collection</Text>
            <Text style={styles.monitoringText}>
              Track: {plan.progress_monitoring.data_collection.frequency.join(', ')}
            </Text>

            <TouchableOpacity style={styles.logButton} onPress={logProgress}>
              <Text style={styles.logButtonText}>Log Today's Progress</Text>
            </TouchableOpacity>

            <Text style={styles.monitoringTitle}>Milestone Indicators</Text>
            {plan.progress_monitoring.milestone_indicators.map((milestone, index) => (
              <Text key={index} style={styles.milestoneText}>• {milestone}</Text>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'goals', label: 'Goals' },
          { key: 'strategies', label: 'Strategies' },
          { key: 'schedule', label: 'Schedule' },
          { key: 'progress', label: 'Progress' }
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {renderTabContent()}
      </ScrollView>

      {/* Resources Section */}
      <View style={styles.resourcesContainer}>
        <Text style={styles.resourcesTitle}>Resources & Support</Text>
        {plan.resource_connections.map((resource, index) => (
          <View key={index} style={styles.resourceCard}>
            <Text style={styles.resourceName}>{resource.name}</Text>
            <Text style={styles.resourceDescription}>{resource.description}</Text>
            <Text style={styles.resourceContact}>{resource.contact_info}</Text>
            {resource.website && (
              <Text style={styles.resourceWebsite}>{resource.website}</Text>
            )}
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.copilotButton} onPress={() => navigation.navigate('Copilot')}>
          <Text style={styles.copilotButtonText}>💬 Ask AI Assistant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#d32f2f',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#4A90E2',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  tabContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  goalCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  goalRationale: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  progressBar: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 10,
  },
  completeButton: {
    backgroundColor: '#4A90E2',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  strategyCategory: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginTop: 20,
    marginBottom: 10,
  },
  strategyCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  strategyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  strategyDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  frequencyText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    fontWeight: '600',
  },
  activitiesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  activityText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  scheduleCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 5,
  },
  scheduleActivity: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  scheduleDuration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  scheduleType: {
    fontSize: 12,
    color: '#4A90E2',
    fontStyle: 'italic',
  },
  monitoringTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  monitoringText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  logButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  logButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  milestoneText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  resourcesContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginTop: 10,
  },
  resourcesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  resourceCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 5,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  resourceContact: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },
  resourceWebsite: {
    fontSize: 14,
    color: '#4A90E2',
  },
  footer: {
    padding: 15,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  copilotButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  copilotButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});

export default InterventionScreen;
