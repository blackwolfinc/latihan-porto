import 'package:equatable/equatable.dart';

class Payment extends Equatable {
  final String id;
  final String bookingId;
  final double amount;
  final String method;
  final String status;
  final String? transactionId;
  final String? snapUrl;
  final String? snapToken;
  final DateTime? paidAt;
  final DateTime? expiredAt;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Payment({
    required this.id,
    required this.bookingId,
    required this.amount,
    required this.method,
    required this.status,
    this.transactionId,
    this.snapUrl,
    this.snapToken,
    this.paidAt,
    this.expiredAt,
    this.metadata,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'] as String,
      bookingId: json['bookingId'] as String,
      amount: (json['amount'] as num).toDouble(),
      method: json['method'] as String? ?? 'MIDTRANS',
      status: json['status'] as String,
      transactionId: json['transactionId'] as String?,
      snapUrl: json['snapUrl'] as String?,
      snapToken: json['snapToken'] as String?,
      paidAt: json['paidAt'] != null ? DateTime.parse(json['paidAt'] as String) : null,
      expiredAt: json['expiredAt'] != null ? DateTime.parse(json['expiredAt'] as String) : null,
      metadata: json['metadata'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'bookingId': bookingId,
      'amount': amount,
      'method': method,
      'status': status,
      'transactionId': transactionId,
      'snapUrl': snapUrl,
      'snapToken': snapToken,
      'paidAt': paidAt?.toIso8601String(),
      'expiredAt': expiredAt?.toIso8601String(),
      'metadata': metadata,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  bool get isPaid => status == 'PAID';
  bool get isPending => status == 'PENDING';
  bool get isFailed => status == 'FAILED';
  bool get isExpired => status == 'EXPIRED';

  String get formattedAmount {
    final parts = amount.toStringAsFixed(0).split('');
    final buffer = StringBuffer();
    for (int i = 0; i < parts.length; i++) {
      if (i > 0 && (parts.length - i) % 3 == 0) buffer.write('.');
      buffer.write(parts[i]);
    }
    return 'Rp $buffer';
  }

  @override
  List<Object?> get props => [id, bookingId, amount, status];
}
