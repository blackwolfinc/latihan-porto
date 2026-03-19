import 'dart:convert';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/services/storage_service.dart';
import '../../../shared/models/user.dart';
import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final ApiClient apiClient;
  final StorageService _storage = StorageService();

  AuthBloc({required this.apiClient}) : super(AuthInitial()) {
    on<CheckAuthStatus>(_onCheckAuthStatus);
    on<LoginRequested>(_onLoginRequested);
    on<RegisterRequested>(_onRegisterRequested);
    on<LogoutRequested>(_onLogoutRequested);
  }

  Future<void> _onCheckAuthStatus(CheckAuthStatus event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final token = await _storage.getAccessToken();
      if (token == null) {
        emit(AuthUnauthenticated());
        return;
      }

      final response = await apiClient.get(ApiEndpoints.profile);
      final user = User.fromJson(response.data['data']);
      emit(AuthAuthenticated(user: user));
    } catch (_) {
      await _storage.clearTokens();
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onLoginRequested(LoginRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final response = await apiClient.post(
        ApiEndpoints.login,
        data: {
          'email': event.email,
          'password': event.password,
        },
      );

      final data = response.data['data'];
      await _storage.saveAccessToken(data['accessToken']);
      await _storage.saveRefreshToken(data['refreshToken']);

      if (event.rememberMe) {
        await _storage.saveRememberMe(true);
      }

      final user = User.fromJson(data['user']);
      await _storage.saveUserData(jsonEncode(user.toJson()));

      emit(AuthAuthenticated(user: user));
    } catch (e) {
      emit(const AuthError(message: 'Email atau kata sandi salah. Silakan coba lagi.'));
    }
  }

  Future<void> _onRegisterRequested(RegisterRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      await apiClient.post(
        ApiEndpoints.register,
        data: {
          'name': event.name,
          'email': event.email,
          'phone': event.phone,
          'password': event.password,
        },
      );

      emit(const AuthRegistrationSuccess());
    } catch (e) {
      emit(const AuthError(message: 'Registrasi gagal. Email mungkin sudah terdaftar.'));
    }
  }

  Future<void> _onLogoutRequested(LogoutRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      await apiClient.post(ApiEndpoints.logout);
    } catch (_) {
      // Logout even if API call fails
    } finally {
      await _storage.clearAll();
      emit(AuthUnauthenticated());
    }
  }
}
