import 'package:equatable/equatable.dart';

class Contract extends Equatable {
  final String id;
  final String bookingId;
  final String contractNumber;
  final String terms;
  final String? customerSignature;
  final String? staffSignature;
  final bool isCustomerSigned;
  final bool isStaffSigned;
  final DateTime? customerSignedAt;
  final DateTime? staffSignedAt;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Contract({
    required this.id,
    required this.bookingId,
    required this.contractNumber,
    required this.terms,
    this.customerSignature,
    this.staffSignature,
    this.isCustomerSigned = false,
    this.isStaffSigned = false,
    this.customerSignedAt,
    this.staffSignedAt,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Contract.fromJson(Map<String, dynamic> json) {
    return Contract(
      id: json['id'] as String,
      bookingId: json['bookingId'] as String,
      contractNumber: json['contractNumber'] as String,
      terms: json['terms'] as String,
      customerSignature: json['customerSignature'] as String?,
      staffSignature: json['staffSignature'] as String?,
      isCustomerSigned: json['isCustomerSigned'] as bool? ?? false,
      isStaffSigned: json['isStaffSigned'] as bool? ?? false,
      customerSignedAt: json['customerSignedAt'] != null ? DateTime.parse(json['customerSignedAt'] as String) : null,
      staffSignedAt: json['staffSignedAt'] != null ? DateTime.parse(json['staffSignedAt'] as String) : null,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'bookingId': bookingId,
      'contractNumber': contractNumber,
      'terms': terms,
      'customerSignature': customerSignature,
      'staffSignature': staffSignature,
      'isCustomerSigned': isCustomerSigned,
      'isStaffSigned': isStaffSigned,
      'customerSignedAt': customerSignedAt?.toIso8601String(),
      'staffSignedAt': staffSignedAt?.toIso8601String(),
      'status': status,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  bool get isFullySigned => isCustomerSigned && isStaffSigned;

  String get statusLabel {
    switch (status) {
      case 'DRAFT':
        return 'Draft';
      case 'PENDING':
        return 'Menunggu Tanda Tangan';
      case 'SIGNED':
        return 'Ditandatangani';
      case 'ACTIVE':
        return 'Aktif';
      case 'COMPLETED':
        return 'Selesai';
      case 'CANCELLED':
        return 'Dibatalkan';
      default:
        return status;
    }
  }

  @override
  List<Object?> get props => [id, bookingId, contractNumber, status];
}
