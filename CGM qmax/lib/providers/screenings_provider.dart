import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive/hive.dart';
import 'package:file_picker/file_picker.dart';
import '../models/screening.dart';
import '../services/excel_service.dart';
import '../services/sync_service.dart';

class ScreeningsNotifier extends StateNotifier<AsyncValue<List<Screening>>> {
  ScreeningsNotifier() : super(const AsyncValue.loading()) {
    loadScreenings();
  }

  Future<void> loadScreenings() async {
    try {
      final box = Hive.box<Screening>('screenings');
      final screenings = box.values.toList();
      state = AsyncValue.data(screenings);
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> addScreening(Screening screening) async {
    try {
      final box = Hive.box<Screening>('screenings');
      await box.put(screening.id, screening);
      await loadScreenings();
      
      // Queue sync operation
      await SyncService.queueSyncOperation('create', 'screening', screening.toMap());
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> updateScreening(Screening screening) async {
    try {
      final box = Hive.box<Screening>('screenings');
      await box.put(screening.id, screening);
      await loadScreenings();
      
      // Queue sync operation
      await SyncService.queueSyncOperation('update', 'screening', screening.toMap());
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> deleteScreening(String screeningId) async {
    try {
      final box = Hive.box<Screening>('screenings');
      await box.delete(screeningId);
      await loadScreenings();
      
      // Queue sync operation
      await SyncService.queueSyncOperation('delete', 'screening', {'id': screeningId});
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
        final screenings = await ExcelService.importScreeningsFromExcel(filePath);
        final box = Hive.box<Screening>('screenings');
        
        for (final screening in screenings) {
          await box.put(screening.id, screening);
        }
        
        await loadScreenings();
      }
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<String?> exportToExcel() async {
    try {
      final screenings = state.value ?? [];
      if (screenings.isNotEmpty) {
        final filePath = await ExcelService.exportScreeningsToExcel(screenings);
        return filePath;
      }
      return null;
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
      return null;
    }
  }

  List<Screening> getScreeningsByChild(String childId) {
    final screenings = state.value ?? [];
    return screenings.where((screening) => screening.childId == childId).toList();
  }

  List<Screening> getUnsyncedScreenings() {
    final screenings = state.value ?? [];
    return screenings.where((screening) => !screening.isSynced).toList();
  }

  List<Screening> getScreeningsByZone(String zone) {
    final screenings = state.value ?? [];
    return screenings.where((screening) {
      // This would need to be implemented based on child zone lookup
      return true; // Placeholder
    }).toList();
  }
}

final screeningsProvider = StateNotifierProvider<ScreeningsNotifier, AsyncValue<List<Screening>>>((ref) {
  return ScreeningsNotifier();
});