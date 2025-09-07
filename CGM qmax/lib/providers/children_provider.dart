import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive/hive.dart';
import 'package:file_picker/file_picker.dart';
import '../models/child.dart';
import '../services/excel_service.dart';
import '../services/sync_service.dart';

class ChildrenNotifier extends StateNotifier<AsyncValue<List<Child>>> {
  ChildrenNotifier() : super(const AsyncValue.loading()) {
    loadChildren();
  }

  Future<void> loadChildren() async {
    try {
      final box = Hive.box<Child>('children');
      final children = box.values.toList();
      state = AsyncValue.data(children);
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> addChild(Child child) async {
    try {
      final box = Hive.box<Child>('children');
      await box.put(child.id, child);
      await loadChildren();
      
      // Queue sync operation
      await SyncService.queueSyncOperation('create', 'child', child.toMap());
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> updateChild(Child child) async {
    try {
      final box = Hive.box<Child>('children');
      await box.put(child.id, child);
      await loadChildren();
      
      // Queue sync operation
      await SyncService.queueSyncOperation('update', 'child', child.toMap());
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> deleteChild(String childId) async {
    try {
      final box = Hive.box<Child>('children');
      await box.delete(childId);
      await loadChildren();
      
      // Queue sync operation
      await SyncService.queueSyncOperation('delete', 'child', {'id': childId});
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> importFromExcel() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['xlsx', 'xls'],
      );
      
      if (result != null && result.files.single.path != null) {
        final filePath = result.files.single.path!;
        final children = await ExcelService.importChildrenFromExcel(filePath);
        final box = Hive.box<Child>('children');
        
        for (final child in children) {
          await box.put(child.id, child);
        }
        
        await loadChildren();
      }
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<String?> exportToExcel() async {
    try {
      final children = state.value ?? [];
      if (children.isNotEmpty) {
        final filePath = await ExcelService.exportChildrenToExcel(children);
        return filePath;
      }
      return null;
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
      return null;
    }
  }

  List<Child> getChildrenByZone(String zone) {
    final children = state.value ?? [];
    return children.where((child) => child.zone == zone).toList();
  }

  Child? getChildById(String id) {
    final children = state.value ?? [];
    return children.firstWhere((child) => child.id == id);
  }
}

final childrenProvider = StateNotifierProvider<ChildrenNotifier, AsyncValue<List<Child>>>((ref) {
  return ChildrenNotifier();
});