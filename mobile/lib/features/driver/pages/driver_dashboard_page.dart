import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_constants.dart';
import '../../../shared/widgets/custom_app_bar.dart';
import '../../../shared/widgets/empty_state.dart';
import '../bloc/driver_bloc.dart';
import '../bloc/driver_event.dart';
import '../bloc/driver_state.dart';

class DriverDashboardPage extends StatelessWidget {
  const DriverDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => DriverBloc(apiClient: ApiClient())..add(LoadDriverDashboard()),
      child: Scaffold(
        appBar: CustomAppBar(
          title: 'Dashboard Sopir',
          showBack: false,
          actions: [
            IconButton(
              icon: const Icon(Icons.notifications_outlined),
              onPressed: () => context.push('/notifications'),
            ),
            IconButton(
              icon: const Icon(Icons.person_outlined),
              onPressed: () => context.push('/profile'),
            ),
          ],
        ),
        body: BlocBuilder<DriverBloc, DriverState>(
          builder: (context, state) {
            if (state is DriverLoading) {
              return const Center(child: CircularProgressIndicator());
            }
            if (state is DriverDashboardLoaded) {
              return RefreshIndicator(
                onRefresh: () async {
                  context.read<DriverBloc>().add(LoadDriverDashboard());
                },
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(AppSizes.paddingMD),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Availability Toggle
                      Container(
                        padding: const EdgeInsets.all(AppSizes.paddingMD),
                        decoration: BoxDecoration(
                          color: state.isAvailable ? AppColors.success.withOpacity(0.1) : AppColors.error.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(AppSizes.radiusMD),
                          border: Border.all(
                            color: state.isAvailable ? AppColors.success.withOpacity(0.3) : AppColors.error.withOpacity(0.3),
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  state.isAvailable ? 'Anda Tersedia' : 'Anda Tidak Tersedia',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                    color: state.isAvailable ? AppColors.success : AppColors.error,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  state.isAvailable ? 'Siap menerima trip baru' : 'Tidak menerima trip baru',
                                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                                ),
                              ],
                            ),
                            Switch(
                              value: state.isAvailable,
                              onChanged: (value) {
                                context.read<DriverBloc>().add(ToggleDriverAvailability(isAvailable: value));
                              },
                              activeColor: AppColors.success,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Stats Grid
                      Row(
                        children: [
                          Expanded(child: _buildStatCard(context, Icons.drive_eta, '${state.totalTrips}', 'Total Trip')),
                          const SizedBox(width: 12),
                          Expanded(child: _buildStatCard(context, Icons.star, state.rating.toStringAsFixed(1), 'Rating')),
                          const SizedBox(width: 12),
                          Expanded(child: _buildStatCard(context, Icons.account_balance_wallet, _formatCurrency(state.todayEarnings), 'Hari Ini')),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Quick Actions
                      Text('Menu Cepat', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: _buildQuickAction(context, Icons.local_gas_station, 'Isi BBM', () => context.push('/driver/fuel-log')),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _buildQuickAction(context, Icons.attach_money, 'Penghasilan', () => context.push('/driver/earnings')),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Today's Trips
                      Text('Trip Hari Ini', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                      if (state.todayTrips.isEmpty)
                        Container(
                          padding: const EdgeInsets.all(32),
                          decoration: BoxDecoration(
                            color: AppColors.background,
                            borderRadius: BorderRadius.circular(AppSizes.radiusMD),
                          ),
                          child: const Center(
                            child: Column(
                              children: [
                                Icon(Icons.drive_eta_outlined, size: 48, color: Colors.grey),
                                SizedBox(height: 8),
                                Text('Belum ada trip hari ini', style: TextStyle(color: AppColors.textSecondary)),
                              ],
                            ),
                          ),
                        )
                      else
                        ...state.todayTrips.map((trip) => Card(
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: AppColors.primary,
                                  child: Text(
                                    (trip.user?.name ?? 'C')[0],
                                    style: const TextStyle(color: Colors.white),
                                  ),
                                ),
                                title: Text(trip.user?.name ?? 'Pelanggan', style: const TextStyle(fontWeight: FontWeight.w600)),
                                subtitle: Text(trip.pickupLocation, maxLines: 1, overflow: TextOverflow.ellipsis),
                                trailing: const Icon(Icons.chevron_right),
                                onTap: () => context.push('/driver/trip/${trip.id}'),
                              ),
                            )),
                    ],
                  ),
                ),
              );
            }
            if (state is DriverError) {
              return EmptyState(
                icon: Icons.error_outline,
                title: 'Terjadi Kesalahan',
                subtitle: state.message,
                buttonText: 'Coba Lagi',
                onButtonPressed: () => context.read<DriverBloc>().add(LoadDriverDashboard()),
              );
            }
            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }

  Widget _buildStatCard(BuildContext context, IconData icon, String value, String label) {
    return Container(
      padding: const EdgeInsets.all(AppSizes.paddingMD),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppSizes.radiusMD),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(
        children: [
          Icon(icon, color: AppColors.primary, size: 28),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
        ],
      ),
    );
  }

  Widget _buildQuickAction(BuildContext context, IconData icon, String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppSizes.radiusMD),
      child: Container(
        padding: const EdgeInsets.all(AppSizes.paddingMD),
        decoration: BoxDecoration(
          color: AppColors.primary.withOpacity(0.05),
          borderRadius: BorderRadius.circular(AppSizes.radiusMD),
          border: Border.all(color: AppColors.primary.withOpacity(0.2)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: AppColors.primary, size: 24),
            const SizedBox(width: 8),
            Text(label, style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
          ],
        ),
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
    return 'Rp $buffer';
  }
}
