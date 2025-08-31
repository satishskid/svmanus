export interface ReferenceObject {
  type: string;
  knownSize: { width: number; height: number }; // in mm
}

export type MeasurementRecord = {
  // Core Measurement
  id: string;
  childId: string;
  measurementDate: Date;
  ageInDays: number;            // Calculated at measurement time

  // Physical Measurements
  anthropometry: {
    height?: {
      value: number;              // cm
      method: 'recumbent' | 'standing' | 'photogrammetry';
      accuracy: number;           // estimated accuracy in cm
      measurementAttempts: number;
    };
    weight?: {
      value: number;              // kg
      scale: 'digital' | 'beam' | 'spring';
      accuracy: number;           // estimated accuracy in kg
      clothingCompensation: number; // weight adjustment for clothes
    };
    muac?: {
      value: number;              // cm
      armUsed: 'left' | 'right';
      tapeType: 'paper' | 'plastic' | 'metal';
      accuracy: number;
    };
    headCircumference?: {
      value: number;              // cm
      measurementPlane: 'occipitofrontal';
      accuracy: number;
    };
  };

  // Photogrammetry Data
  photogrammetryData?: {
    imageId: string;
    referenceObjects: ReferenceObject[];
    measurementPoints: {
      head: {x: number, y: number, confidence: number};
      feet: {x: number, y: number, confidence: number};
    };
    imageQuality: {
      sharpness: number;
      lighting: number;
      framing: number;
      overall: number;
    };
    calibrationData: {
      pixelsPerCm: number;
      perspectiveCorrection: number;
      confidenceInterval: [number, number];
    };
  };

  // Calculated Values
  calculatedIndicators: {
    haz: {value: number, percentile: number, status: string};
    waz: {value: number, percentile: number, status: string};
    whz: {value: number, percentile: number, status: string};
    bmiz?: {value: number, percentile: number, status: string};
    muacz?: {value: number, percentile: number, status: string};
    hcz?: {value: number, percentile: number, status: string};
  };

  // Measurement Context
  context: {
    measuredBy: string;           // Health worker ID
    location: 'home' | 'clinic' | 'community' | 'school';
    visitType: 'routine' | 'followup' | 'referral' | 'emergency';
    healthStatus: 'healthy' | 'sick' | 'recovering';
    feedingStatus: 'fasted' | 'recent_meal' | 'unknown';
  };

  // Quality Assurance
  qualityMetrics: {
    dataCompleteness: number;     // Percentage of fields completed
    measurementAccuracy: number;  // Estimated overall accuracy
    validationsPassed: string[];  // List of passed validations
    warningsGenerated: string[];  // List of warnings
    confidenceScore: number;      // Overall confidence (0-100)
  };
}
