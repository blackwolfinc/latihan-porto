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
  Timer? _durationTimer;
  Duration _elapsed = Duration.zero;
  String? _currentBookingId;
  final List<GpsLog> _trackingHistory = [];

  GpsBloc({required this.apiClient}) : super(GpsInitial()) {
    on<StartTracking>(_onStartTracking);
    on<StopTracking>(_onStopTracking);
    on<UpdateLocation>(_onUpdateLocation);
    on<LoadTrackingHistory>(_onLoadTrackingHistory);
  }

  Future<void> _onStartTracking(StartTracking event, Emitter<GpsState> emit) async {
    emit(GpsLoading());

    final hasPermission = await _locationService.requestPermission();
    if (!hasPermission) {
      emit(const GpsError(message: 'Izin lokasi diperlukan untuk melacak GPS.'));
      return;
    }

    _currentBookingId = event.bookingId;
    _elapsed = Duration.zero;
    _trackingHistory.clear();

    await _socketService.connect();
    _socketService.joinTrackingRoom(event.bookingId);

    final position = await _locationService.getCurrentPosition();
    if (position != null) {
      emit(TrackingActive(
        latitude: position.latitude,
        longitude: position.longitude,
        speed: position.speed,
        heading: position.heading,
      ));
    }

    _positionSubscription = _locationService.getPositionStream().listen((position) {
      add(UpdateLocation(
        latitude: position.latitude,
        longitude: position.longitude,
        speed: position.speed,
        heading: position.heading,
      ));
    });

    _durationTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      _elapsed += const Duration(seconds: 1);
    });
  }

  Future<void> _onStopTracking(StopTracking event, Emitter<GpsState> emit) async {
    _positionSubscription?.cancel();
    _positionSubscription = null;
    _durationTimer?.cancel();
    _durationTimer = null;

    if (_currentBookingId != null) {
      _socketService.leaveTrackingRoom(_currentBookingId!);
    }
    _socketService.disconnect();
    _currentBookingId = null;

    emit(TrackingInactive());
  }

  void _onUpdateLocation(UpdateLocation event, Emitter<GpsState> emit) {
    if (_currentBookingId != null) {
      _socketService.emitGpsUpdate(
        bookingId: _currentBookingId!,
        latitude: event.latitude,
        longitude: event.longitude,
        speed: event.speed,
        heading: event.heading,
      );
    }

    emit(TrackingActive(
      latitude: event.latitude,
      longitude: event.longitude,
      speed: event.speed,
      heading: event.heading,
      duration: _elapsed,
      trackingHistory: List.from(_trackingHistory),
    ));
  }

  Future<void> _onLoadTrackingHistory(LoadTrackingHistory event, Emitter<GpsState> emit) async {
    emit(GpsLoading());
    try {
      final response = await apiClient.get(ApiEndpoints.gpsLogs(event.bookingId));
      final logs = (response.data['data'] as List)
          .map((json) => GpsLog.fromJson(json as Map<String, dynamic>))
          .toList();

      emit(TrackingHistoryLoaded(logs: logs));
    } catch (e) {
      emit(const GpsError(message: 'Gagal memuat riwayat tracking.'));
    }
  }

  @override
  Future<void> close() {
    _positionSubscription?.cancel();
    _durationTimer?.cancel();
    _socketService.disconnect();
    return super.close();
  }
}
