/**
 * IndexedDB Service for Admin Portal
 * Handles offline storage and sync state management
 * 
 * Stores:
 * - children: Child profiles with screening data
 * - screening_results: All test results
 * - sync_queue: Pending uploads to backend
 * - audit_log: Admin actions and changes
 */

class IndexedDBService {
  constructor(dbName = 'SKIDS_EYEAR_ADMIN', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }

  /**
   * Initialize IndexedDB connection
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Children store
        if (!db.objectStoreNames.contains('children')) {
          const childStore = db.createObjectStore('children', { keyPath: 'id' });
          childStore.createIndex('child_id', 'child_id', { unique: true });
          childStore.createIndex('school_code', 'school_code');
          childStore.createIndex('is_synced', 'is_synced');
        }

        // Screening results store
        if (!db.objectStoreNames.contains('screening_results')) {
          const resultsStore = db.createObjectStore('screening_results', { keyPath: 'id' });
          resultsStore.createIndex('child_id', 'child_id');
          resultsStore.createIndex('screening_date', 'screening_date');
          resultsStore.createIndex('is_synced', 'is_synced');
          resultsStore.createIndex('referral_needed', 'referral_needed');
        }

        // Sync queue
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncStore.createIndex('status', 'status');
          syncStore.createIndex('created_at', 'created_at');
        }

        // Audit log
        if (!db.objectStoreNames.contains('audit_log')) {
          const auditStore = db.createObjectStore('audit_log', { keyPath: 'id' });
          auditStore.createIndex('action', 'action');
          auditStore.createIndex('timestamp', 'timestamp');
          auditStore.createIndex('user_id', 'user_id');
        }
      };
    });
  }

  /**
   * Save child profile
   */
  async saveChild(child) {
    const tx = this.db.transaction(['children'], 'readwrite');
    const store = tx.objectStore('children');
    return new Promise((resolve, reject) => {
      const request = store.put({
        ...child,
        updated_at: new Date().toISOString(),
      });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all children for a school
   */
  async getChildrenBySchool(schoolCode) {
    const tx = this.db.transaction(['children'], 'readonly');
    const store = tx.objectStore('children');
    const index = store.index('school_code');
    return new Promise((resolve, reject) => {
      const request = index.getAll(schoolCode);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get child by ID
   */
  async getChild(id) {
    const tx = this.db.transaction(['children'], 'readonly');
    const store = tx.objectStore('children');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save screening result
   */
  async saveScreeningResult(result) {
    const tx = this.db.transaction(['screening_results'], 'readwrite');
    const store = tx.objectStore('screening_results');
    return new Promise((resolve, reject) => {
      const request = store.put({
        ...result,
        updated_at: new Date().toISOString(),
      });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get screening results for child
   */
  async getScreeningsByChild(childId) {
    const tx = this.db.transaction(['screening_results'], 'readonly');
    const store = tx.objectStore('screening_results');
    const index = store.index('child_id');
    return new Promise((resolve, reject) => {
      const request = index.getAll(childId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all screening results for analytics
   */
  async getAllScreenings() {
    const tx = this.db.transaction(['screening_results'], 'readonly');
    const store = tx.objectStore('screening_results');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get unsynced results
   */
  async getUnsyncedResults() {
    const tx = this.db.transaction(['screening_results'], 'readonly');
    const store = tx.objectStore('screening_results');
    const index = store.index('is_synced');
    return new Promise((resolve, reject) => {
      const request = index.getAll(0);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get referral cases
   */
  async getReferralCases() {
    const tx = this.db.transaction(['screening_results'], 'readonly');
    const store = tx.objectStore('screening_results');
    const index = store.index('referral_needed');
    return new Promise((resolve, reject) => {
      const request = index.getAll(1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Add to sync queue
   */
  async addToSyncQueue(item) {
    const tx = this.db.transaction(['sync_queue'], 'readwrite');
    const store = tx.objectStore('sync_queue');
    return new Promise((resolve, reject) => {
      const request = store.add({
        ...item,
        status: 'pending',
        created_at: new Date().toISOString(),
        retry_count: 0,
      });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get pending sync items
   */
  async getPendingSyncItems() {
    const tx = this.db.transaction(['sync_queue'], 'readonly');
    const store = tx.objectStore('sync_queue');
    const index = store.index('status');
    return new Promise((resolve, reject) => {
      const request = index.getAll('pending');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update sync queue item status
   */
  async updateSyncQueueStatus(id, status) {
    const tx = this.db.transaction(['sync_queue'], 'readwrite');
    const store = tx.objectStore('sync_queue');
    return new Promise(async (resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        const updateRequest = store.put({
          ...item,
          status,
          updated_at: new Date().toISOString(),
        });
        updateRequest.onsuccess = () => resolve(updateRequest.result);
        updateRequest.onerror = () => reject(updateRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Log audit event
   */
  async logAuditEvent(action, details, userId = 'admin') {
    const tx = this.db.transaction(['audit_log'], 'readwrite');
    const store = tx.objectStore('audit_log');
    return new Promise((resolve, reject) => {
      const request = store.add({
        id: crypto.randomUUID(),
        action,
        details,
        user_id: userId,
        timestamp: new Date().toISOString(),
      });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get audit log entries
   */
  async getAuditLog(limit = 100) {
    const tx = this.db.transaction(['audit_log'], 'readonly');
    const store = tx.objectStore('audit_log');
    const index = store.index('timestamp');
    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, 'prev');
      const results = [];
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear database (for dev/testing)
   */
  async clear() {
    const stores = ['children', 'screening_results', 'sync_queue', 'audit_log'];
    for (const storeName of stores) {
      const tx = this.db.transaction([storeName], 'readwrite');
      const store = tx.objectStore(storeName);
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }
}

export default IndexedDBService;
