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
    on<ToggleDriverAvailability>(_onToggleAvailability);
    on<LoadDriverTrips>(_onLoadTrips);
    on<LoadTripDetail>(_onLoadTripDetail);
    on<CompleteTripEvent>(_onCompleteTrip);
    on<LoadFuelLogs>(_onLoadFuelLogs);
    on<SubmitFuelLog>(_onSubmitFuelLog);
    on<LoadDriverEarnings>(_onLoadEarnings);
  }

  Future<void> _onLoadDashboard(LoadDriverDashboard event, Emitter<DriverState> emit) async {
    emit(DriverLoading());
    try {
      final response = await apiClient.get(ApiEndpoints.driverDashboard);
      final data = response.data['data'];

      final trips = (data['todayTrips'] as List?)
              ?.map((json) => Booking.fromJson(json as Map<String, dynamic>))
              .toList() ??
          [];

      emit(DriverDashboardLoaded(
        todayTrips: trips,
        isAvailable: data['isAvailable'] as bool? ?? false,
        totalTrips: data['totalTrips'] as int? ?? 0,
        rating: (data['rating'] as num?)?.toDouble() ?? 0.0,
        todayEarnings: (data['todayEarnings'] as num?)?.toDouble() ?? 0.0,
      ));
    } catch (e) {
      emit(const DriverError(message: 'Gagal memuat dashboard.'));
    }
  }

  Future<void> _onToggleAvailability(ToggleDriverAvailability event, Emitter<DriverState> emit) async {
    try {
      await apiClient.patch(
        ApiEndpoints.driverAvailability,
        data: {'isAvailable': event.isAvailable},
      );
      add(LoadDriverDashboard());
    } catch (e) {
      emit(const DriverError(message: 'Gagal mengubah status ketersediaan.'));
    }
  }

  Future<void> _onLoadTrips(LoadDriverTrips event, Emitter<DriverState> emit) async {
    emit(DriverLoading());
    try {
      final params = <String, dynamic>{};
      if (event.status != null) params['status'] = event.status;

      final response = await apiClient.get(ApiEndpoints.driverTrips, queryParameters: params);
      final trips = (response.data['data'] as List)
          .map((json) => Booking.fromJson(json as Map<String, dynamic>))
          .toList();

      emit(DriverTripsLoaded(trips: trips));
    } catch (e) {
      emit(const DriverError(message: 'Gagal memuat daftar perjalanan.'));
    }
  }

  Future<void> _onLoadTripDetail(LoadTripDetail event, Emitter<DriverState> emit) async {
    emit(DriverLoading());
    try {
      final response = await apiClient.get(ApiEndpoints.driverTripById(event.tripId));
      final trip = Booking.fromJson(response.data['data'] as Map<String, dynamic>);
      emit(TripDetailLoaded(trip: trip));
    } catch (e) {
      emit(const DriverError(message: 'Gagal memuat detail perjalanan.'));
    }
  }

  Future<void> _onCompleteTrip(CompleteTripEvent event, Emitter<DriverState> emit) async {
    emit(DriverLoading());
    try {
      await apiClient.post(ApiEndpoints.completeBooking(event.tripId));
      emit(TripCompleted());
    } catch (e) {
      emit(const DriverError(message: 'Gagal menyelesaikan perjalanan.'));
    }
  }

  Future<void> _onLoadFuelLogs(LoadFuelLogs event, Emitter<DriverState> emit) async {
    emit(DriverLoading());
    try {
      final response = await apiClient.get(ApiEndpoints.fuelLogs);
      final logs = (response.data['data'] as List)
          .map((json) => FuelLog.fromJson(json as Map<String, dynamic>))
          .toList();
      emit(FuelLogsLoaded(fuelLogs: logs));
    } catch (e) {
      emit(const DriverError(message: 'Gagal memuat catatan bahan bakar.'));
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
            'costPerLiter': event.costPerLiter,
            'odometer': event.odometer,
            'fuelType': event.fuelType,
            'stationName': event.stationName,
            'notes': event.notes,
          },
        );
      } else {
        await apiClient.post(
          ApiEndpoints.fuelLogs,
          data: {
            'carId': event.carId,
            'liters': event.liters,
            'costPerLiter': event.costPerLiter,
            'totalCost': event.liters * event.costPerLiter,
            'odometer': event.odometer,
            'fuelType': event.fuelType,
            'stationName': event.stationName,
            'notes': event.notes,
          },
        );
      }
      emit(FuelLogSubmitted());
    } catch (e) {
      emit(const DriverError(message: 'Gagal menyimpan catatan bahan bakar.'));
    }
  }

  Future<void> _onLoadEarnings(LoadDriverEarnings event, Emitter<DriverState> emit) async {
    emit(DriverLoading());
    try {
      final params = <String, dynamic>{};
      if (event.period != null) params['period'] = event.period;

      final response = await apiClient.get(ApiEndpoints.driverEarnings, queryParameters: params);
      final data = response.data['data'];

      emit(EarningsLoaded(
        totalEarnings: (data['totalEarnings'] as num?)?.toDouble() ?? 0.0,
        thisMonthEarnings: (data['thisMonthEarnings'] as num?)?.toDouble() ?? 0.0,
        earningsHistory: (data['history'] as List?)?.map((e) => e as Map<String, dynamic>).toList() ?? [],
      ));
    } catch (e) {
      emit(const DriverError(message: 'Gagal memuat data penghasilan.'));
    }
  }
}
