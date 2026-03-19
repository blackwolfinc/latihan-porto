import 'package:equatable/equatable.dart';
import '../../../shared/models/car.dart';
import '../../../shared/models/review.dart';

abstract class CarState extends Equatable {
  const CarState();

  @override
  List<Object?> get props => [];
}

class CarInitial extends CarState {}

class CarLoading extends CarState {}

class CarLoaded extends CarState {
  final List<Car> cars;
  final int totalCount;
  final bool hasMore;

  const CarLoaded({
    required this.cars,
    this.totalCount = 0,
    this.hasMore = false,
  });

  @override
  List<Object?> get props => [cars, totalCount, hasMore];
}

class CarDetailLoaded extends CarState {
  final Car car;
  final List<Review> reviews;
  final bool isAvailable;

  const CarDetailLoaded({
    required this.car,
    this.reviews = const [],
    this.isAvailable = true,
  });

  @override
  List<Object?> get props => [car, reviews, isAvailable];
}

class CarError extends CarState {
  final String message;

  const CarError({required this.message});

  @override
  List<Object?> get props => [message];
}

class CarAvailabilityChecked extends CarState {
  final bool isAvailable;
  final String? message;

  const CarAvailabilityChecked({
    required this.isAvailable,
    this.message,
  });

  @override
  List<Object?> get props => [isAvailable, message];
}
