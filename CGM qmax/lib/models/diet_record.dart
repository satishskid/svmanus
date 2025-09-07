import 'package:hive/hive.dart';

part 'diet_record.g.dart';

@HiveType(typeId: 4)
class DietRecord {
  @HiveField(0)
  final String id;
  
  @HiveField(1)
  final String childId;
  
  @HiveField(2)
  final DateTime date;
  
  @HiveField(3)
  final String mealType; // breakfast, lunch, dinner, snack
  
  @HiveField(4)
  final List<FoodItem> foodItems;
  
  @HiveField(5)
  final String? notes;
  
  @HiveField(6)
  final String? photoPath;
  
  @HiveField(7)
  final double totalCalories;
  
  @HiveField(8)
  final double totalProtein;
  
  @HiveField(9)
  final double totalCarbs;
  
  @HiveField(10)
  final double totalFat;
  
  @HiveField(11)
  final double totalFiber;
  
  @HiveField(12)
  final String? nutritionAnalysis;
  
  @HiveField(13)
  final DateTime createdAt;
  
  @HiveField(14)
  final DateTime updatedAt;

  DietRecord({
    required this.id,
    required this.childId,
    required this.date,
    required this.mealType,
    required this.foodItems,
    this.notes,
    this.photoPath,
    required this.totalCalories,
    required this.totalProtein,
    required this.totalCarbs,
    required this.totalFat,
    required this.totalFiber,
    this.nutritionAnalysis,
    required this.createdAt,
    required this.updatedAt,
  });

  DietRecord copyWith({
    String? id,
    String? childId,
    DateTime? date,
    String? mealType,
    List<FoodItem>? foodItems,
    String? notes,
    String? photoPath,
    double? totalCalories,
    double? totalProtein,
    double? totalCarbs,
    double? totalFat,
    double? totalFiber,
    String? nutritionAnalysis,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return DietRecord(
      id: id ?? this.id,
      childId: childId ?? this.childId,
      date: date ?? this.date,
      mealType: mealType ?? this.mealType,
      foodItems: foodItems ?? this.foodItems,
      notes: notes ?? this.notes,
      photoPath: photoPath ?? this.photoPath,
      totalCalories: totalCalories ?? this.totalCalories,
      totalProtein: totalProtein ?? this.totalProtein,
      totalCarbs: totalCarbs ?? this.totalCarbs,
      totalFat: totalFat ?? this.totalFat,
      totalFiber: totalFiber ?? this.totalFiber,
      nutritionAnalysis: nutritionAnalysis ?? this.nutritionAnalysis,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'childId': childId,
    'date': date.toIso8601String(),
    'mealType': mealType,
    'foodItems': foodItems.map((item) => item.toJson()).toList(),
    'notes': notes,
    'photoPath': photoPath,
    'totalCalories': totalCalories,
    'totalProtein': totalProtein,
    'totalCarbs': totalCarbs,
    'totalFat': totalFat,
    'totalFiber': totalFiber,
    'nutritionAnalysis': nutritionAnalysis,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
  };

  factory DietRecord.fromJson(Map<String, dynamic> json) => DietRecord(
    id: json['id'],
    childId: json['childId'],
    date: DateTime.parse(json['date']),
    mealType: json['mealType'],
    foodItems: List<FoodItem>.from(
      json['foodItems'].map((item) => FoodItem.fromJson(item))
    ),
    notes: json['notes'],
    photoPath: json['photoPath'],
    totalCalories: json['totalCalories'].toDouble(),
    totalProtein: json['totalProtein'].toDouble(),
    totalCarbs: json['totalCarbs'].toDouble(),
    totalFat: json['totalFat'].toDouble(),
    totalFiber: json['totalFiber'].toDouble(),
    nutritionAnalysis: json['nutritionAnalysis'],
    createdAt: DateTime.parse(json['createdAt']),
    updatedAt: DateTime.parse(json['updatedAt']),
  );
}

@HiveType(typeId: 5)
class FoodItem {
  @HiveField(0)
  final String id;
  
  @HiveField(1)
  final String name;
  
  @HiveField(2)
  final double quantity;
  
  @HiveField(3)
  final String unit; // grams, pieces, cups, etc.
  
  @HiveField(4)
  final double calories;
  
  @HiveField(5)
  final double protein;
  
  @HiveField(6)
  final double carbs;
  
  @HiveField(7)
  final double fat;
  
  @HiveField(8)
  final double fiber;
  
  @HiveField(9)
  final String category; // grains, proteins, vegetables, fruits, dairy, etc.

  FoodItem({
    required this.id,
    required this.name,
    required this.quantity,
    required this.unit,
    required this.calories,
    required this.protein,
    required this.carbs,
    required this.fat,
    required this.fiber,
    required this.category,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'quantity': quantity,
    'unit': unit,
    'calories': calories,
    'protein': protein,
    'carbs': carbs,
    'fat': fat,
    'fiber': fiber,
    'category': category,
  };

  factory FoodItem.fromJson(Map<String, dynamic> json) => FoodItem(
    id: json['id'],
    name: json['name'],
    quantity: json['quantity'].toDouble(),
    unit: json['unit'],
    calories: json['calories'].toDouble(),
    protein: json['protein'].toDouble(),
    carbs: json['carbs'].toDouble(),
    fat: json['fat'].toDouble(),
    fiber: json['fiber'].toDouble(),
    category: json['category'],
  );
}