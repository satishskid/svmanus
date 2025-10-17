import React, { useState, useEffect } from 'react';

export default function DataManagerScreen({ indexedDBService, syncService, analyticsService }) {
  const [syncHistory, setSyncHistory] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [stats, setStats] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const log = await indexedDBService.getAuditLog(50);
      setAuditLog(log);

      const dbStats = await analyticsService.getOverallStats();
      setStats(dbStats);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const data = await syncService.exportToFile('json');
      downloadFile(data, 'skids_eyear_data.json', 'application/json');
    } catch (error) {
      alert(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const data = await syncService.exportToFile('csv');
      downloadFile(data, 'skids_eyear_data.csv', 'text/csv');
    } catch (error) {
      alert(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await syncService.importFromFile(file);
      alert('Data imported successfully');
      await loadData();
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    }
  };

  const handleClearDatabase = async () => {
    if (!window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    try {
      await indexedDBService.clear();
      setSyncHistory([]);
      setAuditLog([]);
      setStats(null);
      alert('Database cleared');
    } catch (error) {
      alert(`Clear failed: ${error.message}`);
    } finally {
      setIsClearing(false);
    }
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>📂 Data Manager</h1>
        <p>Manage data synchronization, import/export, and audit logs</p>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div style={styles.statsBox}>
          <div style={styles.statItem}>
            <div style={styles.statLabel}>Total Screenings</div>
            <div style={styles.statValue}>{stats.totalScreenings}</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statLabel}>Unsynced Items</div>
            <div style={styles.statValue}>0</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statLabel}>Last Sync</div>
            <div style={styles.statValue}>Now</div>
          </div>
        </div>
      )}

      {/* Import/Export Section */}
      <div style={styles.section}>
        <h2>📤 Import / Export Data</h2>
        <div style={styles.buttonGrid}>
          <button onClick={handleExportJSON} disabled={isExporting} style={styles.button}>
            💾 Export as JSON
          </button>
          <button onClick={handleExportCSV} disabled={isExporting} style={styles.button}>
            📊 Export as CSV
          </button>
          <label style={styles.button}>
            📥 Import JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              style={{ display: 'none' }}
            />
          </label>
          <button onClick={handleClearDatabase} disabled={isClearing} style={styles.dangerButton}>
            🗑️ Clear Database
          </button>
        </div>
      </div>

      {/* Audit Log */}
      {auditLog.length > 0 && (
        <div style={styles.section}>
          <h2>📋 Activity Log</h2>
          <div style={styles.logContainer}>
            {auditLog.slice(0, 20).map((entry, idx) => (
              <div key={idx} style={styles.logEntry}>
                <div style={styles.logAction}>
                  {getActionIcon(entry.action)} <strong>{entry.action}</strong>
                </div>
                <div style={styles.logTime}>{new Date(entry.timestamp).toLocaleString()}</div>
                {entry.details && (
                  <div style={styles.logDetails}>{JSON.stringify(entry.details).substring(0, 100)}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getActionIcon(action) {
  const icons = {
    sync_completed: '✅',
    sync_failed: '❌',
    roster_imported: '📋',
    data_imported: '📥',
    child_import: '👤',
  };
  return icons[action] || '📝';
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'system-ui',
  },
  header: {
    marginBottom: '30px',
  },
  statsBox: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
  },
  statItem: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  statLabel: {
    color: '#666',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#4a6fa5',
  },
  section: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '10px',
    marginTop: '15px',
  },
  button: {
    padding: '12px 16px',
    backgroundColor: '#4a6fa5',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
  },
  dangerButton: {
    padding: '12px 16px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
  },
  logContainer: {
    display: 'grid',
    gap: '12px',
  },
  logEntry: {
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderLeft: '4px solid #4a6fa5',
    borderRadius: '4px',
    fontSize: '13px',
  },
  logAction: {
    fontWeight: '600',
    marginBottom: '4px',
  },
  logTime: {
    color: '#999',
    fontSize: '12px',
    marginBottom: '4px',
  },
  logDetails: {
    color: '#666',
    fontSize: '12px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};
