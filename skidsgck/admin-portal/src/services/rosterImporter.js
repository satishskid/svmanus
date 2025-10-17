/**
 * Excel Roster Importer Service
 * Parse Excel files and bulk import child profiles
 * 
 * Expected Excel format:
 * - Column A: Child ID (e.g., S00123)
 * - Column B: First Name
 * - Column C: Last Name
 * - Column D: Date of Birth (YYYY-MM-DD)
 * - Column E: Grade Level
 * - Column F: Parent Name (optional)
 * - Column G: Parent Email (optional)
 * 
 * Returns validation report with success/error counts
 */

import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

class RosterImporter {
  constructor(indexedDBService) {
    this.db = indexedDBService;
    this.schoolCode = null;
    this.validationErrors = [];
    this.validationWarnings = [];
  }

  /**
   * Import roster from Excel file
   */
  async importFromFile(file, schoolCode) {
    this.schoolCode = schoolCode;
    this.validationErrors = [];
    this.validationWarnings = [];

    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      return await this.importRows(data);
    } catch (error) {
      throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
  }

  /**
   * Import array of roster rows
   */
  async importRows(rows) {
    const report = {
      totalRows: rows.length,
      successCount: 0,
      errorCount: 0,
      warningCount: 0,
      details: [],
      errors: this.validationErrors,
      warnings: this.validationWarnings,
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 for header and 0-based index

      try {
        // Validate row
        const validation = this.validateRow(row, rowNumber);
        if (!validation.valid) {
          report.errorCount++;
          report.details.push({
            rowNumber,
            status: 'error',
            message: validation.errors.join('; '),
            data: row,
          });
          continue;
        }

        // Add warnings if any
        if (validation.warnings.length > 0) {
          report.warningCount++;
          this.validationWarnings.push(...validation.warnings);
        }

        // Create child profile
        const child = this.rowToChildProfile(row);

        // Save to database
        await this.db.saveChild(child);

        // Add to sync queue
        await this.db.addToSyncQueue({
          id: uuidv4(),
          type: 'child_import',
          action: 'create',
          entity_id: child.id,
          entity_type: 'child',
          payload: child,
        });

        report.successCount++;
        report.details.push({
          rowNumber,
          status: 'success',
          message: `Child ${child.child_id} imported`,
          data: child,
        });
      } catch (error) {
        report.errorCount++;
        report.details.push({
          rowNumber,
          status: 'error',
          message: error.message,
          data: row,
        });
      }
    }

    // Log audit event
    await this.db.logAuditEvent('roster_imported', {
      schoolCode: this.schoolCode,
      successCount: report.successCount,
      errorCount: report.errorCount,
      totalCount: report.totalRows,
    });

    return report;
  }

