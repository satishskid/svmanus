/**
 * Offline Database Tests
 */

const { OfflineDB } = require('../services/offlineDB');

describe('OfflineDB', () => {
  let db;

  beforeEach(() => {
    // Use in-memory database for tests
    db = new OfflineDB(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  describe('schema initialization', () => {
    test('should create all required tables', () => {
      const tables = db.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      const tableNames = tables.map(t => t.name);

      expect(tableNames).toContain('children');
      expect(tableNames).toContain('screening_results');
      expect(tableNames).toContain('sync_queue');
      expect(tableNames).toContain('audit_log');
    });
  });

  describe('children operations', () => {
    const childData = {
      child_id: 'S1001',
      name: 'Amina Ali',
      dateOfBirth: '2019-05-12',
      schoolCode: 'SCH001',
      gradeLevel: 'Grade 3',
    };

    test('should save and retrieve child', () => {
      const id = db.saveChild(childData);
      expect(id).toBeDefined();

      const retrieved = db.getChildById(childData.child_id);
      expect(retrieved).toBeDefined();
      expect(retrieved.name).toBe('Amina Ali');
      expect(retrieved.child_id).toBe('S1001');
    });

    test('should get all children', () => {
      db.saveChild(childData);
      db.saveChild({
        ...childData,
        child_id: 'S1002',
        name: 'Jamal Khan',
      });

      const children = db.getAllChildren();
      expect(children.length).toBe(2);
    });

    test('should update existing child', () => {
      db.saveChild(childData);
      
      const updated = db.saveChild({
        ...childData,
        name: 'Amina Upgraded',
      });

      const retrieved = db.getChildById(childData.child_id);
      expect(retrieved.name).toBe('Amina Upgraded');
    });

    test('should bulk insert children', () => {
      const children = [
        { student_id: 'S1', full_name: 'Child 1', date_of_birth: '2019-01-01', school_code: 'SCH001' },
        { student_id: 'S2', full_name: 'Child 2', date_of_birth: '2019-02-02', school_code: 'SCH001' },
      ];

      const count = db.bulkInsertChildren(children);
      expect(count).toBe(2);

      const allChildren = db.getAllChildren();
      expect(allChildren.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('screening results operations', () => {
    const childData = {
      child_id: 'S1001',
      name: 'Test Child',
      dateOfBirth: '2019-05-12',
      schoolCode: 'SCH001',
    };

    const screeningResult = {
      childProfile: childData,
      screeningDate: new Date().toISOString(),
      vision: {
        logMAR: 0.3,
        snellenEquivalent: '20/40',
        pass: true,
        confidence: 95,
        testDuration: 120000,
        reversals: 4,
      },
      hearing: {
        frequencies: {
          '1000': { detected: true, confidence: 90 },
          '2000': { detected: true, confidence: 85 },
          '4000': { detected: false, confidence: 80 },
        },
        pass: false,
        testDuration: 90000,
      },
      referralNeeded: false,
      referralReasons: [],
      passStatus: 'pass',
      screenerId: 'NURSE001',
      screenerName: 'Jane Nurse',
      schoolCode: 'SCH001',
    };

    test('should save screening result', () => {
      db.saveChild(childData);
      const id = db.saveScreeningResult(screeningResult);

      expect(id).toBeDefined();
    });

    test('should retrieve screenings for child', () => {
      db.saveChild(childData);
      const id = db.saveScreeningResult(screeningResult);

      const screenings = db.getChildScreenings(childData.child_id);
      expect(screenings.length).toBeGreaterThan(0);
      expect(screenings[0].vision_logmar).toBe(0.3);
    });

    test('should mark result as synced', () => {
      db.saveChild(childData);
      const id = db.saveScreeningResult(screeningResult);

      db.markResultSynced(id);

      const unsyncedResults = db.getUnsyncedResults();
      expect(unsyncedResults.find(r => r.id === id)).toBeUndefined();
    });

    test('should get unsynced results', () => {
      db.saveChild(childData);
      const id = db.saveScreeningResult(screeningResult);

      const unsyncedResults = db.getUnsyncedResults();
      expect(unsyncedResults.length).toBeGreaterThan(0);
      expect(unsyncedResults[0].id).toBe(id);
    });
  });

  describe('sync queue operations', () => {
    test('should add to sync queue', () => {
      const data = { test: 'data' };
      const queueId = db.addToSyncQueue('screening_result', 'RESULT001', data);

      expect(queueId).toBeDefined();
    });

    test('should retrieve pending sync items', () => {
      const data = { test: 'data' };
      db.addToSyncQueue('screening_result', 'RESULT001', data);

      const queue = db.getSyncQueue('pending');
      expect(queue.length).toBeGreaterThan(0);
      expect(queue[0].type).toBe('screening_result');
    });

    test('should update sync queue item', () => {
      const data = { test: 'data' };
      const queueId = db.addToSyncQueue('screening_result', 'RESULT001', data);

      db.updateSyncQueueItem(queueId, {
        status: 'syncing',
        attempts: 1,
      });

      const queue = db.getSyncQueue('syncing');
      expect(queue.length).toBeGreaterThan(0);
    });
  });

  describe('audit logging', () => {
    test('should log audit events', () => {
      const eventId = db.logAuditEvent(
        'screening_created',
        'screening_results',
        'RESULT001',
        'NURSE001',
        'create',
        null,
        { vision_logmar: 0.3 }
      );

      expect(eventId).toBeDefined();
    });
  });

  describe('statistics and exports', () => {
    beforeEach(() => {
      // Setup test data
      const childData = {
        child_id: 'S1001',
        name: 'Test Child',
        dateOfBirth: '2019-05-12',
        schoolCode: 'SCH001',
      };
      db.saveChild(childData);

      const now = new Date().toISOString();
      const result = {
        childProfile: childData,
        screeningDate: now,
        vision: { logMAR: 0.2, pass: true, snellenEquivalent: '20/40', confidence: 95, testDuration: 120000 },
        hearing: {
          frequencies: { '1000': { detected: true }, '2000': { detected: true }, '4000': { detected: true } },
          pass: true,
        },
        referralNeeded: false,
        referralReasons: [],
        passStatus: 'pass',
        screenerId: 'NURSE001',
        screenerName: 'Jane',
        schoolCode: 'SCH001',
      };

      const resultId = db.saveScreeningResult(result);
      db.markResultSynced(resultId);
    });

    test('should get screening statistics', () => {
      const now = new Date().toISOString();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const stats = db.getScreeningStats('SCH001', new Date('2020-01-01').toISOString(), tomorrow.toISOString());

      expect(stats).toBeDefined();
      expect(stats.total_screened).toBeGreaterThan(0);
    });

    test('should export screenings', () => {
      const exports = db.exportScreenings({ schoolCode: 'SCH001' });

      expect(Array.isArray(exports)).toBe(true);
      expect(exports.length).toBeGreaterThan(0);
    });
  });

  describe('data retention', () => {
    test('should delete old synced data', () => {
      // Add old data
      const childData = {
        child_id: 'S9999',
        name: 'Old Child',
        dateOfBirth: '2019-05-12',
        schoolCode: 'SCH001',
      };
      db.saveChild(childData);

      const twoMonthsAgo = new Date();
      twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);

      const result = {
        childProfile: childData,
        screeningDate: twoMonthsAgo.toISOString(),
        vision: { logMAR: 0.3, pass: true, snellenEquivalent: '20/40', confidence: 95 },
        hearing: { frequencies: { '1000': { detected: true }, '2000': { detected: true }, '4000': { detected: true } }, pass: true },
        referralNeeded: false,
        referralReasons: [],
        passStatus: 'pass',
        screenerId: 'NURSE001',
        screenerName: 'Jane',
        schoolCode: 'SCH001',
      };

      const resultId = db.saveScreeningResult(result);
      db.markResultSynced(resultId, twoMonthsAgo.toISOString());

      const deletedCount = db.deleteOldSyncedData(30);
      expect(deletedCount).toBeGreaterThan(0);
    });
  });

  describe('database cleanup', () => {
    test('should clear all data', () => {
      db.saveChild({
        child_id: 'S1001',
        name: 'Test',
        dateOfBirth: '2019-05-12',
      });

      db.clear();

      const children = db.getAllChildren();
      expect(children.length).toBe(0);
    });
  });
});
