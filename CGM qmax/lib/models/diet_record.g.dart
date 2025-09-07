// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'diet_record.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class DietRecordAdapter extends TypeAdapter<DietRecord> {
  @override
  final int typeId = 4;

  @override
  DietRecord read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return DietRecord(
      id: fields[0] as String,
      childId: fields[1] as String,
      date: fields[2] as DateTime,
      mealType: fields[3] as String,
      foodItems: (fields[4] as List).cast<FoodItem>(),
      notes: fields[5] as String?,
      photoPath: fields[6] as String?,
      totalCalories: fields[7] as double,
      totalProtein: fields[8] as double,
      totalCarbs: fields[9] as double,
      totalFat: fields[10] as double,
      totalFiber: fields[11] as double,
      nutritionAnalysis: fields[12] as String?,
      createdAt: fields[13] as DateTime,
      updatedAt: fields[14] as DateTime,
    );
  }

  @override
  void write(BinaryWriter writer, DietRecord obj) {
    writer
      ..writeByte(15)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.childId)
      ..writeByte(2)
      ..write(obj.date)
      ..writeByte(3)
      ..write(obj.mealType)
      ..writeByte(4)
      ..write(obj.foodItems)
      ..writeByte(5)
      ..write(obj.notes)
      ..writeByte(6)
      ..write(obj.photoPath)
      ..writeByte(7)
      ..write(obj.totalCalories)
      ..writeByte(8)
      ..write(obj.totalProtein)
      ..writeByte(9)
      ..write(obj.totalCarbs)
      ..writeByte(10)
      ..write(obj.totalFat)
      ..writeByte(11)
      ..write(obj.totalFiber)
      ..writeByte(12)
      ..write(obj.nutritionAnalysis)
      ..writeByte(13)
      ..write(obj.createdAt)
      ..writeByte(14)
      ..write(obj.updatedAt);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is DietRecordAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class FoodItemAdapter extends TypeAdapter<FoodItem> {
  @override
  final int typeId = 5;

  @override
  FoodItem read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return FoodItem(
      id: fields[0] as String,
      name: fields[1] as String,
      quantity: fields[2] as double,
      unit: fields[3] as String,
      calories: fields[4] as double,
      protein: fields[5] as double,
      carbs: fields[6] as double,
      fat: fields[7] as double,
      fiber: fields[8] as double,
      category: fields[9] as String,
    );
  }

  @override
  void write(BinaryWriter writer, FoodItem obj) {
    writer
      ..writeByte(10)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.name)
      ..writeByte(2)
      ..write(obj.quantity)
      ..writeByte(3)
      ..write(obj.unit)
      ..writeByte(4)
      ..write(obj.calories)
      ..writeByte(5)
      ..write(obj.protein)
      ..writeByte(6)
      ..write(obj.carbs)
      ..writeByte(7)
      ..write(obj.fat)
      ..writeByte(8)
      ..write(obj.fiber)
      ..writeByte(9)
      ..write(obj.category);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is FoodItemAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
