import { describe, it, expect, beforeEach, vi } from 'vitest';
import SyncService from '../services/syncService';

describe('SyncService', () => {
  let syncService;
  let mockDB;

  beforeEach(() => {
    mockDB = {
      saveChild: vi.fn().mockResolvedValue('child-id'),
      saveScreeningResult: vi.fn().mockResolvedValue('result-id'),
      getPendingSyncItems: vi.fn().mockResolvedValue([]),
      updateSyncQueueStatus: vi.fn().mockResolvedValue(null),
      logAuditEvent: vi.fn().mockResolvedValue(null),
      getAllScreenings: vi.fn().mockResolvedValue([]),
      getChildrenBySchool: vi.fn().mockResolvedValue([]),
    };
    syncService = new SyncService(mockDB);
    vi.clearAllMocks();
  });

  describe('importData', () => {
    it('should import children and results', async () => {
      const data = {
        children: [
          {
            id: 'child-1',
            child_id: 'S00001',
            name: 'John Doe',
          },
        ],
        screening_results: [
          {
            id: 'result-1',
            child_id: 'S00001',
            vision_pass: 1,
          },
        ],
      };

      await syncService.importData(data);

      expect(mockDB.saveChild).toHaveBeenCalledWith(data.children[0]);
      expect(mockDB.saveScreeningResult).toHaveBeenCalledWith(data.screening_results[0]);
      expect(mockDB.logAuditEvent).toHaveBeenCalled();
    });

    it('should handle empty data', async () => {
      const data = {};
      await syncService.importData(data);

      expect(mockDB.saveChild).not.toHaveBeenCalled();
      expect(mockDB.saveScreeningResult).not.toHaveBeenCalled();
    });
  });

  describe('convertToCSV', () => {
    it('should convert data to CSV format', () => {
      const data = {
        children: [
          {
            child_id: 'S00001',
            name: 'John Doe',
            date_of_birth: '2018-06-15',
            school_code: 'SCHOOL001',
            grade_level: 'K',
          },
        ],
        screening_results: [
          {
            child_id: 'S00001',
            screening_date: '2025-01-15',
            vision_pass: 1,
            hearing_pass: 1,
            referral_needed: 0,
          },
        ],
      };

      const csv = syncService.convertToCSV(data);

      expect(csv).toContain('Child ID');
      expect(csv).toContain('S00001');
      expect(csv).toContain('John Doe');
      expect(csv).toContain('2025-01-15');
    });

    it('should handle missing child references', () => {
      const data = {
        children: [],
        screening_results: [
          {
            child_id: 'S00001',
            screening_date: '2025-01-15',
            vision_pass: 1,
            hearing_pass: 1,
          },
        ],
      };

      const csv = syncService.convertToCSV(data);

      expect(csv).toContain('S00001');
      expect(csv).toContain('2025-01-15');
    });
  });

  describe('resolveConflict', () => {
    it('should use latest strategy', async () => {
      const older = {
        id: '1',
        value: 'old',
        updated_at: '2025-01-01T00:00:00Z',
      };

      const newer = {
        id: '1',
        value: 'new',
        updated_at: '2025-01-02T00:00:00Z',
      };

      const result = await syncService.resolveConflict(older, newer, 'latest');
      expect(result).toEqual(newer);
    });

    it('should use local strategy', async () => {
      const local = { value: 'local' };
      const remote = { value: 'remote' };

      const result = await syncService.resolveConflict(local, remote, 'local');
      expect(result).toEqual(local);
    });

    it('should use remote strategy', async () => {
      const local = { value: 'local' };
      const remote = { value: 'remote' };

      const result = await syncService.resolveConflict(local, remote, 'remote');
      expect(result).toEqual(remote);
    });

    it('should throw on unknown strategy', async () => {
      const local = { value: 'local' };
      const remote = { value: 'remote' };

      await expect(
        syncService.resolveConflict(local, remote, 'unknown')
      ).rejects.toThrow('Unknown conflict resolution strategy');
    });
  });

  describe('getLastSyncTime', () => {
    it('should return stored sync time', async () => {
      const testTime = '2025-01-15T12:00:00Z';
      localStorage.setItem('lastSyncTime', testTime);

      const time = await syncService.getLastSyncTime();
      expect(time).toBe(testTime);
    });

    it('should return epoch if not set', async () => {
      localStorage.removeItem('lastSyncTime');

      const time = await syncService.getLastSyncTime();
      expect(time).toBe(new Date(0).toISOString());
    });
  });

  describe('setLastSyncTime', () => {
    it('should store sync time', async () => {
      const testTime = '2025-01-15T12:00:00Z';
      await syncService.setLastSyncTime(testTime);

      const stored = localStorage.getItem('lastSyncTime');
      expect(stored).toBe(testTime);
    });
  });

  describe('setupAutoSync', () => {
    it('should set up auto sync interval', () => {
      const intervalId = syncService.setupAutoSync(1000);
      expect(intervalId).toBeDefined();
      clearInterval(intervalId);
    });
  });

  describe('pushData', () => {
    it('should handle empty pending items', async () => {
      mockDB.getPendingSyncItems.mockResolvedValue([]);

      const result = await syncService.pushData();

      expect(result.synced).toBe(0);
      expect(result.success).toBe(true);
    });
  });

  describe('performSync', () => {
    it('should set sync in progress flag', async () => {
      mockDB.getPendingSyncItems.mockResolvedValue([]);
      
      // Mock fetch for pull/push operations
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ children: [], screening_results: [] }),
        });

      const syncPromise = syncService.performSync();
      expect(syncService.syncInProgress).toBe(true);

      await syncPromise;
      expect(syncService.syncInProgress).toBe(false);
    });

    it('should prevent concurrent syncs', async () => {
      mockDB.getPendingSyncItems.mockResolvedValue([]);

      syncService.syncInProgress = true;
      const result = await syncService.performSync();

      expect(result).toBeUndefined();
    });
  });

  describe('importFromFile', () => {
    it('should parse and import JSON file', async () => {
      const data = {
        children: [{ id: 'child-1', child_id: 'S00001' }],
      };

      const file = new File([JSON.stringify(data)], 'test.json', { type: 'application/json' });

      await syncService.importFromFile(file);

      expect(mockDB.saveChild).toHaveBeenCalled();
    });

    it('should reject invalid JSON', async () => {
      const file = new File(['invalid json'], 'test.json', { type: 'application/json' });

      await expect(syncService.importFromFile(file)).rejects.toThrow();
    });
  });

  describe('exportToFile', () => {
    it('should export as JSON', async () => {
      mockDB.getAllScreenings.mockResolvedValue([]);
      mockDB.getChildrenBySchool.mockResolvedValue([]);

      const json = await syncService.exportToFile('json');

      expect(json).toContain('export_date');
      expect(json).toContain('children');
      expect(json).toContain('screening_results');
    });

    it('should export as CSV', async () => {
      mockDB.getAllScreenings.mockResolvedValue([
        {
          child_id: 'S00001',
          screening_date: '2025-01-15',
          vision_pass: 1,
          hearing_pass: 1,
          referral_needed: 0,
        },
      ]);
      mockDB.getChildrenBySchool.mockResolvedValue([]);

      const csv = await syncService.exportToFile('csv');

      expect(csv).toContain('Child ID');
      expect(csv).toContain('S00001');
    });

    it('should reject unsupported format', async () => {
      await expect(syncService.exportToFile('unsupported')).rejects.toThrow(
        'Unsupported export format'
      );
    });
  });
});
