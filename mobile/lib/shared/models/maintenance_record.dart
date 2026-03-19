import 'package:equatable/equatable.dart';

class MaintenanceRecord extends Equatable {
  final String id;
  final String carId;
  final String type;
  final String description;
  final double cost;
  final double? mileage;
  final DateTime serviceDate;
  final DateTime? nextServiceDate;
  final String? mechanicName;
  final String? workshopName;
  final List<String> attachments;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;

  const MaintenanceRecord({
    required this.id,
    required this.carId,
    required this.type,
    required this.description,
    required this.cost,
    this.mileage,
    required this.serviceDate,
    this.nextServiceDate,
    this.mechanicName,
    this.workshopName,
    this.attachments = const [],
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory MaintenanceRecord.fromJson(Map<String, dynamic> json) {
    return MaintenanceRecord(
      id: json['id'] as String,
      carId: json['carId'] as String,
      type: json['type'] as String,
      description: json['description'] as String,
      cost: (json['cost'] as num).toDouble(),
      mileage: (json['mileage'] as num?)?.toDouble(),
      serviceDate: DateTime.parse(json['serviceDate'] as String),
      nextServiceDate: json['nextServiceDate'] != null ? DateTime.parse(json['nextServiceDate'] as String) : null,
      mechanicName: json['mechanicName'] as String?,
      workshopName: json['workshopName'] as String?,
      attachments: (json['attachments'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      status: json['status'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'carId': carId,
      'type': type,
      'description': description,
      'cost': cost,
      'mileage': mileage,
      'serviceDate': serviceDate.toIso8601String(),
      'nextServiceDate': nextServiceDate?.toIso8601String(),
      'mechanicName': mechanicName,
      'workshopName': workshopName,
      'attachments': attachments,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  String get typeLabel {
    switch (type) {
      case 'SERVICE':
        return 'Servis Berkala';
      case 'REPAIR':
        return 'Perbaikan';
      case 'TIRE':
        return 'Ban';
      case 'OIL_CHANGE':
        return 'Ganti Oli';
      case 'BODY':
        return 'Body & Cat';
      default:
        return type;
    }
  }

  @override
  List<Object?> get props => [id, carId, type, serviceDate];
}
