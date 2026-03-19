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
  final List<Booking> todayTrips;
  final bool isAvailable;
  final int totalTrips;
  final double rating;
  final double todayEarnings;

  const DriverDashboardLoaded({
    required this.todayTrips,
    required this.isAvailable,
    required this.totalTrips,
    required this.rating,
    required this.todayEarnings,
  });

  @override
  List<Object?> get props => [todayTrips, isAvailable, totalTrips, rating, todayEarnings];
}

class DriverTripsLoaded extends DriverState {
  final List<Booking> trips;

  const DriverTripsLoaded({required this.trips});

  @override
  List<Object?> get props => [trips];
}

class TripDetailLoaded extends DriverState {
  final Booking trip;

  const TripDetailLoaded({required this.trip});

  @override
  List<Object?> get props => [trip];
}

class TripCompleted extends DriverState {}

class FuelLogsLoaded extends DriverState {
  final List<FuelLog> fuelLogs;

  const FuelLogsLoaded({required this.fuelLogs});

  @override
  List<Object?> get props => [fuelLogs];
}

class FuelLogSubmitted extends DriverState {}

class EarningsLoaded extends DriverState {
  final double totalEarnings;
  final double thisMonthEarnings;
  final List<Map<String, dynamic>> earningsHistory;

  const EarningsLoaded({
    required this.totalEarnings,
    required this.thisMonthEarnings,
    required this.earningsHistory,
  });

  @override
  List<Object?> get props => [totalEarnings, thisMonthEarnings, earningsHistory];
}

class DriverError extends DriverState {
  final String message;

  const DriverError({required this.message});

  @override
  List<Object?> get props => [message];
}
