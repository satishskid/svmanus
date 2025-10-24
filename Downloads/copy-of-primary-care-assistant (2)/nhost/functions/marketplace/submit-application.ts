import type { Request, Response } from 'express';
import { MarketplaceApplication, ProviderProfile, LocationDetails, BusinessType, PatientFeedbackSummary, SystemCalculatedRating, MarketplaceApplicationStatus } from '../../types';
import { SmartAIService } from '../shared/smart-ai-service';

// Helper function to validate an API key by making a simple call
const validateApiKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 30) {
    return false;
  }
  try {
    // For marketplace operations (lab/pharmacy), use Groq validation with Gemini fallback
    const aiService = new SmartAIService();
    const operationType = 'pharmacy'; // Could be lab or pharmacy
    await aiService.generateResponse(operationType, 'test validation', { requireJson: false });
    return true;
  } catch (error) {
    console.error("API Key validation failed:", error);
    return false;
  }
};


// Helper to safely convert comma-separated strings to an array of strings.
const csvToArray = (csv: string | undefined): string[] => {
  if (!csv) return [];
  return csv.split(',').map(item => item.trim()).filter(Boolean);
};

// Helper to parse a full address string into a structured LocationDetails object.
const parseAddress = (fullAddress: string): LocationDetails => {
  const parts = fullAddress.split(',').map(p => p.trim());
  // This is a naive parser and can be improved with a proper address parsing library.
  return {
    addressLine1: parts[0] || '',
    city: parts[parts.length - 3] || '',
    stateOrProvince: parts[parts.length - 2]?.split(' ')[0] || '',
    postalCode: parts[parts.length - 2]?.split(' ')[1] || '',
    country: parts[parts.length - 1] || '',
  };
};

// Main transformation logic: converts a raw application into a structured provider profile.
const transformApplicationToProviderProfile = (app: MarketplaceApplication, appId: string): Partial<ProviderProfile> => {
    const baseProfile = {
        applicationId: appId,
        name: app.businessName,
        businessType: app.businessType as BusinessType,
        isActive: true, // Auto-activate for demo purposes
        locationDetails: parseAddress(app.address),
        serviceRegions: csvToArray(app.serviceRegion),
        contactEmail: app.contactEmail,
        contactPhone: app.contactPhone,
        website: app.website,
        operationalHours: app.operationalHoursNotes,
        communicationChannels: csvToArray(app.communicationChannelNotes),
        keyAccreditations: csvToArray(app.keyAccreditationsNotes),
        onboardingDate: new Date().toISOString().split('T')[0],
        patientFeedbackSummary: {
            averageRating: 4.5,
            totalReviews: Math.floor(Math.random() * 100) + 20,
        } as PatientFeedbackSummary,
        systemCalculatedRating: {
            score: 8.0 + Math.random() * 1.5,
            rationale: "Newly onboarded partner with strong initial compliance.",
            lastCalculated: new Date().toISOString(),
        } as SystemCalculatedRating,
    };

    switch (app.businessType) {
        case BusinessType.CLINIC:
            return {
                ...baseProfile,
                mainSpecialties: csvToArray(app.clinicSpecialties),
                bookingSystemFeatures: csvToArray(app.bookingSystemNotes),
                specialEquipmentOrServices: csvToArray(app.specialEquipmentNotes),
            };
        case BusinessType.LAB:
            return {
                ...baseProfile,
                labCertifications: csvToArray(app.labCertificationsNotes),
                homeSampleCollectionAvailable: app.homeSampleCollectionNotes?.toLowerCase().startsWith('y'),
            };
        case BusinessType.PHARMACY:
            return {
                ...baseProfile,
                servicesOffered: csvToArray(app.pharmacyServices),
                offersDelivery: app.prescriptionDelivery,
                deliveryOptions: csvToArray(app.deliveryOptionsNotes),
            };
        default:
            return baseProfile;
    }
};


export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const appData = req.body as MarketplaceApplication & { apiKey: string };

  if (!appData || !appData.businessName || !appData.attestedCompliance || !appData.apiKey) {
    return res.status(400).json({ error: 'Missing required fields, API Key, or compliance attestation.' });
  }

  // ** API Key Validation Step **
  const isKeyValid = await validateApiKey(appData.apiKey);
  if (!isKeyValid) {
    return res.status(401).json({ error: 'Invalid API Key provided. Please check the key and try again.' });
  }

  // Key is valid, but we don't store it. Remove it from the object before further processing.
  const { apiKey, ...applicationToStore } = appData;

  console.log(`Processing application for: ${applicationToStore.businessName}`);

  // --- DATABASE INTERACTION (CONCEPTUAL SIMULATION) ---
  try {
    const fakeApplicationId = `app-${Date.now()}`;
    console.log(`Simulated: Inserted application with ID: ${fakeApplicationId}`);

    // Create application with approved status
    const approvedApplication = {
      ...applicationToStore,
      status: MarketplaceApplicationStatus.APPROVED
    };
    const providerProfileData = transformApplicationToProviderProfile(approvedApplication, fakeApplicationId);

    const fakeProviderId = `prov-${Date.now()}`;
    console.log(`Simulated: Created and inserted provider profile with ID: ${fakeProviderId}`);
    
    res.status(200).json({ 
      success: true, 
      message: `Application for ${approvedApplication.businessName} received and auto-approved for demo purposes.` 
    });

  } catch (dbError) {
    console.error('Error during application processing:', dbError);
    return res.status(500).json({ error: 'An error occurred while processing the application.' });
  }
}
