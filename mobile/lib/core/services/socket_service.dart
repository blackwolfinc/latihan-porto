import 'package:socket_io_client/socket_io_client.dart' as io;
import '../constants/app_constants.dart';
import 'storage_service.dart';

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  io.Socket? _socket;
  final StorageService _storage = StorageService();

  bool get isConnected => _socket?.connected ?? false;

  Future<void> connect() async {
    if (_socket != null && _socket!.connected) return;

    final token = await _storage.getAccessToken();

    _socket = io.io(
      AppConstants.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token ?? ''})
          .disableAutoConnect()
          .enableReconnection()
          .setReconnectionAttempts(5)
          .setReconnectionDelay(2000)
          .build(),
    );

    _socket!.connect();

    _socket!.onConnect((_) {});

    _socket!.onDisconnect((_) {});

    _socket!.onConnectError((error) {});

    _socket!.onError((error) {});
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
  }

  void emit(String event, [dynamic data]) {
    if (_socket != null && _socket!.connected) {
      _socket!.emit(event, data);
    }
  }

  void on(String event, Function(dynamic) callback) {
    _socket?.on(event, callback);
  }

  void off(String event, [Function(dynamic)? callback]) {
    _socket?.off(event, callback);
  }

  void emitGpsUpdate({
    required String bookingId,
    required double latitude,
    required double longitude,
    required double speed,
    required double heading,
  }) {
    emit('gps:update', {
      'bookingId': bookingId,
      'latitude': latitude,
      'longitude': longitude,
      'speed': speed,
      'heading': heading,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  void joinTrackingRoom(String bookingId) {
    emit('tracking:join', {'bookingId': bookingId});
  }

  void leaveTrackingRoom(String bookingId) {
    emit('tracking:leave', {'bookingId': bookingId});
  }
}
