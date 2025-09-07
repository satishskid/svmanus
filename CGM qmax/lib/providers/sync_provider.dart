import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/sync_service.dart';

final syncProvider = StateNotifierProvider<SyncNotifier, SyncState>((ref) {
  return SyncNotifier();
});

class SyncState {
  final SyncStatus status;
  final DateTime? lastSync;
  final int pendingOperations;
  final String? error;
  final bool isAutoSyncEnabled;

  const SyncState({
    required this.status,
    this.lastSync,
    required this.pendingOperations,
    this.error,
    required this.isAutoSyncEnabled,
  });

  SyncState copyWith({
    SyncService.SyncStatus? status,
    DateTime? lastSync,
    int? pendingOperations,
    String? error,
    bool? isAutoSyncEnabled,
  }) {
    return SyncState(
      status: status ?? this.status,
      lastSync: lastSync ?? this.lastSync,
      pendingOperations: pendingOperations ?? this.pendingOperations,
      error: error ?? this.error,
      isAutoSyncEnabled: isAutoSyncEnabled ?? this.isAutoSyncEnabled,
    );
  }
}

class SyncNotifier extends StateNotifier<SyncState> {
  SyncNotifier() : super(const SyncState(
    status: SyncStatus.neverSynced,
    pendingOperations: 0,
    isAutoSyncEnabled: true,
  )) {
    _init();
  }

  Timer? _autoSyncTimer;

  Future<void> _init() async {
    await SyncService.init();
    _loadSyncState();
    _startAutoSync();
  }

  void _loadSyncState() {
    final lastSync = SyncService.getLastSync();
    final status = SyncService.getSyncStatus();
    final pendingOps = SyncService.getPendingSyncCount();

    state = state.copyWith(
      lastSync: lastSync,
      status: status,
      pendingOperations: pendingOps,
    );
  }

  void _startAutoSync() {
    if (!state.isAutoSyncEnabled) return;

    // Auto-sync every 5 minutes
    _autoSyncTimer = Timer.periodic(const Duration(minutes: 5), (timer) {
      if (state.pendingOperations > 0) {
        performSync();
      }
    });
  }

  void stopAutoSync() {
    _autoSyncTimer?.cancel();
    state = state.copyWith(isAutoSyncEnabled: false);
  }

  void startAutoSync() {
    state = state.copyWith(isAutoSyncEnabled: true);
    _startAutoSync();
  }

  Future<void> performSync() async {
    if (state.status == SyncStatus.syncing) return;

    state = state.copyWith(
      status: SyncStatus.syncing,
      error: null,
    );

    final result = await SyncService.performSync();

    switch (result) {
      case SyncResult.success:
        state = state.copyWith(
          status: SyncStatus.synced,
          lastSync: DateTime.now(),
          pendingOperations: 0,
        );
        break;
      case SyncResult.offline:
        state = state.copyWith(
          status: SyncStatus.offline,
        );
        break;
      case SyncResult.error:
        state = state.copyWith(
          status: SyncStatus.error,
          error: 'Sync failed. Please try again.',
        );
        break;
      case SyncResult.noData:
        state = state.copyWith(
          status: SyncStatus.synced,
          lastSync: DateTime.now(),
        );
        break;
    }

    _loadSyncState();
  }

  Future<void> forceSync() async {
    await performSync();
  }

  void queueOperation(String operation, String entityType, Map<String, dynamic> data) {
    SyncService.queueSyncOperation(operation, entityType, data);
    _loadSyncState();
  }

  @override
  void dispose() {
    _autoSyncTimer?.cancel();
    super.dispose();
  }
}