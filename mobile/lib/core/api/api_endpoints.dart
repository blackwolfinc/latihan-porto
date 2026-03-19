class ApiEndpoints {
  ApiEndpoints._();

  static const String baseUrl = 'https://api.rentalku.com/api/v1';

  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String refreshToken = '/auth/refresh-token';
  static const String logout = '/auth/logout';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';

  // Users / Profile
  static const String profile = '/users/profile';
  static const String updateProfile = '/users/profile';
  static const String uploadAvatar = '/users/avatar';
  static const String changePassword = '/users/change-password';

  // Branches
  static const String branches = '/branches';
  static String branchById(String id) => '/branches/$id';

  // Cars
  static const String cars = '/cars';
  static String carById(String id) => '/cars/$id';
  static const String carCategories = '/cars/categories';
  static String carAvailability(String id) => '/cars/$id/availability';
  static String carReviews(String id) => '/cars/$id/reviews';

  // Bookings
  static const String bookings = '/bookings';
  static String bookingById(String id) => '/bookings/$id';
  static const String myBookings = '/bookings/my';
  static String cancelBooking(String id) => '/bookings/$id/cancel';
  static String completeBooking(String id) => '/bookings/$id/complete';

  // Payments
  static String createPayment(String bookingId) => '/payments/$bookingId';
  static String paymentStatus(String bookingId) => '/payments/$bookingId/status';
  static String midtransSnapUrl(String bookingId) => '/payments/$bookingId/snap-url';

  // Drivers
  static const String drivers = '/drivers';
  static String driverById(String id) => '/drivers/$id';
  static const String driverDashboard = '/drivers/dashboard';
  static const String driverAvailability = '/drivers/availability';
  static const String driverTrips = '/drivers/trips';
  static String driverTripById(String id) => '/drivers/trips/$id';
  static const String driverEarnings = '/drivers/earnings';

  // GPS Tracking
  static String gpsLogs(String bookingId) => '/gps/$bookingId/logs';
  static String latestGps(String bookingId) => '/gps/$bookingId/latest';

  // Fuel Logs
  static const String fuelLogs = '/fuel-logs';
  static String fuelLogById(String id) => '/fuel-logs/$id';

  // Inspections
  static String inspection(String bookingId) => '/inspections/$bookingId';
  static String createInspection(String bookingId) => '/inspections/$bookingId';

  // Reviews
  static String reviewByBooking(String bookingId) => '/reviews/$bookingId';
  static String createReview(String bookingId) => '/reviews/$bookingId';

  // Contracts
  static String contract(String bookingId) => '/contracts/$bookingId';
  static String signContract(String bookingId) => '/contracts/$bookingId/sign';

  // Maintenance
  static const String maintenanceRecords = '/maintenance';
  static String maintenanceById(String id) => '/maintenance/$id';

  // Notifications
  static const String notifications = '/notifications';
  static String markNotificationRead(String id) => '/notifications/$id/read';
  static const String markAllNotificationsRead = '/notifications/read-all';

  // Car Documents
  static String carDocuments(String carId) => '/cars/$carId/documents';

  // Verification
  static const String verificationSubmit = '/verification/submit';
  static const String verificationStatus = '/verification/status';
  static String verificationPreBookingCheck(String customerId) => '/verification/pre-booking-check/$customerId';
  static const String blacklistCheck = '/verification/blacklist/check';
}
