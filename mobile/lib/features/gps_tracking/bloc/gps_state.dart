import 'package:equatable/equatable.dart';
import '../../../shared/models/gps_log.dart';

abstract class GpsState extends Equatable {
  const GpsState();

  @override
  List<Object?> get props => [];
}

class GpsInitial extends GpsState {}

class GpsLoading extends GpsState {}

class GpsTracking extends GpsState {
  final double latitude;
  final double longitude;
  final double? speed;
  final double? heading;
  final bool isSending;
  final List<GpsLog> history;

  const GpsTracking({
    required this.latitude,
    required this.longitude,
    this.speed,
    this.heading,
    this.isSending = false,
    this.history = const [],
  });

  GpsTracking copyWith({
    double? latitude,
    double? longitude,
    double? speed,
    double? heading,
    bool? isSending,
    List<GpsLog>? history,
  }) {
    return GpsTracking(
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      speed: speed ?? this.speed,
      heading: heading ?? this.heading,
      isSending: isSending ?? this.isSending,
      history: history ?? this.history,
    );
  }

  @override
  List<Object?> get props => [latitude, longitude, speed, heading, isSending, history];
}

class GpsStopped extends GpsState {}

class GpsError extends GpsState {
  final String message;

  const GpsError({required this.message});

  @override
  List<Object?> get props => [message];
}
