import 'package:equatable/equatable.dart';

abstract class DriverEvent extends Equatable {
  const DriverEvent();

  @override
  List<Object?> get props => [];
}

class LoadDriverDashboard extends DriverEvent {}

class ToggleDriverAvailability extends DriverEvent {
  final bool isAvailable;

  const ToggleDriverAvailability({required this.isAvailable});

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

class CompleteTripEvent extends DriverEvent {
  final String tripId;

  const CompleteTripEvent({required this.tripId});

  @override
  List<Object?> get props => [tripId];
}

class LoadFuelLogs extends DriverEvent {}

class SubmitFuelLog extends DriverEvent {
  final String carId;
  final double liters;
  final double costPerLiter;
  final double odometer;
  final String fuelType;
  final String? stationName;
  final String? receiptPhotoPath;
  final String? notes;

  const SubmitFuelLog({
    required this.carId,
    required this.liters,
    required this.costPerLiter,
    required this.odometer,
    required this.fuelType,
    this.stationName,
    this.receiptPhotoPath,
    this.notes,
  });

  @override
  List<Object?> get props => [carId, liters, costPerLiter, odometer];
}

class LoadDriverEarnings extends DriverEvent {
  final String? period;

  const LoadDriverEarnings({this.period});

  @override
  List<Object?> get props => [period];
}
