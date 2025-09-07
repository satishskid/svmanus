import 'package:hive/hive.dart';
import 'package:uuid/uuid.dart';

part 'screening.g.dart';

@HiveType(typeId: 1)
class Screening extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String childId;

  @HiveField(2)
  final DateTime timestamp;

  @HiveField(3)
  final double? heightCm;

  @HiveField(4)
  final double? weightKg;

  @HiveField(5)
  final double? bmi;

  @HiveField(6)
  final double? zScore;

  @HiveField(7)
  final String? classification; // 'SAM', 'MAM', 'Normal'

  @HiveField(8)
  final double? manualMuacCm;

  @HiveField(9)
  final double? autoMuacCm;

  @HiveField(10)
  final List<String> clinicalObservations;

  @HiveField(11)
  final Map<String, List<String>> dietItems; // {"breakfast": ["Idli", "Dal"], ...}

  @HiveField(12)
  final Map<String, double> nutritionSummary; // {"energy_pct": 85.0, "protein_pct": 90.0, ...}

  @HiveField(13)
  final List<String> deficiencyFlags;

  @HiveField(14)
  final String? interventionType;

  @HiveField(15)
  final DateTime? interventionStartDate;

  @HiveField(16)
  final DateTime? interventionEndDate;

  @HiveField(17)
  final double? gpsLat;

  @HiveField(18)
  final double? gpsLng;

  @HiveField(19)
  final String? manualLocation;

  @HiveField(20)
  final String? videoPath;

  @HiveField(21)
  final bool isSynced;

  @HiveField(22)
  final String? syncedAt;

  @HiveField(23)
  final String? syncError;

  Screening({
    String? id,
    required this.childId,
    DateTime? timestamp,
    this.heightCm,
    this.weightKg,
    this.bmi,
    this.zScore,
    this.classification,
    this.manualMuacCm,
    this.autoMuacCm,
    List<String>? clinicalObservations,
    Map<String, List<String>>? dietItems,
    Map<String, double>? nutritionSummary,
    List<String>? deficiencyFlags,
    this.interventionType,
    this.interventionStartDate,
    this.interventionEndDate,
    this.gpsLat,
    this.gpsLng,
    this.manualLocation,
    this.videoPath,
    bool? isSynced,
    this.syncedAt,
    this.syncError,
  })  : id = id ?? const Uuid().v4(),
        timestamp = timestamp ?? DateTime.now(),
        clinicalObservations = clinicalObservations ?? [],
        dietItems = dietItems ?? {},
        nutritionSummary = nutritionSummary ?? {},
        deficiencyFlags = deficiencyFlags ?? [],
        isSynced = isSynced ?? false;

  Screening copyWith({
    String? childId,
    DateTime? timestamp,
    double? heightCm,
    double? weightKg,
    double? bmi,
    double? zScore,
    String? classification,
    double? manualMuacCm,
    double? autoMuacCm,
    List<String>? clinicalObservations,
    Map<String, List<String>>? dietItems,
    Map<String, double>? nutritionSummary,
    List<String>? deficiencyFlags,
    String? interventionType,
    DateTime? interventionStartDate,
    DateTime? interventionEndDate,
    double? gpsLat,
    double? gpsLng,
    String? manualLocation,
    String? videoPath,
    bool? isSynced,
    String? syncedAt,
    String? syncError,
  }) {
    return Screening(
      id: id,
      childId: childId ?? this.childId,
      timestamp: timestamp ?? this.timestamp,
      heightCm: heightCm ?? this.heightCm,
      weightKg: weightKg ?? this.weightKg,
      bmi: bmi ?? this.bmi,
      zScore: zScore ?? this.zScore,
      classification: classification ?? this.classification,
      manualMuacCm: manualMuacCm ?? this.manualMuacCm,
      autoMuacCm: autoMuacCm ?? this.autoMuacCm,
      clinicalObservations: clinicalObservations ?? this.clinicalObservations,
      dietItems: dietItems ?? this.dietItems,
      nutritionSummary: nutritionSummary ?? this.nutritionSummary,
      deficiencyFlags: deficiencyFlags ?? this.deficiencyFlags,
      interventionType: interventionType ?? this.interventionType,
      interventionStartDate: interventionStartDate ?? this.interventionStartDate,
      interventionEndDate: interventionEndDate ?? this.interventionEndDate,
      gpsLat: gpsLat ?? this.gpsLat,
      gpsLng: gpsLng ?? this.gpsLng,
      manualLocation: manualLocation ?? this.manualLocation,
      videoPath: videoPath ?? this.videoPath,
      isSynced: isSynced ?? this.isSynced,
      syncedAt: syncedAt ?? this.syncedAt,
      syncError: syncError ?? this.syncError,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'childId': childId,
      'timestamp': timestamp.toIso8601String(),
      'heightCm': heightCm,
      'weightKg': weightKg,
      'bmi': bmi,
      'zScore': zScore,
      'classification': classification,
      'manualMuacCm': manualMuacCm,
      'autoMuacCm': autoMuacCm,
      'clinicalObservations': clinicalObservations,
      'dietItems': dietItems,
      'nutritionSummary': nutritionSummary,
      'deficiencyFlags': deficiencyFlags,
      'interventionType': interventionType,
      'interventionStartDate': interventionStartDate?.toIso8601String(),
      'interventionEndDate': interventionEndDate?.toIso8601String(),
      'gpsLat': gpsLat,
      'gpsLng': gpsLng,
      'manualLocation': manualLocation,
      'videoPath': videoPath,
      'isSynced': isSynced,
      'syncedAt': syncedAt,
      'syncError': syncError,
    };
  }

  factory Screening.fromJson(Map<String, dynamic> json) {
    return Screening(
      id: json['id'],
      childId: json['childId'],
      timestamp: DateTime.parse(json['timestamp']),
      heightCm: json['heightCm'],
      weightKg: json['weightKg'],
      bmi: json['bmi'],
      zScore: json['zScore'],
      classification: json['classification'],
      manualMuacCm: json['manualMuacCm'],
      autoMuacCm: json['autoMuacCm'],
      clinicalObservations: List<String>.from(json['clinicalObservations'] ?? []),
      dietItems: (json['dietItems'] as Map<String, dynamic>?)?.map(
            (key, value) => MapEntry(key, List<String>.from(value)),
          ) ??
          {},
      nutritionSummary: (json['nutritionSummary'] as Map<String, dynamic>?)?.map(
            (key, value) => MapEntry(key, value.toDouble()),
          ) ??
          {},
      deficiencyFlags: List<String>.from(json['deficiencyFlags'] ?? []),
      interventionType: json['interventionType'],
      interventionStartDate: json['interventionStartDate'] != null
          ? DateTime.parse(json['interventionStartDate'])
          : null,
      interventionEndDate: json['interventionEndDate'] != null
          ? DateTime.parse(json['interventionEndDate'])
          : null,
      gpsLat: json['gpsLat'],
      gpsLng: json['gpsLng'],
      manualLocation: json['manualLocation'],
      videoPath: json['videoPath'],
      isSynced: json['isSynced'] ?? false,
      syncedAt: json['syncedAt'],
      syncError: json['syncError'],
    );
  }
}