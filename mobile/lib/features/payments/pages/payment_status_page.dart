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
              _buildStatusIcon(),
              const SizedBox(height: 24),
              Text(
                _getTitle(),
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                _getSubtitle(),
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: AppColors.textSecondary,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),
              ElevatedButton(
                onPressed: () => context.go('/bookings/$bookingId'),
                child: const Text('Lihat Detail Pemesanan'),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () => context.go('/home'),
                child: const Text('Kembali ke Beranda'),
              ),
              if (status == 'failed') ...[
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () => context.go('/payment/$bookingId'),
                  child: const Text('Coba Bayar Lagi'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusIcon() {
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
          child: const Icon(Icons.access_time, color: Colors.white, size: 56),
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

  String _getTitle() {
    switch (status) {
      case 'success':
        return 'Pembayaran Berhasil!';
      case 'pending':
        return 'Menunggu Pembayaran';
      default:
        return 'Pembayaran Gagal';
    }
  }

  String _getSubtitle() {
    switch (status) {
      case 'success':
        return 'Pembayaran Anda telah berhasil diproses. Pemesanan Anda sudah dikonfirmasi.';
      case 'pending':
        return 'Silakan selesaikan pembayaran Anda sesuai instruksi yang diberikan.';
      default:
        return 'Pembayaran tidak berhasil diproses. Silakan coba lagi atau gunakan metode pembayaran lain.';
    }
  }
}
