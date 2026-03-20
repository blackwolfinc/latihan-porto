import 'package:flutter/material.dart';

class AppConstants {
  AppConstants._();

  // App Info
  static const String appName = 'Caritahub Rental';
  static const String appVersion = '1.0.0';

  // API
  static const String socketUrl = 'https://api.rentalku.com';
  static const int apiTimeout = 30000;

  // Storage Keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userDataKey = 'user_data';
  static const String rememberMeKey = 'remember_me';

  // Pagination
  static const int defaultPageSize = 10;
  static const int maxPageSize = 50;

  // Image
  static const double maxImageWidth = 1024;
  static const double maxImageHeight = 1024;
  static const int imageQuality = 80;

  // Map
  static const double defaultLatitude = -6.2088;
  static const double defaultLongitude = 106.8456;
  static const double defaultZoom = 14.0;

  // GPS
  static const int gpsUpdateIntervalMs = 5000;
  static const double gpsMinDistance = 10.0;

  // Booking
  static const int minBookingHours = 6;
  static const int maxBookingDays = 30;
}

class AppColors {
  AppColors._();

  static const Color primary = Color(0xFF1A56DB);
  static const Color primaryLight = Color(0xFF3B82F6);
  static const Color primaryDark = Color(0xFF1E40AF);
  static const Color secondary = Color(0xFFFF8F00);
  static const Color background = Color(0xFFF5F5F5);
  static const Color surface = Colors.white;
  static const Color error = Color(0xFFD32F2F);
  static const Color success = Color(0xFF388E3C);
  static const Color warning = Color(0xFFF57C00);
  static const Color info = Color(0xFF1976D2);
  static const Color textPrimary = Color(0xFF212121);
  static const Color textSecondary = Color(0xFF757575);
  static const Color divider = Color(0xFFEEEEEE);
  static const Color shimmerBase = Color(0xFFE0E0E0);
  static const Color shimmerHighlight = Color(0xFFF5F5F5);
}

class AppSizes {
  AppSizes._();

  static const double paddingXS = 4.0;
  static const double paddingSM = 8.0;
  static const double paddingMD = 16.0;
  static const double paddingLG = 24.0;
  static const double paddingXL = 32.0;

  static const double radiusSM = 8.0;
  static const double radiusMD = 12.0;
  static const double radiusLG = 16.0;
  static const double radiusXL = 24.0;
  static const double radiusFull = 100.0;

  static const double iconSM = 16.0;
  static const double iconMD = 24.0;
  static const double iconLG = 32.0;
  static const double iconXL = 48.0;

  static const double cardImageHeight = 180.0;
  static const double avatarSM = 32.0;
  static const double avatarMD = 48.0;
  static const double avatarLG = 80.0;
}

class CarCategory {
  static const String sedan = 'Sedan';
  static const String suv = 'SUV';
  static const String mpv = 'MPV';
  static const String hatchback = 'Hatchback';
  static const String pickup = 'Pickup';
  static const String van = 'Van';
  static const String luxury = 'Luxury';

  static List<String> get all => [sedan, suv, mpv, hatchback, pickup, van, luxury];
}

class BookingStatus {
  static const String pending = 'PENDING';
  static const String confirmed = 'CONFIRMED';
  static const String active = 'ACTIVE';
  static const String completed = 'COMPLETED';
  static const String cancelled = 'CANCELLED';
  static const String overdue = 'OVERDUE';

  static String label(String status) {
    switch (status) {
      case pending:
        return 'Menunggu';
      case confirmed:
        return 'Dikonfirmasi';
      case active:
        return 'Aktif';
      case completed:
        return 'Selesai';
      case cancelled:
        return 'Dibatalkan';
      case overdue:
        return 'Terlambat';
      default:
        return status;
    }
  }

  static Color color(String status) {
    switch (status) {
      case pending:
        return AppColors.warning;
      case confirmed:
        return AppColors.info;
      case active:
        return AppColors.success;
      case completed:
        return AppColors.primary;
      case cancelled:
        return AppColors.error;
      case overdue:
        return AppColors.error;
      default:
        return AppColors.textSecondary;
    }
  }
}

class PaymentStatus {
  static const String pending = 'PENDING';
  static const String paid = 'PAID';
  static const String failed = 'FAILED';
  static const String refunded = 'REFUNDED';
  static const String expired = 'EXPIRED';

  static String label(String status) {
    switch (status) {
      case pending:
        return 'Menunggu Pembayaran';
      case paid:
        return 'Lunas';
      case failed:
        return 'Gagal';
      case refunded:
        return 'Dikembalikan';
      case expired:
        return 'Kedaluwarsa';
      default:
        return status;
    }
  }

  static Color color(String status) {
    switch (status) {
      case paid:
        return AppColors.success;
      case pending:
        return AppColors.warning;
      case failed:
        return AppColors.error;
      case expired:
        return AppColors.textSecondary;
      case refunded:
        return AppColors.info;
      default:
        return AppColors.textSecondary;
    }
  }
}
