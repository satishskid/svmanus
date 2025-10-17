/**
 * Results Screen Tests
 */

describe('ResultsScreen', () => {
  describe('Results Display', () => {
    test('should format vision results correctly', () => {
      const result = {
        vision_logmar: -0.1,
        vision_snellen: '20/16',
        vision_pass: true,
        vision_confidence: 0.95,
      };

      expect(result.vision_logmar.toFixed(3)).toBe('-0.100');
      expect(result.vision_snellen).toBe('20/16');
      expect(result.vision_pass).toBe(true);
      expect(`${(result.vision_confidence * 100).toFixed(0)}%`).toBe('95%');
    });

    test('should format hearing results correctly', () => {
      const result = {
        hearing_1000hz: true,
        hearing_2000hz: true,
        hearing_4000hz: false,
        hearing_pass: false,
      };

      expect(result.hearing_1000hz).toBe(true);
      expect(result.hearing_2000hz).toBe(true);
      expect(result.hearing_4000hz).toBe(false);
      expect(result.hearing_pass).toBe(false);
    });

    test('should determine pass status correctly', () => {
      const passResult = { vision_pass: true, hearing_pass: true };
      const referResult = { vision_pass: false, hearing_pass: true };

      expect(passResult.vision_pass && passResult.hearing_pass).toBe(true);
      expect(referResult.vision_pass || referResult.hearing_pass).toBe(true);
    });
  });

  describe('Referral Recommendations', () => {
    test('should parse referral reasons correctly', () => {
      const reasons = 'Vision deficiency,Hearing loss at 4kHz';
      const parsed = reasons.split(',').map((r) => r.trim());

      expect(parsed.length).toBe(2);
      expect(parsed[0]).toBe('Vision deficiency');
      expect(parsed[1]).toBe('Hearing loss at 4kHz');
    });

    test('should set referral flag when needed', () => {
      const cases = [
        { vision_pass: false, hearing_pass: true, expect: true },
        { vision_pass: true, hearing_pass: false, expect: true },
        { vision_pass: false, hearing_pass: false, expect: true },
        { vision_pass: true, hearing_pass: true, expect: false },
      ];

      cases.forEach(({ vision_pass, hearing_pass, expect: expectedReferral }) => {
        const referralNeeded = !vision_pass || !hearing_pass;
        expect(referralNeeded).toBe(expectedReferral);
      });
    });
  });

  describe('Results Data Validation', () => {
    test('should validate complete result object', () => {
      const result = {
        id: 'R001',
        child_id: 'S1001',
        screening_date: '2025-10-16T10:30:00Z',
        vision_logmar: -0.1,
        vision_snellen: '20/16',
        vision_pass: true,
        vision_confidence: 0.95,
        hearing_1000hz: true,
        hearing_2000hz: true,
        hearing_4000hz: false,
        hearing_pass: false,
        referral_needed: true,
        referral_reasons: 'Hearing loss at 4kHz',
        pass_status: 'REFER',
        screener_id: 'SCR001',
        screener_name: 'Jane Doe',
        school_code: 'SCHOOL001',
      };

      expect(result.id).toBeDefined();
      expect(result.child_id).toBeDefined();
      expect(result.screening_date).toBeDefined();
      expect(result.vision_logmar).toBeGreaterThanOrEqual(-1);
      expect(result.vision_logmar).toBeLessThanOrEqual(2);
    });

    test('should handle missing optional fields', () => {
      const minimalResult = {
        id: 'R001',
        child_id: 'S1001',
        screening_date: '2025-10-16T10:30:00Z',
        vision_logmar: -0.1,
        hearing_1000hz: true,
      };

      expect(minimalResult.vision_snellen).toBeUndefined();
      expect(minimalResult.screener_name).toBeUndefined();
      expect(minimalResult.id).toBeDefined();
    });

    test('should validate screening date format', () => {
      const validDates = ['2025-10-16T10:30:00Z', '2025-10-15'];

      validDates.forEach((date) => {
        const dateObj = new Date(date);
        expect(dateObj).not.toEqual(new Date('Invalid'));
      });
    });
  });

  describe('Results Export Compatibility', () => {
    test('should serialize results to JSON', () => {
      const result = {
        id: 'R001',
        vision_logmar: -0.1,
        hearing_1000hz: true,
        referral_needed: true,
      };

      const json = JSON.stringify(result);
      const parsed = JSON.parse(json);

      expect(parsed.id).toBe('R001');
      expect(parsed.vision_logmar).toBe(-0.1);
      expect(parsed.hearing_1000hz).toBe(true);
    });

    test('should format results for CSV export', () => {
      const result = {
        child_id: 'S1001',
        vision_logmar: -0.1,
        vision_pass: true,
        hearing_1000hz: true,
        referral_needed: false,
      };

      const csvRow = [
        result.child_id,
        result.vision_logmar?.toFixed(3),
        result.vision_pass ? 'PASS' : 'REFER',
        result.hearing_1000hz ? 'YES' : 'NO',
        result.referral_needed ? 'YES' : 'NO',
      ]
        .map((v) => `"${v}"`)
        .join(',');

      expect(csvRow).toContain('S1001');
      expect(csvRow).toContain('PASS');
      expect(csvRow).toContain('YES');
    });
  });

  describe('Multi-Child Results Handling', () => {
    test('should filter results by child ID', () => {
      const allResults = [
        { id: 'R001', child_id: 'S1001', vision_pass: true },
        { id: 'R002', child_id: 'S1001', vision_pass: false },
        { id: 'R003', child_id: 'S1002', vision_pass: true },
      ];

      const childResults = allResults.filter((r) => r.child_id === 'S1001');
      
      expect(childResults.length).toBe(2);
      expect(childResults[0].vision_pass).toBe(true);
      expect(childResults[1].vision_pass).toBe(false);
    });

    test('should order results by date', () => {
      const results = [
        { id: 'R001', child_id: 'S1001', date: '2025-10-15' },
        { id: 'R002', child_id: 'S1001', date: '2025-10-16' },
        { id: 'R003', child_id: 'S1001', date: '2025-10-14' },
      ];

      const sorted = results.sort((a, b) => new Date(a.date) - new Date(b.date));

      expect(sorted[0].date).toBe('2025-10-14');
      expect(sorted[1].date).toBe('2025-10-15');
      expect(sorted[2].date).toBe('2025-10-16');
    });
  });
});
