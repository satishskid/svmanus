// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'child.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class ChildAdapter extends TypeAdapter<Child> {
  @override
  final int typeId = 0;

  @override
  Child read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Child(
      id: fields[0] as String?,
      name: fields[1] as String,
      ageMonths: fields[2] as int,
      sex: fields[3] as String,
      zone: fields[4] as String,
      pinCode: fields[5] as String,
      address: fields[6] as String,
      guardianContact: fields[7] as String,
      createdAt: fields[8] as DateTime?,
      lastScreeningDate: fields[9] as DateTime?,
    );
  }

  @override
  void write(BinaryWriter writer, Child obj) {
    writer
      ..writeByte(10)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.name)
      ..writeByte(2)
      ..write(obj.ageMonths)
      ..writeByte(3)
      ..write(obj.sex)
      ..writeByte(4)
      ..write(obj.zone)
      ..writeByte(5)
      ..write(obj.pinCode)
      ..writeByte(6)
      ..write(obj.address)
      ..writeByte(7)
      ..write(obj.guardianContact)
      ..writeByte(8)
      ..write(obj.createdAt)
      ..writeByte(9)
      ..write(obj.lastScreeningDate);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ChildAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
