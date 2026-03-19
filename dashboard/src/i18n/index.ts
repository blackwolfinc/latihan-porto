type Language = 'id' | 'en' | 'zh';

interface Translations {
  [key: string]: { id: string; en: string; zh: string };
}

export const translations: Translations = {
  // Navigation
  'nav.operational': { id: 'Operasional', en: 'Operations', zh: '运营管理' },
  'nav.dashboard': { id: 'Laporan & Analisa', en: 'Reports & Analytics', zh: '报告与分析' },
  'nav.cars': { id: 'Mobil', en: 'Cars', zh: '车辆' },
  'nav.bookings': { id: 'Booking', en: 'Bookings', zh: '预订' },
  'nav.scheduling': { id: 'Penjadwalan', en: 'Scheduling', zh: '排程' },
  'nav.drivers': { id: 'Driver', en: 'Drivers', zh: '司机' },
  'nav.customers': { id: 'Customer', en: 'Customers', zh: '客户' },
  'nav.payments': { id: 'Pembayaran', en: 'Payments', zh: '付款' },
  'nav.invoices': { id: 'Invoice', en: 'Invoices', zh: '发票' },
  'nav.maintenance': { id: 'Maintenance', en: 'Maintenance', zh: '维护' },
  'nav.fuel': { id: 'BBM & Biaya', en: 'Fuel & Expenses', zh: '燃油与费用' },
  'nav.gps': { id: 'GPS Tracking', en: 'GPS Tracking', zh: 'GPS追踪' },
  'nav.inspections': { id: 'Inspeksi', en: 'Inspections', zh: '检查' },
  'nav.contracts': { id: 'Kontrak', en: 'Contracts', zh: '合同' },
  'nav.reviews': { id: 'Review', en: 'Reviews', zh: '评价' },
  'nav.branches': { id: 'Cabang', en: 'Branches', zh: '分店' },
  'nav.reports': { id: 'Laporan', en: 'Reports', zh: '报告' },
  'nav.settings': { id: 'Pengaturan', en: 'Settings', zh: '设置' },
  'nav.verification': { id: 'Verifikasi', en: 'Verification', zh: '身份验证' },
  'nav.blacklist': { id: 'Blacklist', en: 'Blacklist', zh: '黑名单' },

  // Common
  'common.add': { id: 'Tambah', en: 'Add', zh: '添加' },
  'common.edit': { id: 'Edit', en: 'Edit', zh: '编辑' },
  'common.delete': { id: 'Hapus', en: 'Delete', zh: '删除' },
  'common.save': { id: 'Simpan', en: 'Save', zh: '保存' },
  'common.cancel': { id: 'Batal', en: 'Cancel', zh: '取消' },
  'common.search': { id: 'Cari...', en: 'Search...', zh: '搜索...' },
  'common.filter': { id: 'Filter', en: 'Filter', zh: '筛选' },
  'common.export': { id: 'Ekspor', en: 'Export', zh: '导出' },
  'common.print': { id: 'Cetak', en: 'Print', zh: '打印' },
  'common.back': { id: 'Kembali', en: 'Back', zh: '返回' },
  'common.next': { id: 'Selanjutnya', en: 'Next', zh: '下一步' },
  'common.confirm': { id: 'Konfirmasi', en: 'Confirm', zh: '确认' },
  'common.loading': { id: 'Memuat...', en: 'Loading...', zh: '加载中...' },
  'common.noData': { id: 'Tidak ada data', en: 'No data', zh: '暂无数据' },
  'common.actions': { id: 'Aksi', en: 'Actions', zh: '操作' },
  'common.status': { id: 'Status', en: 'Status', zh: '状态' },
  'common.date': { id: 'Tanggal', en: 'Date', zh: '日期' },
  'common.total': { id: 'Total', en: 'Total', zh: '合计' },
  'common.detail': { id: 'Detail', en: 'Detail', zh: '详情' },
  'common.all': { id: 'Semua', en: 'All', zh: '全部' },

  // Auth
  'auth.login': { id: 'Masuk', en: 'Sign In', zh: '登录' },
  'auth.register': { id: 'Daftar', en: 'Sign Up', zh: '注册' },
  'auth.logout': { id: 'Keluar', en: 'Logout', zh: '退出' },
  'auth.email': { id: 'Email', en: 'Email', zh: '邮箱' },
  'auth.password': { id: 'Kata Sandi', en: 'Password', zh: '密码' },
  'auth.rememberMe': { id: 'Ingat Saya', en: 'Remember Me', zh: '记住我' },
  'auth.forgotPassword': { id: 'Lupa Kata Sandi?', en: 'Forgot Password?', zh: '忘记密码？' },

  // Cars
  'cars.title': { id: 'Manajemen Mobil', en: 'Car Management', zh: '车辆管理' },
  'cars.addCar': { id: 'Tambah Mobil', en: 'Add Car', zh: '添加车辆' },
  'cars.plateNumber': { id: 'Plat Nomor', en: 'Plate Number', zh: '车牌号' },
  'cars.brand': { id: 'Merek', en: 'Brand', zh: '品牌' },
  'cars.model': { id: 'Model', en: 'Model', zh: '型号' },
  'cars.category': { id: 'Kategori', en: 'Category', zh: '类别' },
  'cars.dailyRate': { id: 'Tarif/Hari', en: 'Daily Rate', zh: '日租金' },
  'cars.available': { id: 'Tersedia', en: 'Available', zh: '可用' },
  'cars.rented': { id: 'Disewa', en: 'Rented', zh: '已租出' },
  'cars.maintenance': { id: 'Maintenance', en: 'Maintenance', zh: '维护中' },

  // Bookings
  'bookings.title': { id: 'Manajemen Booking', en: 'Booking Management', zh: '预订管理' },
  'bookings.create': { id: 'Buat Booking', en: 'Create Booking', zh: '创建预订' },
  'bookings.startDate': { id: 'Tanggal Mulai', en: 'Start Date', zh: '开始日期' },
  'bookings.endDate': { id: 'Tanggal Selesai', en: 'End Date', zh: '结束日期' },
  'bookings.pickup': { id: 'Lokasi Pengambilan', en: 'Pickup Location', zh: '取车地点' },
  'bookings.dropoff': { id: 'Lokasi Pengembalian', en: 'Return Location', zh: '还车地点' },
  'bookings.withDriver': { id: 'Dengan Driver', en: 'With Driver', zh: '含司机' },
  'bookings.selfDrive': { id: 'Lepas Kunci', en: 'Self Drive', zh: '自驾' },
  'bookings.pending': { id: 'Menunggu', en: 'Pending', zh: '待处理' },
  'bookings.confirmed': { id: 'Dikonfirmasi', en: 'Confirmed', zh: '已确认' },
  'bookings.active': { id: 'Aktif', en: 'Active', zh: '进行中' },
  'bookings.completed': { id: 'Selesai', en: 'Completed', zh: '已完成' },
  'bookings.cancelled': { id: 'Dibatalkan', en: 'Cancelled', zh: '已取消' },

  // Drivers
  'drivers.title': { id: 'Manajemen Driver', en: 'Driver Management', zh: '司机管理' },
  'drivers.addDriver': { id: 'Tambah Driver', en: 'Add Driver', zh: '添加司机' },
  'drivers.available': { id: 'Tersedia', en: 'Available', zh: '可用' },
  'drivers.onTrip': { id: 'Dalam Perjalanan', en: 'On Trip', zh: '行程中' },
  'drivers.offDuty': { id: 'Tidak Bertugas', en: 'Off Duty', zh: '休息中' },

  // Payments
  'payments.title': { id: 'Manajemen Pembayaran', en: 'Payment Management', zh: '付款管理' },
  'payments.paid': { id: 'Dibayar', en: 'Paid', zh: '已付款' },
  'payments.unpaid': { id: 'Belum Dibayar', en: 'Unpaid', zh: '未付款' },
  'payments.refund': { id: 'Refund', en: 'Refund', zh: '退款' },

  // Invoices
  'invoices.title': { id: 'Manajemen Invoice', en: 'Invoice Management', zh: '发票管理' },
  'invoices.create': { id: 'Buat Invoice', en: 'Create Invoice', zh: '创建发票' },
  'invoices.send': { id: 'Kirim', en: 'Send', zh: '发送' },
  'invoices.markPaid': { id: 'Tandai Lunas', en: 'Mark as Paid', zh: '标记已付' },
  'invoices.downloadPdf': { id: 'Download PDF', en: 'Download PDF', zh: '下载PDF' },
  'invoices.draft': { id: 'Draft', en: 'Draft', zh: '草稿' },
  'invoices.sent': { id: 'Terkirim', en: 'Sent', zh: '已发送' },
  'invoices.overdue': { id: 'Jatuh Tempo', en: 'Overdue', zh: '逾期' },

  // Operational
  'ops.todayBookings': { id: 'Booking Hari Ini', en: "Today's Bookings", zh: '今日预订' },
  'ops.pickupsToday': { id: 'Pengambilan Hari Ini', en: "Today's Pickups", zh: '今日取车' },
  'ops.returnsToday': { id: 'Pengembalian Hari Ini', en: "Today's Returns", zh: '今日还车' },
  'ops.needAttention': { id: 'Perlu Perhatian', en: 'Needs Attention', zh: '需要关注' },
  'ops.todaySchedule': { id: 'Jadwal Hari Ini', en: "Today's Schedule", zh: '今日排程' },
  'ops.quickActions': { id: 'Aksi Cepat', en: 'Quick Actions', zh: '快捷操作' },
  'ops.fleetStatus': { id: 'Status Armada', en: 'Fleet Status', zh: '车队状态' },

  // Verification
  'verify.title': { id: 'Verifikasi Identitas', en: 'Identity Verification', zh: '身份验证' },
  'verify.ktpNumber': { id: 'Nomor KTP', en: 'ID Card Number', zh: '身份证号' },
  'verify.simNumber': { id: 'Nomor SIM', en: 'License Number', zh: '驾照号' },
  'verify.verified': { id: 'Terverifikasi', en: 'Verified', zh: '已验证' },
  'verify.rejected': { id: 'Ditolak', en: 'Rejected', zh: '已拒绝' },
  'verify.pendingReview': { id: 'Menunggu Review', en: 'Pending Review', zh: '待审核' },
  'verify.riskScore': { id: 'Skor Risiko', en: 'Risk Score', zh: '风险评分' },
  'verify.approve': { id: 'Setujui', en: 'Approve', zh: '批准' },
  'verify.reject': { id: 'Tolak', en: 'Reject', zh: '拒绝' },

  // Reports
  'reports.revenue': { id: 'Laporan Pendapatan', en: 'Revenue Report', zh: '收入报告' },
  'reports.fleet': { id: 'Laporan Armada', en: 'Fleet Report', zh: '车队报告' },
  'reports.expenses': { id: 'Laporan Pengeluaran', en: 'Expense Report', zh: '支出报告' },
};

let currentLanguage: Language = 'id';

export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
  localStorage.setItem('caritahub_lang', lang);
};

export const getLanguage = (): Language => {
  return (localStorage.getItem('caritahub_lang') as Language) || 'id';
};

export const t = (key: string): string => {
  const lang = getLanguage();
  return translations[key]?.[lang] || translations[key]?.['id'] || key;
};

export const LANGUAGES = [
  { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

export type { Language };
