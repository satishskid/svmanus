/**
 * TypeScript Type Definitions for NeuroKinetics AI Platform
 *
 * These interfaces define the data structures used throughout the application
 * for autism screening, analysis, reporting, and intervention planning.
 */

export interface ChildProfile {
  id: string;
  name: string;
  age: number; // in months
  sex: 'male' | 'female' | 'other';
  developmentalConcerns: string[];
  previousAssessments?: AssessmentResult[];
  familyContext: {
    primaryLanguage: string;
    culturalBackground: string;
    parentalEducation: string;
    availableTime: string;
    resources: string[];
  };
}

export interface VideoAnalysisData {
  videoStream: string;
  extractedFeatures: {
    eyeTracking: EyeTrackingData[];
    facialLandmarks: FacialLandmark[];
    headPose: HeadPoseData[];
    bodyKeypoints: BodyKeypoint[];
    audioPatterns: AudioPattern[];
  };
  temporalSequences: FrameData[];
  metadata: {
    duration: number;
    fps: number;
    resolution: string;
  };
}

export interface EyeTrackingData {
  timestamp: number;
  x: number;
  y: number;
  fixationDuration: number;
  saccadeVelocity: number;
  pupilDilation: number;
  blinkRate: number;
}

export interface FacialLandmark {
  timestamp: number;
  landmarks: number[][]; // 68 facial landmarks with x,y coordinates
  expressions: {
    happiness: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
  };
}

export interface HeadPoseData {
  timestamp: number;
  pitch: number;
  yaw: number;
  roll: number;
  orientation: string;
}

export interface BodyKeypoint {
  timestamp: number;
  keypoints: Array<{
    x: number;
    y: number;
    confidence: number;
    name: string;
  }>;
}

export interface AudioPattern {
  timestamp: number;
  frequency: number;
  amplitude: number;
  vocalizationType: 'babbling' | 'words' | 'silence' | 'other';
}

export interface FrameData {
  frameNumber: number;
  timestamp: number;
  behavioralData: {
    socialStimulus: boolean;
    responseLatency: number;
    jointAttention: boolean;
    repetitiveBehavior: boolean;
    emotionalExpression: string;
  };
}

export interface ScreeningAnalysisResult {
  asd_probability: number; // 0-100
  confidence_level: 'high' | 'medium' | 'low';
  severity_score: 1 | 2 | 3;
  domain_scores: {
    social_communication: number;
    repetitive_behaviors: number;
    sensory_processing: number;
    motor_coordination: number;
  };
  red_flags: string[];
  key_observations: Array<{
    timestamp: number;
    behavior: string;
    concern_level: 'low' | 'medium' | 'high';
  }>;
  recommendation: 'refer_for_diagnostic' | 'monitor' | 'typical_development';
  analysis_timestamp: string;
  model_version: string;
}

export interface AssessmentResult {
  id: string;
  child_id: string;
  assessment_date: string;
  screening_result: ScreeningAnalysisResult;
  video_clips: Array<{
    timestamp: number;
    duration: number;
    behavior_type: string;
    url: string;
  }>;
  status: 'completed' | 'in_progress' | 'pending_review';
}

export interface ClinicalReport {
  id: string;
  assessment_id: string;
  generated_date: string;
  executive_summary: {
    clinical_impression: string;
    asd_probability: number;
    key_findings: string[];
    severity_level: string;
    differential_diagnosis: string[];
    next_steps: string[];
  };
  detailed_results: {
    domain_analysis: Array<{
      domain: string;
      score: number;
      interpretation: string;
      evidence: string[];
      video_references: number[];
    }>;
    behavioral_examples: Array<{
      behavior: string;
      timestamp: number;
      clinical_significance: string;
    }>;
    normative_comparison: {
      age_norms: Record<string, number>;
      child_scores: Record<string, number>;
      percentile_ranks: Record<string, number>;
    };
  };
  parent_summary: {
    simple_explanation: string;
    strengths_highlighted: string[];
    concerns_explained: string[];
    hope_message: string;
    next_steps_parent: string[];
  };
  visual_analytics: {
    gaze_heatmap: string; // base64 image or description
    movement_trajectory: string;
    domain_radar_chart: string;
    developmental_comparison: string;
  };
  educational_resources: Array<{
    title: string;
    type: 'article' | 'video' | 'website' | 'book';
    url: string;
    description: string;
  }>;
  report_metadata: {
    clinician_name?: string;
    report_version: string;
    language: string;
  };
}

