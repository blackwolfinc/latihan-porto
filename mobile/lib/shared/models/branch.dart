import 'package:equatable/equatable.dart';

class Branch extends Equatable {
  final String id;
  final String name;
  final String address;
  final String city;
  final String province;
  final String? phone;
  final String? email;
  final double? latitude;
  final double? longitude;
  final bool isActive;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Branch({
    required this.id,
    required this.name,
    required this.address,
    required this.city,
    required this.province,
    this.phone,
    this.email,
    this.latitude,
    this.longitude,
    this.isActive = true,
    this.createdAt,
    this.updatedAt,
  });

  factory Branch.fromJson(Map<String, dynamic> json) {
    return Branch(
      id: json['id'] as String? ?? json['_id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      address: json['address'] as String? ?? '',
      city: json['city'] as String? ?? '',
      province: json['province'] as String? ?? '',
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      isActive: json['isActive'] as bool? ?? true,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String)
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'address': address,
      'city': city,
      'province': province,
      'phone': phone,
      'email': email,
      'latitude': latitude,
      'longitude': longitude,
      'isActive': isActive,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [id, name, address, city, province];
}
