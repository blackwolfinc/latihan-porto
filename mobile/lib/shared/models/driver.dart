import 'package:equatable/equatable.dart';
import 'user.dart';

class Driver extends Equatable {
  final String id;
  final String userId;
  final String licenseNumber;
  final String licenseType;
  final DateTime? licenseExpiry;
  final bool isAvailable;
  final double rating;
  final int totalTrips;
  final String status;
  final User? user;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Driver({
    required this.id,
    required this.userId,
    required this.licenseNumber,
    required this.licenseType,
    this.licenseExpiry,
    this.isAvailable = true,
    this.rating = 0.0,
    this.totalTrips = 0,
    this.status = 'active',
    this.user,
    this.createdAt,
    this.updatedAt,
  });

  factory Driver.fromJson(Map<String, dynamic> json) {
    return Driver(
      id: json['id'] as String? ?? json['_id'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      licenseNumber: json['licenseNumber'] as String? ?? '',
      licenseType: json['licenseType'] as String? ?? '',
      licenseExpiry: json['licenseExpiry'] != null
          ? DateTime.tryParse(json['licenseExpiry'] as String)
          : null,
      isAvailable: json['isAvailable'] as bool? ?? true,
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      totalTrips: json['totalTrips'] as int? ?? 0,
      status: json['status'] as String? ?? 'active',
      user: json['user'] != null
          ? User.fromJson(json['user'] as Map<String, dynamic>)
          : null,
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
      'userId': userId,
      'licenseNumber': licenseNumber,
      'licenseType': licenseType,
      'licenseExpiry': licenseExpiry?.toIso8601String(),
      'isAvailable': isAvailable,
      'rating': rating,
      'totalTrips': totalTrips,
      'status': status,
      'user': user?.toJson(),
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [id, userId, licenseNumber];
}
