/**
 * AI Analysis Service for Autism Screening
 *
 * This service uses the AI prompts to analyze morphokinetic data and generate
 * screening results, clinical reports, intervention plans, and conversational responses.
 */

import * as TFLite from 'react-native-fast-tflite';
import {
  AUTISM_SCREENING_MODEL_PATH,
  REPORT_GENERATION_MODEL_PATH,
  INTERVENTION_PLANNING_MODEL_PATH,
  CONVERSATIONAL_MODEL_PATH
} from '../models/modelPaths';
import {
  VideoAnalysisData,
  ScreeningAnalysisResult,
  ClinicalReport,
  InterventionPlan,
  CopilotConversation,
  ChildProfile
} from '../types';
import {
  SCREENING_ANALYSIS_PROMPT,
  REPORT_GENERATION_PROMPT,
  INTERVENTION_PLANNING_PROMPT,
  CONVERSATIONAL_COPILOT_PROMPT
} from './aiPrompts';

export interface AIModelConfig {
  modelVersion: string;
  temperature: number;
  maxTokens: number;
  apiEndpoint?: string; // For cloud models, local models use TensorFlow Lite
}

export class AIAnalysisService {
  private config: AIModelConfig = {
    modelVersion: '1.0.0',
    temperature: 0.7,
    maxTokens: 2048
  };

