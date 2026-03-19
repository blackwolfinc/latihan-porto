import 'package:equatable/equatable.dart';

abstract class DriverEvent extends Equatable {
  const DriverEvent();

  @override
  List<Object?> get props => [];
}

class LoadDriverDashboard extends DriverEvent {}

class ToggleAvailability extends DriverEvent {
  final bool isAvailable;

  const ToggleAvailability({required this.isAvailable});

  @override
  List<Object?> get props => [isAvailable];
}

class LoadDriverTrips extends DriverEvent {
  final String? status;

  const LoadDriverTrips({this.status});

  @override
  List<Object?> get props => [status];
}

class LoadTripDetail extends DriverEvent {
  final String tripId;

  const LoadTripDetail({required this.tripId});

  @override
  List<Object?> get props => [tripId];
}

class StartTrip extends DriverEvent {
  final String tripId;

  const StartTrip({required this.tripId});

  @override
  List<Object?> get props => [tripId];
}

class EndTrip extends DriverEvent {
  final String tripId;

  const EndTrip({required this.tripId});

  @override
  List<Object?> get props => [tripId];
}

class LoadDriverEarnings extends DriverEvent {
  final String? period;

  const LoadDriverEarnings({this.period});

  @override
  List<Object?> get props => [period];
}

class SubmitFuelLog extends DriverEvent {
  final String carId;
  final double liters;
  final double totalCost;
  final double odometer;
  final String fuelType;
  final String? receiptPhotoPath;
  final String? notes;

  const SubmitFuelLog({
    required this.carId,
    required this.liters,
    required this.totalCost,
    required this.odometer,
    required this.fuelType,
    this.receiptPhotoPath,
    this.notes,
  });

  @override
  List<Object?> get props => [carId, liters, totalCost, odometer, fuelType];
}
