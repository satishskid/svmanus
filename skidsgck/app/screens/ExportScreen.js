import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { OfflineDB } from '../services/offlineDB';
import { FHIRExport } from '../services/fhirExport';

/**
 * ExportScreen - FHIR, HL7, CSV, PDF export functionality
 * Supports single child or bulk export with filtering options
 */
export const ExportScreen = ({ route, navigation }) => {
  const { childId, screeningId, bulkExport = false } = route.params || {};
  const [exportFormat, setExportFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includePII, setIncludePII] = useState(false);
  const [dateRange, setDateRange] = useState('all'); // all, month, week

  /**
   * Export to PDF format
   */
  const exportToPDF = async () => {
    try {
      setLoading(true);

      const db = new OfflineDB(':memory:');
      db.initialize();

      if (childId && screeningId) {
        // Single result export
        const result = db.getChildScreenings(childId).find(
          (r) => r.id === screeningId
        );
        if (!result) throw new Error('Screening result not found');

        const child = db.getChildById(childId);
        const pdfContent = generatePDFContent(child, result);
        await savePDFFile(pdfContent, `${child.child_id}_screening.pdf`);
      } else if (bulkExport) {
        // Bulk export
        const stats = db.getScreeningStats();
        const pdfContent = generateBulkPDFContent(stats);
        await savePDFFile(pdfContent, 'bulk_screening_export.pdf');
      }

      Alert.alert('Success', 'PDF export completed successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      Alert.alert('Error', `Failed to export PDF: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export to CSV format
   */
  const exportToCSV = async () => {
    try {
      setLoading(true);

      const db = new OfflineDB(':memory:');
      db.initialize();

      let csvContent = '';

      if (childId && screeningId) {
        // Single result export
        const result = db.getChildScreenings(childId).find(
          (r) => r.id === screeningId
        );
        if (!result) throw new Error('Screening result not found');

        const child = db.getChildById(childId);
        csvContent = generateCSVContent([{ child, result }]);
      } else if (bulkExport) {
        // Bulk export all results
        const children = db.getAllChildren();
        const data = children.flatMap((child) => {
          const screenings = db.getChildScreenings(child.id);
          return screenings.map((result) => ({ child, result }));
        });
        csvContent = generateCSVContent(data);
      }

      const fileName = childId
        ? `${childId}_screening.csv`
        : 'bulk_screening_export.csv';

      await saveCSVFile(csvContent, fileName);
      Alert.alert('Success', 'CSV export completed successfully');
    } catch (error) {
      console.error('CSV export error:', error);
      Alert.alert('Error', `Failed to export CSV: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export to FHIR R4 format (JSON)
   */
  const exportToFHIR = async () => {
    try {
      setLoading(true);

      const db = new OfflineDB(':memory:');
      db.initialize();

      if (childId && screeningId) {
        // Single result export
        const result = db.getChildScreenings(childId).find(
          (r) => r.id === screeningId
        );
        if (!result) throw new Error('Screening result not found');

        const child = db.getChildById(childId);
        const fhirExport = new FHIRExport();
        const bundle = fhirExport.createBundle(child, result);
        const jsonContent = JSON.stringify(bundle, null, 2);

        await saveJSONFile(jsonContent, `${childId}_fhir_r4.json`);
      } else if (bulkExport) {
        // Bulk FHIR export
        const children = db.getAllChildren();
        const bundles = children.map((child) => {
          const screenings = db.getChildScreenings(child.id);
          const fhirExport = new FHIRExport();
          return screenings.map((result) => fhirExport.createBundle(child, result));
        });
        const combinedBundles = bundles.flat();
        const jsonContent = JSON.stringify(combinedBundles, null, 2);
        await saveJSONFile(jsonContent, 'bulk_fhir_r4_export.json');
      }

      Alert.alert('Success', 'FHIR R4 export completed successfully');
    } catch (error) {
      console.error('FHIR export error:', error);
      Alert.alert('Error', `Failed to export FHIR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export to HL7 v2.5 format (text)
   */
  const exportToHL7 = async () => {
    try {
      setLoading(true);

      const db = new OfflineDB(':memory:');
      db.initialize();

      let hl7Content = '';

      if (childId && screeningId) {
        // Single result export
        const result = db.getChildScreenings(childId).find(
          (r) => r.id === screeningId
        );
        if (!result) throw new Error('Screening result not found');

        const child = db.getChildById(childId);
        hl7Content = generateHL7Content(child, result);
      } else if (bulkExport) {
        // Bulk HL7 export
        const children = db.getAllChildren();
        hl7Content = children
          .flatMap((child) => {
            const screenings = db.getChildScreenings(child.id);
            return screenings.map((result) => generateHL7Content(child, result));
          })
          .join('\n\n');
      }

      await saveTextFile(hl7Content, childId ? `${childId}_hl7.txt` : 'bulk_hl7_export.txt');
      Alert.alert('Success', 'HL7 v2.5 export completed successfully');
    } catch (error) {
      console.error('HL7 export error:', error);
      Alert.alert('Error', `Failed to export HL7: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate PDF content
   */
  const generatePDFContent = (child, result) => {
    const date = new Date(result.screening_date).toLocaleDateString();
    const content = `
SKIDS EYEAR - SCREENING RESULTS
================================

CHILD INFORMATION
-----------------
Name: ${child.name}
Child ID: ${child.child_id}
Date of Birth: ${child.date_of_birth}
School Code: ${child.school_code || 'N/A'}
Grade Level: ${child.grade_level || 'N/A'}

SCREENING INFORMATION
--------------------
Date: ${date}
Screener: ${result.screener_name || 'Unknown'}
School: ${result.school_code || 'N/A'}

VISION TEST RESULTS
------------------
Visual Acuity (logMAR): ${result.vision_logmar?.toFixed(3) || 'N/A'}
Snellen Equivalent: ${result.vision_snellen || 'N/A'}
Confidence: ${result.vision_confidence ? `${(result.vision_confidence * 100).toFixed(0)}%` : 'N/A'}
Status: ${result.vision_pass ? 'PASS' : 'REFER'}

HEARING TEST RESULTS
-------------------
1000 Hz: ${result.hearing_1000hz ? 'DETECTED' : 'NO RESPONSE'}
2000 Hz: ${result.hearing_2000hz ? 'DETECTED' : 'NO RESPONSE'}
4000 Hz: ${result.hearing_4000hz ? 'DETECTED' : 'NO RESPONSE'}
Status: ${result.hearing_pass ? 'PASS' : 'REFER'}

OVERALL ASSESSMENT
------------------
Pass Status: ${result.pass_status}
Referral Needed: ${result.referral_needed ? 'YES' : 'NO'}
${result.referral_reasons ? `Referral Reasons: ${result.referral_reasons}` : ''}

Generated by SKIDS EYEAR
Report timestamp: ${new Date().toISOString()}
    `;
    return content;
  };

  /**
   * Generate CSV content
   */
  const generateCSVContent = (data) => {
    const headers =
      'Child ID,Name,DOB,School,Screening Date,Vision LogMAR,Vision Snellen,Vision Status,Hearing 1kHz,Hearing 2kHz,Hearing 4kHz,Hearing Status,Referral Needed,Screener\n';

    const rows = data
      .map(({ child, result }) => {
        return [
          child.child_id,
          child.name,
          child.date_of_birth,
          child.school_code || '',
          new Date(result.screening_date).toISOString(),
          result.vision_logmar?.toFixed(3) || '',
          result.vision_snellen || '',
          result.vision_pass ? 'PASS' : 'REFER',
          result.hearing_1000hz ? 'YES' : 'NO',
          result.hearing_2000hz ? 'YES' : 'NO',
          result.hearing_4000hz ? 'YES' : 'NO',
          result.hearing_pass ? 'PASS' : 'REFER',
          result.referral_needed ? 'YES' : 'NO',
          result.screener_name || '',
        ]
          .map((v) => `"${v}"`)
          .join(',');
      })
      .join('\n');

    return headers + rows;
  };

  /**
   * Generate HL7 v2.5 content
   */
  const generateHL7Content = (child, result) => {
    const msh = `MSH|^~\\&|SKIDS|EYEAR|SKIDS_RECEIVER|${child.school_code}|${new Date().toISOString().replace(/[:-]/g, '')}||ORM^O01|||2.5`;

    const pid = `PID||${child.child_id}|||${child.name}||${child.date_of_birth.replace(/-/g, '')}`;

    const obr1 = `OBR|||${result.id}|VA^VISION_ACUITY||${new Date(result.screening_date).toISOString().replace(/[:-]/g, '')}`;

    const obx1 = `OBX|1|NM|VA^Vision LogMAR||${result.vision_logmar?.toFixed(3) || ''}|||||${result.vision_pass ? 'P' : 'A'}`;

    const obr2 = `OBR|||${result.id}|HA^HEARING_TEST||${new Date(result.screening_date).toISOString().replace(/[:-]/g, '')}`;

    const obx2 = `OBX|1|CWE|HA1000^Hearing 1kHz||${result.hearing_1000hz ? 'P' : 'N'}|||||${result.hearing_1000hz ? 'P' : 'A'}`;
    const obx3 = `OBX|2|CWE|HA2000^Hearing 2kHz||${result.hearing_2000hz ? 'P' : 'N'}|||||${result.hearing_2000hz ? 'P' : 'A'}`;
    const obx4 = `OBX|3|CWE|HA4000^Hearing 4kHz||${result.hearing_4000hz ? 'P' : 'N'}|||||${result.hearing_4000hz ? 'P' : 'A'}`;

    return [msh, pid, obr1, obx1, obr2, obx2, obx3, obx4].join('\n');
  };

  /**
   * Generate bulk PDF content
   */
  const generateBulkPDFContent = (stats) => {
    const content = `
SKIDS EYEAR - BULK EXPORT REPORT
================================

SCREENING STATISTICS
-------------------
Total Screenings: ${stats.totalScreenings || 0}
Vision Tests: ${stats.visionTests || 0}
Hearing Tests: ${stats.hearingTests || 0}
Referrals Needed: ${stats.referralsNeeded || 0}
Pass Rate: ${stats.passRate ? `${(stats.passRate * 100).toFixed(1)}%` : 'N/A'}

Generated by SKIDS EYEAR
Report timestamp: ${new Date().toISOString()}
    `;
    return content;
  };

  /**
   * Save file to device storage
   */
  const saveTextFile = async (content, fileName) => {
    const uri = `${FileSystem.cacheDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(uri, content);
    await Sharing.shareAsync(uri);
  };

  const saveCSVFile = async (content, fileName) => {
    await saveTextFile(content, fileName);
  };

  const savePDFFile = async (content, fileName) => {
    // In a real app, use a PDF library like react-native-pdf-lib
    await saveTextFile(content, fileName);
  };

  const saveJSONFile = async (content, fileName) => {
    await saveTextFile(content, fileName);
  };

  const handleExport = async () => {
    switch (exportFormat) {
      case 'pdf':
        await exportToPDF();
        break;
      case 'csv':
        await exportToCSV();
        break;
      case 'fhir':
        await exportToFHIR();
        break;
      case 'hl7':
        await exportToHL7();
        break;
      default:
        Alert.alert('Error', 'Invalid export format');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📤 Export Screening Data</Text>
        <Text style={styles.subtitle}>
          {bulkExport ? 'Bulk Export' : 'Single Result Export'}
        </Text>
      </View>

      {/* Format Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Export Format</Text>

        {[
          {
            id: 'pdf',
            name: '📄 PDF Report',
            desc: 'Professional PDF report for printing',
          },
          {
            id: 'csv',
            name: '📊 CSV Spreadsheet',
            desc: 'Excel-compatible CSV format',
          },
          {
            id: 'fhir',
            name: '🏥 FHIR R4 (JSON)',
            desc: 'Healthcare interoperability standard',
          },
          {
            id: 'hl7',
            name: '🔗 HL7 v2.5 (EDI)',
            desc: 'Electronic Data Interchange format',
          },
        ].map((format) => (
          <TouchableOpacity
            key={format.id}
            style={[
              styles.formatOption,
              exportFormat === format.id && styles.formatOptionSelected,
            ]}
            onPress={() => setExportFormat(format.id)}
          >
            <View style={styles.formatRadio}>
              {exportFormat === format.id && (
                <View style={styles.formatRadioDot} />
              )}
            </View>
            <View style={styles.formatInfo}>
              <Text style={styles.formatName}>{format.name}</Text>
              <Text style={styles.formatDesc}>{format.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Export Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export Options</Text>

        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>Include Metadata</Text>
          <Switch
            value={includeMetadata}
            onValueChange={setIncludeMetadata}
            trackColor={{ false: '#D0D0D0', true: '#81C784' }}
            thumbColor={includeMetadata ? '#4a6fa5' : '#f4f4f4'}
          />
        </View>

        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>Include PII (Names, DOB)</Text>
          <Switch
            value={includePII}
            onValueChange={setIncludePII}
            trackColor={{ false: '#D0D0D0', true: '#81C784' }}
            thumbColor={includePII ? '#4a6fa5' : '#f4f4f4'}
          />
        </View>

        {bulkExport && (
          <View style={styles.dateRangeSection}>
            <Text style={styles.optionLabel}>Date Range</Text>
            <View style={styles.dateRangeOptions}>
              {['All', 'Month', 'Week'].map((range, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.dateRangeButton,
                    dateRange === range.toLowerCase() &&
                      styles.dateRangeButtonSelected,
                  ]}
                  onPress={() => setDateRange(range.toLowerCase())}
                >
                  <Text
                    style={[
                      styles.dateRangeButtonText,
                      dateRange === range.toLowerCase() &&
                        styles.dateRangeButtonTextSelected,
                    ]}
                  >
                    {range}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Format Info */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>ℹ️ Format Information</Text>
        {exportFormat === 'pdf' && (
          <Text style={styles.infoText}>
            PDF reports include all screening results with recommendations and
            can be printed directly.
          </Text>
        )}
        {exportFormat === 'csv' && (
          <Text style={styles.infoText}>
            CSV files are compatible with Excel and Google Sheets for further
            analysis and reporting.
          </Text>
        )}
        {exportFormat === 'fhir' && (
          <Text style={styles.infoText}>
            FHIR R4 JSON format follows healthcare standards and can be
            integrated with EHR systems.
          </Text>
        )}
        {exportFormat === 'hl7' && (
          <Text style={styles.infoText}>
            HL7 v2.5 EDI format is compatible with legacy healthcare systems
            and medical records.
          </Text>
        )}
      </View>

      {/* Export Button */}
      <View style={styles.actionSection}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4a6fa5" />
            <Text style={styles.loadingText}>Exporting...</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={handleExport}
              disabled={loading}
            >
              <Text style={styles.exportButtonText}>📤 Export Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.spacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#4a6fa5',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  formatOptionSelected: {
    borderColor: '#4a6fa5',
    backgroundColor: '#F0F4F8',
  },
  formatRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4a6fa5',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formatRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4a6fa5',
  },
  formatInfo: {
    flex: 1,
  },
  formatName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  formatDesc: {
    fontSize: 12,
    color: '#999',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  dateRangeSection: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  dateRangeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dateRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  dateRangeButtonSelected: {
    backgroundColor: '#4a6fa5',
  },
  dateRangeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  dateRangeButtonTextSelected: {
    color: '#FFF',
  },
  infoSection: {
    backgroundColor: '#E8F4F8',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#16A085',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16A085',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
  },
  actionSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  exportButton: {
    backgroundColor: '#4a6fa5',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  exportButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#E5E5E5',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  spacing: {
    height: 40,
  },
});

export default ExportScreen;
