import 'package:equatable/equatable.dart';
import '../../../shared/models/gps_log.dart';

abstract class GpsState extends Equatable {
  const GpsState();

  @override
  List<Object?> get props => [];
}

class GpsInitial extends GpsState {}

class GpsLoading extends GpsState {}

class TrackingActive extends GpsState {
  final double latitude;
  final double longitude;
  final double speed;
  final double heading;
  final Duration duration;
  final List<GpsLog> trackingHistory;

  const TrackingActive({
    required this.latitude,
    required this.longitude,
    this.speed = 0.0,
    this.heading = 0.0,
    this.duration = Duration.zero,
    this.trackingHistory = const [],
  });

  @override
  List<Object?> get props => [latitude, longitude, speed, heading, duration, trackingHistory];
}

class TrackingInactive extends GpsState {}

class TrackingHistoryLoaded extends GpsState {
  final List<GpsLog> logs;

  const TrackingHistoryLoaded({required this.logs});

  @override
  List<Object?> get props => [logs];
}

class GpsError extends GpsState {
  final String message;

  const GpsError({required this.message});

  @override
  List<Object?> get props => [message];
}
