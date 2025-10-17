/**
 * FHIR Export Service Tests
 */

const { generateFHIRBundle } = require('../services/fhirExport');

describe('FHIR Export Service', () => {
  const mockResult = {
    childId: 'S1001',
    studentId: 'STU-001',
    childName: 'Amina Ali',
    dob: '2019-05-12',
    va: 0.3,
    hearingResult: '{"1000_30dB":true,"2000_30dB":true,"4000_30dB":false}',
  };

  describe('generateFHIRBundle', () => {
    test('should create valid FHIR bundle structure', () => {
      const bundle = generateFHIRBundle(mockResult);
      
      expect(bundle.resourceType).toBe('Bundle');
      expect(bundle.type).toBe('collection');
      expect(bundle.id).toBeDefined();
      expect(bundle.timestamp).toBeDefined();
      expect(Array.isArray(bundle.entry)).toBe(true);
    });

    test('should include Patient resource', () => {
      const bundle = generateFHIRBundle(mockResult);
      const patientEntry = bundle.entry.find(e => e.resource.resourceType === 'Patient');
      
      expect(patientEntry).toBeDefined();
      expect(patientEntry.resource.id).toBe(mockResult.childId);
      expect(patientEntry.resource.name[0].text).toBe(mockResult.childName);
      expect(patientEntry.resource.birthDate).toBe(mockResult.dob);
    });

    test('should include Vision Observation', () => {
      const bundle = generateFHIRBundle(mockResult);
      const visionObs = bundle.entry.find(
        e => e.resource.resourceType === 'Observation' && 
             e.resource.code?.coding?.[0]?.code === '59610-3'
      );
      
      expect(visionObs).toBeDefined();
      expect(visionObs.resource.valueString).toContain('0.3');
      expect(visionObs.resource.valueString).toContain('logMAR');
    });

    test('should include Hearing Observation', () => {
      const bundle = generateFHIRBundle(mockResult);
      const hearingObs = bundle.entry.find(
        e => e.resource.resourceType === 'Observation' && 
             e.resource.code?.coding?.[0]?.code === '69737-5'
      );
      
      expect(hearingObs).toBeDefined();
      // The valueString contains the JSON results
      expect(hearingObs.resource.valueString).toBeDefined();
      expect(typeof hearingObs.resource.valueString).toBe('string');
    });

    test('should have valid timestamp format', () => {
      const bundle = generateFHIRBundle(mockResult);
      const timestamp = new Date(bundle.timestamp);
      
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });

    test('should generate unique UUIDs', () => {
      const bundle1 = generateFHIRBundle(mockResult);
      const bundle2 = generateFHIRBundle(mockResult);
      
      expect(bundle1.id).not.toBe(bundle2.id);
    });
  });
});
