import 'package:hive/hive.dart';
import 'package:uuid/uuid.dart';

part 'child.g.dart';

@HiveType(typeId: 0)
class Child extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String name;

  @HiveField(2)
  final int ageMonths;

  @HiveField(3)
  final String sex; // 'M' or 'F'

  @HiveField(4)
  final String zone;

  @HiveField(5)
  final String pinCode;

  @HiveField(6)
  final String address;

  @HiveField(7)
  final String guardianContact;

  @HiveField(8)
  final DateTime createdAt;

  @HiveField(9)
  final DateTime? lastScreeningDate;

  Child({
    String? id,
    required this.name,
    required this.ageMonths,
    required this.sex,
    required this.zone,
    required this.pinCode,
    required this.address,
    required this.guardianContact,
    DateTime? createdAt,
    this.lastScreeningDate,
  })  : id = id ?? const Uuid().v4(),
        createdAt = createdAt ?? DateTime.now();

  Child copyWith({
    String? name,
    int? ageMonths,
    String? sex,
    String? zone,
    String? pinCode,
    String? address,
    String? guardianContact,
    DateTime? lastScreeningDate,
  }) {
    return Child(
      id: id,
      name: name ?? this.name,
      ageMonths: ageMonths ?? this.ageMonths,
      sex: sex ?? this.sex,
      zone: zone ?? this.zone,
      pinCode: pinCode ?? this.pinCode,
      address: address ?? this.address,
      guardianContact: guardianContact ?? this.guardianContact,
      createdAt: createdAt,
      lastScreeningDate: lastScreeningDate ?? this.lastScreeningDate,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'ageMonths': ageMonths,
      'sex': sex,
      'zone': zone,
      'pinCode': pinCode,
      'address': address,
      'guardianContact': guardianContact,
      'createdAt': createdAt.toIso8601String(),
      'lastScreeningDate': lastScreeningDate?.toIso8601String(),
    };
  }

  factory Child.fromJson(Map<String, dynamic> json) {
    return Child(
      id: json['id'],
      name: json['name'],
      ageMonths: json['ageMonths'],
      sex: json['sex'],
      zone: json['zone'],
      pinCode: json['pinCode'],
      address: json['address'],
      guardianContact: json['guardianContact'],
      createdAt: DateTime.parse(json['createdAt']),
      lastScreeningDate: json['lastScreeningDate'] != null
          ? DateTime.parse(json['lastScreeningDate'])
          : null,
    );
  }
}