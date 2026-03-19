import 'package:equatable/equatable.dart';
import 'car.dart';
import 'user.dart';
import 'driver.dart';

class Booking extends Equatable {
  final String id;
  final String userId;
  final String carId;
  final String? driverId;
  final DateTime startDate;
  final DateTime endDate;
  final String pickupLocation;
  final String dropoffLocation;
  final double totalAmount;
  final double? driverFee;
  final String status;
  final String paymentStatus;
  final bool withDriver;
  final String? notes;
  final Car? car;
  final User? user;
  final Driver? driver;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Booking({
    required this.id,
    required this.userId,
    required this.carId,
    this.driverId,
    required this.startDate,
    required this.endDate,
    required this.pickupLocation,
    required this.dropoffLocation,
    required this.totalAmount,
    this.driverFee,
    required this.status,
    required this.paymentStatus,
    this.withDriver = false,
    this.notes,
    this.car,
    this.user,
    this.driver,
    this.createdAt,
    this.updatedAt,
  });

  int get totalDays => endDate.difference(startDate).inDays;

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'] as String? ?? json['_id'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      carId: json['carId'] as String? ?? '',
      driverId: json['driverId'] as String?,
      startDate: json['startDate'] != null
          ? DateTime.parse(json['startDate'] as String)
          : DateTime.now(),
      endDate: json['endDate'] != null
          ? DateTime.parse(json['endDate'] as String)
          : DateTime.now(),
      pickupLocation: json['pickupLocation'] as String? ?? '',
      dropoffLocation: json['dropoffLocation'] as String? ?? '',
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0.0,
      driverFee: (json['driverFee'] as num?)?.toDouble(),
      status: json['status'] as String? ?? 'PENDING',
      paymentStatus: json['paymentStatus'] as String? ?? 'PENDING',
      withDriver: json['withDriver'] as bool? ?? false,
      notes: json['notes'] as String?,
      car: json['car'] != null
          ? Car.fromJson(json['car'] as Map<String, dynamic>)
          : null,
      user: json['user'] != null
          ? User.fromJson(json['user'] as Map<String, dynamic>)
          : null,
      driver: json['driver'] != null
          ? Driver.fromJson(json['driver'] as Map<String, dynamic>)
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
      'carId': carId,
      'driverId': driverId,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate.toIso8601String(),
      'pickupLocation': pickupLocation,
      'dropoffLocation': dropoffLocation,
      'totalAmount': totalAmount,
      'driverFee': driverFee,
      'status': status,
      'paymentStatus': paymentStatus,
      'withDriver': withDriver,
      'notes': notes,
      'car': car?.toJson(),
      'user': user?.toJson(),
      'driver': driver?.toJson(),
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [id, userId, carId, status];
}
