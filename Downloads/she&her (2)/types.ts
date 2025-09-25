
import { Chat } from "@google/genai";

export type UserRole = 'USER' | 'HR' | 'PROVIDER' | 'MANAGER';
export type PatientContext = 'SELF' | 'DAUGHTER' | 'MOTHER';

export enum LifeStageKey {
  GROOMING = 'GROOMING',
  MARRIAGE = 'MARRIAGE',
  MOTHERHOOD = 'MOTHERHOOD',
  BALANCING_FAMILY = 'BALANCING_FAMILY',
  STABILISING = 'STABILISING',
  LIFE_CONTINUED = 'LIFE_CONTINUED',
}

export interface Concern {
  id: string;
  text: string;
  details?: string;
}

export interface Stage {
  key: LifeStageKey;
  title: string;
  description: string;
  richDescription: string;
  concerns: Concern[];
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  sources?: Array<{ uri: string; title: string }>;
}

export interface Provider {
  id: string;
  name: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  type: 'In-Clinic' | 'Telemedicine' | 'At-Home';
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  price: number; // Standard consumer price
  corporatePrice?: number; // Special price for corporate partners
  relevantStages?: LifeStageKey[]; // Stages this service is relevant for
  providerId?: string;
}

export interface CorporatePlan {
  id: string;
  name: string;
  coveredServices: string[];
  discountedServices: string[];
}

// This type represents a User document from the Convex database
export interface User {
    _id: string;
    _creationTime: number;
    name: string;
    clerkId: string;
    role: UserRole;
    corporatePlanId?: string;
}

export interface ProviderSlot {
    id: string;
    startTime: Date;
    isBooked: boolean;
}

// This type represents an Appointment document from the Convex database
export interface Appointment {
  _id: string;
  _creationTime: number;
  userId: string;
  serviceId: string;
  serviceName: string;
  slotStartTime: number;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  pricePaid: number;
  notes?: string;
  patientContext: PatientContext;
  // These are populated on the client side after fetching
  user: User;
  service: Service;
}

export interface ProductKnowledge {
  id: string;
  name: string;
  description: string;
  staffTrainingInfo: string;
  patientFacingInfo: string;
}

export interface GuidelineItem {
    serviceName: string;
    protocol: string;
    references: string;
}

export interface ClinicalGuideline {
    stage: LifeStageKey;
    stageTitle: string;
    guidelines: GuidelineItem[];
}

export type ConsultationStatus = 'active' | 'completed' | 'paused' | 'closed';
export type ConsultationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ConsultationCategory = 'general' | 'gynecology' | 'mental-health' | 'emergency' | 'follow-up' | 'preventive';
export type ConsultationMessageType = 'text' | 'image' | 'file' | 'system';
export type MessageAuthorRole = 'USER' | 'PROVIDER' | 'AI';

export interface Consultation {
  _id: string;
  _creationTime: number;
  userId: string;
  providerId?: string;
  title: string;
  status: ConsultationStatus;
  priority: ConsultationPriority;
  category: ConsultationCategory;
  initialSymptoms?: string;
  aiSummary?: string;
  providerNotes?: string;
  recommendations?: any;
  riskAssessment?: any;
  messages?: ConsultationMessage[];
  created_at: number;
  updated_at: number;
  closed_at?: number;
}

export interface ConsultationMessage {
  _id: string;
  consultationId: string;
  authorId: string;
  authorRole: MessageAuthorRole;
  messageType: ConsultationMessageType;
  content: string;
  metadata?: any;
  isAiGenerated: boolean;
  confidenceScore?: number;
  created_at: number;
}
