import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';
import '../models/child.dart';
import '../models/diet_record.dart';
import '../providers/diet_provider.dart';

class DietCaptureScreen extends StatefulWidget {
  final Child child;
  
  const DietCaptureScreen({Key? key, required this.child}) : super(key: key);

  @override
  _DietCaptureScreenState createState() => _DietCaptureScreenState();
}

class _DietCaptureScreenState extends State<DietCaptureScreen> {
  final _formKey = GlobalKey<FormState>();
  final _notesController = TextEditingController();
  final ImagePicker _picker = ImagePicker();
  
  String _selectedMealType = 'breakfast';
  DateTime _selectedDate = DateTime.now();
  File? _mealPhoto;
  final List<FoodItem> _selectedFoodItems = [];
  final Map<String, double> _customQuantities = {};

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _capturePhoto() async {
    final XFile? photo = await _picker.pickImage(source: ImageSource.camera);
    if (photo != null) {
      setState(() {
        _mealPhoto = File(photo.path);
      });
    }
  }

  void _addFoodItem(FoodItem foodItem) {
    setState(() {
      if (!_selectedFoodItems.any((item) => item.id == foodItem.id)) {
        _selectedFoodItems.add(foodItem);
        _customQuantities[foodItem.id] = foodItem.quantity;
      }
    });
  }

  void _removeFoodItem(FoodItem foodItem) {
    setState(() {
      _selectedFoodItems.removeWhere((item) => item.id == foodItem.id);
      _customQuantities.remove(foodItem.id);
    });
  }

  void _updateQuantity(String foodId, double quantity) {
    setState(() {
      _customQuantities[foodId] = quantity;
    });
  }

  double _calculateTotalCalories() {
    double total = 0;
    for (var food in _selectedFoodItems) {
      final quantity = _customQuantities[food.id] ?? food.quantity;
      final ratio = quantity / food.quantity;
      total += food.calories * ratio;
    }
    return total;
  }

  double _calculateTotalProtein() {
    double total = 0;
    for (var food in _selectedFoodItems) {
      final quantity = _customQuantities[food.id] ?? food.quantity;
      final ratio = quantity / food.quantity;
      total += food.protein * ratio;
    }
    return total;
  }

  double _calculateTotalCarbs() {
    double total = 0;
    for (var food in _selectedFoodItems) {
      final quantity = _customQuantities[food.id] ?? food.quantity;
      final ratio = quantity / food.quantity;
      total += food.carbs * ratio;
    }
    return total;
  }

  double _calculateTotalFat() {
    double total = 0;
    for (var food in _selectedFoodItems) {
      final quantity = _customQuantities[food.id] ?? food.quantity;
      final ratio = quantity / food.quantity;
      total += food.fat * ratio;
    }
    return total;
  }

  double _calculateTotalFiber() {
    double total = 0;
    for (var food in _selectedFoodItems) {
      final quantity = _customQuantities[food.id] ?? food.quantity;
      final ratio = quantity / food.quantity;
      total += food.fiber * ratio;
    }
    return total;
  }

  String _generateNutritionAnalysis() {
    final ageMonths = widget.child.age;
    final totalCalories = _calculateTotalCalories();
    
    // WHO recommended daily intake
    final recommendedCalories = ageMonths < 12 ? 800 :
                               ageMonths < 24 ? 1000 :
                               ageMonths < 36 ? 1200 :
                               ageMonths < 48 ? 1400 : 1600;
    
    final analysis = StringBuffer();
    
    if (totalCalories < recommendedCalories * 0.8) {
      analysis.writeln('⚠️ Low calorie intake. Consider adding energy-dense foods.');
    } else if (totalCalories > recommendedCalories * 1.2) {
      analysis.writeln('⚠️ High calorie intake. Monitor portion sizes.');
    } else {
      analysis.writeln('✅ Adequate calorie intake for age.');
    }
    
    final totalProtein = _calculateTotalProtein();
    final recommendedProtein = ageMonths < 12 ? 13 :
                              ageMonths < 24 ? 16 :
                              ageMonths < 36 ? 19 :
                              ageMonths < 48 ? 22 : 25;
    
    if (totalProtein < recommendedProtein * 0.8) {
      analysis.writeln('⚠️ Low protein intake. Add protein-rich foods like lentils, eggs, or dairy.');
    } else {
      analysis.writeln('✅ Adequate protein intake.');
    }
    
    return analysis.toString();
  }

  Future<void> _saveDietRecord() async {
    if (_selectedFoodItems.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please add at least one food item')),
      );
      return;
    }

    final dietProvider = Provider.of<DietProvider>(context, listen: false);
    
    final dietRecord = DietRecord(
      id: const Uuid().v4(),
      childId: widget.child.id,
      date: _selectedDate,
      mealType: _selectedMealType,
      foodItems: _selectedFoodItems.map((food) {
        final quantity = _customQuantities[food.id] ?? food.quantity;
        final ratio = quantity / food.quantity;
        
        return FoodItem(
          id: food.id,
          name: food.name,
          quantity: quantity,
          unit: food.unit,
          calories: food.calories * ratio,
          protein: food.protein * ratio,
          carbs: food.carbs * ratio,
          fat: food.fat * ratio,
          fiber: food.fiber * ratio,
          category: food.category,
        );
      }).toList(),
      notes: _notesController.text,
      photoPath: _mealPhoto?.path,
      totalCalories: _calculateTotalCalories(),
      totalProtein: _calculateTotalProtein(),
      totalCarbs: _calculateTotalCarbs(),
      totalFat: _calculateTotalFat(),
      totalFiber: _calculateTotalFiber(),
      nutritionAnalysis: _generateNutritionAnalysis(),
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    await dietProvider.addDietRecord(dietRecord);

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Diet record saved successfully')),
    );

    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final dietProvider = Provider.of<DietProvider>(context);
    final commonFoods = dietProvider.getCommonFoodItems();

