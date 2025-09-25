// This file centralizes the "mock" database data so it can be used by backend functions.
// This data is duplicated from src/constants.ts to avoid breaking Convex's sandboxing.
// In a fully dynamic app, this data would live in Convex tables.

const SERVICES_DATA_FOR_BACKEND = [
  { id: 'serv1', name: 'AI Cervical Cancer Screen', description: 'Painless, non-invasive screening using advanced Mobile ODT technology.', type: 'In-Clinic', icon: 'ClipboardDocCheckIcon', price: 3000, corporatePrice: 2500, providerId: 'prov_santaan' },
  { id: 'serv2', name: 'AI Breast Cancer Screen', description: 'Radiation-free, touch-free thermal screening by Niramai for early detection.', type: 'In-Clinic', icon: 'NiramaiIcon', price: 2500, corporatePrice: 2000, providerId: 'prov_santaan' },
  { id: 'serv3', name: 'Essential Vaccinations', description: 'HPV and other essential vaccinations for women\'s health.', type: 'In-Clinic', icon: 'SyringeIcon', price: 8000, corporatePrice: 7000, providerId: 'prov_santaan' },
  { id: 'serv4', name: 'Expert Nutritionist', description: 'Personalized diet plans for hormonal balance, PCOS, and overall wellness.', type: 'Telemedicine', icon: 'NutritionIcon', price: 1500, corporatePrice: 1000, providerId: 'prov_santaan' },
  { id: 'serv5', name: 'At-Home Semen Analysis', description: 'Discreet and convenient fertility assessment for partners.', type: 'At-Home', icon: 'SpermIcon', price: 2000, providerId: 'prov_santaan' },
  { id: 'serv6', name: 'Comprehensive Blood Work', description: 'Full panel blood tests to monitor key health parameters.', type: 'At-Home', icon: 'BloodDropIcon', price: 3500, corporatePrice: 3000, providerId: 'prov_santaan' },
  { id: 'serv7', name: 'Gynecologist & USG', description: 'Consult with expert gynecologists, with in-clinic ultrasound services.', type: 'In-Clinic', icon: 'StethoscopeIcon', price: 2000, corporatePrice: 1500, providerId: 'prov_santaan' },
  { id: 'serv8', name: 'Orthopedician Consult', description: 'Specialist consultation for osteoporosis and bone health management.', type: 'Telemedicine', icon: 'BoneIcon', price: 1200, corporatePrice: 800, providerId: 'prov_santaan' },
  { id: 'serv9', name: 'Psychologist Support', description: 'Confidential counseling and therapy sessions for mental well-being.', type: 'Telemedicine', icon: 'BrainIcon', price: 1800, corporatePrice: 1200, providerId: 'prov_santaan' },
];

export const servicesMap = new Map(SERVICES_DATA_FOR_BACKEND.map(s => [s.id, s as any]));