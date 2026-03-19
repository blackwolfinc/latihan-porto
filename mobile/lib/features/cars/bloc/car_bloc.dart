import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../shared/models/car.dart';
import '../../../shared/models/review.dart';
import 'car_event.dart';
import 'car_state.dart';

class CarBloc extends Bloc<CarEvent, CarState> {
  final ApiClient apiClient;

  CarBloc({required this.apiClient}) : super(CarInitial()) {
    on<LoadCars>(_onLoadCars);
    on<LoadCarDetail>(_onLoadCarDetail);
    on<LoadCarReviews>(_onLoadCarReviews);
    on<CheckCarAvailability>(_onCheckCarAvailability);
  }

  Future<void> _onLoadCars(LoadCars event, Emitter<CarState> emit) async {
    emit(CarLoading());
    try {
      final queryParams = <String, dynamic>{
        'page': event.page,
        'limit': event.limit,
      };
      if (event.search != null && event.search!.isNotEmpty) {
        queryParams['search'] = event.search;
      }
      if (event.category != null && event.category!.isNotEmpty) {
        queryParams['category'] = event.category;
      }
      if (event.sortBy != null) {
        queryParams['sortBy'] = event.sortBy;
      }

      final response = await apiClient.get(
        ApiEndpoints.cars,
        queryParameters: queryParams,
      );

      final data = response.data['data'];
      final cars = (data['cars'] as List)
          .map((json) => Car.fromJson(json as Map<String, dynamic>))
          .toList();
      final total = data['total'] as int? ?? cars.length;

      emit(CarLoaded(
        cars: cars,
        totalCount: total,
        hasMore: cars.length >= event.limit,
      ));
    } catch (e) {
      emit(const CarError(message: 'Gagal memuat daftar mobil. Silakan coba lagi.'));
    }
  }

  Future<void> _onLoadCarDetail(LoadCarDetail event, Emitter<CarState> emit) async {
    emit(CarLoading());
    try {
      final response = await apiClient.get(ApiEndpoints.carById(event.carId));
      final car = Car.fromJson(response.data['data'] as Map<String, dynamic>);

      List<Review> reviews = [];
      try {
        final reviewResponse = await apiClient.get(ApiEndpoints.carReviews(event.carId));
        reviews = (reviewResponse.data['data'] as List)
            .map((json) => Review.fromJson(json as Map<String, dynamic>))
            .toList();
      } catch (_) {
        // Reviews may not be available
      }

      emit(CarDetailLoaded(car: car, reviews: reviews));
    } catch (e) {
      emit(const CarError(message: 'Gagal memuat detail mobil.'));
    }
  }

  Future<void> _onLoadCarReviews(LoadCarReviews event, Emitter<CarState> emit) async {
    try {
      final response = await apiClient.get(ApiEndpoints.carReviews(event.carId));
      final reviews = (response.data['data'] as List)
          .map((json) => Review.fromJson(json as Map<String, dynamic>))
          .toList();

      if (state is CarDetailLoaded) {
        final currentState = state as CarDetailLoaded;
        emit(CarDetailLoaded(car: currentState.car, reviews: reviews));
      }
    } catch (_) {
      // Silently fail for reviews
    }
  }

  Future<void> _onCheckCarAvailability(CheckCarAvailability event, Emitter<CarState> emit) async {
    try {
      final response = await apiClient.get(
        ApiEndpoints.carAvailability(event.carId),
        queryParameters: {
          'startDate': event.startDate.toIso8601String(),
          'endDate': event.endDate.toIso8601String(),
        },
      );

      final isAvailable = response.data['data']['available'] as bool;
      emit(CarAvailabilityChecked(
        isAvailable: isAvailable,
        message: isAvailable ? 'Mobil tersedia' : 'Mobil tidak tersedia pada tanggal ini',
      ));
    } catch (e) {
      emit(const CarAvailabilityChecked(
        isAvailable: false,
        message: 'Gagal memeriksa ketersediaan.',
      ));
    }
  }
}