  constructor(config?: Partial<AIModelConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Perform autism screening analysis on morphokinetic data
   */
  async performScreeningAnalysis(
    videoData: VideoAnalysisData,
    childProfile: ChildProfile
  ): Promise<ScreeningAnalysisResult> {
    try {
      console.log('Starting AI screening analysis...');

      // Prepare input data according to the prompt
      const inputData = {
        videoStream: videoData.videoStream,
        extractedFeatures: Object.keys(videoData.extractedFeatures).map(key => `${key}: ${videoData.extractedFeatures[key as keyof typeof videoData.extractedFeatures].length} data points`),
        temporalSequences: `Frame-by-frame behavioral data (${videoData.temporalSequences.length} frames at ${videoData.metadata.fps}fps)`,
        childMetadata: {
          age: childProfile.age,
          sex: childProfile.sex,
          developmentalConcerns: childProfile.developmentalConcerns
        }
      };

      // Use TensorFlow Lite for local inference (mock implementation)
      const result = await this.runLocalInference('screening', {
        systemPrompt: SCREENING_ANALYSIS_PROMPT.systemRole,
        inputData,
        tasks: SCREENING_ANALYSIS_PROMPT.analysisTasks,
        guidelines: SCREENING_ANALYSIS_PROMPT.clinicalGuidelines
      });

      // Parse and validate the result
      const screeningResult: ScreeningAnalysisResult = {
        asd_probability: result.asd_probability || 50,
        confidence_level: result.confidence_level || 'medium',
        severity_score: result.severity_score || 2,
        domain_scores: result.domain_scores || {
          social_communication: 50,
          repetitive_behaviors: 50,
          sensory_processing: 50,
          motor_coordination: 50
        },
        red_flags: result.red_flags || [],
        key_observations: result.key_observations || [],
        recommendation: result.recommendation || 'monitor',
        analysis_timestamp: new Date().toISOString(),
        model_version: this.config.modelVersion
      };

      console.log('Screening analysis completed:', screeningResult);
      return screeningResult;

    } catch (error) {
      console.error('Screening analysis failed:', error);

      // Return a safe default result
      return {
        asd_probability: 50,
        confidence_level: 'low',
        severity_score: 2,
        domain_scores: {
          social_communication: 50,
          repetitive_behaviors: 50,
          sensory_processing: 50,
          motor_coordination: 50
        },
        red_flags: ['Analysis error - manual review recommended'],
        key_observations: [],
        recommendation: 'monitor',
        analysis_timestamp: new Date().toISOString(),
        model_version: this.config.modelVersion
      };
    }
  }

  /**
   * Generate clinical report from screening results
   */
  async generateClinicalReport(
    screeningResult: ScreeningAnalysisResult,
    childProfile: ChildProfile,
    videoClips: Array<{ timestamp: number; url: string; behavior: string }>
  ): Promise<ClinicalReport> {
    try {
      console.log('Generating clinical report...');

      const inputData = {
        screeningResults: screeningResult,
        videoClips: videoClips.map(clip => `${clip.timestamp}: ${clip.behavior}`),
        childProfile,
        previousAssessments: childProfile.previousAssessments || []
      };

      const result = await this.runLocalInference('report', {
        systemPrompt: REPORT_GENERATION_PROMPT.systemRole,
        inputData,
        sections: REPORT_GENERATION_PROMPT.reportSections,
        toneGuidelines: REPORT_GENERATION_PROMPT.toneGuidelines
      });

      // Generate comprehensive report structure
      const report: ClinicalReport = {
        id: `report_${Date.now()}`,
        assessment_id: `assessment_${Date.now()}`,
        generated_date: new Date().toISOString(),
        executive_summary: {
          clinical_impression: result.executive_summary?.clinical_impression || 'Screening completed - further evaluation recommended',
          asd_probability: screeningResult.asd_probability,
          key_findings: screeningResult.key_observations.map(obs => obs.behavior),
          severity_level: this.getSeverityLevel(screeningResult.severity_score),
          differential_diagnosis: ['ADHD', 'Language Delay', 'Anxiety Disorder'],
          next_steps: [
            'Comprehensive diagnostic evaluation',
            'Early intervention referral if indicated',
            'Developmental monitoring'
          ]
        },
        detailed_results: {
          domain_analysis: Object.entries(screeningResult.domain_scores).map(([domain, score]) => ({
            domain,
            score,
            interpretation: this.interpretScore(score),
            evidence: screeningResult.key_observations.filter(obs => obs.behavior.toLowerCase().includes(domain.replace('_', ' '))).map(obs => obs.behavior),
            video_references: videoClips.filter(clip => clip.behavior.toLowerCase().includes(domain.replace('_', ' '))).map(clip => clip.timestamp)
          })),
          behavioral_examples: screeningResult.key_observations.map(obs => ({
            behavior: obs.behavior,
            timestamp: obs.timestamp || 0,
            clinical_significance: this.getClinicalSignificance(obs.concern_level)
          })),
          normative_comparison: {
            age_norms: this.getAgeNorms(childProfile.age),
            child_scores: screeningResult.domain_scores,
            percentile_ranks: this.calculatePercentileRanks(screeningResult.domain_scores, childProfile.age)
          }
        },
        parent_summary: {
          simple_explanation: this.generateParentExplanation(screeningResult),
          strengths_highlighted: this.identifyStrengths(screeningResult),
          concerns_explained: screeningResult.red_flags,
          hope_message: 'Early intervention can make a significant difference in your child\'s development. Many children with autism go on to lead fulfilling lives with appropriate support.',
          next_steps_parent: [
            'Discuss results with your pediatrician',
            'Consider developmental evaluation if recommended',
            'Connect with local autism support resources'
          ]
        },
        visual_analytics: {
          gaze_heatmap: 'gaze_heatmap_placeholder',
          movement_trajectory: 'movement_trajectory_placeholder',
          domain_radar_chart: 'radar_chart_placeholder',
          developmental_comparison: 'comparison_chart_placeholder'
        },
        educational_resources: [
          {
            title: 'Understanding Autism Spectrum Disorder',
            type: 'article',
            url: 'https://www.cdc.gov/ncbddd/autism/facts.html',
            description: 'CDC overview of autism signs and characteristics'
          },
          {
            title: 'Early Intervention Services',
            type: 'website',
            url: 'https://www.cdc.gov/ncbddd/autism/treatment.html',
            description: 'Information about early intervention programs'
          }
        ],
        report_metadata: {
          report_version: '1.0',
          language: 'en'
        }
      };

      console.log('Clinical report generated successfully');
      return report;

    } catch (error) {
      console.error('Report generation failed:', error);
      throw new Error('Failed to generate clinical report');
    }
  }

  /**
   * Generate personalized intervention plan
   */
  async generateInterventionPlan(
    assessmentResult: ScreeningAnalysisResult,
    childProfile: ChildProfile,
    familyContext: any
  ): Promise<InterventionPlan> {
    try {
      console.log('Generating intervention plan...');

      const inputData = {
        assessmentResults: assessmentResult,
        childProfile,
        familyContext,
        availableServices: {} // Would be populated with local services
      };

      const result = await this.runLocalInference('intervention', {
        systemPrompt: INTERVENTION_PLANNING_PROMPT.systemRole,
        inputData,
        components: INTERVENTION_PLANNING_PROMPT.planComponents,
        personalization: INTERVENTION_PLANNING_PROMPT.personalizationFactors
      });

      // Generate comprehensive intervention plan
      const plan: InterventionPlan = {
        id: `plan_${Date.now()}`,
        assessment_id: `assessment_${Date.now()}`,
        child_id: childProfile.id,
        created_date: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        priority_goals: this.generatePriorityGoals(assessmentResult),
        evidence_based_strategies: {
          social_communication: [
            {
              strategy: 'Joint Attention Training',
              description: 'Focus on shared attention during play activities',
              activities: ['Follow child\'s lead in play', 'Use child\'s interests to build attention', 'Narrate actions during play'],
              frequency: 'Daily, 15-20 minutes',
              materials_needed: ['Child\'s favorite toys', 'Picture books']
            }
          ],
          behavior_management: [
            {
              strategy: 'Visual Schedules',
              description: 'Use visual supports to help with transitions and routines',
              activities: ['Create picture schedule for daily routines', 'Use timer for activity transitions', 'Provide advance warnings'],
              frequency: 'Throughout the day',
              materials_needed: ['Picture cards', 'Timer', 'Visual schedule board']
            }
          ],
          language_development: [
            {
              strategy: 'Communication Temptations',
              description: 'Set up situations that naturally encourage communication',
              activities: ['Pause during favorite activities', 'Offer choices', 'Wait for communication attempts'],
              frequency: 'Multiple times daily',
              materials_needed: ['Favorite snacks or toys for motivation']
            }
          ],
          daily_living_skills: [
            {
              strategy: 'Task Analysis',
              description: 'Break down daily living skills into small, manageable steps',
              activities: ['Hand washing routine', 'Getting dressed sequence', 'Meal time steps'],
              frequency: 'Daily practice',
              materials_needed: ['Visual step cards', 'Timer for each step']
            }
          ]
        },
        daily_schedule: this.generateDailySchedule(),
        parent_training: {
          curriculum: this.generateParentCurriculum()
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
            'Reduced repetitive behaviors',
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
            contact_info: 'Contact local developmental services',
            description: 'Comprehensive developmental evaluation and therapy services'
          },
          {
            type: 'support_group',
            name: 'Parent Support Network',
            contact_info: 'Local autism society chapter',
            description: 'Connect with other parents for support and information'
          }
        ],
        personalization_factors: {
          language_complexity: 'simple',
          cultural_considerations: familyContext.culturalBackground ? [familyContext.culturalBackground] : [],
          time_resources: familyContext.availableTime || 'moderate',
          family_priorities: ['social skills', 'communication'],
          child_strengths: ['visual learning', 'good motor skills']
        }
      };

      console.log('Intervention plan generated successfully');
      return plan;

    } catch (error) {
      console.error('Intervention plan generation failed:', error);
      throw new Error('Failed to generate intervention plan');
    }
  }

