import 'package:equatable/equatable.dart';
import 'user.dart';

class Review extends Equatable {
  final String id;
  final String bookingId;
  final String userId;
  final String? carId;
  final String? driverId;
  final int carRating;
  final int? driverRating;
  final String? comment;
  final List<String> photos;
  final User? user;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Review({
    required this.id,
    required this.bookingId,
    required this.userId,
    this.carId,
    this.driverId,
    required this.carRating,
    this.driverRating,
    this.comment,
    this.photos = const [],
    this.user,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'] as String,
      bookingId: json['bookingId'] as String,
      userId: json['userId'] as String,
      carId: json['carId'] as String?,
      driverId: json['driverId'] as String?,
      carRating: json['carRating'] as int,
      driverRating: json['driverRating'] as int?,
      comment: json['comment'] as String?,
      photos: (json['photos'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      user: json['user'] != null ? User.fromJson(json['user'] as Map<String, dynamic>) : null,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'bookingId': bookingId,
      'userId': userId,
      'carId': carId,
      'driverId': driverId,
      'carRating': carRating,
      'driverRating': driverRating,
      'comment': comment,
      'photos': photos,
      'user': user?.toJson(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [id, bookingId, userId, carRating];
}
