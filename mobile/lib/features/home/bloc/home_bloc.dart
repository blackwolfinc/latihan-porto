import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../shared/models/car.dart';
import 'home_event.dart';
import 'home_state.dart';

class HomeBloc extends Bloc<HomeEvent, HomeState> {
  final ApiClient apiClient;

  HomeBloc({required this.apiClient}) : super(HomeInitial()) {
    on<LoadHome>(_onLoadHome);
    on<RefreshHome>(_onRefreshHome);
    on<SelectCategory>(_onSelectCategory);
  }

  Future<void> _onLoadHome(LoadHome event, Emitter<HomeState> emit) async {
    emit(HomeLoading());
    try {
      final response = await apiClient.get(
        ApiEndpoints.cars,
        queryParameters: {'page': 1, 'limit': 10, 'sortBy': 'rating'},
      );

      final data = response.data['data'];
      final cars = (data['cars'] as List)
          .map((json) => Car.fromJson(json as Map<String, dynamic>))
          .toList();

      final featured = cars.take(5).toList();
      final nearby = cars.skip(5).toList();

      emit(HomeLoaded(featuredCars: featured, nearbyCars: nearby));
    } catch (e) {
      emit(const HomeError(message: 'Gagal memuat data beranda. Silakan coba lagi.'));
    }
  }

  Future<void> _onRefreshHome(RefreshHome event, Emitter<HomeState> emit) async {
    add(LoadHome());
  }

  Future<void> _onSelectCategory(SelectCategory event, Emitter<HomeState> emit) async {
    try {
      final queryParams = <String, dynamic>{
        'page': 1,
        'limit': 10,
      };
      if (event.category != null) {
        queryParams['category'] = event.category;
      }

      final response = await apiClient.get(
        ApiEndpoints.cars,
        queryParameters: queryParams,
      );

      final data = response.data['data'];
      final cars = (data['cars'] as List)
          .map((json) => Car.fromJson(json as Map<String, dynamic>))
          .toList();

      emit(HomeLoaded(
        featuredCars: cars.take(5).toList(),
        nearbyCars: cars.skip(5).toList(),
        selectedCategory: event.category,
      ));
    } catch (e) {
      emit(const HomeError(message: 'Gagal memuat data.'));
    }
  }
}
