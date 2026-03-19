import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../shared/models/booking.dart';
import 'booking_event.dart';
import 'booking_state.dart';

class BookingBloc extends Bloc<BookingEvent, BookingState> {
  final ApiClient apiClient;

  BookingBloc({required this.apiClient}) : super(BookingInitial()) {
    on<LoadBookings>(_onLoadBookings);
    on<LoadBookingDetail>(_onLoadBookingDetail);
    on<CreateBooking>(_onCreateBooking);
    on<CancelBooking>(_onCancelBooking);
  }

  Future<void> _onLoadBookings(LoadBookings event, Emitter<BookingState> emit) async {
    emit(BookingLoading());
    try {
      final queryParams = <String, dynamic>{
        'page': event.page,
        'limit': event.limit,
      };
      if (event.status != null) {
        queryParams['status'] = event.status;
      }

      final response = await apiClient.get(
        ApiEndpoints.myBookings,
        queryParameters: queryParams,
      );

      final data = response.data['data'];
      final bookings = (data['bookings'] as List)
          .map((json) => Booking.fromJson(json as Map<String, dynamic>))
          .toList();
      final total = data['total'] as int? ?? bookings.length;

      emit(BookingsLoaded(
        bookings: bookings,
        totalCount: total,
        hasMore: bookings.length >= event.limit,
      ));
    } catch (e) {
      emit(const BookingError(message: 'Gagal memuat daftar pemesanan.'));
    }
  }

  Future<void> _onLoadBookingDetail(LoadBookingDetail event, Emitter<BookingState> emit) async {
    emit(BookingLoading());
    try {
      final response = await apiClient.get(ApiEndpoints.bookingById(event.bookingId));
      final booking = Booking.fromJson(response.data['data'] as Map<String, dynamic>);
      emit(BookingDetailLoaded(booking: booking));
    } catch (e) {
      emit(const BookingError(message: 'Gagal memuat detail pemesanan.'));
    }
  }

  Future<void> _onCreateBooking(CreateBooking event, Emitter<BookingState> emit) async {
    emit(BookingLoading());
    try {
      final response = await apiClient.post(
        ApiEndpoints.bookings,
        data: {
          'carId': event.carId,
          'startDate': event.startDate.toIso8601String(),
          'endDate': event.endDate.toIso8601String(),
          'pickupLocation': event.pickupLocation,
          'dropoffLocation': event.dropoffLocation,
          'withDriver': event.withDriver,
          if (event.driverId != null) 'driverId': event.driverId,
          if (event.notes != null) 'notes': event.notes,
        },
      );

      final booking = Booking.fromJson(response.data['data'] as Map<String, dynamic>);
      emit(BookingCreated(booking: booking));
    } catch (e) {
      emit(const BookingError(message: 'Gagal membuat pemesanan. Silakan coba lagi.'));
    }
  }

  Future<void> _onCancelBooking(CancelBooking event, Emitter<BookingState> emit) async {
    emit(BookingLoading());
    try {
      await apiClient.post(
        ApiEndpoints.cancelBooking(event.bookingId),
        data: {
          if (event.reason != null) 'reason': event.reason,
        },
      );
      emit(BookingCancelled(bookingId: event.bookingId));
    } catch (e) {
      emit(const BookingError(message: 'Gagal membatalkan pemesanan.'));
    }
  }
}
