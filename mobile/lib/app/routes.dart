import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../features/auth/pages/login_page.dart';
import '../features/auth/pages/register_page.dart';
import '../features/home/pages/home_page.dart';
import '../features/cars/pages/car_list_page.dart';
import '../features/cars/pages/car_detail_page.dart';
import '../features/bookings/pages/create_booking_page.dart';
import '../features/bookings/pages/booking_list_page.dart';
import '../features/bookings/pages/booking_detail_page.dart';
import '../features/payments/pages/payment_page.dart';
import '../features/payments/pages/payment_status_page.dart';
import '../features/driver/pages/driver_dashboard_page.dart';
import '../features/driver/pages/trip_detail_page.dart';
import '../features/driver/pages/fuel_log_page.dart';
import '../features/driver/pages/earnings_page.dart';
import '../features/gps_tracking/pages/live_tracking_page.dart';
import '../features/inspections/pages/inspection_form_page.dart';
import '../features/reviews/pages/review_form_page.dart';
import '../features/contracts/pages/contract_view_page.dart';
import '../features/invoices/pages/invoice_list_page.dart';
import '../features/invoices/pages/invoice_detail_page.dart';
import '../features/notifications/pages/notification_list_page.dart';
import '../features/profile/pages/profile_page.dart';
import '../features/profile/pages/edit_profile_page.dart';
import '../features/verification/pages/verification_page.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/login',
  routes: [
    GoRoute(
      path: '/login',
      name: 'login',
      builder: (context, state) => const LoginPage(),
    ),
    GoRoute(
      path: '/register',
      name: 'register',
      builder: (context, state) => const RegisterPage(),
    ),
    GoRoute(
      path: '/home',
      name: 'home',
      builder: (context, state) => const HomePage(),
    ),
    GoRoute(
      path: '/cars',
      name: 'cars',
      builder: (context, state) => const CarListPage(),
    ),
    GoRoute(
      path: '/cars/:id',
      name: 'carDetail',
      builder: (context, state) => CarDetailPage(
        carId: state.pathParameters['id']!,
      ),
    ),
    GoRoute(
      path: '/bookings',
      name: 'bookings',
      builder: (context, state) => const BookingListPage(),
    ),
    GoRoute(
      path: '/bookings/create',
      name: 'createBooking',
      builder: (context, state) {
        final carId = state.uri.queryParameters['carId'] ?? '';
        return CreateBookingPage(carId: carId);
      },
    ),
    GoRoute(
      path: '/bookings/:id',
      name: 'bookingDetail',
      builder: (context, state) => BookingDetailPage(
        bookingId: state.pathParameters['id']!,
      ),
    ),
    GoRoute(
      path: '/payment/:bookingId',
      name: 'payment',
      builder: (context, state) => PaymentPage(
        bookingId: state.pathParameters['bookingId']!,
      ),
    ),
    GoRoute(
      path: '/payment-status/:bookingId',
      name: 'paymentStatus',
      builder: (context, state) {
        final status = state.uri.queryParameters['status'] ?? 'pending';
        return PaymentStatusPage(
          bookingId: state.pathParameters['bookingId']!,
          status: status,
        );
      },
    ),
    GoRoute(
      path: '/my-bookings',
      name: 'myBookings',
      builder: (context, state) => const BookingListPage(),
    ),
    GoRoute(
      path: '/profile',
      name: 'profile',
      builder: (context, state) => const ProfilePage(),
    ),
    GoRoute(
      path: '/profile/edit',
      name: 'editProfile',
      builder: (context, state) => const EditProfilePage(),
    ),
    GoRoute(
      path: '/driver/dashboard',
      name: 'driverDashboard',
      builder: (context, state) => const DriverDashboardPage(),
    ),
    GoRoute(
      path: '/driver/trip/:id',
      name: 'tripDetail',
      builder: (context, state) => TripDetailPage(
        tripId: state.pathParameters['id']!,
      ),
    ),
    GoRoute(
      path: '/driver/fuel-log',
      name: 'fuelLog',
      builder: (context, state) => const FuelLogPage(),
    ),
    GoRoute(
      path: '/driver/earnings',
      name: 'earnings',
      builder: (context, state) => const EarningsPage(),
    ),
    GoRoute(
      path: '/tracking/:bookingId',
      name: 'liveTracking',
      builder: (context, state) => LiveTrackingPage(
        bookingId: state.pathParameters['bookingId']!,
      ),
    ),
    GoRoute(
      path: '/inspection/:bookingId',
      name: 'inspection',
      builder: (context, state) => InspectionFormPage(
        bookingId: state.pathParameters['bookingId']!,
      ),
    ),
    GoRoute(
      path: '/review/:bookingId',
      name: 'review',
      builder: (context, state) => ReviewFormPage(
        bookingId: state.pathParameters['bookingId']!,
      ),
    ),
    GoRoute(
      path: '/contract/:bookingId',
      name: 'contract',
      builder: (context, state) => ContractViewPage(
        bookingId: state.pathParameters['bookingId']!,
      ),
    ),
    GoRoute(
      path: '/invoices',
      name: 'invoices',
      builder: (context, state) => const InvoiceListPage(),
    ),
    GoRoute(
      path: '/invoices/:id',
      name: 'invoiceDetail',
      builder: (context, state) => InvoiceDetailPage(
        invoiceId: state.pathParameters['id']!,
      ),
    ),
    GoRoute(
      path: '/notifications',
      name: 'notifications',
      builder: (context, state) => const NotificationListPage(),
    ),
    GoRoute(
      path: '/verification',
      name: 'verification',
      builder: (context, state) => const VerificationPage(),
    ),
  ],
  errorBuilder: (context, state) => Scaffold(
    body: Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 64, color: Colors.red),
          const SizedBox(height: 16),
          Text(
            'Halaman tidak ditemukan',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: () => context.go('/home'),
            child: const Text('Kembali ke Beranda'),
          ),
        ],
      ),
    ),
  ),
);
