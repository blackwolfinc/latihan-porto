import 'package:equatable/equatable.dart';

class NotificationModel extends Equatable {
  final String id;
  final String userId;
  final String title;
  final String body;
  final String type;
  final String? referenceId;
  final String? referenceType;
  final bool isRead;
  final DateTime? readAt;
  final DateTime createdAt;

  const NotificationModel({
    required this.id,
    required this.userId,
    required this.title,
    required this.body,
    required this.type,
    this.referenceId,
    this.referenceType,
    this.isRead = false,
    this.readAt,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] as String,
      userId: json['userId'] as String,
      title: json['title'] as String,
      body: json['body'] as String,
      type: json['type'] as String,
      referenceId: json['referenceId'] as String?,
      referenceType: json['referenceType'] as String?,
      isRead: json['isRead'] as bool? ?? false,
      readAt: json['readAt'] != null ? DateTime.parse(json['readAt'] as String) : null,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'title': title,
      'body': body,
      'type': type,
      'referenceId': referenceId,
      'referenceType': referenceType,
      'isRead': isRead,
      'readAt': readAt?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
    };
  }

  NotificationModel copyWith({bool? isRead, DateTime? readAt}) {
    return NotificationModel(
      id: id,
      userId: userId,
      title: title,
      body: body,
      type: type,
      referenceId: referenceId,
      referenceType: referenceType,
      isRead: isRead ?? this.isRead,
      readAt: readAt ?? this.readAt,
      createdAt: createdAt,
    );
  }

  String get typeLabel {
    switch (type) {
      case 'BOOKING':
        return 'Pemesanan';
      case 'PAYMENT':
        return 'Pembayaran';
      case 'DRIVER':
        return 'Driver';
      case 'SYSTEM':
        return 'Sistem';
      case 'PROMO':
        return 'Promo';
      default:
        return type;
    }
  }

  @override
  List<Object?> get props => [id, userId, title, type, isRead];
}
