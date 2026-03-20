import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/utils/responsive.dart';
import '../../../shared/models/booking.dart';
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
      create: (_) => BookingBloc(apiClient: ApiClient())
        ..add(LoadBookingDetail(bookingId: bookingId)),
      child: _BookingDetailView(bookingId: bookingId),
    );
  }
}

class _BookingDetailView extends StatelessWidget {
  final String bookingId;
  const _BookingDetailView({required this.bookingId});

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('dd MMM yyyy, HH:mm');
    final isTabletDevice = isTablet(context);

    return BlocConsumer<BookingBloc, BookingState>(
      listener: (context, state) {
        if (state is BookingCancelled) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Pemesanan berhasil dibatalkan'),
              backgroundColor: AppColors.success,
            ),
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
          return Scaffold(
            appBar: AppBar(title: const Text('Detail Pemesanan')),
            body: const Center(child: CircularProgressIndicator()),
          );
        }
        if (state is BookingDetailLoaded) {
          final booking = state.booking;
          return Scaffold(
            appBar: AppBar(title: const Text('Detail Pemesanan')),
            body: SingleChildScrollView(
              padding: responsivePadding(context),
              child: ResponsiveContainer(
                maxWidth: 900,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Status timeline
                    _buildStatusTimeline(context, booking.status),
                    const SizedBox(height: 20),

                    // Tablet: side-by-side layout for cards
                    if (isTabletDevice)
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              children: [
                                _buildCarInfoCard(context, booking),
                                const SizedBox(height: 12),
                                _buildDatesCard(context, booking, dateFormat),
                              ],
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              children: [
                                if (booking.withDriver) ...[
                                  _buildDriverCard(context, booking),
                                  const SizedBox(height: 12),
                                ],
                                _buildPaymentCard(context, booking),
                              ],
                            ),
                          ),
                        ],
                      )
                    else ...[
                      _buildCarInfoCard(context, booking),
                      const SizedBox(height: 12),
                      _buildDatesCard(context, booking, dateFormat),
                      const SizedBox(height: 12),
                      if (booking.withDriver) ...[
                        _buildDriverCard(context, booking),
                        const SizedBox(height: 12),
                      ],
                      _buildPaymentCard(context, booking),
                    ],
                    const SizedBox(height: 24),

