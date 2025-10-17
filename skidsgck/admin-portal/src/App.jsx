import { useState, useEffect } from 'react';
import AnalyticsDashboard from './components/AnalyticsDashboard.jsx';
import RosterImporterScreen from './components/RosterImporterScreen.jsx';
import DataManagerScreen from './components/DataManagerScreen.jsx';
import IndexedDBService from './services/indexedDBService.js';
import SyncService from './services/syncService.js';
import AnalyticsService from './services/analyticsService.js';

export default function App() {
  const [indexedDBService, setIndexedDBService] = useState(null);
  const [analyticsService, setAnalyticsService] = useState(null);
  const [syncService, setSyncService] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [syncStatus, setSyncStatus] = useState('ready');
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Initialize services on mount
  useEffect(() => {
    const initServices = async () => {
      try {
        // Initialize IndexedDB
        const db = new IndexedDBService();
        await db.init();
        setIndexedDBService(db);

        // Initialize Analytics Service
        const analytics = new AnalyticsService(db);
        setAnalyticsService(analytics);

        // Initialize Sync Service
        const sync = new SyncService(db, {
          syncEndpoint: process.env.REACT_APP_API_URL || '/api/sync',
        });
        setSyncService(sync);

        // Setup auto-sync (every 5 minutes)
        sync.setupAutoSync(5 * 60 * 1000);

        // Setup offline/online listeners
        window.addEventListener('online', () => setSyncStatus('connected'));
        window.addEventListener('offline', () => setSyncStatus('offline'));

        if (!navigator.onLine) {
          setSyncStatus('offline');
        }
      } catch (err) {
        setError(`Failed to initialize services: ${err.message}`);
        console.error(err);
      }
    };

    initServices();
  }, []);

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorBox}>
          <h2>⚠️ Initialization Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!indexedDBService || !analyticsService) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}>⟳</div>
        <p>Initializing Admin Portal...</p>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <AnalyticsDashboard indexedDBService={indexedDBService} analyticsService={analyticsService} />
        );
      case 'importer':
        return (
          <RosterImporterScreen
            indexedDBService={indexedDBService}
            onImportComplete={() => setCurrentScreen('dashboard')}
          />
        );
      case 'manager':
        return (
          <DataManagerScreen
            indexedDBService={indexedDBService}
            syncService={syncService}
            analyticsService={analyticsService}
          />
        );
      default:
        return <div>Unknown screen</div>;
    }
  };

  return (
    <div style={styles.app} data-testid="app-container">
      {/* Navigation Bar */}
      <nav style={styles.navbar} data-testid="main-navigation">
        <div style={styles.navContent}>
          <div style={styles.navBrand}>
            <span style={styles.brandIcon}>👁️👂</span>
            <h1 style={styles.brandTitle}>SKIDS EYEAR</h1>
          </div>

          <div style={styles.navMenu}>
            <NavButton
              label="📊 Dashboard"
              active={currentScreen === 'dashboard'}
              onClick={() => setCurrentScreen('dashboard')}
              testId="nav-dashboard"
            />
            <NavButton
              label="📋 Import"
              active={currentScreen === 'importer'}
              onClick={() => setCurrentScreen('importer')}
              testId="nav-import"
            />
            <NavButton
              label="📂 Data"
              active={currentScreen === 'manager'}
              onClick={() => setCurrentScreen('manager')}
              testId="nav-data"
            />
          </div>

          {/* Status Badge */}
          <div
            data-testid="connection-status"
            style={{
              ...styles.statusBadge,
              backgroundColor:
                syncStatus === 'offline'
                  ? '#dc2626'
                  : syncStatus === 'connected'
                    ? '#059669'
                    : '#9ca3af',
            }}
          >
            {syncStatus === 'offline' ? '🔴 Offline' : syncStatus === 'connected' ? '🟢 Connected' : '🟡 Ready'}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={styles.main} role="main" data-testid="main-content">{renderScreen()}</main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>SKIDS EYEAR Admin Portal • v1.0.0 • Production Ready</p>
      </footer>
    </div>
  );
}

function NavButton({ label, active, onClick, testId }) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      style={{
        ...styles.navButton,
        backgroundColor: active ? '#4a6fa5' : 'transparent',
        color: active ? 'white' : '#9ca3af',
      }}
    >
      {label}
    </button>
  );
}

const styles = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  navbar: {
    backgroundColor: '#1f2937',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  navContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  brandIcon: {
    fontSize: '24px',
  },
  brandTitle: {
    margin: '0',
    fontSize: '20px',
    fontWeight: '700',
  },
  navMenu: {
    display: 'flex',
    gap: '10px',
    flex: 1,
    marginLeft: '40px',
  },
  navButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  main: {
    flex: 1,
  },
  footer: {
    backgroundColor: '#374151',
    color: '#d1d5db',
    padding: '20px',
    textAlign: 'center',
    fontSize: '13px',
    borderTop: '1px solid #4b5563',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  },
  spinner: {
    fontSize: '48px',
    marginBottom: '20px',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '20px',
  },
  errorBox: {
    backgroundColor: 'white',
    border: '2px solid #dc2626',
    borderRadius: '8px',
    padding: '30px',
    maxWidth: '500px',
    textAlign: 'center',
    color: '#dc2626',
  },
};

// Add spinning animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
