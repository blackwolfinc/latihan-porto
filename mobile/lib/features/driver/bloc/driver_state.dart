import 'package:equatable/equatable.dart';
import '../../../shared/models/booking.dart';
import '../../../shared/models/fuel_log.dart';

abstract class DriverState extends Equatable {
  const DriverState();

  @override
  List<Object?> get props => [];
}

class DriverInitial extends DriverState {}

class DriverLoading extends DriverState {}

class DriverDashboardLoaded extends DriverState {
  final bool isAvailable;
  final int tripsToday;
  final int totalTrips;
  final double rating;
  final Booking? activeTrip;
  final List<Booking> upcomingTrips;

  const DriverDashboardLoaded({
    required this.isAvailable,
    required this.tripsToday,
    required this.totalTrips,
    required this.rating,
    this.activeTrip,
    this.upcomingTrips = const [],
  });

  @override
  List<Object?> get props => [isAvailable, tripsToday, totalTrips, rating, activeTrip, upcomingTrips];
}

class DriverTripsLoaded extends DriverState {
  final List<Booking> trips;

  const DriverTripsLoaded({required this.trips});

  @override
  List<Object?> get props => [trips];
}

class DriverTripDetailLoaded extends DriverState {
  final Booking trip;

  const DriverTripDetailLoaded({required this.trip});

  @override
  List<Object?> get props => [trip];
}

class DriverEarningsLoaded extends DriverState {
  final double totalEarnings;
  final List<Map<String, dynamic>> earningsHistory;
  final List<double> chartData;

  const DriverEarningsLoaded({
    required this.totalEarnings,
    this.earningsHistory = const [],
    this.chartData = const [],
  });

  @override
  List<Object?> get props => [totalEarnings, earningsHistory, chartData];
}

class FuelLogSubmitted extends DriverState {}

class FuelLogsLoaded extends DriverState {
  final List<FuelLog> fuelLogs;

  const FuelLogsLoaded({required this.fuelLogs});

  @override
  List<Object?> get props => [fuelLogs];
}

class DriverAvailabilityUpdated extends DriverState {
  final bool isAvailable;

  const DriverAvailabilityUpdated({required this.isAvailable});

  @override
  List<Object?> get props => [isAvailable];
}

class TripStarted extends DriverState {
  final String tripId;

  const TripStarted({required this.tripId});

  @override
  List<Object?> get props => [tripId];
}

class TripEnded extends DriverState {
  final String tripId;

  const TripEnded({required this.tripId});

  @override
  List<Object?> get props => [tripId];
}

class DriverError extends DriverState {
  final String message;

  const DriverError({required this.message});

  @override
  List<Object?> get props => [message];
}