                    // Action buttons
                    if (isTabletDevice)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: _buildActionButtons(context, booking.status, booking.id)
                            .map((w) => Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 6),
                                  child: w,
                                ))
                            .toList(),
                      )
                    else
                      ..._buildActionButtons(context, booking.status, booking.id),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          );
        }
        return Scaffold(
          appBar: AppBar(title: const Text('Detail Pemesanan')),
          body: const SizedBox.shrink(),
        );
      },
    );
  }

  Widget _buildCarInfoCard(BuildContext context, Booking booking) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSizes.paddingMD),
        child: Row(
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: AppColors.shimmerBase,
                borderRadius: BorderRadius.circular(AppSizes.radiusSM),
              ),
              child: const Icon(Icons.directions_car, color: Colors.grey),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    booking.car?.name ?? 'Mobil',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  if (booking.car != null)
                    Text(
                      '${booking.car!.category} - ${booking.car!.plateNumber}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.textSecondary,
                          ),
                    ),
                ],
              ),
            ),
            StatusBadge(
              label: BookingStatus.label(booking.status),
              color: BookingStatus.color(booking.status),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDatesCard(BuildContext context, Booking booking, DateFormat dateFormat) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSizes.paddingMD),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Tanggal & Lokasi',
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 12),
            _buildInfoRow(context, Icons.calendar_today, 'Mulai',
                dateFormat.format(booking.startDate)),
            const SizedBox(height: 8),
            _buildInfoRow(context, Icons.calendar_today, 'Selesai',
                dateFormat.format(booking.endDate)),
            const Divider(height: 20),
            _buildInfoRow(
                context, Icons.location_on, 'Penjemputan', booking.pickupLocation),
            const SizedBox(height: 8),
            _buildInfoRow(
                context, Icons.flag, 'Pengembalian', booking.dropoffLocation),
          ],
        ),
      ),
    );
  }

  Widget _buildDriverCard(BuildContext context, Booking booking) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSizes.paddingMD),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Informasi Sopir',
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: AppColors.primaryLight,
                  child: const Icon(Icons.person, color: Colors.white),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        booking.driver?.displayName ?? 'Menunggu penugasan',
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      if (booking.driver != null)
                        Row(
                          children: [
                            const Icon(Icons.star, color: Colors.amber, size: 16),
                            const SizedBox(width: 4),
                            Text(
                              booking.driver!.rating.toStringAsFixed(1),
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                          ],
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentCard(BuildContext context, Booking booking) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSizes.paddingMD),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Pembayaran',
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Status'),
                StatusBadge(
                  label: PaymentStatus.label(booking.paymentStatus),
                  color: PaymentStatus.color(booking.paymentStatus),
                ),
              ],
            ),
            const Divider(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Total'),
                Text(
                  booking.formattedTotalPrice,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusTimeline(BuildContext context, String currentStatus) {
    final statuses = [BookingStatus.pending, BookingStatus.confirmed, BookingStatus.active, BookingStatus.completed];
    final labels = ['Menunggu', 'Dikonfirmasi', 'Aktif', 'Selesai'];
    final currentIndex = statuses.indexOf(currentStatus);

    return Row(
      children: List.generate(statuses.length, (index) {
        final isCompleted = index <= currentIndex && currentStatus != BookingStatus.cancelled;
        final isCurrent = index == currentIndex;
        return Expanded(
          child: Column(
            children: [
              Row(
                children: [
                  if (index > 0)
                    Expanded(
                      child: Container(
                        height: 2,
                        color: isCompleted ? AppColors.primary : AppColors.divider,
                      ),
                    ),
                  Container(
                    width: isCurrent ? 28 : 20,
                    height: isCurrent ? 28 : 20,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isCompleted ? AppColors.primary : AppColors.divider,
                      border: isCurrent ? Border.all(color: AppColors.primary, width: 3) : null,
                    ),
                    child: isCompleted
                        ? const Icon(Icons.check, color: Colors.white, size: 14)
                        : null,
                  ),
                  if (index < statuses.length - 1)
                    Expanded(
                      child: Container(
                        height: 2,
                        color: index < currentIndex ? AppColors.primary : AppColors.divider,
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                labels[index],
                style: TextStyle(
                  fontSize: 10,
                  color: isCompleted ? AppColors.primary : AppColors.textSecondary,
                  fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildInfoRow(BuildContext context, IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: AppColors.textSecondary),
        const SizedBox(width: 10),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary)),
            Text(value, style: Theme.of(context).textTheme.bodyMedium),
          ],
        ),
      ],
    );
  }

  List<Widget> _buildActionButtons(BuildContext context, String status, String id) {
    switch (status) {
      case BookingStatus.pending:
        return [
          ElevatedButton.icon(
            onPressed: () => context.push('/payment/$id'),
            icon: const Icon(Icons.payment),
            label: const Text('Bayar Sekarang'),
          ),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: () => _showCancelDialog(context, id),
            icon: const Icon(Icons.cancel, color: AppColors.error),
            label: const Text('Batalkan', style: TextStyle(color: AppColors.error)),
            style: OutlinedButton.styleFrom(side: const BorderSide(color: AppColors.error)),
          ),
        ];
      case BookingStatus.confirmed:
        return [
          ElevatedButton.icon(
            onPressed: () => context.push('/contract/$id'),
            icon: const Icon(Icons.description),
            label: const Text('Lihat Kontrak'),
          ),
        ];
      case BookingStatus.active:
        return [
          ElevatedButton.icon(
            onPressed: () => context.push('/tracking/$id'),
            icon: const Icon(Icons.gps_fixed),
            label: const Text('Lihat GPS'),
          ),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: () => context.push('/inspection/$id'),
            icon: const Icon(Icons.checklist),
            label: const Text('Inspeksi'),
          ),
        ];
      case BookingStatus.completed:
        return [
          ElevatedButton.icon(
            onPressed: () => context.push('/review/$id'),
            icon: const Icon(Icons.rate_review),
            label: const Text('Beri Review'),
          ),
        ];
      default:
        return [];
    }
  }

  void _showCancelDialog(BuildContext context, String id) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Batalkan Pemesanan?'),
        content: const Text('Apakah Anda yakin ingin membatalkan pemesanan ini?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Tidak'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(dialogContext);
              context.read<BookingBloc>().add(CancelBooking(bookingId: id));
            },
            child: const Text('Ya, Batalkan', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
  }
}
