import 'package:equatable/equatable.dart';
import '../../../shared/models/booking.dart';

abstract class BookingState extends Equatable {
  const BookingState();

  @override
  List<Object?> get props => [];
}

class BookingInitial extends BookingState {}

class BookingLoading extends BookingState {}

class BookingsLoaded extends BookingState {
  final List<Booking> bookings;
  final int totalCount;
  final bool hasMore;

  const BookingsLoaded({
    required this.bookings,
    this.totalCount = 0,
    this.hasMore = false,
  });

  @override
  List<Object?> get props => [bookings, totalCount, hasMore];
}

class BookingDetailLoaded extends BookingState {
  final Booking booking;

  const BookingDetailLoaded({required this.booking});

  @override
  List<Object?> get props => [booking];
}

class BookingCreated extends BookingState {
  final Booking booking;

  const BookingCreated({required this.booking});

  @override
  List<Object?> get props => [booking];
}

class BookingCancelled extends BookingState {
  final String bookingId;

  const BookingCancelled({required this.bookingId});

  @override
  List<Object?> get props => [bookingId];
}

class BookingError extends BookingState {
  final String message;

  const BookingError({required this.message});

  @override
  List<Object?> get props => [message];
}
