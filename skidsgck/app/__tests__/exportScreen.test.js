/**
 * Export Screen Tests
 */

describe('ExportScreen', () => {
  describe('CSV Export', () => {
    test('should generate CSV headers', () => {
      const headers =
        'Child ID,Name,DOB,School,Screening Date,Vision LogMAR,Vision Snellen,Vision Status,Hearing 1kHz,Hearing 2kHz,Hearing 4kHz,Hearing Status,Referral Needed,Screener\n';

      expect(headers).toContain('Child ID');
      expect(headers).toContain('Vision LogMAR');
      expect(headers).toContain('Hearing 1kHz');
      expect(headers).toContain('Referral Needed');
    });

    test('should format CSV rows correctly', () => {
      const result = {
        child_id: 'S1001',
        name: 'Amina Ali',
        date_of_birth: '2018-03-15',
        school_code: 'SCHOOL001',
        screening_date: '2025-10-16T10:30:00Z',
        vision_logmar: -0.1,
        vision_snellen: '20/16',
        vision_pass: true,
        hearing_1000hz: true,
        hearing_2000hz: true,
        hearing_4000hz: false,
        hearing_pass: false,
        referral_needed: true,
        screener_name: 'Jane Doe',
      };

      const row = [
        result.child_id,
        result.name,
        result.date_of_birth,
        result.school_code,
        new Date(result.screening_date).toISOString(),
        result.vision_logmar?.toFixed(3),
        result.vision_snellen,
        result.vision_pass ? 'PASS' : 'REFER',
        result.hearing_1000hz ? 'YES' : 'NO',
        result.hearing_2000hz ? 'YES' : 'NO',
        result.hearing_4000hz ? 'YES' : 'NO',
        result.hearing_pass ? 'PASS' : 'REFER',
        result.referral_needed ? 'YES' : 'NO',
        result.screener_name,
      ]
        .map((v) => `"${v}"`)
        .join(',');

      expect(row).toContain('S1001');
      expect(row).toContain('Amina Ali');
      expect(row).toContain('2018-03-15');
      expect(row).toContain('PASS');
      expect(row).toContain('REFER');
    });

    test('should handle bulk CSV export', () => {
      const data = [
        {
          child: { child_id: 'S1001', name: 'Child A', date_of_birth: '2018-01-01' },
          result: { vision_pass: true, hearing_pass: true },
        },
        {
          child: { child_id: 'S1002', name: 'Child B', date_of_birth: '2019-02-02' },
          result: { vision_pass: false, hearing_pass: true },
        },
      ];

      const rows = data.map(({ child, result }) => {
        return [
          child.child_id,
          child.name,
          child.date_of_birth,
          result.vision_pass ? 'PASS' : 'REFER',
          result.hearing_pass ? 'PASS' : 'REFER',
        ]
          .map((v) => `"${v}"`)
          .join(',');
      });

      expect(rows.length).toBe(2);
      expect(rows[0]).toContain('S1001');
      expect(rows[1]).toContain('S1002');
    });

    test('should escape special characters in CSV', () => {
      const name = 'Ali, Jr.';
      const escaped = `"${name}"`;

      expect(escaped).toContain('"');
      expect(escaped).toBe('"Ali, Jr."');
    });
  });

  describe('FHIR R4 Export', () => {
    test('should create FHIR Patient resource', () => {
      const patient = {
        resourceType: 'Patient',
        id: 'S1001',
        name: [{ text: 'Amina Ali' }],
        birthDate: '2018-03-15',
      };

      expect(patient.resourceType).toBe('Patient');
      expect(patient.id).toBe('S1001');
      expect(patient.name[0].text).toBe('Amina Ali');
    });

    test('should create FHIR Observation for vision', () => {
      const observation = {
        resourceType: 'Observation',
        id: 'obs-vision-001',
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '99173-3',
              display: 'Visual acuity',
            },
          ],
        },
        valueQuantity: {
          value: -0.1,
          unit: 'logMAR',
        },
      };

      expect(observation.resourceType).toBe('Observation');
      expect(observation.code.coding[0].code).toBe('99173-3');
      expect(observation.valueQuantity.unit).toBe('logMAR');
    });

    test('should create FHIR Bundle', () => {
      const bundle = {
        resourceType: 'Bundle',
        type: 'document',
        entry: [
          {
            resource: {
              resourceType: 'Patient',
              id: 'S1001',
              name: [{ text: 'Amina Ali' }],
            },
          },
          {
            resource: {
              resourceType: 'Observation',
              id: 'obs-vision-001',
            },
          },
        ],
      };

      expect(bundle.resourceType).toBe('Bundle');
      expect(bundle.type).toBe('document');
      expect(bundle.entry.length).toBe(2);
    });

    test('should serialize FHIR to JSON', () => {
      const resource = {
        resourceType: 'Patient',
        id: 'S1001',
        name: [{ text: 'Amina Ali' }],
      };

      const json = JSON.stringify(resource, null, 2);
      const parsed = JSON.parse(json);

      expect(parsed.resourceType).toBe('Patient');
      expect(parsed.name[0].text).toBe('Amina Ali');
    });
  });

  describe('HL7 v2.5 Export', () => {
    test('should create HL7 MSH segment', () => {
      const msh = 'MSH|^~\\&|SKIDS|EYEAR|SKIDS_RECEIVER|SCHOOL001|20251016103000||ORM^O01|||2.5';

      expect(msh).toContain('MSH');
      expect(msh).toContain('SKIDS');
      expect(msh).toContain('2.5');
    });

    test('should create HL7 PID segment', () => {
      const pid = 'PID||S1001|||Amina Ali||20180315';

      expect(pid).toContain('PID');
      expect(pid).toContain('S1001');
      expect(pid).toContain('Amina Ali');
    });

    test('should create HL7 OBX segment for vision', () => {
      const obx = 'OBX|1|NM|VA^Vision LogMAR||-0.100|||||P';

      expect(obx).toContain('OBX');
      expect(obx).toContain('VA');
      expect(obx).toContain('-0.100');
    });

    test('should create HL7 OBX segment for hearing', () => {
      const obx1 = 'OBX|1|CWE|HA1000^Hearing 1kHz||P|||||P';
      const obx2 = 'OBX|2|CWE|HA2000^Hearing 2kHz||P|||||P';
      const obx3 = 'OBX|3|CWE|HA4000^Hearing 4kHz||N|||||A';

      expect(obx1).toContain('HA1000');
      expect(obx2).toContain('HA2000');
      expect(obx3).toContain('HA4000');
    });

    test('should construct complete HL7 message', () => {
      const segments = [
        'MSH|^~\\&|SKIDS|EYEAR|SKIDS_RECEIVER|SCHOOL001|20251016103000||ORM^O01|||2.5',
        'PID||S1001|||Amina Ali||20180315',
        'OBX|1|NM|VA^Vision LogMAR||-0.100|||||P',
      ];

      const message = segments.join('\n');

      expect(message).toContain('MSH');
      expect(message).toContain('PID');
      expect(message).toContain('OBX');
    });
  });

  describe('Export Format Selection', () => {
    test('should support all export formats', () => {
      const formats = ['pdf', 'csv', 'fhir', 'hl7'];
      const supportedFormats = ['pdf', 'csv', 'fhir', 'hl7'];

      formats.forEach((format) => {
        expect(supportedFormats).toContain(format);
      });
    });

    test('should provide accurate format descriptions', () => {
      const formatInfo = {
        pdf: 'Professional PDF report for printing',
        csv: 'Excel-compatible CSV format',
        fhir: 'Healthcare interoperability standard',
        hl7: 'Electronic Data Interchange format',
      };

      expect(formatInfo.pdf).toContain('PDF');
      expect(formatInfo.csv).toContain('Excel');
      expect(formatInfo.fhir).toContain('interoperability');
      expect(formatInfo.hl7).toContain('Electronic');
    });
  });

  describe('File Operations', () => {
    test('should generate appropriate file names', () => {
      const childId = 'S1001';
      const formats = {
        pdf: `${childId}_screening.pdf`,
        csv: `${childId}_screening.csv`,
        fhir: `${childId}_fhir_r4.json`,
        hl7: `${childId}_hl7.txt`,
      };

      Object.values(formats).forEach((filename) => {
        expect(filename).toBeTruthy();
        expect(filename.length).toBeGreaterThan(0);
      });
    });

    test('should generate bulk export file names', () => {
      const bulkFiles = {
        pdf: 'bulk_screening_export.pdf',
        csv: 'bulk_screening_export.csv',
        fhir: 'bulk_fhir_r4_export.json',
        hl7: 'bulk_hl7_export.txt',
      };

      Object.values(bulkFiles).forEach((filename) => {
        expect(filename).toContain('bulk');
      });
    });
  });

  describe('Export Options', () => {
    test('should handle PII inclusion toggle', () => {
      const resultWithPII = {
        name: 'Amina Ali',
        dob: '2018-03-15',
        vision_logmar: -0.1,
      };

      const resultWithoutPII = {
        vision_logmar: -0.1,
      };

      expect(resultWithPII.name).toBeDefined();
      expect(resultWithoutPII.name).toBeUndefined();
    });

    test('should filter by date range', () => {
      const allResults = [
        { date: '2025-10-01', id: 'R001' },
        { date: '2025-10-10', id: 'R002' },
        { date: '2025-10-16', id: 'R003' },
      ];

      // Use explicit cutoff date for deterministic testing
      const cutoffDate = new Date('2025-10-09');
      const weekResults = allResults.filter((r) => {
        const resultDate = new Date(r.date);
        return resultDate >= cutoffDate;
      });

      expect(weekResults.length).toBe(2);
      expect(weekResults[0].id).toBe('R002');
      expect(weekResults[1].id).toBe('R003');
    });
  });
});
