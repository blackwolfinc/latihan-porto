import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/services/location_service.dart';
import '../../../core/services/socket_service.dart';
import '../../../shared/models/gps_log.dart';
import 'gps_event.dart';
import 'gps_state.dart';

class GpsBloc extends Bloc<GpsEvent, GpsState> {
  final ApiClient apiClient;
  final LocationService _locationService = LocationService();
  final SocketService _socketService = SocketService();
  StreamSubscription<Position>? _positionSubscription;
  String? _currentBookingId;

  GpsBloc({required this.apiClient}) : super(GpsInitial()) {
    on<StartTracking>(_onStartTracking);
    on<StopTracking>(_onStopTracking);
    on<UpdatePosition>(_onUpdatePosition);
    on<LoadTrackingHistory>(_onLoadTrackingHistory);
  }

  Future<void> _onStartTracking(StartTracking event, Emitter<GpsState> emit) async {
    emit(GpsLoading());
    try {
      final hasPermission = await _locationService.requestPermission();
      if (!hasPermission) {
        emit(const GpsError(message: 'Izin lokasi diperlukan untuk melacak posisi.'));
        return;
      }

      _currentBookingId = event.bookingId;

      await _socketService.connect();
      _socketService.joinTrackingRoom(event.bookingId);

      final position = await _locationService.getCurrentPosition();
      if (position != null) {
        emit(GpsTracking(
          latitude: position.latitude,
          longitude: position.longitude,
          speed: position.speed,
          heading: position.heading,
        ));
      }

      _positionSubscription = _locationService.getPositionStream().listen((position) {
        add(UpdatePosition(
          latitude: position.latitude,
          longitude: position.longitude,
          speed: position.speed,
          heading: position.heading,
        ));
      });

      // Load history
      add(LoadTrackingHistory(bookingId: event.bookingId));
    } catch (e) {
      emit(const GpsError(message: 'Gagal memulai pelacakan GPS.'));
    }
  }

  Future<void> _onStopTracking(StopTracking event, Emitter<GpsState> emit) async {
    _positionSubscription?.cancel();
    _positionSubscription = null;

    if (_currentBookingId != null) {
      _socketService.leaveTrackingRoom(_currentBookingId!);
    }
    _socketService.disconnect();
    _currentBookingId = null;

    emit(GpsStopped());
  }

  Future<void> _onUpdatePosition(UpdatePosition event, Emitter<GpsState> emit) async {
    if (_currentBookingId != null) {
      _socketService.emitGpsUpdate(
        bookingId: _currentBookingId!,
        latitude: event.latitude,
        longitude: event.longitude,
        speed: event.speed ?? 0,
        heading: event.heading ?? 0,
      );
    }

    final currentState = state;
    if (currentState is GpsTracking) {
      emit(currentState.copyWith(
        latitude: event.latitude,
        longitude: event.longitude,
        speed: event.speed,
        heading: event.heading,
      ));
    } else {
      emit(GpsTracking(
        latitude: event.latitude,
        longitude: event.longitude,
        speed: event.speed,
        heading: event.heading,
      ));
    }
  }

  Future<void> _onLoadTrackingHistory(LoadTrackingHistory event, Emitter<GpsState> emit) async {
    try {
      final response = await apiClient.get(ApiEndpoints.gpsLogs(event.bookingId));
      final logs = (response.data['data'] as List)
          .map((json) => GpsLog.fromJson(json as Map<String, dynamic>))
          .toList();

      final currentState = state;
      if (currentState is GpsTracking) {
        emit(currentState.copyWith(history: logs));
      }
    } catch (_) {
      // Silently fail for history
    }
  }

  @override
  Future<void> close() {
    _positionSubscription?.cancel();
    _socketService.disconnect();
    return super.close();
  }
}