  /**
   * Validate a single row
   */
  validateRow(row, rowNumber) {
    const errors = [];
    const warnings = [];

    // Extract fields (handle various column name formats)
    const childId = this.getField(row, ['Child ID', 'child_id', 'Student ID', 'ID']);
    const firstName = this.getField(row, ['First Name', 'first_name', 'Given Name']);
    const lastName = this.getField(row, ['Last Name', 'last_name', 'Family Name']);
    const dob = this.getField(row, ['Date of Birth', 'date_of_birth', 'DOB', 'Birth Date']);
    const grade = this.getField(row, ['Grade', 'grade_level', 'Grade Level']);

    // Validate required fields
    if (!childId || childId.trim() === '') {
      errors.push('Child ID is required');
    } else if (!this.isValidChildId(childId)) {
      errors.push(`Invalid Child ID format: ${childId} (expected S + 4+ digits)`);
    }

    if (!firstName || firstName.trim() === '') {
      errors.push('First Name is required');
    }

    if (!lastName || lastName.trim() === '') {
      errors.push('Last Name is required');
    }

    if (!dob || dob.trim() === '') {
      errors.push('Date of Birth is required');
    } else if (!this.isValidDate(dob)) {
      errors.push(`Invalid Date of Birth: ${dob} (expected YYYY-MM-DD format)`);
    } else if (!this.isReasonableAge(dob)) {
      warnings.push(`Unusual age for child: ${childId}`);
    }

    if (!grade || grade.trim() === '') {
      warnings.push(`Grade missing for child: ${childId}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Convert Excel row to child profile
   */
  rowToChildProfile(row) {
    const childId = this.getField(row, ['Child ID', 'child_id', 'Student ID', 'ID']).trim();
    const firstName = this.getField(row, ['First Name', 'first_name', 'Given Name']).trim();
    const lastName = this.getField(row, ['Last Name', 'last_name', 'Family Name']).trim();
    const dob = this.parseDate(this.getField(row, ['Date of Birth', 'date_of_birth', 'DOB']));
    const grade = this.getField(row, ['Grade', 'grade_level', 'Grade Level']).trim() || null;
    const parentName = this.getField(row, ['Parent Name', 'parent_name', 'Guardian']).trim() || null;
    const parentEmail = this.getField(row, ['Parent Email', 'parent_email', 'Email']).trim() || null;

    return {
      id: uuidv4(),
      child_id: childId,
      name: `${firstName} ${lastName}`,
      date_of_birth: dob,
      school_code: this.schoolCode,
      grade_level: grade,
      parent_name: parentName,
      parent_email: parentEmail,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_synced: 0,
    };
  }

  /**
   * Helper: Get field from row (case-insensitive, multiple possible names)
   */
  getField(row, fieldNames) {
    for (const name of fieldNames) {
      // Try exact match
      if (row[name]) return row[name];

      // Try case-insensitive
      const lowerName = name.toLowerCase();
      for (const key of Object.keys(row)) {
        if (key.toLowerCase() === lowerName) {
          return row[key];
        }
      }
    }
    return '';
  }

  /**
   * Validate Child ID format: S + 4+ digits
   */
  isValidChildId(childId) {
    return /^S\d{4,}$/.test(childId);
  }

  /**
   * Validate date format: YYYY-MM-DD
   */
  isValidDate(dateStr) {
    // Handle Excel serial dates
    if (typeof dateStr === 'number') {
      return true;
    }

    // Check YYYY-MM-DD format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return false;
    }

    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Parse date (handle Excel serial dates)
   */
  parseDate(dateStr) {
    if (typeof dateStr === 'number') {
      // Excel serial date
      const excelEpoch = new Date(1900, 0, 1);
      const date = new Date(excelEpoch.getTime() + (dateStr - 2) * 24 * 60 * 60 * 1000);
      return date.toISOString().split('T')[0];
    }

    // Already in string format
    return dateStr.split('T')[0];
  }

  /**
   * Check if age is reasonable for screening (typically 3-8 years)
   */
  isReasonableAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    const age = (today - birthDate) / (365.25 * 24 * 60 * 60 * 1000);

    return age >= 2 && age <= 15;
  }

  /**
   * Generate validation report as CSV
   */
  generateValidationReport(importReport) {
    const headers = ['Row Number', 'Status', 'Message', 'Child ID', 'Name'];
    const rows = importReport.details.map((detail) => [
      detail.rowNumber,
      detail.status,
      detail.message,
      detail.data['Child ID'] || detail.data.child_id || '',
      (detail.data['First Name'] || detail.data.first_name || '') +
        ' ' +
        (detail.data['Last Name'] || detail.data.last_name || ''),
    ]);

    const csv =
      [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n') + '\n';

    return csv;
  }

  /**
   * Export template
   */
  static generateTemplate() {
    const template = [
      ['Child ID', 'First Name', 'Last Name', 'Date of Birth', 'Grade', 'Parent Name', 'Parent Email'],
      ['S00001', 'John', 'Doe', '2018-06-15', 'K', 'Jane Doe', 'jane@example.com'],
      ['S00002', 'Jane', 'Smith', '2018-07-20', 'K', 'John Smith', 'john@example.com'],
      ['S00003', 'Bob', 'Johnson', '2017-03-10', '1st', 'Mary Johnson', 'mary@example.com'],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Children');

    return workbook;
  }
}

export default RosterImporter;
