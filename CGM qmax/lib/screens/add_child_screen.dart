import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/child.dart';
import '../providers/children_provider.dart';

class AddChildScreen extends ConsumerStatefulWidget {
  const AddChildScreen({super.key});

  @override
  ConsumerState<AddChildScreen> createState() => _AddChildScreenState();
}

class _AddChildScreenState extends ConsumerState<AddChildScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _idController = TextEditingController();
  final _pinCodeController = TextEditingController();
  final _addressController = TextEditingController();
  final _contactController = TextEditingController();
  
  int _ageMonths = 12;
  String _sex = 'M';
  String _zone = 'Zone A';

  @override
  void dispose() {
    _nameController.dispose();
    _idController.dispose();
    _pinCodeController.dispose();
    _addressController.dispose();
    _contactController.dispose();
    super.dispose();
  }

  void _saveChild() {
    if (!_formKey.currentState!.validate()) return;

    final child = Child(
      id: _idController.text,
      name: _nameController.text,
      ageMonths: _ageMonths,
      sex: _sex,
      zone: _zone,
      pinCode: _pinCodeController.text,
      address: _addressController.text,
      contact: _contactController.text,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    ref.read(childrenProvider.notifier).addChild(child);
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Add New Child'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Child Name *',
                  prefixIcon: Icon(Icons.person),
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter child name';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _idController,
                decoration: const InputDecoration(
                  labelText: 'Unique ID *',
                  prefixIcon: Icon(Icons.badge),
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter unique ID';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Age (months) *'),
                        Slider(
                          value: _ageMonths.toDouble(),
                          min: 0,
                          max: 60,
                          divisions: 60,
                          label: '$_ageMonths months',
                          onChanged: (value) {
                            setState(() => _ageMonths = value.round());
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Sex *'),
                        SegmentedButton<String>(
                          segments: const [
                            ButtonSegment(
                              value: 'M',
                              label: Text('Male'),
                              icon: Icon(Icons.male),
                            ),
                            ButtonSegment(
                              value: 'F',
                              label: Text('Female'),
                              icon: Icon(Icons.female),
                            ),
                          ],
                          selected: {_sex},
                          onSelectionChanged: (Set<String> newSelection) {
                            setState(() => _sex = newSelection.first);
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _zone,
                decoration: const InputDecoration(
                  labelText: 'Zone *',
                  prefixIcon: Icon(Icons.location_on),
                  border: OutlineInputBorder(),
                ),
                items: ['Zone A', 'Zone B', 'Zone C', 'Zone D']
                    .map((zone) => DropdownMenuItem(
                          value: zone,
                          child: Text(zone),
                        ))
                    .toList(),
                onChanged: (value) {
                  setState(() => _zone = value!);
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _pinCodeController,
                decoration: const InputDecoration(
                  labelText: 'PIN Code',
                  prefixIcon: Icon(Icons.pin),
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _addressController,
                decoration: const InputDecoration(
                  labelText: 'Address',
                  prefixIcon: Icon(Icons.home),
                  border: OutlineInputBorder(),
                ),
                maxLines: 2,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _contactController,
                decoration: const InputDecoration(
                  labelText: 'Contact Number',
                  prefixIcon: Icon(Icons.phone),
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: _saveChild,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('Save Child'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}