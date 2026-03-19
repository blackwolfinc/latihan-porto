import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../shared/models/booking.dart';
import '../../../shared/models/fuel_log.dart';
import 'driver_event.dart';
import 'driver_state.dart';

class DriverBloc extends Bloc<DriverEvent, DriverState> {
  final ApiClient apiClient;

  DriverBloc({required this.apiClient}) : super(DriverInitial()) {
    on<LoadDriverDashboard>(_onLoadDashboard);
    on<ToggleAvailability>(_onToggleAvailability);
    on<LoadDriverTrips>(_onLoadTrips);
    on<LoadTripDetail>(_onLoadTripDetail);
    on<StartTrip>(_onStartTrip);
    on<EndTrip>(_onEndTrip);
    on<LoadDriverEarnings>(_onLoadEarnings);
    on<SubmitFuelLog>(_onSubmitFuelLog);
  }

  Future<void> _onLoadDashboard(LoadDriverDashboard event, Emitter<DriverState> emit) async {
    emit(DriverLoading());
    try {
      final response = await apiClient.get(ApiEndpoints.driverDashboard);
      final data = response.data['data'];

      Booking? activeTrip;
      if (data['activeTrip'] != null) {
        activeTrip = Booking.fromJson(data['activeTrip'] as Map<String, dynamic>);
      }

      final upcomingTrips = (data['upcomingTrips'] as List?)
              ?.map((json) => Booking.fromJson(json as Map<String, dynamic>))
              .toList() ??
          [];

      emit(DriverDashboardLoaded(
        isAvailable: data['isAvailable'] as bool? ?? true,
        tripsToday: data['tripsToday'] as int? ?? 0,
        totalTrips: data['totalTrips'] as int? ?? 0,
        rating: (data['rating'] as num?)?.toDouble() ?? 0.0,
        activeTrip: activeTrip,
        upcomingTrips: upcomingTrips,
      ));
    } catch (e) {
      emit(const DriverError(message: 'Gagal memuat dashboard.'));
    }
  }

  Future<void> _onToggleAvailability(ToggleAvailability event, Emitter<DriverState> emit) async {
    try {
      await apiClient.put(
        ApiEndpoints.driverAvailability,
        data: {'isAvailable': event.isAvailable},
      );
      emit(DriverAvailabilityUpdated(isAvailable: event.isAvailable));
      add(LoadDriverDashboard());
    } catch (e) {
      emit(const DriverError(message: 'Gagal mengubah status ketersediaan.'));
    }
  }

  Future<void> _onLoadTrips(LoadDriverTrips event, Emitter<DriverState> emit) async {
    emit(DriverLoading());
    try {
      final queryParams = <String, dynamic>{};
      if (event.status != null) queryParams['status'] = event.status;

      final response = await apiClient.get(
        ApiEndpoints.driverTrips,
        queryParameters: queryParams,
      );
      final trips = (response.data['data'] as List)
          .map((json) => Booking.fromJson(json as Map<String, dynamic>))
          .toList();

      emit(DriverTripsLoaded(trips: trips));
    } catch (e) {
      emit(const DriverError(message: 'Gagal memuat daftar trip.'));
    }
  }

  Future<void> _onLoadTripDetail(LoadTripDetail event, Emitter<DriverState> emit) async {
    emit(DriverLoading());
    try {
      final response = await apiClient.get(ApiEndpoints.driverTripById(event.tripId));
      final trip = Booking.fromJson(response.data['data'] as Map<String, dynamic>);
      emit(DriverTripDetailLoaded(trip: trip));
    } catch (e) {
      emit(const DriverError(message: 'Gagal memuat detail trip.'));
    }
  }

  Future<void> _onStartTrip(StartTrip event, Emitter<DriverState> emit) async {
    try {
      await apiClient.post('${ApiEndpoints.driverTripById(event.tripId)}/start');
      emit(TripStarted(tripId: event.tripId));
    } catch (e) {
      emit(const DriverError(message: 'Gagal memulai trip.'));
    }
  }

  Future<void> _onEndTrip(EndTrip event, Emitter<DriverState> emit) async {
    try {
      await apiClient.post('${ApiEndpoints.driverTripById(event.tripId)}/end');
      emit(TripEnded(tripId: event.tripId));
    } catch (e) {
      emit(const DriverError(message: 'Gagal mengakhiri trip.'));
    }
  }

  Future<void> _onLoadEarnings(LoadDriverEarnings event, Emitter<DriverState> emit) async {
    emit(DriverLoading());
    try {
      final queryParams = <String, dynamic>{};
      if (event.period != null) queryParams['period'] = event.period;

      final response = await apiClient.get(
        ApiEndpoints.driverEarnings,
        queryParameters: queryParams,
      );
      final data = response.data['data'];

      emit(DriverEarningsLoaded(
        totalEarnings: (data['totalEarnings'] as num?)?.toDouble() ?? 0.0,
        earningsHistory: (data['history'] as List?)
                ?.map((e) => e as Map<String, dynamic>)
                .toList() ??
            [],
        chartData: (data['chartData'] as List?)
                ?.map((e) => (e as num).toDouble())
                .toList() ??
            [],
      ));
    } catch (e) {
      emit(const DriverError(message: 'Gagal memuat data pendapatan.'));
    }
  }

  Future<void> _onSubmitFuelLog(SubmitFuelLog event, Emitter<DriverState> emit) async {
    emit(DriverLoading());
    try {
      if (event.receiptPhotoPath != null) {
        await apiClient.uploadFile(
          ApiEndpoints.fuelLogs,
          filePath: event.receiptPhotoPath!,
          fieldName: 'receiptPhoto',
          extraFields: {
            'carId': event.carId,
            'liters': event.liters,
            'totalCost': event.totalCost,
            'odometer': event.odometer,
            'fuelType': event.fuelType,
            if (event.notes != null) 'notes': event.notes,
          },
        );
      } else {
        await apiClient.post(
          ApiEndpoints.fuelLogs,
          data: {
            'carId': event.carId,
            'liters': event.liters,
            'totalCost': event.totalCost,
            'odometer': event.odometer,
            'fuelType': event.fuelType,
            if (event.notes != null) 'notes': event.notes,
          },
        );
      }
      emit(FuelLogSubmitted());
    } catch (e) {
      emit(const DriverError(message: 'Gagal menyimpan log BBM.'));
    }
  }
}
