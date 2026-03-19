import 'package:equatable/equatable.dart';

abstract class GpsEvent extends Equatable {
  const GpsEvent();

  @override
  List<Object?> get props => [];
}

class StartTracking extends GpsEvent {
  final String bookingId;

  const StartTracking({required this.bookingId});

  @override
  List<Object?> get props => [bookingId];
}

class StopTracking extends GpsEvent {}

class UpdateLocation extends GpsEvent {
  final double latitude;
  final double longitude;
  final double speed;
  final double heading;

  const UpdateLocation({
    required this.latitude,
    required this.longitude,
    required this.speed,
    required this.heading,
  });

  @override
  List<Object?> get props => [latitude, longitude, speed, heading];
}

class LoadTrackingHistory extends GpsEvent {
  final String bookingId;

  const LoadTrackingHistory({required this.bookingId});

  @override
  List<Object?> get props => [bookingId];
}
