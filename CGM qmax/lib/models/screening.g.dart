// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'screening.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class ScreeningAdapter extends TypeAdapter<Screening> {
  @override
  final int typeId = 1;

  @override
  Screening read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Screening(
      id: fields[0] as String?,
      childId: fields[1] as String,
      timestamp: fields[2] as DateTime?,
      heightCm: fields[3] as double?,
      weightKg: fields[4] as double?,
      bmi: fields[5] as double?,
      zScore: fields[6] as double?,
      classification: fields[7] as String?,
      manualMuacCm: fields[8] as double?,
      autoMuacCm: fields[9] as double?,
      clinicalObservations: (fields[10] as List?)?.cast<String>(),
      dietItems: (fields[11] as Map?)?.map((dynamic k, dynamic v) =>
          MapEntry(k as String, (v as List).cast<String>())),
      nutritionSummary: (fields[12] as Map?)?.cast<String, double>(),
      deficiencyFlags: (fields[13] as List?)?.cast<String>(),
      interventionType: fields[14] as String?,
      interventionStartDate: fields[15] as DateTime?,
      interventionEndDate: fields[16] as DateTime?,
      gpsLat: fields[17] as double?,
      gpsLng: fields[18] as double?,
      manualLocation: fields[19] as String?,
      videoPath: fields[20] as String?,
      isSynced: fields[21] as bool?,
      syncedAt: fields[22] as String?,
      syncError: fields[23] as String?,
    );
  }

  @override
  void write(BinaryWriter writer, Screening obj) {
    writer
      ..writeByte(24)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.childId)
      ..writeByte(2)
      ..write(obj.timestamp)
      ..writeByte(3)
      ..write(obj.heightCm)
      ..writeByte(4)
      ..write(obj.weightKg)
      ..writeByte(5)
      ..write(obj.bmi)
      ..writeByte(6)
      ..write(obj.zScore)
      ..writeByte(7)
      ..write(obj.classification)
      ..writeByte(8)
      ..write(obj.manualMuacCm)
      ..writeByte(9)
      ..write(obj.autoMuacCm)
      ..writeByte(10)
      ..write(obj.clinicalObservations)
      ..writeByte(11)
      ..write(obj.dietItems)
      ..writeByte(12)
      ..write(obj.nutritionSummary)
      ..writeByte(13)
      ..write(obj.deficiencyFlags)
      ..writeByte(14)
      ..write(obj.interventionType)
      ..writeByte(15)
      ..write(obj.interventionStartDate)
      ..writeByte(16)
      ..write(obj.interventionEndDate)
      ..writeByte(17)
      ..write(obj.gpsLat)
      ..writeByte(18)
      ..write(obj.gpsLng)
      ..writeByte(19)
      ..write(obj.manualLocation)
      ..writeByte(20)
      ..write(obj.videoPath)
      ..writeByte(21)
      ..write(obj.isSynced)
      ..writeByte(22)
      ..write(obj.syncedAt)
      ..writeByte(23)
      ..write(obj.syncError);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ScreeningAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