    return Scaffold(
      appBar: AppBar(
        title: Text('Record Meal - ${widget.child.name}'),
        backgroundColor: Theme.of(context).primaryColor,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Child Info Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.child.name,
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                      const SizedBox(height: 8),
                      Text('Age: ${widget.child.age} months'),
                      Text('Sex: ${widget.child.sex}'),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Meal Details
              Text(
                'Meal Details',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              
              // Date Picker
              ListTile(
                leading: const Icon(Icons.calendar_today),
                title: const Text('Date'),
                subtitle: Text(
                  '${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year}',
                ),
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _selectedDate,
                    firstDate: DateTime.now().subtract(const Duration(days: 30)),
                    lastDate: DateTime.now(),
                  );
                  if (picked != null) {
                    setState(() {
                      _selectedDate = picked;
                    });
                  }
                },
              ),

              // Meal Type
              DropdownButtonFormField<String>(
                value: _selectedMealType,
                decoration: const InputDecoration(
                  labelText: 'Meal Type',
                  prefixIcon: Icon(Icons.restaurant),
                ),
                items: const [
                  DropdownMenuItem(value: 'breakfast', child: Text('Breakfast')),
                  DropdownMenuItem(value: 'lunch', child: Text('Lunch')),
                  DropdownMenuItem(value: 'dinner', child: Text('Dinner')),
                  DropdownMenuItem(value: 'snack', child: Text('Snack')),
                ],
                onChanged: (value) {
                  setState(() {
                    _selectedMealType = value!;
                  });
                },
              ),
              const SizedBox(height: 20),

              // Photo Capture
              Text(
                'Meal Photo (Optional)',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              Center(
                child: GestureDetector(
                  onTap: _capturePhoto,
                  child: Container(
                    width: 200,
                    height: 150,
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey),
                      borderRadius: BorderRadius.circular(8),
                      color: Colors.grey.shade100,
                    ),
                    child: _mealPhoto != null
                        ? Image.file(_mealPhoto!, fit: BoxFit.cover)
                        : const Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.camera_alt, size: 40, color: Colors.grey),
                              Text('Tap to capture photo'),
                            ],
                          ),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Food Selection
              Text(
                'Food Items',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              
              // Common Foods Grid
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 3,
                  crossAxisSpacing: 8,
                  mainAxisSpacing: 8,
                ),
                itemCount: commonFoods.length,
                itemBuilder: (context, index) {
                  final food = commonFoods[index];
                  final isSelected = _selectedFoodItems.any((item) => item.id == food.id);
                  
                  return Card(
                    color: isSelected ? Colors.green.shade100 : null,
                    child: InkWell(
                      onTap: () {
                        if (isSelected) {
                          _removeFoodItem(food);
                        } else {
                          _addFoodItem(food);
                        }
                      },
                      child: Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(food.name, style: const TextStyle(fontSize: 12)),
                            Text(
                              '${food.calories} kcal',
                              style: const TextStyle(fontSize: 10, color: Colors.grey),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 20),

              // Selected Foods List
              if (_selectedFoodItems.isNotEmpty) ...[
                Text(
                  'Selected Foods',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _selectedFoodItems.length,
                  itemBuilder: (context, index) {
                    final food = _selectedFoodItems[index];
                    final quantity = _customQuantities[food.id] ?? food.quantity;
                    
                    return Card(
                      child: ListTile(
                        title: Text(food.name),
                        subtitle: Text('${food.calories * (quantity / food.quantity)} kcal'),
                        trailing: SizedBox(
                          width: 100,
                          child: Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  decoration: const InputDecoration(
                                    labelText: 'Qty',
                                    isDense: true,
                                  ),
                                  keyboardType: TextInputType.number,
                                  controller: TextEditingController(
                                    text: quantity.toString(),
                                  ),
                                  onChanged: (value) {
                                    final newQuantity = double.tryParse(value) ?? quantity;
                                    _updateQuantity(food.id, newQuantity);
                                  },
                                ),
                              ),
                              Text(' ${food.unit}'),
                              IconButton(
                                icon: const Icon(Icons.delete, color: Colors.red),
                                onPressed: () => _removeFoodItem(food),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ],

              // Nutrition Summary
              if (_selectedFoodItems.isNotEmpty) ...[
                const SizedBox(height: 20),
                Text(
                  'Nutrition Summary',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: [
                        _buildNutrientRow('Calories', _calculateTotalCalories(), 'kcal'),
                        _buildNutrientRow('Protein', _calculateTotalProtein(), 'g'),
                        _buildNutrientRow('Carbs', _calculateTotalCarbs(), 'g'),
                        _buildNutrientRow('Fat', _calculateTotalFat(), 'g'),
                        _buildNutrientRow('Fiber', _calculateTotalFiber(), 'g'),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  _generateNutritionAnalysis(),
                  style: const TextStyle(fontSize: 14),
                ),
              ],

              // Notes
              TextFormField(
                controller: _notesController,
                decoration: const InputDecoration(
                  labelText: 'Additional Notes',
                  hintText: 'Any special notes about this meal...',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
              ),
              const SizedBox(height: 20),

              // Save Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _saveDietRecord,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text('Save Diet Record'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNutrientRow(String name, double value, String unit) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(name),
          Text('${value.toStringAsFixed(1)} $unit'),
        ],
      ),
    );
  }
}