import 'package:equatable/equatable.dart';

abstract class CarEvent extends Equatable {
  const CarEvent();

  @override
  List<Object?> get props => [];
}

class LoadCars extends CarEvent {
  final String? search;
  final String? category;
  final String? sortBy;
  final int page;
  final int limit;

  const LoadCars({
    this.search,
    this.category,
    this.sortBy,
    this.page = 1,
    this.limit = 10,
  });

  @override
  List<Object?> get props => [search, category, sortBy, page, limit];
}

class LoadCarDetail extends CarEvent {
  final String carId;

  const LoadCarDetail({required this.carId});

  @override
  List<Object?> get props => [carId];
}

class LoadCarReviews extends CarEvent {
  final String carId;

  const LoadCarReviews({required this.carId});

  @override
  List<Object?> get props => [carId];
}

class CheckCarAvailability extends CarEvent {
  final String carId;
  final DateTime startDate;
  final DateTime endDate;

  const CheckCarAvailability({
    required this.carId,
    required this.startDate,
    required this.endDate,
  });

  @override
  List<Object?> get props => [carId, startDate, endDate];
}
