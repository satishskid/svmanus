import React, { useState, useEffect } from 'react';

export default function AnalyticsDashboard({ indexedDBService, analyticsService }) {
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [bySchool, setBySchool] = useState([]);
  const [byGrade, setByGrade] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');

  useEffect(() => {
    loadAnalytics();
  }, [analyticsService]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [s, t, sch, gr, ref] = await Promise.all([
        analyticsService.getOverallStats(),
        analyticsService.getTrendAnalysis(30),
        analyticsService.getStatsBySchool(),
        analyticsService.getStatsByGrade(),
        analyticsService.getReferralCaseDetails(),
      ]);

      setStats(s);
      setTrend(t);
      setBySchool(sch);
      setByGrade(gr);
      setReferrals(ref.slice(0, 10));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncStatus('syncing');
    try {
      // Sync logic would go here
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSyncStatus('success');
      await loadAnalytics();
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err) {
      setSyncStatus('error');
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container} data-testid="analytics-dashboard">
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <div style={styles.icon}>📊</div>
          <h1>SKIDS EYEAR Dashboard</h1>
        </div>
        <button
          onClick={handleSync}
          disabled={syncStatus === 'syncing'}
          data-testid="sync-button"
          style={{
            ...styles.syncButton,
            opacity: syncStatus === 'syncing' ? 0.6 : 1,
          }}
        >
          {syncStatus === 'syncing' ? '⟳ Syncing...' : '↻ Sync Data'}
        </button>
      </div>

      {/* Overall Stats */}
      <div style={styles.section} data-testid="stats-section">
        <h2>Overall Statistics</h2>
        <div style={styles.statsGrid} data-testid="stats-container">
          <StatCard
            icon="👥"
            label="Children Screened"
            value={stats?.totalScreened || 0}
            color="#4a6fa5"
          />
          <StatCard
            icon="👁️"
            label="Vision Pass Rate"
            value={`${stats?.visionPassRate || 0}%`}
            color="#4a6fa5"
          />
          <StatCard
            icon="👂"
            label="Hearing Pass Rate"
            value={`${stats?.hearingPassRate || 0}%`}
            color="#4a6fa5"
          />
          <StatCard icon="⚠️" label="Referrals" value={stats?.referralCount || 0} color="#d97706" />
          <StatCard
            icon="📅"
            label="Total Screenings"
            value={stats?.totalScreenings || 0}
            color="#059669"
          />
          <StatCard
            icon="🎯"
            label="Referral Rate"
            value={`${stats?.referralRate || 0}%`}
            color="#d97706"
          />
        </div>
      </div>

      {/* By School */}
      {bySchool && bySchool.length > 0 && (
        <div style={styles.section} data-testid="school-breakdown">
          <h2>School Breakdown</h2>
          <div style={styles.tableContainer}>
            <table style={styles.table} data-testid="school-table">
              <thead>
                <tr style={styles.tableHeader}>
                  <th>School</th>
                  <th>Children</th>
                  <th>Vision Pass %</th>
                  <th>Hearing Pass %</th>
                  <th>Referral Rate %</th>
                </tr>
              </thead>
              <tbody>
                {bySchool.map((school, idx) => (
                  <tr key={idx} style={idx % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                    <td>{school.schoolCode}</td>
                    <td>{school.childrenCount}</td>
                    <td>{school.visionPassRate}%</td>
                    <td>{school.hearingPassRate}%</td>
                    <td>{school.referralRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* By Grade */}
      {byGrade && byGrade.length > 0 && (
        <div style={styles.section}>
          <h2>Grade Level Breakdown</h2>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th>Grade</th>
                  <th>Screened</th>
                  <th>Vision Pass %</th>
                  <th>Hearing Pass %</th>
                </tr>
              </thead>
              <tbody>
                {byGrade.map((grade, idx) => (
                  <tr key={idx} style={idx % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                    <td>{grade.grade}</td>
                    <td>{grade.screeningCount}</td>
                    <td>{grade.visionPassRate}%</td>
                    <td>{grade.hearingPassRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Referral Cases */}
      {referrals && referrals.length > 0 && (
        <div style={styles.section}>
          <h2>Recent Referral Cases</h2>
          <div style={styles.referralList}>
            {referrals.slice(0, 5).map((ref, idx) => (
              <div key={idx} style={styles.referralCard}>
                <div style={styles.referralHeader}>
                  <strong>{ref.name}</strong> ({ref.childId})
                  <span style={styles.badge}>{ref.age} years</span>
                </div>
                <div style={styles.referralDetails}>
                  <p>Screened: {new Date(ref.screeningDate).toLocaleDateString()}</p>
                  {ref.visionLogMAR !== null && (
                    <p>Vision LogMAR: {ref.visionLogMAR.toFixed(2)}</p>
                  )}
                  <p>
                    Reasons: {ref.referralReasons?.join(', ') || 'Not specified'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Trend */}
      {trend && trend.length > 0 && (
        <div style={styles.section}>
          <h2>Recent Screening Activity (30 days)</h2>
          <div style={styles.trendContainer}>
            {trend.slice(-7).map((day, idx) => (
              <div key={idx} style={styles.trendBar}>
                <div style={styles.trendDate}>{day.date}</div>
                <div style={styles.trendStats}>
                  <div style={{...styles.trendItem, backgroundColor: '#059669'}}>
                    {day.screened} screened
                  </div>
                  <div style={{...styles.trendItem, backgroundColor: '#d97706'}}>
                    {day.referrals} refer
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data Message */}
      {(!stats || stats.totalScreened === 0) && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <p>No screening data available yet.</p>
          <p>Import or sync data to see analytics.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ ...styles.statCard, borderLeftColor: color }}>
      <div style={styles.statIcon}>{icon}</div>
      <div style={styles.statContent}>
        <div style={styles.statLabel}>{label}</div>
        <div style={{ ...styles.statValue, color }}>{value}</div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  icon: {
    fontSize: '32px',
  },
  syncButton: {
    padding: '10px 20px',
    backgroundColor: '#4a6fa5',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'background-color 0.3s',
  },
  section: {
    backgroundColor: 'white',
    padding: '25px',
    marginBottom: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginTop: '15px',
  },
  statCard: {
    display: 'flex',
    gap: '12px',
    padding: '15px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    borderLeft: '4px solid',
  },
  statIcon: {
    fontSize: '28px',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    fontWeight: '500',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginTop: '4px',
  },
  tableContainer: {
    overflowX: 'auto',
    marginTop: '15px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#4a6fa5',
    color: 'white',
  },
  tableRowEven: {
    backgroundColor: '#f9fafb',
  },
  tableRowOdd: {
    backgroundColor: 'white',
  },
  referralList: {
    display: 'grid',
    gap: '15px',
    marginTop: '15px',
  },
  referralCard: {
    padding: '15px',
    backgroundColor: '#fef3c7',
    borderLeft: '4px solid #d97706',
    borderRadius: '6px',
  },
  referralHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  badge: {
    backgroundColor: '#d97706',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
  },
  referralDetails: {
    fontSize: '13px',
    color: '#333',
  },
  trendContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '10px',
    marginTop: '15px',
  },
  trendBar: {
    padding: '12px',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    textAlign: 'center',
  },
  trendDate: {
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  trendItem: {
    padding: '6px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '4px',
  },
  trendStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    color: '#999',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '15px',
  },
  loading: {
    textAlign: 'center',
    padding: '60px 20px',
    fontSize: '18px',
    color: '#666',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '20px',
    borderRadius: '8px',
    margin: '20px',
  },
};
