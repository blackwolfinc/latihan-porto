import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_constants.dart';
import '../../../shared/widgets/custom_app_bar.dart';
import '../../../shared/widgets/status_badge.dart';
import '../bloc/driver_bloc.dart';
import '../bloc/driver_event.dart';
import '../bloc/driver_state.dart';

class TripDetailPage extends StatelessWidget {
  final String tripId;

  const TripDetailPage({super.key, required this.tripId});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => DriverBloc(apiClient: ApiClient())..add(LoadTripDetail(tripId: tripId)),
      child: Scaffold(
        appBar: const CustomAppBar(title: 'Detail Perjalanan'),
        body: BlocConsumer<DriverBloc, DriverState>(
          listener: (context, state) {
            if (state is TripCompleted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Perjalanan selesai!'), backgroundColor: AppColors.success),
              );
              context.pop();
            } else if (state is DriverError) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(state.message), backgroundColor: AppColors.error),
              );
            }
          },
          builder: (context, state) {
            if (state is DriverLoading) {
              return const Center(child: CircularProgressIndicator());
            }
            if (state is TripDetailLoaded) {
              final trip = state.trip;
              final dateFormat = DateFormat('dd MMM yyyy HH:mm', 'id_ID');

              return SingleChildScrollView(
                padding: const EdgeInsets.all(AppSizes.paddingMD),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Customer Info
                    Container(
                      padding: const EdgeInsets.all(AppSizes.paddingMD),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(AppSizes.radiusMD),
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8)],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Informasi Pelanggan', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                              StatusBadge(label: BookingStatus.label(trip.status), color: BookingStatus.color(trip.status)),
                            ],
                          ),
                          const Divider(height: 20),
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 28,
                                backgroundColor: AppColors.primaryLight,
                                child: Text(
                                  (trip.user?.name ?? 'C')[0].toUpperCase(),
                                  style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(trip.user?.name ?? 'Pelanggan', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                    if (trip.user?.phone != null)
                                      Text(trip.user!.phone!, style: const TextStyle(color: AppColors.textSecondary)),
                                  ],
                                ),
                              ),
                              if (trip.user?.phone != null)
                                IconButton(
                                  icon: const Icon(Icons.phone, color: AppColors.success),
                                  onPressed: () {},
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Trip Details
                    Container(
                      padding: const EdgeInsets.all(AppSizes.paddingMD),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(AppSizes.radiusMD),
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8)],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Detail Trip', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                          const Divider(height: 20),
                          _buildDetailRow(Icons.calendar_today, 'Mulai', dateFormat.format(trip.startDate)),
                          _buildDetailRow(Icons.calendar_today, 'Selesai', dateFormat.format(trip.endDate)),
                          _buildDetailRow(Icons.location_on, 'Jemput', trip.pickupLocation),
                          _buildDetailRow(Icons.location_on, 'Antar', trip.dropoffLocation),
                          if (trip.car != null) ...[
                            _buildDetailRow(Icons.directions_car, 'Mobil', trip.car!.fullName),
                            _buildDetailRow(Icons.confirmation_number, 'Plat', trip.car!.plateNumber),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Action Buttons
                    if (trip.status == 'ACTIVE') ...[
                      ElevatedButton.icon(
                        onPressed: () => context.push('/tracking/${trip.id}'),
                        icon: const Icon(Icons.navigation),
                        label: const Text('Mulai Navigasi'),
                        style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 52)),
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton.icon(
                        onPressed: () => _showCompleteTripDialog(context),
                        icon: const Icon(Icons.check_circle),
                        label: const Text('Selesaikan Trip'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.success,
                          minimumSize: const Size(double.infinity, 52),
                        ),
                      ),
                      const SizedBox(height: 12),
                      OutlinedButton.icon(
                        onPressed: () => context.push('/inspection/${trip.id}'),
                        icon: const Icon(Icons.checklist),
                        label: const Text('Inspeksi Kendaraan'),
                        style: OutlinedButton.styleFrom(minimumSize: const Size(double.infinity, 52)),
                      ),
                    ],
                  ],
                ),
              );
            }
            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: AppColors.textSecondary),
          const SizedBox(width: 12),
          SizedBox(width: 70, child: Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13))),
          const SizedBox(width: 8),
          Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13))),
        ],
      ),
    );
  }

  void _showCompleteTripDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Selesaikan Trip'),
        content: const Text('Apakah Anda yakin ingin menyelesaikan perjalanan ini?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('Batal')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(dialogContext);
              context.read<DriverBloc>().add(CompleteTripEvent(tripId: tripId));
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.success),
            child: const Text('Ya, Selesaikan'),
          ),
        ],
      ),
    );
  }
}
