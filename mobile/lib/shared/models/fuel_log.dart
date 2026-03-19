import 'package:equatable/equatable.dart';

class FuelLog extends Equatable {
  final String id;
  final String carId;
  final String? driverId;
  final String? bookingId;
  final double liters;
  final double costPerLiter;
  final double totalCost;
  final double odometer;
  final String fuelType;
  final String? stationName;
  final String? receiptPhoto;
  final String? notes;
  final DateTime filledAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  const FuelLog({
    required this.id,
    required this.carId,
    this.driverId,
    this.bookingId,
    required this.liters,
    required this.costPerLiter,
    required this.totalCost,
    required this.odometer,
    required this.fuelType,
    this.stationName,
    this.receiptPhoto,
    this.notes,
    required this.filledAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory FuelLog.fromJson(Map<String, dynamic> json) {
    return FuelLog(
      id: json['id'] as String,
      carId: json['carId'] as String,
      driverId: json['driverId'] as String?,
      bookingId: json['bookingId'] as String?,
      liters: (json['liters'] as num).toDouble(),
      costPerLiter: (json['costPerLiter'] as num).toDouble(),
      totalCost: (json['totalCost'] as num).toDouble(),
      odometer: (json['odometer'] as num).toDouble(),
      fuelType: json['fuelType'] as String,
      stationName: json['stationName'] as String?,
      receiptPhoto: json['receiptPhoto'] as String?,
      notes: json['notes'] as String?,
      filledAt: DateTime.parse(json['filledAt'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'carId': carId,
      'driverId': driverId,
      'bookingId': bookingId,
      'liters': liters,
      'costPerLiter': costPerLiter,
      'totalCost': totalCost,
      'odometer': odometer,
      'fuelType': fuelType,
      'stationName': stationName,
      'receiptPhoto': receiptPhoto,
      'notes': notes,
      'filledAt': filledAt.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  String get formattedTotalCost {
    final parts = totalCost.toStringAsFixed(0).split('');
    final buffer = StringBuffer();
    for (int i = 0; i < parts.length; i++) {
      if (i > 0 && (parts.length - i) % 3 == 0) buffer.write('.');
      buffer.write(parts[i]);
    }
    return 'Rp $buffer';
  }

  @override
  List<Object?> get props => [id, carId, liters, totalCost, filledAt];
}