export interface InterventionPlan {
  id: string;
  assessment_id: string;
  child_id: string;
  created_date: string;
  last_updated: string;
  priority_goals: Array<{
    id: string;
    goal: string;
    smart_format: {
      specific: string;
      measurable: string;
      achievable: string;
      relevant: string;
      time_bound: string;
    };
    rationale: string;
    timeline_weeks: number;
    current_progress: number; // 0-100
  }>;
  evidence_based_strategies: {
    social_communication: Array<{
      strategy: string;
      description: string;
      activities: string[];
      frequency: string;
      materials_needed: string[];
    }>;
    behavior_management: Array<{
      strategy: string;
      description: string;
      activities: string[];
      frequency: string;
      materials_needed: string[];
    }>;
    language_development: Array<{
      strategy: string;
      description: string;
      activities: string[];
      frequency: string;
      materials_needed: string[];
    }>;
    daily_living_skills: Array<{
      strategy: string;
      description: string;
      activities: string[];
      frequency: string;
      materials_needed: string[];
    }>;
  };
  daily_schedule: Array<{
    time_slot: string;
    activity: string;
    duration_minutes: number;
    intervention_type: string;
    materials: string[];
  }>;
  parent_training: {
    curriculum: Array<{
      week: number;
      topic: string;
      learning_objectives: string[];
      video_url?: string;
      practice_activities: string[];
      homework: string[];
    }>;
  };
  progress_monitoring: {
    data_collection: {
      frequency: string[];
      duration: string[];
      abc_analysis: boolean;
    };
    check_in_prompts: string[];
    milestone_indicators: string[];
    adjustment_triggers: string[];
  };
  resource_connections: Array<{
    type: 'therapy' | 'support_group' | 'financial' | 'educational';
    name: string;
    contact_info: string;
    description: string;
    website?: string;
  }>;
  personalization_factors: {
    language_complexity: 'simple' | 'moderate' | 'advanced';
    cultural_considerations: string[];
    time_resources: string;
    family_priorities: string[];
    child_strengths: string[];
  };
}

export interface CopilotConversation {
  id: string;
  user_id: string;
  user_type: 'parent' | 'physician';
  child_id?: string;
  messages: Array<{
    id: string;
    timestamp: string;
    sender: 'user' | 'copilot';
    content: string;
    query_type?: 'interpreting_results' | 'intervention_guidance' | 'behavioral_challenges' | 'progress_questions' | 'resource_navigation';
    embedded_resources?: Array<{
      title: string;
      type: string;
      url: string;
    }>;
    suggested_activities?: string[];
    safety_flags?: string[];
  }>;
  context: {
    current_assessment?: string;
    intervention_plan?: string;
    conversation_history: string[];
  };
}

export interface ClinicalValidationData {
  study_id: string;
  participant_count: number;
  sensitivity: number; // >= 85%
  specificity: number; // >= 80%
  positive_predictive_value: number; // >= 70%
  correlation_with_ados: number; // r >= 0.75
  sites: string[];
  irb_approval: string;
  publication_references: string[];
  last_updated: string;
}

export interface SystemConfig {
  version: string;
  build_number: string;
  platform: 'ios' | 'android';
  ai_models: {
    screening_model: string;
    report_generation: string;
    intervention_planning: string;
    conversational_copilot: string;
  };
  clinical_validation: ClinicalValidationData;
  hipaa_compliance: {
    encryption_enabled: boolean;
    local_processing: boolean;
    data_retention_days: number;
    consent_version: string;
  };
  regulatory_status: 'development' | 'clinical_trial' | 'fda_510k_pending' | 'fda_cleared';
}

export {
  ChildProfile,
  VideoAnalysisData,
  ScreeningAnalysisResult,
  AssessmentResult,
  ClinicalReport,
  InterventionPlan,
  CopilotConversation,
  ClinicalValidationData,
  SystemConfig
};
