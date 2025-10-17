import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import RosterImporter from '../services/rosterImporter';

export default function RosterImporterScreen({ indexedDBService, onImportComplete }) {
  const [schoolCode, setSchoolCode] = useState('');
  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select an Excel file');
      return;
    }

    if (!schoolCode.trim()) {
      setError('Please enter a school code');
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      const importer = new RosterImporter(indexedDBService);
      const result = await importer.importFromFile(file, schoolCode);
      setImportResult(result);

      if (onImportComplete) {
        onImportComplete(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const workbook = RosterImporter.generateTemplate();
    XLSX.writeFile(workbook, 'SKIDS_EYEAR_Roster_Template.xlsx');
  };

  const downloadValidationReport = () => {
    if (!importResult) return;

    const importer = new RosterImporter(indexedDBService);
    const csv = importer.generateValidationReport(importResult);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'import_validation_report.csv');
    link.click();
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>📋 Import Child Roster</h2>
        <p style={styles.subtitle}>Upload an Excel file to bulk import child profiles</p>

        {/* School Code Input */}
        <div style={styles.formGroup}>
          <label style={styles.label}>School Code</label>
          <input
            type="text"
            placeholder="e.g., SCHOOL001"
            value={schoolCode}
            onChange={(e) => setSchoolCode(e.target.value)}
            style={styles.input}
            disabled={isImporting}
          />
          <p style={styles.helperText}>All imported children will be assigned to this school</p>
        </div>

        {/* File Input */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Excel File</label>
          <div style={styles.fileInputWrapper}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              style={styles.fileInput}
              disabled={isImporting}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={styles.browseButton}
              disabled={isImporting}
            >
              📁 Choose File
            </button>
            <span style={styles.fileName}>{file?.name || 'No file selected'}</span>
          </div>
          <p style={styles.helperText}>
            Accepted formats: .xlsx, .xls, .csv
          </p>
        </div>

        {/* Error Message */}
        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Action Buttons */}
        <div style={styles.buttonGroup}>
          <button
            onClick={downloadTemplate}
            style={styles.secondaryButton}
            disabled={isImporting}
          >
            📄 Download Template
          </button>
          <button
            onClick={handleImport}
            style={{
              ...styles.primaryButton,
              opacity: isImporting ? 0.6 : 1,
              cursor: isImporting ? 'not-allowed' : 'pointer',
            }}
            disabled={isImporting}
          >
            {isImporting ? '⏳ Importing...' : '✅ Import Roster'}
          </button>
        </div>

        {/* Import Result */}
        {importResult && (
          <div style={styles.resultBox}>
            <h3 style={styles.resultTitle}>Import Results</h3>
            <div style={styles.resultStats}>
              <StatItem label="Total Rows" value={importResult.totalRows} />
              <StatItem label="Success" value={importResult.successCount} color="#059669" />
              <StatItem label="Errors" value={importResult.errorCount} color="#dc2626" />
              {importResult.warningCount > 0 && (
                <StatItem label="Warnings" value={importResult.warningCount} color="#f59e0b" />
              )}
            </div>

            {importResult.errorCount > 0 && (
              <div style={styles.resultSection}>
                <h4 style={styles.sectionTitle}>Errors</h4>
                <div style={styles.resultList}>
                  {importResult.details
                    .filter((d) => d.status === 'error')
                    .slice(0, 5)
                    .map((detail, idx) => (
                      <div key={idx} style={styles.resultItem}>
                        <div style={styles.resultItemRow}>
                          Row {detail.rowNumber}: <span style={styles.error}>{detail.message}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {importResult.successCount > 0 && (
              <div style={styles.resultSection}>
                <h4 style={styles.sectionTitle}>Sample Imported Records</h4>
                <div style={styles.resultList}>
                  {importResult.details
                    .filter((d) => d.status === 'success')
                    .slice(0, 3)
                    .map((detail, idx) => (
                      <div key={idx} style={styles.resultItem}>
                        <div style={styles.success}>✓ {detail.data.name}</div>
                        <div style={styles.resultMeta}>ID: {detail.data.child_id}</div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {importResult.errorCount > 0 && (
              <button onClick={downloadValidationReport} style={styles.reportButton}>
                📊 Download Validation Report
              </button>
            )}
          </div>
        )}

        {/* File Format Guide */}
        <div style={styles.guideBox}>
          <h4 style={styles.guideTitle}>📋 File Format Requirements</h4>
          <ul style={styles.guideList}>
            <li><strong>Child ID:</strong> Required, format S + 4+ digits (e.g., S00123)</li>
            <li><strong>First Name:</strong> Required</li>
            <li><strong>Last Name:</strong> Required</li>
            <li><strong>Date of Birth:</strong> Required, format YYYY-MM-DD</li>
            <li><strong>Grade:</strong> Optional (K, 1st, 2nd, etc.)</li>
            <li><strong>Parent Name:</strong> Optional</li>
            <li><strong>Parent Email:</strong> Optional</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, color = '#4a6fa5' }) {
  return (
    <div style={styles.statItem}>
      <div style={{ ...styles.statValue, color }}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    color: '#1f2937',
  },
  subtitle: {
    color: '#666',
    margin: '0 0 25px 0',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#374151',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  helperText: {
    fontSize: '12px',
    color: '#999',
    margin: '6px 0 0 0',
  },
  fileInputWrapper: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  fileInput: {
    display: 'none',
  },
  browseButton: {
    padding: '10px 16px',
    backgroundColor: '#e5e7eb',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  fileName: {
    fontSize: '14px',
    color: '#666',
    flex: 1,
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  primaryButton: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#4a6fa5',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '12px 16px',
    backgroundColor: 'white',
    color: '#4a6fa5',
    border: '1px solid #4a6fa5',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
  },
  resultBox: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #86efac',
    borderRadius: '6px',
    padding: '20px',
    marginBottom: '20px',
  },
  resultTitle: {
    margin: '0 0 15px 0',
    color: '#166534',
    fontSize: '16px',
    fontWeight: '600',
  },
  resultStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
  },
  statItem: {
    textAlign: 'center',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '6px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    marginTop: '4px',
  },
  resultSection: {
    marginBottom: '15px',
  },
  sectionTitle: {
    margin: '0 0 10px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  resultList: {
    display: 'grid',
    gap: '8px',
  },
  resultItem: {
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '4px',
    fontSize: '13px',
  },
  resultItemRow: {
    marginBottom: '4px',
  },
  success: {
    color: '#059669',
    fontWeight: '600',
  },
  error: {
    color: '#dc2626',
  },
  resultMeta: {
    fontSize: '12px',
    color: '#999',
    marginTop: '4px',
  },
  reportButton: {
    width: '100%',
    padding: '10px 16px',
    backgroundColor: '#fef3c7',
    color: '#b45309',
    border: '1px solid #fcd34d',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  guideBox: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
    padding: '15px',
  },
  guideTitle: {
    margin: '0 0 10px 0',
    color: '#1e40af',
    fontSize: '14px',
    fontWeight: '600',
  },
  guideList: {
    margin: '0',
    paddingLeft: '20px',
    color: '#1e40af',
    fontSize: '13px',
    lineHeight: '1.6',
  },
};