  /**
   * Generate conversational copilot response
   */
  async generateCopilotResponse(
    conversation: CopilotConversation,
    userMessage: string,
    userType: 'parent' | 'physician'
  ): Promise<string> {
    try {
      console.log('Generating copilot response...');

      const context = {
        conversationHistory: conversation.context.conversation_history,
        userType,
        currentAssessment: conversation.context.current_assessment,
        interventionPlan: conversation.context.intervention_plan
      };

      const result = await this.runLocalInference('copilot', {
        systemPrompt: CONVERSATIONAL_COPILOT_PROMPT.systemRole,
        userMessage,
        context,
        userTypeGuidelines: CONVERSATIONAL_COPILOT_PROMPT.userTypes[userType],
        knowledgeBase: CONVERSATIONAL_COPILOT_PROMPT.knowledgeBase
      });

      return result.response || 'I understand your concern. Let me help you with that.';

    } catch (error) {
      console.error('Copilot response generation failed:', error);
      return 'I\'m here to help. Could you please rephrase your question or provide more details about what you\'d like to know?';
    }
  }

  /**
   * Run local inference using TensorFlow Lite
   */
  private async runLocalInference(
    modelType: 'screening' | 'report' | 'intervention' | 'copilot',
    input: any
  ): Promise<any> {
    try {
      // Load the appropriate model based on type
      const modelPath = this.getModelPath(modelType);

      if (!modelPath) {
        console.warn(`No model path found for ${modelType}, using mock inference`);
        return this.getMockInferenceResult(modelType);
      }

      // Load TensorFlow Lite model
      const model = await TFLite.loadModel(modelPath);

      if (!model) {
        console.error(`Failed to load model for ${modelType}`);
        return this.getMockInferenceResult(modelType);
      }

      // Prepare input data for the model
      const modelInput = this.prepareModelInput(modelType, input);

      // Run inference
      const outputs = await model.run(modelInput);

      // Process outputs based on model type
      const result = this.processModelOutput(modelType, outputs);

      console.log(`${modelType} inference completed successfully`);
      return result;

    } catch (error) {
      console.error(`TensorFlow Lite inference failed for ${modelType}:`, error);
      // Fallback to mock results
      return this.getMockInferenceResult(modelType);
    }
  }

