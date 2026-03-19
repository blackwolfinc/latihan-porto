import 'package:equatable/equatable.dart';

class GpsLog extends Equatable {
  final String id;
  final String bookingId;
  final double latitude;
  final double longitude;
  final double? speed;
  final double? heading;
  final double? altitude;
  final double? accuracy;
  final DateTime timestamp;
  final DateTime createdAt;

  const GpsLog({
    required this.id,
    required this.bookingId,
    required this.latitude,
    required this.longitude,
    this.speed,
    this.heading,
    this.altitude,
    this.accuracy,
    required this.timestamp,
    required this.createdAt,
  });

  factory GpsLog.fromJson(Map<String, dynamic> json) {
    return GpsLog(
      id: json['id'] as String,
      bookingId: json['bookingId'] as String,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      speed: (json['speed'] as num?)?.toDouble(),
      heading: (json['heading'] as num?)?.toDouble(),
      altitude: (json['altitude'] as num?)?.toDouble(),
      accuracy: (json['accuracy'] as num?)?.toDouble(),
      timestamp: DateTime.parse(json['timestamp'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'bookingId': bookingId,
      'latitude': latitude,
      'longitude': longitude,
      'speed': speed,
      'heading': heading,
      'altitude': altitude,
      'accuracy': accuracy,
      'timestamp': timestamp.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [id, bookingId, latitude, longitude, timestamp];
}
