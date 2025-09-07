import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../providers/children_provider.dart';
import '../providers/diet_provider.dart';
import '../models/diet_record.dart';
import 'diet_capture_screen.dart';

class DietListScreen extends ConsumerStatefulWidget {
  const DietListScreen({super.key});

  @override
  ConsumerState<DietListScreen> createState() => _DietListScreenState();
}

class _DietListScreenState extends ConsumerState<DietListScreen> {
  String? _selectedChildId;
  DateTime? _selectedDate;

  @override
  void initState() {
    super.initState();
    // Initialize diet provider
    ref.read(dietProvider.notifier).loadDietRecords();
  }

  @override
  Widget build(BuildContext context) {
    final children = ref.watch(childrenProvider);
    final dietRecords = ref.watch(dietProvider);

    // Filter records based on selected child and date
    var filteredRecords = dietRecords;
    if (_selectedChildId != null) {
      filteredRecords = filteredRecords.where((record) => record.childId == _selectedChildId).toList();
    }
    if (_selectedDate != null) {
      filteredRecords = filteredRecords.where((record) => 
        record.date.year == _selectedDate!.year &&
        record.date.month == _selectedDate!.month &&
        record.date.day == _selectedDate!.day
      ).toList();
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Diet Records'),
        actions: [
          IconButton(
            icon: const Icon(Icons.file_download),
            onPressed: () => _importFromExcel(),
            tooltip: 'Import from Excel',
          ),
          IconButton(
            icon: const Icon(Icons.file_upload),
            onPressed: () => _exportToExcel(),
            tooltip: 'Export to Excel',
          ),
        ],
      ),
      body: Column(
        children: [
          // Filters
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                // Child filter
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _selectedChildId,
                    hint: const Text('Select Child'),
                    items: [
                      const DropdownMenuItem(
                        value: null,
                        child: Text('All Children'),
                      ),
                      ...children.map((child) => DropdownMenuItem(
                        value: child.id,
                        child: Text(child.name),
                      )),
                    ],
                    onChanged: (value) {
                      setState(() {
                        _selectedChildId = value;
                      });
                    },
                  ),
                ),
                const SizedBox(width: 16),
                // Date filter
                Expanded(
                  child: TextButton(
                    onPressed: () async {
                      final date = await showDatePicker(
                        context: context,
                        initialDate: _selectedDate ?? DateTime.now(),
                        firstDate: DateTime(2020),
                        lastDate: DateTime.now(),
                      );
                      if (date != null) {
                        setState(() {
                          _selectedDate = date;
                        });
                      }
                    },
                    child: Text(
                      _selectedDate != null 
                        ? DateFormat('yyyy-MM-dd').format(_selectedDate!)
                        : 'Select Date',
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    setState(() {
                      _selectedChildId = null;
                      _selectedDate = null;
                    });
                  },
                ),
              ],
            ),
          ),
          // Records list
          Expanded(
            child: filteredRecords.isEmpty
                ? const Center(
                    child: Text('No diet records found. Add a new record to get started.'),
                  )
                : ListView.builder(
                    itemCount: filteredRecords.length,
                    itemBuilder: (context, index) {
                      final record = filteredRecords[index];
                      final child = children.firstWhere(
                        (c) => c.id == record.childId,
                        orElse: () => children.first,
                      );

                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: _getMealTypeColor(record.mealType),
                            child: Text(record.mealType.substring(0, 1).toUpperCase()),
                          ),
                          title: Text('${child.name} - ${record.mealType}'),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(DateFormat('MMM dd, yyyy').format(record.date)),
                              Text('Calories: ${record.totalCalories.toStringAsFixed(0)} kcal'),
                              Text('Protein: ${record.totalProtein.toStringAsFixed(1)}g'),
                            ],
                          ),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.edit),
                                onPressed: () => _editDietRecord(record),
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete),
                                onPressed: () => _deleteDietRecord(record.id),
                              ),
                            ],
                          ),
                          onTap: () => _viewDietRecordDetails(record),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _addDietRecord(),
        child: const Icon(Icons.add),
      ),
    );
  }

  Color _getMealTypeColor(String mealType) {
    switch (mealType.toLowerCase()) {
      case 'breakfast':
        return Colors.orange;
      case 'lunch':
        return Colors.green;
      case 'dinner':
        return Colors.blue;
      case 'snack':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }

  void _addDietRecord() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const DietCaptureScreen(),
      ),
    );
  }

  void _editDietRecord(DietRecord record) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => DietCaptureScreen(dietRecord: record),
      ),
    );
  }

  void _viewDietRecordDetails(DietRecord record) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Diet Record Details'),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Date: ${DateFormat('MMM dd, yyyy').format(record.date)}'),
              Text('Meal Type: ${record.mealType}'),
              const SizedBox(height: 8),
              const Text('Nutrition Summary:', style: TextStyle(fontWeight: FontWeight.bold)),
              Text('Calories: ${record.totalCalories.toStringAsFixed(0)} kcal'),
              Text('Protein: ${record.totalProtein.toStringAsFixed(1)}g'),
              Text('Carbs: ${record.totalCarbs.toStringAsFixed(1)}g'),
              Text('Fat: ${record.totalFat.toStringAsFixed(1)}g'),
              Text('Fiber: ${record.totalFiber.toStringAsFixed(1)}g'),
              const SizedBox(height: 8),
              const Text('Food Items:', style: TextStyle(fontWeight: FontWeight.bold)),
              ...record.foodItems.map((item) =>
                Text('• ${item.name} (${item.quantity}${item.unit})')
              ),
              if (record.notes != null && record.notes!.isNotEmpty) ...[
                const SizedBox(height: 8),
                const Text('Notes:', style: TextStyle(fontWeight: FontWeight.bold)),
                Text(record.notes!),
              ],
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _deleteDietRecord(String id) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Diet Record'),
        content: const Text('Are you sure you want to delete this diet record?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              ref.read(dietProvider.notifier).deleteDietRecord(id);
              Navigator.pop(context);
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  Future<void> _importFromExcel() async {
    await ref.read(dietProvider.notifier).importFromExcel();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Diet records imported successfully')),
      );
    }
  }

  Future<void> _exportToExcel() async {
    await ref.read(dietProvider.notifier).exportToExcel();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Diet records exported successfully')),
      );
    }
  }
}