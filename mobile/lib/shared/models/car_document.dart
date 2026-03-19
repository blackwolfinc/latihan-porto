import 'package:equatable/equatable.dart';

class CarDocument extends Equatable {
  final String id;
  final String carId;
  final String type;
  final String documentNumber;
  final DateTime? expiryDate;
  final String? fileUrl;
  final String status;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const CarDocument({
    required this.id,
    required this.carId,
    required this.type,
    required this.documentNumber,
    this.expiryDate,
    this.fileUrl,
    this.status = 'active',
    this.createdAt,
    this.updatedAt,
  });

  factory CarDocument.fromJson(Map<String, dynamic> json) {
    return CarDocument(
      id: json['id'] as String? ?? json['_id'] as String? ?? '',
      carId: json['carId'] as String? ?? '',
      type: json['type'] as String? ?? '',
      documentNumber: json['documentNumber'] as String? ?? '',
      expiryDate: json['expiryDate'] != null
          ? DateTime.tryParse(json['expiryDate'] as String)
          : null,
      fileUrl: json['fileUrl'] as String?,
      status: json['status'] as String? ?? 'active',
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
      'carId': carId,
      'type': type,
      'documentNumber': documentNumber,
      'expiryDate': expiryDate?.toIso8601String(),
      'fileUrl': fileUrl,
      'status': status,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [id, carId, type, documentNumber];
}
