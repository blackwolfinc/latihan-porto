import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/utils/responsive.dart';
import '../bloc/driver_bloc.dart';
import '../bloc/driver_event.dart';
import '../bloc/driver_state.dart';

class DriverDashboardPage extends StatelessWidget {
  const DriverDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => DriverBloc(apiClient: ApiClient())..add(LoadDriverDashboard()),
      child: const _DriverDashboardView(),
    );
  }
}

class _DriverDashboardView extends StatelessWidget {
  const _DriverDashboardView();

  @override
  Widget build(BuildContext context) {
    final isTabletDevice = isTablet(context);
    final hPadding = responsiveHorizontalPadding(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard Driver'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => context.push('/notifications'),
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
                padding: EdgeInsets.all(hPadding),
                child: ResponsiveContainer(
                  maxWidth: 900,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Availability toggle
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(AppSizes.paddingMD),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Status Ketersediaan',
                                    style: TextStyle(fontWeight: FontWeight.w600),
                                  ),
                                  Text(
                                    state.isAvailable ? 'Tersedia' : 'Tidak Tersedia',
                                    style: TextStyle(
                                      color: state.isAvailable ? AppColors.success : AppColors.error,
                                      fontSize: 13,
                                    ),
                                  ),
                                ],
                              ),
                              Switch(
                                value: state.isAvailable,
                                onChanged: (value) {
                                  context.read<DriverBloc>().add(ToggleAvailability(isAvailable: value));
                                },
                                activeColor: AppColors.success,
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Stats row
                      Row(
                        children: [
                          _buildStatCard(context, 'Trip Hari Ini', '${state.tripsToday}', Icons.today, AppColors.primary),
                          const SizedBox(width: 8),
                          _buildStatCard(context, 'Total Trip', '${state.totalTrips}', Icons.directions_car, AppColors.secondary),
                          const SizedBox(width: 8),
                          _buildStatCard(context, 'Rating', state.rating.toStringAsFixed(1), Icons.star, Colors.amber),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Tablet: side-by-side layout for active trip + upcoming
                      if (isTabletDevice)
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (state.activeTrip != null) ...[
                                    Text(
                                      'Trip Aktif',
                                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                            fontWeight: FontWeight.bold,
                                          ),
                                    ),
                                    const SizedBox(height: 8),
                                    _buildActiveTripCard(context, state),
                                    const SizedBox(height: 20),
                                  ],
                                  Text(
                                    'Aksi Cepat',
                                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                          fontWeight: FontWeight.bold,
                                        ),
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: _buildQuickAction(
                                          context, Icons.local_gas_station, 'Log BBM',
                                          AppColors.secondary, () => context.push('/driver/fuel-log'),
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: _buildQuickAction(
                                          context, Icons.account_balance_wallet, 'Pendapatan',
                                          AppColors.success, () => context.push('/driver/earnings'),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (state.upcomingTrips.isNotEmpty) ...[
                                    Text(
                                      'Trip Mendatang',
                                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                            fontWeight: FontWeight.bold,
                                          ),
                                    ),
                                    const SizedBox(height: 8),
                                    ...state.upcomingTrips.map((trip) => Card(
                                          child: ListTile(
                                            leading: CircleAvatar(
                                              backgroundColor: AppColors.primaryLight,
                                              child: const Icon(Icons.person, color: Colors.white, size: 20),
                                            ),
                                            title: Text(trip.user?.name ?? 'Pelanggan'),
                                            subtitle: Text(
                                              '${DateFormat('dd MMM').format(trip.startDate)} - ${trip.pickupLocation}',
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            trailing: const Icon(Icons.chevron_right),
                                            onTap: () => context.push('/driver/trip/${trip.id}'),
                                          ),
                                        )),
                                  ],
                                ],
                              ),
                            ),
                          ],
                        )
                      else ...[
                        // Mobile: vertical layout
                        if (state.activeTrip != null) ...[
                          Text(
                            'Trip Aktif',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                          const SizedBox(height: 8),
                          _buildActiveTripCard(context, state),
                          const SizedBox(height: 20),
                        ],

                        if (state.upcomingTrips.isNotEmpty) ...[
                          Text(
                            'Trip Mendatang',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                          const SizedBox(height: 8),
                          ...state.upcomingTrips.map((trip) => Card(
                                child: ListTile(
                                  leading: CircleAvatar(
                                    backgroundColor: AppColors.primaryLight,
                                    child: const Icon(Icons.person, color: Colors.white, size: 20),
                                  ),
                                  title: Text(trip.user?.name ?? 'Pelanggan'),
                                  subtitle: Text(
                                    '${DateFormat('dd MMM').format(trip.startDate)} - ${trip.pickupLocation}',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  trailing: const Icon(Icons.chevron_right),
                                  onTap: () => context.push('/driver/trip/${trip.id}'),
                                ),
                              )),
                          const SizedBox(height: 20),
                        ],

                        Text(
                          'Aksi Cepat',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Expanded(
                              child: _buildQuickAction(
                                context, Icons.local_gas_station, 'Log BBM',
                                AppColors.secondary, () => context.push('/driver/fuel-log'),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _buildQuickAction(
                                context, Icons.account_balance_wallet, 'Pendapatan',
                                AppColors.success, () => context.push('/driver/earnings'),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            );
          }
          if (state is DriverError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.grey),
                  const SizedBox(height: 8),
                  Text(state.message),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => context.read<DriverBloc>().add(LoadDriverDashboard()),
                    child: const Text('Coba Lagi'),
                  ),
                ],
              ),
            );
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }

  Widget _buildActiveTripCard(BuildContext context, DriverDashboardLoaded state) {
    return Card(
      color: AppColors.primary.withOpacity(0.05),
      child: InkWell(
        onTap: () => context.push('/driver/trip/${state.activeTrip!.id}'),
        borderRadius: BorderRadius.circular(AppSizes.radiusLG),
        child: Padding(
          padding: const EdgeInsets.all(AppSizes.paddingMD),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.person, color: AppColors.primary),
                  const SizedBox(width: 8),
                  Text(
                    state.activeTrip!.user?.name ?? 'Pelanggan',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.directions_car, size: 16, color: AppColors.textSecondary),
                  const SizedBox(width: 8),
                  Text(state.activeTrip!.car?.name ?? 'Mobil'),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.location_on, size: 16, color: AppColors.textSecondary),
                  const SizedBox(width: 8),
                  Expanded(child: Text(state.activeTrip!.pickupLocation, maxLines: 1, overflow: TextOverflow.ellipsis)),
                ],
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => context.push('/driver/trip/${state.activeTrip!.id}'),
                  icon: const Icon(Icons.navigation),
                  label: const Text('Lihat Detail'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(BuildContext context, String label, String value, IconData icon, Color color) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            children: [
              Icon(icon, color: color, size: 28),
              const SizedBox(height: 8),
              Text(
                value,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              Text(
                label,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.textSecondary,
                    ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuickAction(BuildContext context, IconData icon, String label, Color color, VoidCallback onTap) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSizes.radiusLG),
        child: Padding(
          padding: const EdgeInsets.all(AppSizes.paddingMD),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color),
              ),
              const SizedBox(height: 8),
              Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
            ],
          ),
        ),
      ),
    );
  }
}
