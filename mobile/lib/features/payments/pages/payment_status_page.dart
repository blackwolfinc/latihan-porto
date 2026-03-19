import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';

class PaymentStatusPage extends StatelessWidget {
  final String bookingId;
  final String status;

  const PaymentStatusPage({
    super.key,
    required this.bookingId,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSizes.paddingXL),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildIcon(),
              const SizedBox(height: 24),
              Text(
                _title,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                _subtitle,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.textSecondary,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),
              ..._buildActions(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildIcon() {
    switch (status) {
      case 'success':
        return Container(
          width: 100,
          height: 100,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.success,
          ),
          child: const Icon(Icons.check, color: Colors.white, size: 56),
        );
      case 'pending':
        return Container(
          width: 100,
          height: 100,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.warning,
          ),
          child: const Icon(Icons.schedule, color: Colors.white, size: 56),
        );
      default:
        return Container(
          width: 100,
          height: 100,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.error,
          ),
          child: const Icon(Icons.close, color: Colors.white, size: 56),
        );
    }
  }

  String get _title {
    switch (status) {
      case 'success':
        return 'Pembayaran Berhasil!';
      case 'pending':
        return 'Menunggu Pembayaran';
      default:
        return 'Pembayaran Gagal';
    }
  }

  String get _subtitle {
    switch (status) {
      case 'success':
        return 'Pembayaran Anda telah berhasil diproses. Pemesanan Anda telah dikonfirmasi.';
      case 'pending':
        return 'Silakan selesaikan pembayaran Anda sesuai instruksi yang diberikan. Pemesanan akan dikonfirmasi setelah pembayaran diterima.';
      default:
        return 'Pembayaran Anda gagal diproses. Silakan coba lagi atau gunakan metode pembayaran lain.';
    }
  }

  List<Widget> _buildActions(BuildContext context) {
    switch (status) {
      case 'success':
        return [
          ElevatedButton(
            onPressed: () => context.go('/bookings/$bookingId'),
            child: const Text('Lihat Pemesanan'),
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: () => context.go('/home'),
            child: const Text('Kembali ke Beranda'),
          ),
        ];
      case 'pending':
        return [
          ElevatedButton(
            onPressed: () => context.go('/bookings/$bookingId'),
            child: const Text('Lihat Detail Pemesanan'),
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: () => context.go('/home'),
            child: const Text('Kembali ke Beranda'),
          ),
        ];
      default:
        return [
          ElevatedButton(
            onPressed: () => context.go('/payment/$bookingId'),
            child: const Text('Coba Lagi'),
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: () => context.go('/home'),
            child: const Text('Kembali ke Beranda'),
          ),
        ];
    }
  }
}
