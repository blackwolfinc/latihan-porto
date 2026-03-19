import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_constants.dart';
import '../bloc/gps_bloc.dart';
import '../bloc/gps_event.dart';
import '../bloc/gps_state.dart';

class LiveTrackingPage extends StatefulWidget {
  final String bookingId;

  const LiveTrackingPage({super.key, required this.bookingId});

  @override
  State<LiveTrackingPage> createState() => _LiveTrackingPageState();
}

class _LiveTrackingPageState extends State<LiveTrackingPage> {
  GoogleMapController? _mapController;
  final Set<Marker> _markers = {};
  final Set<Polyline> _polylines = {};
  final List<LatLng> _routePoints = [];

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => GpsBloc(apiClient: ApiClient())..add(StartTracking(bookingId: widget.bookingId)),
      child: BlocConsumer<GpsBloc, GpsState>(
        listener: (context, state) {
          if (state is TrackingActive) {
            final position = LatLng(state.latitude, state.longitude);
            _routePoints.add(position);

            setState(() {
              _markers.clear();
              _markers.add(Marker(
                markerId: const MarkerId('current'),
                position: position,
                icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
                infoWindow: InfoWindow(
                  title: 'Posisi Saat Ini',
                  snippet: '${state.speed.toStringAsFixed(1)} km/h',
                ),
              ));

              _polylines.clear();
              if (_routePoints.length > 1) {
                _polylines.add(Polyline(
                  polylineId: const PolylineId('route'),
                  points: _routePoints,
                  color: AppColors.primary,
                  width: 4,
                ));
              }
            });

            _mapController?.animateCamera(CameraUpdate.newLatLng(position));
          }
        },
        builder: (context, state) {
          return Scaffold(
            body: Stack(
              children: [
                GoogleMap(
                  initialCameraPosition: CameraPosition(
                    target: state is TrackingActive
                        ? LatLng(state.latitude, state.longitude)
                        : const LatLng(AppConstants.defaultLatitude, AppConstants.defaultLongitude),
                    zoom: AppConstants.defaultZoom,
                  ),
                  onMapCreated: (controller) => _mapController = controller,
                  markers: _markers,
                  polylines: _polylines,
                  myLocationEnabled: true,
                  myLocationButtonEnabled: false,
                  zoomControlsEnabled: false,
                ),
                // Top bar
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  child: SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.all(AppSizes.paddingMD),
                      child: Row(
                        children: [
                          CircleAvatar(
                            backgroundColor: Colors.white,
                            child: IconButton(
                              icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
                              onPressed: () {
                                context.read<GpsBloc>().add(StopTracking());
                                Navigator.of(context).maybePop();
                              },
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(AppSizes.radiusFull),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.1),
                                    blurRadius: 8,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Text(
                                state is TrackingActive ? 'Tracking Aktif' : 'Memuat...',
                                style: const TextStyle(fontWeight: FontWeight.w600),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                // Bottom info
                if (state is TrackingActive)
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 10,
                            offset: const Offset(0, -4),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.all(AppSizes.paddingLG),
                      child: SafeArea(
                        top: false,
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: [
                                _buildInfoItem(
                                  context,
                                  Icons.speed,
                                  '${state.speed.toStringAsFixed(1)} km/h',
                                  'Kecepatan',
                                ),
                                Container(
                                  width: 1,
                                  height: 40,
                                  color: AppColors.divider,
                                ),
                                _buildInfoItem(
                                  context,
                                  Icons.timer,
                                  _formatDuration(state.duration),
                                  'Durasi',
                                ),
                                Container(
                                  width: 1,
                                  height: 40,
                                  color: AppColors.divider,
                                ),
                                _buildInfoItem(
                                  context,
                                  Icons.explore,
                                  '${state.heading.toStringAsFixed(0)}°',
                                  'Arah',
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton.icon(
                                onPressed: () {
                                  context.read<GpsBloc>().add(StopTracking());
                                  Navigator.of(context).maybePop();
                                },
                                icon: const Icon(Icons.stop),
                                label: const Text('Hentikan Tracking'),
                                style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                if (state is GpsLoading)
                  const Center(child: CircularProgressIndicator()),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildInfoItem(BuildContext context, IconData icon, String value, String label) {
    return Column(
      children: [
        Icon(icon, color: AppColors.primary, size: 20),
        const SizedBox(height: 4),
        Text(
          value,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
        ),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
        ),
      ],
    );
  }

  String _formatDuration(Duration d) {
    final hours = d.inHours.toString().padLeft(2, '0');
    final minutes = (d.inMinutes % 60).toString().padLeft(2, '0');
    final seconds = (d.inSeconds % 60).toString().padLeft(2, '0');
    return '$hours:$minutes:$seconds';
  }

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }
}
