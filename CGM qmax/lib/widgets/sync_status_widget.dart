import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/sync_provider.dart';
import '../services/sync_service.dart';

class SyncStatusWidget extends ConsumerWidget {
  const SyncStatusWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final syncState = ref.watch(syncProvider);
    
    return Card(
      margin: const EdgeInsets.all(8.0),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Row(
          children: [
            _buildSyncIcon(syncState.status),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    _getSyncStatusText(syncState.status),
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  if (syncState.lastSync != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      'Last sync: ${_formatLastSync(syncState.lastSync!)}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: Colors.grey,
                      ),
                    ),
                  ],
                  if (syncState.pendingOperations > 0) ...[
                    const SizedBox(height: 4),
                    Text(
                      '${syncState.pendingOperations} pending changes',
                      style: const TextStyle(
                        fontSize: 12,
                        color: Colors.orange,
                      ),
                    ),
                  ],
                  if (syncState.error != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      syncState.error!,
                      style: const TextStyle(
                        fontSize: 12,
                        color: Colors.red,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.sync),
              onPressed: syncState.status == SyncStatus.syncing
                  ? null
                  : () => ref.read(syncProvider.notifier).performSync(),
              tooltip: 'Sync now',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSyncIcon(SyncStatus status) {
    switch (status) {
      case SyncStatus.synced:
        return const Icon(Icons.cloud_done, color: Colors.green, size: 24);
      case SyncStatus.syncing:
        return const SizedBox(
          width: 24,
          height: 24,
          child: CircularProgressIndicator(strokeWidth: 2),
        );
      case SyncStatus.error:
        return const Icon(Icons.error, color: Colors.red, size: 24);
      case SyncStatus.offline:
        return const Icon(Icons.cloud_off, color: Colors.orange, size: 24);
      case SyncStatus.neverSynced:
        return const Icon(Icons.cloud_queue, color: Colors.grey, size: 24);
    }
  }

  String _getSyncStatusText(SyncStatus status) {
    switch (status) {
      case SyncStatus.synced:
        return 'Synced';
      case SyncStatus.syncing:
        return 'Syncing...';
      case SyncStatus.error:
        return 'Sync Error';
      case SyncStatus.offline:
        return 'Offline';
      case SyncStatus.neverSynced:
        return 'Not synced';
    }
  }

  String _formatLastSync(DateTime lastSync) {
    final now = DateTime.now();
    final difference = now.difference(lastSync);
    
    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inHours < 1) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inDays < 1) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else {
      return '${difference.inDays ~/ 7}w ago';
    }
  }
}