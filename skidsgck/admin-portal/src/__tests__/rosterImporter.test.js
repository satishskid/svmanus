import { describe, it, expect, beforeEach, vi } from 'vitest';
import RosterImporter from '../services/rosterImporter';

describe('RosterImporter', () => {
  let importer;
  let mockDB;

  beforeEach(() => {
    mockDB = {
      saveChild: vi.fn().mockResolvedValue('child-id'),
      addToSyncQueue: vi.fn().mockResolvedValue('queue-id'),
      logAuditEvent: vi.fn().mockResolvedValue(null),
    };
    importer = new RosterImporter(mockDB);
  });

  describe('validateRow', () => {
    it('should validate a correct row', () => {
      const row = {
        'Child ID': 'S00123',
        'First Name': 'John',
        'Last Name': 'Doe',
        'Date of Birth': '2018-06-15',
        'Grade': 'K',
      };

      const result = importer.validateRow(row, 2);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing Child ID', () => {
      const row = {
        'First Name': 'John',
        'Last Name': 'Doe',
        'Date of Birth': '2018-06-15',
      };

      const result = importer.validateRow(row, 2);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Child ID is required');
    });

    it('should reject invalid Child ID format', () => {
      const row = {
        'Child ID': 'INVALID',
        'First Name': 'John',
        'Last Name': 'Doe',
        'Date of Birth': '2018-06-15',
      };

      const result = importer.validateRow(row, 2);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Invalid Child ID'))).toBe(true);
    });

    it('should accept valid Child ID formats', () => {
      const validIds = ['S0001', 'S00123', 'S999999'];
      validIds.forEach((childId) => {
        const row = {
          'Child ID': childId,
          'First Name': 'John',
          'Last Name': 'Doe',
          'Date of Birth': '2018-06-15',
        };

        const result = importer.validateRow(row, 2);
        expect(result.valid).toBe(true);
      });
    });

    it('should reject invalid date format', () => {
      const row = {
        'Child ID': 'S00123',
        'First Name': 'John',
        'Last Name': 'Doe',
        'Date of Birth': '06/15/2018',
      };

      const result = importer.validateRow(row, 2);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Invalid Date'))).toBe(true);
    });

    it('should warn on unusual ages', () => {
      const row = {
        'Child ID': 'S00123',
        'First Name': 'John',
        'Last Name': 'Doe',
        'Date of Birth': '1900-06-15',
      };

      const result = importer.validateRow(row, 2);
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should handle optional fields', () => {
      const row = {
        'Child ID': 'S00123',
        'First Name': 'John',
        'Last Name': 'Doe',
        'Date of Birth': '2018-06-15',
      };

      const result = importer.validateRow(row, 2);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.includes('Grade'))).toBe(true);
    });
  });

  describe('rowToChildProfile', () => {
    it('should convert row to child profile', () => {
      importer.schoolCode = 'SCHOOL001';
      const row = {
        'Child ID': 'S00123',
        'First Name': 'John',
        'Last Name': 'Doe',
        'Date of Birth': '2018-06-15',
        'Grade': 'K',
        'Parent Name': 'Jane Doe',
        'Parent Email': 'jane@example.com',
      };

      const profile = importer.rowToChildProfile(row);
      expect(profile.child_id).toBe('S00123');
      expect(profile.name).toBe('John Doe');
      expect(profile.date_of_birth).toBe('2018-06-15');
      expect(profile.school_code).toBe('SCHOOL001');
      expect(profile.grade_level).toBe('K');
      expect(profile.parent_name).toBe('Jane Doe');
      expect(profile.parent_email).toBe('jane@example.com');
      expect(profile.is_synced).toBe(0);
    });
  });

  describe('isValidChildId', () => {
    it('should validate correct Child ID formats', () => {
      expect(importer.isValidChildId('S0001')).toBe(true);
      expect(importer.isValidChildId('S00123')).toBe(true);
      expect(importer.isValidChildId('S999999')).toBe(true);
    });

    it('should reject invalid Child ID formats', () => {
      expect(importer.isValidChildId('S001')).toBe(false); // Too short
      expect(importer.isValidChildId('A00123')).toBe(false); // Wrong prefix
      expect(importer.isValidChildId('S0012A')).toBe(false); // Contains letter
      expect(importer.isValidChildId('00123')).toBe(false); // No prefix
    });
  });

  describe('isValidDate', () => {
    it('should validate correct date formats', () => {
      expect(importer.isValidDate('2018-06-15')).toBe(true);
      expect(importer.isValidDate('2020-01-01')).toBe(true);
      expect(importer.isValidDate('2025-12-31')).toBe(true);
    });

    it('should accept Excel serial dates', () => {
      expect(importer.isValidDate(43295)).toBe(true); // Numeric date
    });

    it('should reject invalid date formats', () => {
      expect(importer.isValidDate('06/15/2018')).toBe(false);
      expect(importer.isValidDate('2018-13-45')).toBe(false);
      expect(importer.isValidDate('invalid')).toBe(false);
    });
  });

  describe('isReasonableAge', () => {
    it('should accept reasonable ages (2-15 years)', () => {
      const today = new Date();

      // 5 year old
      const fiveYearsAgo = new Date(today);
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
      expect(importer.isReasonableAge(fiveYearsAgo.toISOString().split('T')[0])).toBe(true);

      // 10 year old
      const tenYearsAgo = new Date(today);
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
      expect(importer.isReasonableAge(tenYearsAgo.toISOString().split('T')[0])).toBe(true);
    });

    it('should reject unreasonable ages', () => {
      const today = new Date();

      // 1 year old (too young)
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      expect(importer.isReasonableAge(oneYearAgo.toISOString().split('T')[0])).toBe(false);

      // 20 year old (too old)
      const twentyYearsAgo = new Date(today);
      twentyYearsAgo.setFullYear(twentyYearsAgo.getFullYear() - 20);
      expect(importer.isReasonableAge(twentyYearsAgo.toISOString().split('T')[0])).toBe(false);
    });
  });

  describe('importRows', () => {
    it('should import valid rows successfully', async () => {
      const rows = [
        {
          'Child ID': 'S00001',
          'First Name': 'John',
          'Last Name': 'Doe',
          'Date of Birth': '2018-06-15',
          'Grade': 'K',
        },
        {
          'Child ID': 'S00002',
          'First Name': 'Jane',
          'Last Name': 'Smith',
          'Date of Birth': '2018-07-20',
          'Grade': 'K',
        },
      ];

      importer.schoolCode = 'SCHOOL001';
      const result = await importer.importRows(rows);

      expect(result.successCount).toBe(2);
      expect(result.errorCount).toBe(0);
      expect(mockDB.saveChild).toHaveBeenCalledTimes(2);
    });

    it('should track errors in import', async () => {
      const rows = [
        {
          'Child ID': 'S00001',
          'First Name': 'John',
          'Last Name': 'Doe',
          'Date of Birth': '2018-06-15',
        },
        {
          'Child ID': 'INVALID',
          'First Name': 'Jane',
          'Last Name': 'Smith',
          'Date of Birth': '2018-07-20',
        },
      ];

      importer.schoolCode = 'SCHOOL001';
      const result = await importer.importRows(rows);

      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(1);
      expect(mockDB.saveChild).toHaveBeenCalledTimes(1);
    });
  });

  describe('generateValidationReport', () => {
    it('should generate CSV validation report', () => {
      const importResult = {
        totalRows: 2,
        successCount: 1,
        errorCount: 1,
        details: [
          {
            rowNumber: 2,
            status: 'success',
            message: 'Child S00001 imported',
            data: { 'Child ID': 'S00001', 'First Name': 'John', 'Last Name': 'Doe' },
          },
          {
            rowNumber: 3,
            status: 'error',
            message: 'Invalid Child ID',
            data: { 'Child ID': 'INVALID', 'First Name': 'Jane', 'Last Name': 'Smith' },
          },
        ],
      };

      const csv = importer.generateValidationReport(importResult);
      expect(csv).toContain('Row Number');
      expect(csv).toContain('Status');
      expect(csv).toContain('success');
      expect(csv).toContain('error');
    });
  });

  describe('generateTemplate', () => {
    it('should generate Excel template', () => {
      const workbook = RosterImporter.generateTemplate();
      expect(workbook).toBeDefined();
      expect(workbook.SheetNames).toBeDefined();
      expect(workbook.SheetNames.length).toBeGreaterThan(0);
    });
  });
});