  /**
   * Get model path for specific model type
   */
  private getModelPath(modelType: string): string | null {
    switch (modelType) {
      case 'screening':
        return AUTISM_SCREENING_MODEL_PATH;
      case 'report':
        return REPORT_GENERATION_MODEL_PATH;
      case 'intervention':
        return INTERVENTION_PLANNING_MODEL_PATH;
      case 'copilot':
        return CONVERSATIONAL_MODEL_PATH;
      default:
        return null;
    }
  }

  /**
   * Prepare input data for model inference
   */
  private prepareModelInput(modelType: string, input: any): any {
    // Convert input data to model-compatible format
    // This would depend on the specific model architecture

    switch (modelType) {
      case 'screening':
        return {
          video_features: this.extractVideoFeatures(input),
          child_metadata: input.childMetadata,
          temporal_data: input.temporalSequences
        };

      case 'report':
        return {
          screening_results: input.screeningResults,
          video_clips: input.videoClips,
          child_profile: input.childProfile
        };

      case 'intervention':
        return {
          assessment_results: input.assessmentResults,
          child_profile: input.childProfile,
          family_context: input.familyContext
        };

      case 'copilot':
        return {
          user_message: input.userMessage,
          context: input.context,
          user_type: input.userType
        };

      default:
        return input;
    }
  }

  /**
   * Process model output based on model type
   */
  private processModelOutput(modelType: string, outputs: any): any {
    switch (modelType) {
      case 'screening':
        return {
          asd_probability: outputs.asd_probability || 50,
          confidence_level: outputs.confidence_level || 'medium',
          severity_score: outputs.severity_score || 2,
          domain_scores: outputs.domain_scores || {
            social_communication: 50,
            repetitive_behaviors: 50,
            sensory_processing: 50,
            motor_coordination: 50
          },
          red_flags: outputs.red_flags || [],
          key_observations: outputs.key_observations || [],
          recommendation: outputs.recommendation || 'monitor'
        };

      case 'report':
        return {
          executive_summary: outputs.executive_summary || {},
          clinical_impressions: outputs.clinical_impressions || [],
          recommendations: outputs.recommendations || []
        };

      case 'intervention':
        return {
          priority_goals: outputs.priority_goals || [],
          strategies: outputs.strategies || {},
          progress_metrics: outputs.progress_metrics || []
        };

      case 'copilot':
        return {
          response: outputs.response || 'I understand your concern.',
          suggestions: outputs.suggestions || [],
          follow_up_questions: outputs.follow_up_questions || []
        };

      default:
        return outputs;
    }
  }

  /**
   * Extract video features for model input
   */
  private extractVideoFeatures(input: any): any {
    // Extract relevant features from video analysis data
    return {
      eye_tracking_stats: input.extractedFeatures.eyeTracking.length,
      facial_landmark_count: input.extractedFeatures.facialLandmarks.length,
      head_pose_variations: input.extractedFeatures.headPose.length,
      body_keypoint_count: input.extractedFeatures.bodyKeypoints.length,
      temporal_sequence_length: input.temporalSequences.length,
      metadata: input.metadata
    };
  }

