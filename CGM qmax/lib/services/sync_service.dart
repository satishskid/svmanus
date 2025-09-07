import 'dart:convert';
import 'package:hive/hive.dart';
import '../models/child.dart';
import '../models/screening.dart';
import '../models/worker.dart';
import '../models/diet_record.dart';

enum SyncStatus {
  neverSynced,
  syncing,
  synced,
  error,
  offline
}

enum SyncResult {
  success,
  error,
  offline,
  noData
}

class SyncService {
  static const String _syncMetadataBox = 'sync_metadata';
  static const String _pendingSyncBox = 'pending_sync';
  
  static const String _lastSyncKey = 'last_sync_timestamp';
  static const String _syncStatusKey = 'sync_status';

  // Initialize sync service
  static Future<void> init() async {
    await Hive.openBox(_syncMetadataBox);
    await Hive.openBox(_pendingSyncBox);
  }

  // Get last sync timestamp
  static DateTime? getLastSync() {
    final box = Hive.box(_syncMetadataBox);
    final timestamp = box.get(_lastSyncKey);
    return timestamp != null ? DateTime.fromMillisecondsSinceEpoch(timestamp) : null;
  }

  // Update last sync timestamp
  static Future<void> updateLastSync() async {
    final box = Hive.box(_syncMetadataBox);
    await box.put(_lastSyncKey, DateTime.now().millisecondsSinceEpoch);
  }

  // Get sync status
  static SyncStatus getSyncStatus() {
    final box = Hive.box(_syncMetadataBox);
    final status = box.get(_syncStatusKey, defaultValue: SyncStatus.neverSynced.index);
    return SyncStatus.values[status];
  }

  // Update sync status
  static Future<void> updateSyncStatus(SyncStatus status) async {
    final box = Hive.box(_syncMetadataBox);
    await box.put(_syncStatusKey, status.index);
  }

  // Queue pending sync operation
  static Future<void> queueSyncOperation(String operation, String entityType, Map<String, dynamic> data) async {
    final box = Hive.box(_pendingSyncBox);
    final pendingItem = {
      'operation': operation,
      'entityType': entityType,
      'data': data,
      'timestamp': DateTime.now().toIso8601String(),
      'synced': false,
    };
    
    await box.add(pendingItem);
  }

  // Get all pending sync operations
  static List<Map<String, dynamic>> getPendingSyncOperations() {
    final box = Hive.box(_pendingSyncBox);
    return box.values.map((item) => Map<String, dynamic>.from(item as Map)).toList();
  }

  // Mark sync operation as completed
  static Future<void> markSyncOperationCompleted(int index) async {
    final box = Hive.box(_pendingSyncBox);
    await box.deleteAt(index);
  }

  // Clear all pending sync operations
  static Future<void> clearPendingSyncOperations() async {
    final box = Hive.box(_pendingSyncBox);
    await box.clear();
  }

  // Count pending sync operations
  static int getPendingSyncCount() {
    final box = Hive.box(_pendingSyncBox);
    return box.length;
  }

  // Export all local data for sync
  static Map<String, List<Map<String, dynamic>>> exportLocalData() {
    final children = Hive.box<Child>('children').values.map((e) => e.toMap()).toList();
    final screenings = Hive.box<Screening>('screenings').values.map((e) => e.toMap()).toList();
    final workers = Hive.box<Worker>('workers').values.map((e) => e.toMap()).toList();
    final dietRecords = Hive.box<DietRecord>('diet_records').values.map((e) => e.toMap()).toList();

    return {
      'children': children,
      'screenings': screenings,
      'workers': workers,
      'diet_records': dietRecords,
    };
  }

  // Import server data
  static Future<void> importServerData(Map<String, dynamic> serverData) async {
    final childrenBox = Hive.box<Child>('children');
    final screeningsBox = Hive.box<Screening>('screenings');
    final workersBox = Hive.box<Worker>('workers');
    final dietRecordsBox = Hive.box<DietRecord>('diet_records');

    // Import children
    if (serverData['children'] != null) {
      for (var childData in serverData['children']) {
        final child = Child.fromMap(childData);
        await childrenBox.put(child.id, child);
      }
    }

    // Import screenings
    if (serverData['screenings'] != null) {
      for (var screeningData in serverData['screenings']) {
        final screening = Screening.fromMap(screeningData);
        await screeningsBox.put(screening.id, screening);
      }
    }

    // Import workers
    if (serverData['workers'] != null) {
      for (var workerData in serverData['workers']) {
        final worker = Worker.fromMap(workerData);
        await workersBox.put(worker.id, worker);
      }
    }

    // Import diet records
    if (serverData['diet_records'] != null) {
      for (var dietData in serverData['diet_records']) {
        final dietRecord = DietRecord.fromMap(dietData);
        await dietRecordsBox.put(dietRecord.id, dietRecord);
      }
    }
  }

  // Check if device is online (mock implementation)
  static Future<bool> isOnline() async {
    // In a real app, this would check actual network connectivity
    // For now, we'll return true to simulate online status
    return true;
  }

  // Perform sync operation
  static Future<SyncResult> performSync() async {
    try {
      await updateSyncStatus(SyncStatus.syncing);
      
      final isConnected = await isOnline();
      if (!isConnected) {
        await updateSyncStatus(SyncStatus.offline);
        return SyncResult.offline;
      }

      // Get local data
      final localData = exportLocalData();
      
      // Get pending operations
      final pendingOperations = getPendingSyncOperations();
      
      // In a real app, this would send data to server
      // For now, we'll simulate successful sync
      
      // Clear pending operations after successful sync
      await clearPendingSyncOperations();
      
      // Update last sync timestamp
      await updateLastSync();
      
      await updateSyncStatus(SyncStatus.synced);
      return SyncResult.success;
      
    } catch (e) {
      await updateSyncStatus(SyncStatus.error);
      return SyncResult.error;
    }
  }
}