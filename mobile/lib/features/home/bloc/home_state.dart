import 'package:equatable/equatable.dart';
import '../../../shared/models/car.dart';

abstract class HomeState extends Equatable {
  const HomeState();

  @override
  List<Object?> get props => [];
}

class HomeInitial extends HomeState {}

class HomeLoading extends HomeState {}

class HomeLoaded extends HomeState {
  final List<Car> featuredCars;
  final List<Car> nearbyCars;
  final String? selectedCategory;

  const HomeLoaded({
    required this.featuredCars,
    required this.nearbyCars,
    this.selectedCategory,
  });

  @override
  List<Object?> get props => [featuredCars, nearbyCars, selectedCategory];
}

class HomeError extends HomeState {
  final String message;

  const HomeError({required this.message});

  @override
  List<Object?> get props => [message];
}
