/**
 * Offline Database Layer (SQLite)
 * Handles all local data persistence for SKIDS EYEAR mobile app
 * 
 * Database Schema:
 * - children: Child profiles (QR scanned or imported)
 * - screening_results: Vision & hearing test results
 * - sync_queue: Queue for pending uploads
 * - audit_log: Event log for compliance
 */

const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');

class OfflineDB {
  constructor(dbPath = ':memory:') {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL'); // Enable WAL for better concurrency
    this.db.pragma('foreign_keys = ON');
    this.initializeSchema();
  }

  /**
   * Initialize database schema if not exists
   */
  initializeSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS children (
        id TEXT PRIMARY KEY,
        child_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        date_of_birth TEXT NOT NULL,
        school_code TEXT,
        grade_level TEXT,
        parent_name TEXT,
        parent_email TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        synced_at TEXT,
        is_synced INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS screening_results (
        id TEXT PRIMARY KEY,
        child_id TEXT NOT NULL,
        screening_date TEXT NOT NULL,
        vision_logmar REAL,
        vision_snellen TEXT,
        vision_pass INTEGER,
        vision_confidence REAL,
        vision_test_duration INTEGER,
        vision_reversals INTEGER,
        vision_notes TEXT,
        hearing_1000hz INTEGER,
        hearing_2000hz INTEGER,
        hearing_4000hz INTEGER,
        hearing_pass INTEGER,
        hearing_test_duration INTEGER,
        hearing_notes TEXT,
        referral_needed INTEGER,
        referral_reasons TEXT,
        pass_status TEXT,
        screener_id TEXT NOT NULL,
        screener_name TEXT NOT NULL,
        school_code TEXT,
        offline_mode INTEGER DEFAULT 1,
        synced_at TEXT,
        is_synced INTEGER DEFAULT 0,
        external_notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (child_id) REFERENCES children(child_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        data_id TEXT NOT NULL,
        data_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        attempts INTEGER DEFAULT 0,
        last_attempt TEXT,
        status TEXT DEFAULT 'pending',
        error_message TEXT
      );

      CREATE TABLE IF NOT EXISTS audit_log (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        entity_type TEXT,
        entity_id TEXT,
        user_id TEXT,
        action TEXT,
        old_values TEXT,
        new_values TEXT,
        timestamp TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_child_id ON screening_results(child_id);
      CREATE INDEX IF NOT EXISTS idx_screening_date ON screening_results(screening_date);
      CREATE INDEX IF NOT EXISTS idx_pass_status ON screening_results(pass_status);
      CREATE INDEX IF NOT EXISTS idx_sync_status ON sync_queue(status);
      CREATE INDEX IF NOT EXISTS idx_sync_created ON sync_queue(created_at);
      CREATE INDEX IF NOT EXISTS idx_audit_event ON audit_log(event_type);
      CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_log(timestamp);
    `);
  }

  /**
   * Get all children
   */
  getAllChildren() {
    const stmt = this.db.prepare('SELECT * FROM children ORDER BY updated_at DESC');
    return stmt.all();
  }

  /**
   * Get child by ID
   */
  getChildById(childId) {
    const stmt = this.db.prepare('SELECT * FROM children WHERE child_id = ?');
    return stmt.get(childId);
  }

  /**
   * Add or update child
   */
  saveChild(childData) {
    const id = childData.id || uuidv4();
    const now = new Date().toISOString();
    const existing = this.getChildById(childData.child_id);

    if (existing) {
      const stmt = this.db.prepare(`
        UPDATE children SET 
          name = ?, date_of_birth = ?, school_code = ?, grade_level = ?,
          parent_name = ?, parent_email = ?, updated_at = ?, is_synced = 0
        WHERE child_id = ?
      `);
      stmt.run(
        childData.name,
        childData.dateOfBirth,
        childData.schoolCode,
        childData.gradeLevel,
        childData.parentName,
        childData.parentEmail,
        now,
        childData.child_id
      );
      return existing.id;
    } else {
      const stmt = this.db.prepare(`
        INSERT INTO children (id, child_id, name, date_of_birth, school_code, grade_level, 
                             parent_name, parent_email, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        id,
        childData.child_id,
        childData.name,
        childData.dateOfBirth,
        childData.schoolCode,
        childData.gradeLevel,
        childData.parentName,
        childData.parentEmail,
        now,
        now
      );
      return id;
    }
  }

  /**
   * Save screening result
   */
  saveScreeningResult(result) {
    const id = result.id || uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO screening_results (
        id, child_id, screening_date,
        vision_logmar, vision_snellen, vision_pass, vision_confidence,
        vision_test_duration, vision_reversals, vision_notes,
        hearing_1000hz, hearing_2000hz, hearing_4000hz, hearing_pass,
        hearing_test_duration, hearing_notes,
        referral_needed, referral_reasons, pass_status,
        screener_id, screener_name, school_code, offline_mode,
        external_notes, created_at, updated_at, is_synced
      ) VALUES (
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?
      )
    `);

    stmt.run(
      id,
      result.childProfile?.child_id || result.childId,
      result.screeningDate || now,
      result.vision?.logMAR,
      result.vision?.snellenEquivalent,
      result.vision?.pass ? 1 : 0,
      result.vision?.confidence || null,
      result.vision?.testDuration || null,
      result.vision?.reversals || null,
      result.vision?.notes || null,
      result.hearing?.frequencies?.['1000']?.detected ? 1 : 0,
      result.hearing?.frequencies?.['2000']?.detected ? 1 : 0,
      result.hearing?.frequencies?.['4000']?.detected ? 1 : 0,
      result.hearing?.pass ? 1 : 0,
      result.hearing?.testDuration || null,
      result.hearing?.notes || null,
      result.referralNeeded ? 1 : 0,
      JSON.stringify(result.referralReasons || []),
      result.passStatus,
      result.screenerId,
      result.screenerName,
      result.schoolCode,
      result.offlineMode ? 1 : 0,
      result.externalNotes || null,
      now,
      now,
      0
    );

    return id;
  }

  /**
   * Get screening results for a child
   */
  getChildScreenings(childId) {
    const stmt = this.db.prepare(`
      SELECT * FROM screening_results 
      WHERE child_id = ? 
      ORDER BY screening_date DESC
    `);
    return stmt.all(childId);
  }

  /**
   * Get all unsynced results
   */
  getUnsyncedResults() {
    const stmt = this.db.prepare(`
      SELECT * FROM screening_results 
      WHERE is_synced = 0 
      ORDER BY created_at ASC
    `);
    return stmt.all();
  }

  /**
   * Mark result as synced
   */
  markResultSynced(resultId, syncedAt = new Date().toISOString()) {
    const stmt = this.db.prepare(`
      UPDATE screening_results 
      SET is_synced = 1, synced_at = ? 
      WHERE id = ?
    `);
    stmt.run(syncedAt, resultId);
  }

  /**
   * Get all items in sync queue
   */
  getSyncQueue(status = 'pending') {
    const stmt = this.db.prepare(`
      SELECT * FROM sync_queue 
      WHERE status = ? 
      ORDER BY created_at ASC
    `);
    return stmt.all(status);
  }

  /**
   * Add item to sync queue
   */
  addToSyncQueue(type, dataId, data) {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO sync_queue (id, type, data_id, data_json, created_at, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, type, dataId, JSON.stringify(data), now, 'pending');
    return id;
  }

  /**
   * Update sync queue item
   */
  updateSyncQueueItem(queueId, updates) {
    const allowed = ['status', 'attempts', 'last_attempt', 'error_message'];
    const setClause = Object.keys(updates)
      .filter(k => allowed.includes(k))
      .map(k => `${k} = ?`)
      .join(', ');

    if (!setClause) return;

    const stmt = this.db.prepare(`UPDATE sync_queue SET ${setClause} WHERE id = ?`);
    const values = Object.keys(updates)
      .filter(k => allowed.includes(k))
      .map(k => updates[k]);
    values.push(queueId);

    stmt.run(...values);
  }

  /**
   * Log audit event
   */
  logAuditEvent(eventType, entityType, entityId, userId, action, oldValues, newValues) {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO audit_log (id, event_type, entity_type, entity_id, user_id, action, 
                            old_values, new_values, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      eventType,
      entityType,
      entityId,
      userId,
      action,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      now
    );

    return id;
  }

  /**
   * Get statistics for dashboard
   */
  getScreeningStats(schoolCode, startDate, endDate) {
    const stmt = this.db.prepare(`
      SELECT 
        COUNT(*) as total_screened,
        SUM(CASE WHEN vision_pass = 1 THEN 1 ELSE 0 END) as vision_pass,
        SUM(CASE WHEN vision_pass = 0 AND vision_pass IS NOT NULL THEN 1 ELSE 0 END) as vision_refer,
        SUM(CASE WHEN hearing_pass = 1 THEN 1 ELSE 0 END) as hearing_pass,
        SUM(CASE WHEN hearing_pass = 0 AND hearing_pass IS NOT NULL THEN 1 ELSE 0 END) as hearing_refer,
        AVG(CASE WHEN vision_logmar IS NOT NULL THEN vision_logmar ELSE NULL END) as avg_vision_logmar
      FROM screening_results
      WHERE school_code = ? 
      AND screening_date BETWEEN ? AND ?
      AND is_synced = 1
    `);

    return stmt.get(schoolCode, startDate, endDate);
  }

  /**
   * Export results to JSON
   */
  exportScreenings(filters = {}) {
    let query = 'SELECT sr.*, c.name, c.date_of_birth FROM screening_results sr LEFT JOIN children c ON sr.child_id = c.child_id WHERE 1=1';
    const params = [];

    if (filters.schoolCode) {
      query += ' AND sr.school_code = ?';
      params.push(filters.schoolCode);
    }

    if (filters.startDate && filters.endDate) {
      query += ' AND sr.screening_date BETWEEN ? AND ?';
      params.push(filters.startDate, filters.endDate);
    }

    if (filters.passStatus) {
      query += ' AND sr.pass_status = ?';
      params.push(filters.passStatus);
    }

    query += ' ORDER BY sr.screening_date DESC';

    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  /**
   * Bulk insert children (for roster import)
   */
  bulkInsertChildren(childrenArray) {
    const insertStmt = this.db.prepare(`
      INSERT OR IGNORE INTO children (id, child_id, name, date_of_birth, school_code, 
                                     grade_level, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    const transaction = this.db.transaction((children) => {
      for (const child of children) {
        insertStmt.run(
          uuidv4(),
          child.student_id,
          child.full_name,
          child.date_of_birth,
          child.school_code,
          child.grade,
          now,
          now
        );
      }
    });

    transaction(childrenArray);
    return childrenArray.length;
  }

  /**
   * Delete old synced data (retention policy)
   */
  deleteOldSyncedData(daysOld = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffISO = cutoffDate.toISOString();

    const stmt = this.db.prepare(`
      DELETE FROM screening_results 
      WHERE is_synced = 1 AND synced_at < ?
    `);

    const result = stmt.run(cutoffISO);
    return result.changes;
  }

  /**
   * Close database connection
   */
  close() {
    this.db.close();
  }

  /**
   * Export entire database for backup
   */
  exportBackup() {
    return this.db.exec('SELECT * FROM screening_results');
  }

  /**
   * Clear all data (for testing only)
   */
  clear() {
    this.db.exec(`
      DELETE FROM sync_queue;
      DELETE FROM screening_results;
      DELETE FROM children;
      DELETE FROM audit_log;
    `);
  }
}

module.exports = { OfflineDB };