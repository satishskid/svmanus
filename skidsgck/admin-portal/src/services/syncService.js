/**
 * Data Synchronization Service
 * Handles bi-directional sync between mobile app and admin portal
 * 
 * Features:
 * - Pull: Download latest data from mobile app/backend
 * - Push: Upload admin changes to backend
 * - Conflict resolution: Handle data conflicts
 * - Retry logic: Handle network failures
 */

class SyncService {
  constructor(indexedDBService, options = {}) {
    this.db = indexedDBService;
    this.syncEndpoint = options.syncEndpoint || '/api/sync';
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 5000; // 5 seconds
    this.syncInProgress = false;
  }

  /**
   * Perform full sync (pull + push)
   */
  async performSync() {
    if (this.syncInProgress) {
      console.log('Sync already in progress');
      return;
    }

    this.syncInProgress = true;
    try {
      // Pull new data from server
      await this.pullData();

      // Push pending changes
      await this.pushData();

      // Log successful sync
      await this.db.logAuditEvent('sync_completed', {
        timestamp: new Date().toISOString(),
        type: 'full_sync',
      });

      return { success: true, message: 'Sync completed successfully' };
    } catch (error) {
      console.error('Sync failed:', error);
      await this.db.logAuditEvent('sync_failed', {
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Pull new data from backend
   */
  async pullData() {
    try {
      const response = await fetch(`${this.syncEndpoint}/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastSyncTime: await this.getLastSyncTime(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Sync pull failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Process incoming data
      if (data.children) {
        for (const child of data.children) {
          await this.db.saveChild({
            ...child,
            is_synced: 1,
            synced_at: new Date().toISOString(),
          });
        }
      }

      if (data.screening_results) {
        for (const result of data.screening_results) {
          await this.db.saveScreeningResult({
            ...result,
            is_synced: 1,
            synced_at: new Date().toISOString(),
          });
        }
      }

      // Update last sync time
      await this.setLastSyncTime(new Date().toISOString());

      return data;
    } catch (error) {
      console.error('Pull data failed:', error);
      // Fail silently for offline - will retry on next sync
      if (!navigator.onLine) {
        console.log('Offline - pull will retry when connection restored');
        return null;
      }
      throw error;
    }
  }

  /**
   * Push pending changes to backend
   */
  async pushData() {
    const pendingItems = await this.db.getPendingSyncItems();

    if (pendingItems.length === 0) {
      return { success: true, synced: 0 };
    }

    let successCount = 0;
    let failureCount = 0;

    for (const item of pendingItems) {
      try {
        await this.pushItemWithRetry(item);
        await this.db.updateSyncQueueStatus(item.id, 'synced');
        successCount++;
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error);
        failureCount++;
      }
    }

    return { success: failureCount === 0, synced: successCount, failed: failureCount };
  }

  /**
   * Push single item with retry logic
   */
  async pushItemWithRetry(item, attempt = 1) {
    try {
      const response = await fetch(`${this.syncEndpoint}/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        throw new Error(`Push failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt < this.maxRetries && !navigator.onLine) {
        // Retry after delay if offline and retries remaining
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        return this.pushItemWithRetry(item, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Handle conflict resolution
   */
  async resolveConflict(localData, remoteData, strategy = 'latest') {
    if (strategy === 'latest') {
      // Keep the most recently modified version
      const localTime = new Date(localData.updated_at).getTime();
      const remoteTime = new Date(remoteData.updated_at).getTime();
      return localTime > remoteTime ? localData : remoteData;
    } else if (strategy === 'local') {
      return localData;
    } else if (strategy === 'remote') {
      return remoteData;
    } else {
      throw new Error(`Unknown conflict resolution strategy: ${strategy}`);
    }
  }

  /**
   * Import data from file (USB or file upload)
   */
  async importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          await this.importData(data);
          resolve({ success: true, message: 'Data imported successfully' });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  /**
   * Import data from parsed object
   */
  async importData(data) {
    if (data.children) {
      for (const child of data.children) {
        await this.db.saveChild(child);
      }
    }

    if (data.screening_results) {
      for (const result of data.screening_results) {
        await this.db.saveScreeningResult(result);
      }
    }

    await this.db.logAuditEvent('data_imported', {
      childrenCount: data.children?.length || 0,
      resultsCount: data.screening_results?.length || 0,
    });
  }

  /**
   * Export data to file
   */
  async exportToFile(format = 'json') {
    const children = await this.db.getChildrenBySchool('*'); // Get all
    const screenings = await this.getAllScreenings();

    const data = {
      export_date: new Date().toISOString(),
      children,
      screening_results: screenings,
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      return this.convertToCSV(data);
    } else {
      throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Convert data to CSV format
   */
  convertToCSV(data) {
    const headers = [
      'Child ID',
      'Name',
      'DOB',
      'School',
      'Grade',
      'Screening Date',
      'Vision LogMAR',
      'Vision Pass',
      'Hearing Pass',
      'Referral Needed',
    ];

    const rows = data.screening_results.map((result) => {
      const child = data.children.find((c) => c.child_id === result.child_id);
      return [
        result.child_id,
        child?.name || '',
        child?.date_of_birth || '',
        child?.school_code || '',
        child?.grade_level || '',
        result.screening_date,
        result.vision_logmar || '',
        result.vision_pass ? 'Yes' : 'No',
        result.hearing_pass ? 'Yes' : 'No',
        result.referral_needed ? 'Yes' : 'No',
      ];
    });

    const csv =
      [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n') +
      '\n';

    return csv;
  }

  /**
   * Get last sync time
   */
  async getLastSyncTime() {
    const lastSync = localStorage.getItem('lastSyncTime');
    return lastSync || new Date(0).toISOString();
  }

  /**
   * Set last sync time
   */
  async setLastSyncTime(timestamp) {
    localStorage.setItem('lastSyncTime', timestamp);
  }

  /**
   * Get all children (internal helper)
   */
  async getAllChildren() {
    // This would need to be implemented in IndexedDBService
    // For now, return empty
    return [];
  }

  /**
   * Get all screenings (internal helper)
   */
  async getAllScreenings() {
    return this.db.getAllScreenings();
  }

  /**
   * Monitor connection status for automatic sync
   */
  setupAutoSync(interval = 60000) {
    // Check connection status
    window.addEventListener('online', async () => {
      console.log('Connection restored - performing sync');
      try {
        await this.performSync();
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    });

    // Periodic sync interval
    return setInterval(async () => {
      if (navigator.onLine) {
        try {
          await this.performSync();
        } catch (error) {
          console.error('Periodic sync failed:', error);
        }
      }
    }, interval);
  }
}

export default SyncService;