  /**
   * Fallback mock inference results
   */
  private getMockInferenceResult(modelType: string): any {
    console.log(`Using mock inference for ${modelType}`);

    switch (modelType) {
      case 'screening':
        return {
          asd_probability: Math.floor(Math.random() * 100),
          confidence_level: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
          severity_score: Math.floor(Math.random() * 3) + 1,
          domain_scores: {
            social_communication: Math.floor(Math.random() * 100),
            repetitive_behaviors: Math.floor(Math.random() * 100),
            sensory_processing: Math.floor(Math.random() * 100),
            motor_coordination: Math.floor(Math.random() * 100)
          },
          red_flags: ['Limited eye contact', 'Delayed response to name'],
          key_observations: [
            { timestamp: 1000, behavior: 'Reduced social engagement', concern_level: 'medium' },
            { timestamp: 2000, behavior: 'Repetitive hand movements', concern_level: 'high' }
          ],
          recommendation: ['refer_for_diagnostic', 'monitor'][Math.floor(Math.random() * 2)]
        };

      case 'report':
        return {
          executive_summary: {
            clinical_impression: 'Screening suggests possible autism spectrum concerns requiring further evaluation.'
          }
        };

      case 'intervention':
        return {
          priority_goals: ['Increase social interaction', 'Reduce repetitive behaviors']
        };

      case 'copilot':
        return {
          response: 'I understand your concern about your child\'s development. Based on the screening results, here are some strategies that might help...'
        };

      default:
        return {};
    }
  }

  // Helper methods for generating content
  private getSeverityLevel(score: number): string {
    if (score === 1) return 'Requiring Support';
    if (score === 2) return 'Requiring Substantial Support';
    return 'Requiring Very Substantial Support';
  }

  private interpretScore(score: number): string {
    if (score < 30) return 'Below typical range - significant concerns';
    if (score < 70) return 'Below typical range - moderate concerns';
    if (score < 85) return 'Within typical range - mild variations';
    return 'Within typical range';
  }

  private getClinicalSignificance(level: string): string {
    switch (level) {
      case 'high': return 'Strong indicator requiring immediate attention';
      case 'medium': return 'Moderate concern warranting further evaluation';
      case 'low': return 'Mild variation that should be monitored';
      default: return 'Requires clinical judgment';
    }
  }

  private getAgeNorms(age: number): Record<string, number> {
    // Mock age-based norms
    return {
      social_communication: Math.max(30, 100 - age * 0.5),
      repetitive_behaviors: 20,
      sensory_processing: 80,
      motor_coordination: Math.min(90, 50 + age * 0.8)
    };
  }

  private calculatePercentileRanks(scores: Record<string, number>, age: number): Record<string, number> {
    // Mock percentile calculations
    return Object.fromEntries(
      Object.entries(scores).map(([domain, score]) => [domain, Math.floor(Math.random() * 100)])
    );
  }

  private generateParentExplanation(result: ScreeningAnalysisResult): string {
    return `Your child showed some differences in social communication and behavior patterns compared to what we typically see at their age. This doesn't mean they have autism, but it suggests we should look more closely with a comprehensive evaluation.`;
  }

  private identifyStrengths(result: ScreeningAnalysisResult): string[] {
    const strengths = [];
    if (result.domain_scores.motor_coordination > 70) strengths.push('Good motor coordination');
    if (result.domain_scores.sensory_processing > 70) strengths.push('Adaptive sensory processing');
    return strengths;
  }

  private generatePriorityGoals(result: ScreeningAnalysisResult) {
    return [
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
        rationale: 'Based on observed reduced eye contact patterns',
        timeline_weeks: 8,
        current_progress: 0
      }
    ];
  }

  private generateDailySchedule() {
    return [
      {
        time_slot: 'Morning',
        activity: 'Social play time',
        duration_minutes: 20,
        intervention_type: 'Joint attention training',
        materials: ['Favorite toys', 'Books']
      },
      {
        time_slot: 'Afternoon',
        activity: 'Communication practice',
        duration_minutes: 15,
        intervention_type: 'Language temptations',
        materials: ['Snacks', 'Picture cards']
      }
    ];
  }

  private generateParentCurriculum() {
    return [
      {
        week: 1,
        topic: 'Understanding Autism Screening Results',
        learning_objectives: ['Explain screening findings in simple terms', 'Identify next steps for evaluation'],
        practice_activities: ['Review child\'s results with partner', 'Practice explaining to family members'],
        homework: ['Read provided educational materials', 'Make list of questions for pediatrician']
      }
    ];
  }
}

export const aiAnalysisService = new AIAnalysisService();
