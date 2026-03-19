import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart' as launcher;
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_constants.dart';
import '../../../shared/widgets/status_badge.dart';
import '../bloc/driver_bloc.dart';
import '../bloc/driver_event.dart';
import '../bloc/driver_state.dart';

class TripDetailPage extends StatefulWidget {
  final String tripId;

  const TripDetailPage({super.key, required this.tripId});

  @override
  State<TripDetailPage> createState() => _TripDetailPageState();
}

class _TripDetailPageState extends State<TripDetailPage> {
  Timer? _timer;
  Duration _elapsed = Duration.zero;
  bool _isTripActive = false;

  @override
  void initState() {
    super.initState();
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() => _elapsed += const Duration(seconds: 1));
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _formatDuration(Duration d) {
    final hours = d.inHours.toString().padLeft(2, '0');
    final minutes = (d.inMinutes % 60).toString().padLeft(2, '0');
    final seconds = (d.inSeconds % 60).toString().padLeft(2, '0');
    return '$hours:$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('dd MMM yyyy, HH:mm');

    return BlocProvider(
      create: (_) => DriverBloc(apiClient: ApiClient())..add(LoadTripDetail(tripId: widget.tripId)),
      child: BlocConsumer<DriverBloc, DriverState>(
        listener: (context, state) {
          if (state is TripStarted) {
            setState(() => _isTripActive = true);
            _startTimer();
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Trip dimulai!'), backgroundColor: AppColors.success),
            );
            context.read<DriverBloc>().add(LoadTripDetail(tripId: widget.tripId));
          } else if (state is TripEnded) {
            _timer?.cancel();
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Trip selesai!'), backgroundColor: AppColors.success),
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
            return Scaffold(
              appBar: AppBar(title: const Text('Detail Trip')),
              body: const Center(child: CircularProgressIndicator()),
            );
          }
          if (state is DriverTripDetailLoaded) {
            final trip = state.trip;
            if (trip.status == 'ACTIVE' && !_isTripActive) {
              _isTripActive = true;
              WidgetsBinding.instance.addPostFrameCallback((_) => _startTimer());
            }
            return Scaffold(
              appBar: AppBar(title: const Text('Detail Trip')),
              body: SingleChildScrollView(
                padding: const EdgeInsets.all(AppSizes.paddingMD),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Customer info
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(AppSizes.paddingMD),
                        child: Row(
                          children: [
                            CircleAvatar(
                              radius: 28,
                              backgroundColor: AppColors.primaryLight,
                              child: const Icon(Icons.person, color: Colors.white, size: 28),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    trip.user?.name ?? 'Pelanggan',
                                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                          fontWeight: FontWeight.bold,
                                        ),
                                  ),
                                  if (trip.user?.phone != null)
                                    Text(
                                      trip.user!.phone!,
                                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                            color: AppColors.textSecondary,
                                          ),
                                    ),
                                ],
                              ),
                            ),
                            if (trip.user?.phone != null)
                              IconButton(
                                icon: const Icon(Icons.phone, color: AppColors.success),
                                onPressed: () {
                                  final uri = Uri(scheme: 'tel', path: trip.user!.phone);
                                  launcher.launchUrl(uri);
                                },
                              ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Locations
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(AppSizes.paddingMD),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 12,
                                  height: 12,
                                  decoration: const BoxDecoration(
                                    color: AppColors.success,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('Penjemputan', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                                      Text(trip.pickupLocation, style: const TextStyle(fontWeight: FontWeight.w500)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            Container(
                              margin: const EdgeInsets.only(left: 5),
                              height: 30,
                              width: 2,
                              color: AppColors.divider,
                            ),
                            Row(
                              children: [
                                Container(
                                  width: 12,
                                  height: 12,
                                  decoration: const BoxDecoration(
                                    color: AppColors.error,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('Pengembalian', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                                      Text(trip.dropoffLocation, style: const TextStyle(fontWeight: FontWeight.w500)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Car info
                    Card(
                      child: ListTile(
                        leading: Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: AppColors.shimmerBase,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.directions_car, color: Colors.grey),
                        ),
                        title: Text(trip.car?.name ?? 'Mobil'),
                        subtitle: Text(trip.car?.plateNumber ?? ''),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Dates
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(AppSizes.paddingMD),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Mulai'),
                                Text(dateFormat.format(trip.startDate)),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Selesai'),
                                Text(dateFormat.format(trip.endDate)),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Navigation button
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: () {
                          final uri = Uri.parse(
                            'https://www.google.com/maps/dir/?api=1&destination=${Uri.encodeComponent(trip.pickupLocation)}',
                          );
                          launcher.launchUrl(uri, mode: launcher.LaunchMode.externalApplication);
                        },
                        icon: const Icon(Icons.navigation),
                        label: const Text('Mulai Navigasi'),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Timer
                    if (_isTripActive)
                      Card(
                        color: AppColors.primary.withOpacity(0.05),
                        child: Padding(
                          padding: const EdgeInsets.all(AppSizes.paddingMD),
                          child: Column(
                            children: [
                              const Text('Durasi Trip', style: TextStyle(color: AppColors.textSecondary)),
                              const SizedBox(height: 4),
                              Text(
                                _formatDuration(_elapsed),
                                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.primary,
                                    ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    const SizedBox(height: 16),

                    // Action button
                    if (trip.status == 'CONFIRMED')
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            context.read<DriverBloc>().add(StartTrip(tripId: trip.id));
                          },
                          icon: const Icon(Icons.play_arrow),
                          label: const Text('Mulai Trip'),
                          style: ElevatedButton.styleFrom(backgroundColor: AppColors.success),
                        ),
                      ),
                    if (trip.status == 'ACTIVE')
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            showDialog(
                              context: context,
                              builder: (dlg) => AlertDialog(
                                title: const Text('Selesai Trip?'),
                                content: const Text('Apakah Anda yakin ingin mengakhiri trip ini?'),
                                actions: [
                                  TextButton(onPressed: () => Navigator.pop(dlg), child: const Text('Batal')),
                                  TextButton(
                                    onPressed: () {
                                      Navigator.pop(dlg);
                                      context.read<DriverBloc>().add(EndTrip(tripId: trip.id));
                                    },
                                    child: const Text('Ya, Selesai'),
                                  ),
                                ],
                              ),
                            );
                          },
                          icon: const Icon(Icons.stop),
                          label: const Text('Selesai Trip'),
                          style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
                        ),
                      ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            );
          }
          return Scaffold(
            appBar: AppBar(title: const Text('Detail Trip')),
            body: const SizedBox.shrink(),
          );
        },
      ),
    );
  }
}
