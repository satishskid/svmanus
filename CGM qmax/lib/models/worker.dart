import 'package:hive/hive.dart';

part 'worker.g.dart';

@HiveType(typeId: 3)
class Worker {
  @HiveField(0)
  final String id;
  
  @HiveField(1)
  final String name;
  
  @HiveField(2)
  final String zone;
  
  @HiveField(3)
  final String phone;
  
  @HiveField(4)
  final String email;
  
  @HiveField(5)
  final String role;
  
  @HiveField(6)
  final DateTime createdAt;
  
  @HiveField(7)
  final DateTime updatedAt;

  Worker({
    required this.id,
    required this.name,
    required this.zone,
    required this.phone,
    required this.email,
    this.role = 'worker',
    required this.createdAt,
    required this.updatedAt,
  });

  Worker copyWith({
    String? id,
    String? name,
    String? zone,
    String? phone,
    String? email,
    String? role,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Worker(
      id: id ?? this.id,
      name: name ?? this.name,
      zone: zone ?? this.zone,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      role: role ?? this.role,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'zone': zone,
      'phone': phone,
      'email': email,
      'role': role,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory Worker.fromJson(Map<String, dynamic> json) {
    return Worker(
      id: json['id'] as String,
      name: json['name'] as String,
      zone: json['zone'] as String,
      phone: json['phone'] as String,
      email: json['email'] as String,
      role: json['role'] as String? ?? 'worker',
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }
}