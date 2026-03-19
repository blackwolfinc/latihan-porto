import 'package:equatable/equatable.dart';

abstract class HomeEvent extends Equatable {
  const HomeEvent();

  @override
  List<Object?> get props => [];
}

class LoadHome extends HomeEvent {}

class RefreshHome extends HomeEvent {}

class SelectCategory extends HomeEvent {
  final String? category;

  const SelectCategory({this.category});

  @override
  List<Object?> get props => [category];
}
