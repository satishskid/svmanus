// Backend types for Nhost serverless functions
// These types define the data structures used across the AI assistant backend

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: Date;
  isMetaSuggestion?: boolean;
}

export interface PatientProfile {
  id?: string; 
  name?: string;
  age?: string;
  pastHistory?: string;
  habits?: string;
}

export interface LocationDetails {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface PatientFeedbackSummary {
  averageRating: number; 
  totalReviews: number;
  commonPositiveThemes?: string[]; 
  commonNegativeThemes?: string[]; 
}

export interface SystemCalculatedRating {
  score: number; 
  rationale: string; 
  lastCalculated: string; // ISO date
}

export interface GeneratedQuestion {
  question: string;
  metaSymptomQuestions?: MetaSymptomQuestion[];
  isFinal?: boolean;
}

export interface MetaSymptomQuestion {
  prompt: string;
  options: string[];
}

export interface ProvisionalDiagnosis {
  condition: string;
  confidence: number;
  reasoning: string;
  recommendedActions: string[];
  urgencyLevel: 'Low' | 'Medium' | 'High' | 'Emergency';
}

export interface ProvisionalDiagnosisResult {
  condition: string;
  confidence: string;
  summaryForPatient: string;
  nextSteps: string;
}

export interface SuggestedTest {
  testName: string;
  reason: string;
  urgency: 'Routine' | 'Priority' | 'Urgent';
  category: string;
}

export interface DifferentialDiagnosis {
  condition: string;
  likelihood: number;
  supportingFactors: string[];
  requiredTests: string[];
}

export interface PrescriptionKeywords {
  medications: string[];
  dosages: string[];
  frequencies: string[];
  durations: string[];
  instructions: string[];
}

export interface FullPrescription {
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  generalInstructions: string[];
  followUpRecommendations: string[];
}

export interface DoctorNote {
  section: string;
  suggestion: string;
  confidence: number;
}

export interface MarketplaceApplication {
  businessType: 'Clinic' | 'Laboratory' | 'Pharmacy';
  businessName: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  operationalHoursNotes?: string;
  communicationChannelNotes?: string;
  keyAccreditationsNotes?: string;
  clinicSpecialties?: string;
  doctorCount?: string;
  bookingSystemNotes?: string;
  specialEquipmentNotes?: string;
  labTestTypes?: string;
  labCertificationsNotes?: string;
  homeSampleCollectionNotes?: string;
  pharmacyServices?: string;
  prescriptionDelivery?: boolean;
  deliveryOptionsNotes?: string;
  regulatoryComplianceNotes: string;
  attestedCompliance: boolean;
  serviceRegion?: string;
}

export enum BusinessType {
  CLINIC = 'Clinic',
  LAB = 'Laboratory',
  PHARMACY = 'Pharmacy'
}

export enum MarketplaceApplicationStatus {
  SUBMITTED = 'Submitted',
  UNDER_REVIEW = 'Under Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export interface ProviderProfile {
  applicationId?: string;
  name: string;
  businessType: BusinessType;
  isActive: boolean;
  locationDetails?: LocationDetails;
  serviceRegions?: string[];
  contactEmail: string;
  contactPhone: string;
  website?: string;
  operationalHours?: string;
  communicationChannels?: string[];
  keyAccreditations?: string[];
  patientFeedbackSummary?: PatientFeedbackSummary;
  systemCalculatedRating?: SystemCalculatedRating;
  onboardingDate: string;
  
  // Clinic specific
  mainSpecialties?: string[];
  bookingSystemFeatures?: string[];
  specialEquipmentOrServices?: string[];
  qualityTier?: 'Premium' | 'Standard' | 'Basic';
  
  // Lab specific
  testsOfferedDetails?: any;
  labCertifications?: string[];
  homeSampleCollectionAvailable?: boolean;

  // Pharmacy specific
  servicesOffered?: string[];
  offersDelivery?: boolean;
  deliveryOptions?: string[];
}

export interface Provider {
  id: string;
  name: string;
  businessType: 'Clinic' | 'Laboratory' | 'Pharmacy';
  isActive: boolean;
  locationDetails?: LocationDetails;
  serviceRegions?: string[];
  contactEmail: string;
  contactPhone: string;
  website?: string;
  operationalHours?: string;
  communicationChannels?: string[];
  keyAccreditations?: string[];
  patientFeedbackSummary?: PatientFeedbackSummary;
  systemCalculatedRating?: SystemCalculatedRating;
  verificationTier?: string;
  onboardingDate: string;
  
  // Clinic specific
  mainSpecialties?: string[];
  bookingSystemFeatures?: string[];
  specialEquipmentOrServices?: string[];
  qualityTier?: 'Premium' | 'Standard' | 'Basic';
  
  // Lab specific
  testsOfferedDetails?: any;
  labCertifications?: string[];
  homeSampleCollectionAvailable?: boolean;

  // Pharmacy specific
  servicesOffered?: string[];
  offersDelivery?: boolean;
  deliveryOptions?: string[];
}

export interface Order {
  id: string;
  orderType: 'PHARMACY' | 'LAB';
  status: 'Pending Broadcast' | 'Awaiting Bids' | 'Bids Received' | 'Assigned' | 'In Progress' | 'Out for Delivery' | 'Ready for Pickup' | 'Completed' | 'Cancelled';
  patientProfile: any;
  requestingDoctor: any;
  prescriptionDetails?: any;
  tests?: any;
  assignedProviderId?: string;
  serviceTierPreference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: string;
  orderId: string;
  providerId: string;
  providerName: string;
  bidAmount: number;
  estimatedDeliveryTime?: string;
  estimatedTurnaroundTime?: string;
  serviceTierOffered?: string;
  notes?: string;
  qualityMetrics?: any;
  isWinningBid: boolean;
  createdAt: string;
}
