class AppTranslations {
  static const Map<String, Map<String, String>> translations = {
    // Navigation
    'home': {'id': 'Beranda', 'en': 'Home', 'zh': '首页'},
    'bookings': {'id': 'Booking', 'en': 'Bookings', 'zh': '预订'},
    'notifications': {'id': 'Notifikasi', 'en': 'Notifications', 'zh': '通知'},
    'profile': {'id': 'Profil', 'en': 'Profile', 'zh': '个人'},

    // Auth
    'login': {'id': 'Masuk', 'en': 'Sign In', 'zh': '登录'},
    'register': {'id': 'Daftar', 'en': 'Sign Up', 'zh': '注册'},
    'loginTitle': {'id': 'Masuk ke Akun Anda', 'en': 'Sign In to Your Account', 'zh': '登录您的账户'},
    'registerTitle': {'id': 'Buat Akun Baru', 'en': 'Create New Account', 'zh': '创建新账户'},
    'email': {'id': 'Email', 'en': 'Email', 'zh': '邮箱'},
    'password': {'id': 'Kata Sandi', 'en': 'Password', 'zh': '密码'},
    'confirmPassword': {'id': 'Konfirmasi Kata Sandi', 'en': 'Confirm Password', 'zh': '确认密码'},
    'fullName': {'id': 'Nama Lengkap', 'en': 'Full Name', 'zh': '全名'},
    'phone': {'id': 'No. Telepon', 'en': 'Phone Number', 'zh': '电话号码'},
    'rememberMe': {'id': 'Ingat Saya', 'en': 'Remember Me', 'zh': '记住我'},
    'forgotPassword': {'id': 'Lupa Kata Sandi?', 'en': 'Forgot Password?', 'zh': '忘记密码？'},
    'noAccount': {'id': 'Belum punya akun?', 'en': "Don't have an account?", 'zh': '没有账户？'},
    'haveAccount': {'id': 'Sudah punya akun?', 'en': 'Already have an account?', 'zh': '已有账户？'},

    // Cars
    'carList': {'id': 'Daftar Mobil', 'en': 'Car List', 'zh': '车辆列表'},
    'bookNow': {'id': 'Pesan Sekarang', 'en': 'Book Now', 'zh': '立即预订'},
    'perDay': {'id': '/hari', 'en': '/day', 'zh': '/天'},
    'category': {'id': 'Kategori', 'en': 'Category', 'zh': '类别'},
    'transmission': {'id': 'Transmisi', 'en': 'Transmission', 'zh': '变速箱'},
    'fuelType': {'id': 'Bahan Bakar', 'en': 'Fuel Type', 'zh': '燃料类型'},
    'seats': {'id': 'Kursi', 'en': 'Seats', 'zh': '座位'},
    'reviews': {'id': 'Ulasan', 'en': 'Reviews', 'zh': '评价'},
    'specifications': {'id': 'Spesifikasi', 'en': 'Specifications', 'zh': '规格'},

    // Bookings
    'createBooking': {'id': 'Buat Booking', 'en': 'Create Booking', 'zh': '创建预订'},
    'selectDate': {'id': 'Pilih Tanggal', 'en': 'Select Date', 'zh': '选择日期'},
    'startDate': {'id': 'Tanggal Mulai', 'en': 'Start Date', 'zh': '开始日期'},
    'endDate': {'id': 'Tanggal Selesai', 'en': 'End Date', 'zh': '结束日期'},
    'pickup': {'id': 'Lokasi Pengambilan', 'en': 'Pickup Location', 'zh': '取车地点'},
    'dropoff': {'id': 'Lokasi Pengembalian', 'en': 'Return Location', 'zh': '还车地点'},
    'withDriver': {'id': 'Dengan Driver', 'en': 'With Driver', 'zh': '含司机'},
    'selfDrive': {'id': 'Lepas Kunci', 'en': 'Self Drive', 'zh': '自驾'},
    'summary': {'id': 'Ringkasan', 'en': 'Summary', 'zh': '摘要'},
    'confirmAndPay': {'id': 'Konfirmasi & Bayar', 'en': 'Confirm & Pay', 'zh': '确认并支付'},
    'myBookings': {'id': 'Booking Saya', 'en': 'My Bookings', 'zh': '我的预订'},
    'active': {'id': 'Aktif', 'en': 'Active', 'zh': '进行中'},
    'upcoming': {'id': 'Mendatang', 'en': 'Upcoming', 'zh': '即将到来'},
    'completed': {'id': 'Selesai', 'en': 'Completed', 'zh': '已完成'},
    'cancelled': {'id': 'Dibatalkan', 'en': 'Cancelled', 'zh': '已取消'},

    // Payments
    'payment': {'id': 'Pembayaran', 'en': 'Payment', 'zh': '付款'},
    'payNow': {'id': 'Bayar Sekarang', 'en': 'Pay Now', 'zh': '立即支付'},
    'paymentSuccess': {'id': 'Pembayaran Berhasil', 'en': 'Payment Successful', 'zh': '支付成功'},
    'paymentPending': {'id': 'Menunggu Pembayaran', 'en': 'Payment Pending', 'zh': '等待支付'},
    'paymentFailed': {'id': 'Pembayaran Gagal', 'en': 'Payment Failed', 'zh': '支付失败'},

    // Driver
    'driverDashboard': {'id': 'Dashboard Driver', 'en': 'Driver Dashboard', 'zh': '司机面板'},
    'availableForTrip': {'id': 'Tersedia untuk Trip', 'en': 'Available for Trip', 'zh': '可接单'},
    'todayTrips': {'id': 'Trip Hari Ini', 'en': "Today's Trips", 'zh': '今日行程'},
    'totalTrips': {'id': 'Total Trip', 'en': 'Total Trips', 'zh': '总行程'},
    'earnings': {'id': 'Pendapatan', 'en': 'Earnings', 'zh': '收入'},
    'startTrip': {'id': 'Mulai Trip', 'en': 'Start Trip', 'zh': '开始行程'},
    'endTrip': {'id': 'Selesai Trip', 'en': 'End Trip', 'zh': '结束行程'},
    'fuelLog': {'id': 'Log BBM', 'en': 'Fuel Log', 'zh': '燃油记录'},

    // Inspection
    'inspection': {'id': 'Inspeksi Kendaraan', 'en': 'Vehicle Inspection', 'zh': '车辆检查'},
    'exterior': {'id': 'Eksterior', 'en': 'Exterior', 'zh': '外观'},
    'interior': {'id': 'Interior', 'en': 'Interior', 'zh': '内饰'},
    'engine': {'id': 'Mesin', 'en': 'Engine', 'zh': '发动机'},
    'good': {'id': 'Baik', 'en': 'Good', 'zh': '良好'},
    'fair': {'id': 'Cukup', 'en': 'Fair', 'zh': '一般'},
    'damaged': {'id': 'Rusak', 'en': 'Damaged', 'zh': '损坏'},

    // Profile
    'editProfile': {'id': 'Edit Profil', 'en': 'Edit Profile', 'zh': '编辑资料'},
    'myDocuments': {'id': 'Dokumen Saya', 'en': 'My Documents', 'zh': '我的文件'},
    'bookingHistory': {'id': 'Riwayat Booking', 'en': 'Booking History', 'zh': '预订历史'},
    'settings': {'id': 'Pengaturan', 'en': 'Settings', 'zh': '设置'},
    'help': {'id': 'Bantuan', 'en': 'Help', 'zh': '帮助'},
    'about': {'id': 'Tentang CaritaHub Rental', 'en': 'About CaritaHub Rental', 'zh': '关于CaritaHub Rental'},
    'logout': {'id': 'Keluar', 'en': 'Logout', 'zh': '退出'},
    'save': {'id': 'Simpan', 'en': 'Save', 'zh': '保存'},

    // Invoices
    'invoices': {'id': 'Invoice Saya', 'en': 'My Invoices', 'zh': '我的发票'},
    'invoiceDetail': {'id': 'Detail Invoice', 'en': 'Invoice Detail', 'zh': '发票详情'},
    'downloadPdf': {'id': 'Download PDF', 'en': 'Download PDF', 'zh': '下载PDF'},
    'share': {'id': 'Bagikan', 'en': 'Share', 'zh': '分享'},

    // Verification
    'verification': {'id': 'Verifikasi Identitas', 'en': 'Identity Verification', 'zh': '身份验证'},
    'uploadKtp': {'id': 'Upload Foto KTP', 'en': 'Upload ID Card Photo', 'zh': '上传身份证照片'},
    'uploadSim': {'id': 'Upload Foto SIM', 'en': 'Upload License Photo', 'zh': '上传驾照照片'},
    'uploadSelfie': {'id': 'Selfie dengan KTP', 'en': 'Selfie with ID Card', 'zh': '手持身份证自拍'},
    'submitVerification': {'id': 'Kirim untuk Verifikasi', 'en': 'Submit for Verification', 'zh': '提交验证'},

    // Common
    'search': {'id': 'Cari...', 'en': 'Search...', 'zh': '搜索...'},
    'all': {'id': 'Semua', 'en': 'All', 'zh': '全部'},
    'loading': {'id': 'Memuat...', 'en': 'Loading...', 'zh': '加载中...'},
    'noData': {'id': 'Tidak ada data', 'en': 'No data available', 'zh': '暂无数据'},
    'retry': {'id': 'Coba Lagi', 'en': 'Retry', 'zh': '重试'},
    'language': {'id': 'Bahasa', 'en': 'Language', 'zh': '语言'},
  };

  static String _currentLanguage = 'id';

  static void setLanguage(String lang) {
    _currentLanguage = lang;
  }

  static String get currentLanguage => _currentLanguage;

  static String tr(String key) {
    return translations[key]?[_currentLanguage] ?? translations[key]?['id'] ?? key;
  }
}

// Shorthand function
String tr(String key) => AppTranslations.tr(key);
