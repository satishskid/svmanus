import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive/hive.dart';
import '../models/worker.dart';
import '../services/excel_service.dart';

class WorkersNotifier extends StateNotifier<AsyncValue<List<Worker>>> {
  WorkersNotifier() : super(const AsyncValue.loading()) {
    loadWorkers();
  }

  Future<void> loadWorkers() async {
    try {
      final box = Hive.box<Worker>('workers');
      final workers = box.values.toList();
      state = AsyncValue.data(workers);
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> addWorker(Worker worker) async {
    try {
      final box = Hive.box<Worker>('workers');
      await box.put(worker.id, worker);
      await loadWorkers();
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> updateWorker(Worker worker) async {
    try {
      final box = Hive.box<Worker>('workers');
      await box.put(worker.id, worker);
      await loadWorkers();
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> deleteWorker(String workerId) async {
    try {
      final box = Hive.box<Worker>('workers');
      await box.delete(workerId);
      await loadWorkers();
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> importFromExcel() async {
    try {
      // TODO: Implement file picker to select Excel file
      // For now, we'll use the ExcelService.importWorkersFromExcel method
      // final filePath = await pickExcelFile();
      // if (filePath != null) {
      //   final workers = await ExcelService.importWorkersFromExcel(filePath);
      //   final box = Hive.box<Worker>('workers');
      //   
      //   for (final worker in workers) {
      //     await box.put(worker.id, worker);
      //   }
      //   
      //   await loadWorkers();
      // }
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> exportToExcel() async {
    try {
      final workers = state.value ?? [];
      if (workers.isNotEmpty) {
        await ExcelService.exportWorkersToExcel(workers);
      }
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  List<Worker> getWorkersByZone(String zone) {
    final workers = state.value ?? [];
    return workers.where((worker) => worker.zone == zone).toList();
  }

  Worker? getWorkerById(String id) {
    final workers = state.value ?? [];
    return workers.firstWhere((worker) => worker.id == id);
  }
}

final workersProvider = StateNotifierProvider<WorkersNotifier, AsyncValue<List<Worker>>>((ref) {
  return WorkersNotifier();
});