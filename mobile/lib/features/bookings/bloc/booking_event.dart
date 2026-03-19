import 'package:equatable/equatable.dart';

abstract class BookingEvent extends Equatable {
  const BookingEvent();

  @override
  List<Object?> get props => [];
}

class LoadBookings extends BookingEvent {
  final String? status;
  final int page;
  final int limit;

  const LoadBookings({this.status, this.page = 1, this.limit = 10});

  @override
  List<Object?> get props => [status, page, limit];
}

class LoadBookingDetail extends BookingEvent {
  final String bookingId;

  const LoadBookingDetail({required this.bookingId});

  @override
  List<Object?> get props => [bookingId];
}

class CreateBooking extends BookingEvent {
  final String carId;
  final DateTime startDate;
  final DateTime endDate;
  final String pickupLocation;
  final String dropoffLocation;
  final bool withDriver;
  final String? driverId;
  final String? notes;

  const CreateBooking({
    required this.carId,
    required this.startDate,
    required this.endDate,
    required this.pickupLocation,
    required this.dropoffLocation,
    this.withDriver = false,
    this.driverId,
    this.notes,
  });

  @override
  List<Object?> get props => [carId, startDate, endDate, pickupLocation, dropoffLocation, withDriver];
}

class CancelBooking extends BookingEvent {
  final String bookingId;
  final String? reason;

  const CancelBooking({required this.bookingId, this.reason});

  @override
  List<Object?> get props => [bookingId, reason];
}
