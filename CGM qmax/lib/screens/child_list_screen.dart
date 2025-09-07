import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../models/child.dart';
import '../providers/children_provider.dart';
import '../providers/sync_provider.dart';
import '../widgets/sync_status_widget.dart';
import 'screening_screen.dart';
import 'ml_measurement_screen.dart';
import 'diet_list_screen.dart';
import 'diet_capture_screen.dart';

class ChildListScreen extends ConsumerStatefulWidget {
  const ChildListScreen({super.key});

  @override
  ConsumerState<ChildListScreen> createState() => _ChildListScreenState();
}

class _ChildListScreenState extends ConsumerState<ChildListScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';
  String _selectedZone = 'All';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _addNewChild() {
    Navigator.pushNamed(context, '/add-child');
  }

  void _startScreening(Child child) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ScreeningScreen(child: child),
      ),
    );
  }

  List<Child> _filterChildren(List<Child> children) {
    return children.where((child) {
      final matchesSearch = _searchQuery.isEmpty ||
          child.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          child.id.toLowerCase().contains(_searchQuery.toLowerCase());
      
      final matchesZone = _selectedZone == 'All' || child.zone == _selectedZone;
      
      return matchesSearch && matchesZone;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Children'),
        actions: [
          IconButton(
            icon: const Icon(Icons.restaurant_menu),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const DietListScreen(),
                ),
              );
            },
            tooltip: 'Diet Records',
          ),
          IconButton(
            icon: const Icon(Icons.file_download),
            onPressed: () {
              ref.read(childrenProvider.notifier).importFromExcel();
            },
          ),
          IconButton(
            icon: const Icon(Icons.file_upload),
            onPressed: () {
              ref.read(childrenProvider.notifier).exportToExcel();
            },
          ),
        ],
      ),
      body: Column(
        children: [
          const SyncStatusWidget(),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    decoration: const InputDecoration(
                      labelText: 'Search children...',
                      prefixIcon: Icon(Icons.search),
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (value) {
                      setState(() => _searchQuery = value);
                    },
                  ),
                ),
                const SizedBox(width: 16),
                DropdownButton<String>(
                  value: _selectedZone,
                  items: ['All', 'Zone A', 'Zone B', 'Zone C']
                      .map((zone) => DropdownMenuItem(
                            value: zone,
                            child: Text(zone),
                          ))
                      .toList(),
                  onChanged: (value) {
                    setState(() => _selectedZone = value!);
                  },
                ),
              ],
            ),
          ),
          Expanded(
            child: ValueListenableBuilder<Box<Child>>(
              valueListenable: Hive.box<Child>('children').listenable(),
              builder: (context, box, _) {
                final children = _filterChildren(box.values.toList());
                
                if (children.isEmpty) {
                  return const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.people_outline, size: 64, color: Colors.grey),
                        SizedBox(height: 16),
                        Text(
                          'No children registered',
                          style: TextStyle(fontSize: 18, color: Colors.grey),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  itemCount: children.length,
                  itemBuilder: (context, index) {
                    final child = children[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 4,
                      ),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: child.sex == 'M' 
                              ? Colors.blue.shade100 
                              : Colors.pink.shade100,
                          child: Text(
                            child.name[0].toUpperCase(),
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ),
                        title: Text(child.name),
                        subtitle: Text(
                          'ID: ${child.id} • Zone: ${child.zone} • Age: ${child.ageMonths} months',
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.restaurant, color: Colors.orange),
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => DietCaptureScreen(child: child),
                                  ),
                                );
                              },
                              tooltip: 'Record Diet',
                            ),
                            IconButton(
                              icon: const Icon(Icons.camera_alt, color: Colors.blue),
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => MLMeasurementScreen(child: child),
                                  ),
                                );
                              },
                              tooltip: 'ML Measurement',
                            ),
                            const SizedBox(width: 8),
                            ElevatedButton(
                              onPressed: () => _startScreening(child),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.green,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(horizontal: 12),
                              ),
                              child: const Text('Screen'),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addNewChild,
        child: const Icon(Icons.add),
      ),
    );
  }
}