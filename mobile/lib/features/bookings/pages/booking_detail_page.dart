import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_constants.dart';
import '../../../shared/widgets/custom_app_bar.dart';
import '../../../shared/widgets/status_badge.dart';
import '../bloc/booking_bloc.dart';
import '../bloc/booking_event.dart';
import '../bloc/booking_state.dart';

class BookingDetailPage extends StatelessWidget {
  final String bookingId;

  const BookingDetailPage({super.key, required this.bookingId});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => BookingBloc(apiClient: ApiClient())..add(LoadBookingDetail(bookingId: bookingId)),
      child: Scaffold(
        appBar: const CustomAppBar(title: 'Detail Pemesanan'),
        body: BlocConsumer<BookingBloc, BookingState>(
          listener: (context, state) {
            if (state is BookingCancelled) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Pemesanan berhasil dibatalkan'), backgroundColor: AppColors.success),
              );
              context.pop();
            } else if (state is BookingError) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(state.message), backgroundColor: AppColors.error),
              );
            }
          },
          builder: (context, state) {
            if (state is BookingLoading) {
              return const Center(child: CircularProgressIndicator());
            }
            if (state is BookingDetailLoaded) {
              final booking = state.booking;
              final dateFormat = DateFormat('dd MMM yyyy HH:mm', 'id_ID');

              return SingleChildScrollView(
                padding: const EdgeInsets.all(AppSizes.paddingMD),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Status Timeline
                    Container(
                      padding: const EdgeInsets.all(AppSizes.paddingMD),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(AppSizes.radiusMD),
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2))],
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Status', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                              StatusBadge(label: BookingStatus.label(booking.status), color: BookingStatus.color(booking.status)),
                            ],
                          ),
                          const SizedBox(height: 16),
                          _buildTimeline(booking.status),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Car Info
                    Container(
                      padding: const EdgeInsets.all(AppSizes.paddingMD),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(AppSizes.radiusMD),
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2))],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Informasi Mobil', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                          const Divider(height: 20),
                          if (booking.car != null) ...[
                            _buildInfoRow('Mobil', booking.car!.fullName),
                            _buildInfoRow('Kategori', booking.car!.category),
                            _buildInfoRow('Plat Nomor', booking.car!.plateNumber),
                          ] else
                            _buildInfoRow('Mobil ID', booking.carId),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Booking Details
                    Container(
                      padding: const EdgeInsets.all(AppSizes.paddingMD),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(AppSizes.radiusMD),
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2))],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Detail Pemesanan', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                          const Divider(height: 20),
                          _buildInfoRow('Tanggal Mulai', dateFormat.format(booking.startDate)),
                          _buildInfoRow('Tanggal Selesai', dateFormat.format(booking.endDate)),
                          _buildInfoRow('Durasi', '${booking.totalDays} hari'),
                          _buildInfoRow('Pengambilan', booking.pickupLocation),
                          _buildInfoRow('Pengembalian', booking.dropoffLocation),
                          _buildInfoRow('Dengan Sopir', booking.withDriver ? 'Ya' : 'Tidak'),
                          if (booking.notes != null && booking.notes!.isNotEmpty) _buildInfoRow('Catatan', booking.notes!),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Driver Info
                    if (booking.driver != null) ...[
                      Container(
                        padding: const EdgeInsets.all(AppSizes.paddingMD),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(AppSizes.radiusMD),
                          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2))],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Informasi Sopir', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                            const Divider(height: 20),
                            Row(
                              children: [
                                CircleAvatar(
                                  radius: 24,
                                  backgroundColor: AppColors.primaryLight,
                                  child: Text(
                                    (booking.driver!.user?.name ?? 'D')[0],
                                    style: const TextStyle(color: Colors.white, fontSize: 20),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(booking.driver!.user?.name ?? 'Sopir', style: const TextStyle(fontWeight: FontWeight.bold)),
                                    Row(
                                      children: [
                                        const Icon(Icons.star, color: Colors.amber, size: 16),
                                        const SizedBox(width: 4),
                                        Text('${booking.driver!.rating}'),
                                      ],
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Payment Info
                    Container(
                      padding: const EdgeInsets.all(AppSizes.paddingMD),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(AppSizes.radiusMD),
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2))],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Pembayaran', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                          const Divider(height: 20),
                          _buildInfoRow('Total', 'Rp ${_formatCurrency(booking.totalAmount)}'),
                          if (booking.driverFee != null) _buildInfoRow('Biaya Sopir', 'Rp ${_formatCurrency(booking.driverFee!)}'),
                          _buildInfoRow('Status Pembayaran', PaymentStatus.label(booking.paymentStatus)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Action buttons
                    _buildActionButtons(context, booking),
                    const SizedBox(height: 32),
                  ],
                ),
              );
            }
            if (state is BookingError) {
              return Center(child: Text(state.message));
            }
            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }

  Widget _buildTimeline(String status) {
    final steps = ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED'];
    final currentIndex = steps.indexOf(status);

    return Row(
      children: List.generate(steps.length * 2 - 1, (index) {
        if (index.isOdd) {
          final stepIndex = index ~/ 2;
          return Expanded(
            child: Container(
              height: 3,
              color: stepIndex < currentIndex ? AppColors.success : AppColors.divider,
            ),
          );
        }
        final stepIndex = index ~/ 2;
        final isCompleted = stepIndex <= currentIndex;
        final isCurrent = stepIndex == currentIndex;
        return Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isCompleted ? AppColors.success : AppColors.divider,
            border: isCurrent ? Border.all(color: AppColors.success, width: 3) : null,
          ),
          child: isCompleted
              ? const Icon(Icons.check, color: Colors.white, size: 16)
              : Center(child: Text('${stepIndex + 1}', style: const TextStyle(fontSize: 12, color: Colors.grey))),
        );
      }),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
          const SizedBox(width: 16),
          Flexible(
            child: Text(value, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13), textAlign: TextAlign.end),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context, dynamic booking) {
    final buttons = <Widget>[];

    if (booking.status == 'PENDING' && booking.paymentStatus == 'PENDING') {
      buttons.add(
        ElevatedButton.icon(
          onPressed: () => context.push('/payment/${booking.id}'),
          icon: const Icon(Icons.payment),
          label: const Text('Bayar Sekarang'),
        ),
      );
    }

    if (booking.status == 'PENDING' || booking.status == 'CONFIRMED') {
      buttons.add(
        OutlinedButton.icon(
          onPressed: () => _showCancelDialog(context),
          icon: const Icon(Icons.cancel_outlined, color: AppColors.error),
          label: const Text('Batalkan', style: TextStyle(color: AppColors.error)),
          style: OutlinedButton.styleFrom(side: const BorderSide(color: AppColors.error)),
        ),
      );
    }

    if (booking.status == 'ACTIVE') {
      buttons.addAll([
        ElevatedButton.icon(
          onPressed: () => context.push('/tracking/${booking.id}'),
          icon: const Icon(Icons.location_on),
          label: const Text('Lacak Posisi'),
        ),
        OutlinedButton.icon(
          onPressed: () => context.push('/inspection/${booking.id}'),
          icon: const Icon(Icons.checklist),
          label: const Text('Inspeksi'),
        ),
      ]);
    }

    if (booking.status == 'COMPLETED') {
      buttons.addAll([
        ElevatedButton.icon(
          onPressed: () => context.push('/review/${booking.id}'),
          icon: const Icon(Icons.star),
          label: const Text('Beri Ulasan'),
        ),
        OutlinedButton.icon(
          onPressed: () => context.push('/contract/${booking.id}'),
          icon: const Icon(Icons.description),
          label: const Text('Lihat Kontrak'),
        ),
      ]);
    }

    if (buttons.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: buttons.map((btn) => Padding(padding: const EdgeInsets.only(bottom: 8), child: btn)).toList(),
    );
  }

  void _showCancelDialog(BuildContext context) {
    final reasonController = TextEditingController();
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Batalkan Pemesanan'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Apakah Anda yakin ingin membatalkan pemesanan ini?'),
            const SizedBox(height: 16),
            TextField(
              controller: reasonController,
              decoration: const InputDecoration(
                hintText: 'Alasan pembatalan (opsional)',
                border: OutlineInputBorder(),
              ),
              maxLines: 2,
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('Tidak')),
          TextButton(
            onPressed: () {
              Navigator.pop(dialogContext);
              context.read<BookingBloc>().add(CancelBooking(
                    bookingId: bookingId,
                    reason: reasonController.text.isNotEmpty ? reasonController.text : null,
                  ));
            },
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('Ya, Batalkan'),
          ),
        ],
      ),
    );
  }

  String _formatCurrency(double amount) {
    final parts = amount.toStringAsFixed(0).split('');
    final buffer = StringBuffer();
    for (int i = 0; i < parts.length; i++) {
      if (i > 0 && (parts.length - i) % 3 == 0) buffer.write('.');
      buffer.write(parts[i]);
    }
    return buffer.toString();
  }
}
