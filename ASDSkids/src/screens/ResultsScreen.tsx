/**
 * Results Screen - Display Assessment Results and Clinical Report
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
import { ClinicalReport, ScreeningAnalysisResult } from '../types';

type ResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Results'>;
type ResultsScreenRouteProp = RouteProp<RootStackParamList, 'Results'>;

interface Props {
  navigation: ResultsScreenNavigationProp;
  route: ResultsScreenRouteProp;
}

const ResultsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { assessmentId } = route.params;
  const [report, setReport] = useState<ClinicalReport | null>(null);
  const [screeningResult, setScreeningResult] = useState<ScreeningAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [assessmentId]);

  const loadResults = async () => {
    try {
      // In a real app, this would fetch from API or AsyncStorage
      // For demo, we'll create mock data
      const mockReport: ClinicalReport = {
        id: assessmentId,
        assessment_id: `assessment_${Date.now()}`,
        generated_date: new Date().toISOString(),
        executive_summary: {
          clinical_impression: 'Screening completed successfully. Results suggest monitoring and further evaluation may be warranted.',
          asd_probability: 65,
          key_findings: [
            'Reduced eye contact during social interactions',
            'Delayed response to name calling',
            'Limited joint attention behaviors'
          ],
          severity_level: 'Requiring Support',
          differential_diagnosis: [
            'Autism Spectrum Disorder',
            'Speech/Language Delay',
            'Social Communication Disorder'
          ],
          next_steps: [
            'Comprehensive diagnostic evaluation',
            'Early intervention referral if indicated',
            'Developmental monitoring every 3 months'
          ]
        },
        detailed_results: {
          domain_analysis: [
            {
              domain: 'social_communication',
              score: 45,
              interpretation: 'Below typical range - moderate concerns',
              evidence: [
                'Limited eye contact during play (observed in 3/6 tasks)',
                'Delayed response to name (average 2.3 seconds vs typical <1 second)'
              ],
              video_references: [1000, 2000, 3000]
            },
            {
              domain: 'repetitive_behaviors',
              score: 70,
              interpretation: 'Within typical range',
              evidence: [
                'No significant repetitive movements observed',
                'Age-appropriate exploration of objects'
              ],
              video_references: []
            }
          ],
          behavioral_examples: [
            {
              behavior: 'Limited eye contact during social play',
              timestamp: 1500,
              clinical_significance: 'Moderate concern warranting further evaluation'
            }
          ],
          normative_comparison: {
            age_norms: {
              social_communication: 75,
              repetitive_behaviors: 25,
              sensory_processing: 80,
              motor_coordination: 85
            },
            child_scores: {
              social_communication: 45,
              repetitive_behaviors: 70,
              sensory_processing: 60,
              motor_coordination: 75
            },
            percentile_ranks: {
              social_communication: 15,
              repetitive_behaviors: 65,
              sensory_processing: 35,
              motor_coordination: 55
            }
          }
        },
        parent_summary: {
          simple_explanation: 'Your child showed some differences in how they interact socially compared to what we typically see at their age. This might be completely normal, or it could be something we want to look at more closely.',
          strengths_highlighted: [
            'Good motor coordination and movement',
            'Appropriate sensory responses',
            'Engaged in visual exploration'
          ],
          concerns_explained: [
            'Less eye contact during play than expected',
            'Slower response when name is called'
          ],
          hope_message: 'Remember, this is just a screening - it doesn\'t mean your child has autism. Early evaluation helps us provide the best support for their development.',
          next_steps_parent: [
            'Talk with your pediatrician about these results',
            'Consider a developmental evaluation if recommended',
            'Continue providing loving, responsive caregiving'
          ]
        },
        visual_analytics: {
          gaze_heatmap: 'heatmap_placeholder',
          movement_trajectory: 'trajectory_placeholder',
          domain_radar_chart: 'radar_placeholder',
          developmental_comparison: 'comparison_placeholder'
        },
        educational_resources: [
          {
            title: 'Understanding Autism Screening',
            type: 'article',
            url: 'https://www.cdc.gov/ncbddd/autism/screening.html',
            description: 'CDC guide to autism screening and early detection'
          }
        ],
        report_metadata: {
          report_version: '1.0',
          language: 'en'
        }
      };

      const mockScreeningResult: ScreeningAnalysisResult = {
        asd_probability: 65,
        confidence_level: 'medium',
        severity_score: 1,
        domain_scores: {
          social_communication: 45,
          repetitive_behaviors: 70,
          sensory_processing: 60,
          motor_coordination: 75
        },
        red_flags: [
          'Limited eye contact during social interactions',
          'Delayed response to name calling'
        ],
        key_observations: [
          {
            timestamp: 1500,
            behavior: 'Reduced social engagement',
            concern_level: 'medium'
          }
        ],
        recommendation: 'refer_for_diagnostic',
        analysis_timestamp: new Date().toISOString(),
        model_version: '1.0.0'
      };

      setReport(mockReport);
      setScreeningResult(mockScreeningResult);
    } catch (error) {
      console.error('Failed to load results:', error);
      Alert.alert('Error', 'Failed to load assessment results');
    } finally {
      setLoading(false);
    }
  };

  const generateInterventionPlan = () => {
    if (!report) return;

    // Navigate to intervention plan generation
    navigation.navigate('Intervention', { planId: `plan_${Date.now()}` });
  };

  const shareResults = () => {
    Alert.alert(
      'Share Results',
      'Would you like to share these results with your healthcare provider?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => {
          // Implement sharing functionality
          Alert.alert('Shared', 'Results have been prepared for sharing');
        }}
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading results...</Text>
      </View>
    );
  }

  if (!report || !screeningResult) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load results</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadResults}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Assessment Results</Text>
        <Text style={styles.date}>{new Date(report.generated_date).toLocaleDateString()}</Text>
      </View>

      {/* ASD Probability Card */}
      <View style={styles.probabilityCard}>
        <Text style={styles.cardTitle}>ASD Probability</Text>
        <View style={styles.probabilityContainer}>
          <Text style={[styles.probabilityText, { color: this.getProbabilityColor(screeningResult.asd_probability) }]}>
            {screeningResult.asd_probability}%
          </Text>
          <Text style={styles.confidenceText}>
            Confidence: {screeningResult.confidence_level}
          </Text>
        </View>
      </View>

      {/* Domain Scores */}
      <View style={styles.scoresCard}>
        <Text style={styles.cardTitle}>Domain Scores</Text>
        {Object.entries(screeningResult.domain_scores).map(([domain, score]) => (
          <View key={domain} style={styles.scoreRow}>
            <Text style={styles.domainText}>{domain.replace('_', ' ')}</Text>
            <View style={styles.scoreBar}>
              <View
                style={[
                  styles.scoreFill,
                  { width: `${score}%`, backgroundColor: this.getScoreColor(score) }
                ]}
              />
            </View>
            <Text style={[styles.scoreText, { color: this.getScoreColor(score) }]}>
              {score}
            </Text>
          </View>
        ))}
      </View>

      {/* Key Findings */}
      <View style={styles.findingsCard}>
        <Text style={styles.cardTitle}>Key Findings</Text>
        {screeningResult.red_flags.map((flag, index) => (
          <Text key={index} style={styles.findingText}>• {flag}</Text>
        ))}
      </View>

      {/* Parent Summary */}
      <View style={styles.parentCard}>
        <Text style={styles.cardTitle}>For Parents</Text>
        <Text style={styles.parentText}>{report.parent_summary.simple_explanation}</Text>

        <Text style={styles.strengthsTitle}>Strengths:</Text>
        {report.parent_summary.strengths_highlighted.map((strength, index) => (
          <Text key={index} style={styles.strengthText}>✓ {strength}</Text>
        ))}

        <Text style={styles.nextStepsTitle}>Next Steps:</Text>
        {report.parent_summary.next_steps_parent.map((step, index) => (
          <Text key={index} style={styles.nextStepText}>• {step}</Text>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={generateInterventionPlan}>
          <Text style={styles.primaryButtonText}>Create Intervention Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={shareResults}>
          <Text style={styles.secondaryButtonText}>Share with Provider</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Copilot')}>
          <Text style={styles.secondaryButtonText}>Ask AI Assistant</Text>
        </TouchableOpacity>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⚠️ This is a screening tool only. These results should be discussed with qualified
          healthcare professionals for proper diagnosis and treatment planning.
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
  header: {
    backgroundColor: '#4A90E2',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  date: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  probabilityCard: {
    backgroundColor: '#ffffff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  probabilityContainer: {
    alignItems: 'center',
  },
  probabilityText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  confidenceText: {
    fontSize: 14,
    color: '#666',
  },
  scoresCard: {
    backgroundColor: '#ffffff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  domainText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textTransform: 'capitalize',
  },
  scoreBar: {
    flex: 2,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginHorizontal: 10,
  },
  scoreFill: {
    height: '100%',
    borderRadius: 10,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'center',
  },
  findingsCard: {
    backgroundColor: '#ffffff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  findingText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 5,
  },
  parentCard: {
    backgroundColor: '#ffffff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  parentText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 15,
  },
  strengthsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 10,
  },
  strengthText: {
    fontSize: 16,
    color: '#4A90E2',
    marginBottom: 5,
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  nextStepText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  actionsContainer: {
    padding: 15,
    gap: 15,
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
  disclaimer: {
    margin: 15,
    padding: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 10,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 20,
  },
});

// Helper methods
const getScoreColor = (score: number): string => {
  if (score >= 80) return '#4caf50'; // Green
  if (score >= 60) return '#ff9800'; // Orange
  return '#f44336'; // Red
};

const getProbabilityColor = (probability: number): string => {
  if (probability >= 80) return '#f44336'; // High risk - Red
  if (probability >= 60) return '#ff9800'; // Medium risk - Orange
  return '#4caf50'; // Low risk - Green
};

export default ResultsScreen;
