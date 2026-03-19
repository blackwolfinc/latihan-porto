import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_constants.dart';
import '../../../shared/widgets/custom_app_bar.dart';
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

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => GpsBloc(apiClient: ApiClient())..add(StartTracking(bookingId: widget.bookingId)),
      child: Scaffold(
        appBar: CustomAppBar(
          title: 'Pelacakan Langsung',
          actions: [
            BlocBuilder<GpsBloc, GpsState>(
              builder: (context, state) {
                final isTracking = state is GpsTracking;
                return IconButton(
                  icon: Icon(isTracking ? Icons.gps_fixed : Icons.gps_off, color: isTracking ? Colors.white : Colors.white54),
                  onPressed: () {
                    if (isTracking) {
                      context.read<GpsBloc>().add(StopTracking());
                    } else {
                      context.read<GpsBloc>().add(StartTracking(bookingId: widget.bookingId));
                    }
                  },
                );
              },
            ),
          ],
        ),
        body: BlocConsumer<GpsBloc, GpsState>(
          listener: (context, state) {
            if (state is GpsTracking && _mapController != null) {
              _mapController!.animateCamera(
                CameraUpdate.newLatLng(LatLng(state.latitude, state.longitude)),
              );
            }
            if (state is GpsError) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(state.message), backgroundColor: AppColors.error),
              );
            }
          },
          builder: (context, state) {
            if (state is GpsLoading) {
              return const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(),
                    SizedBox(height: 16),
                    Text('Memuat lokasi...'),
                  ],
                ),
              );
            }

            double lat = AppConstants.defaultLatitude;
            double lng = AppConstants.defaultLongitude;
            Set<Marker> markers = {};
            Set<Polyline> polylines = {};

            if (state is GpsTracking) {
              lat = state.latitude;
              lng = state.longitude;
              markers.add(
                Marker(
                  markerId: const MarkerId('current'),
                  position: LatLng(lat, lng),
                  infoWindow: InfoWindow(
                    title: 'Posisi Saat Ini',
                    snippet: 'Kecepatan: ${state.speed?.toStringAsFixed(1) ?? '0'} km/h',
                  ),
                  icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
                ),
              );

              if (state.history.isNotEmpty) {
                final points = state.history
                    .map((log) => LatLng(log.latitude, log.longitude))
                    .toList();
                points.add(LatLng(lat, lng));
                polylines.add(
                  Polyline(
                    polylineId: const PolylineId('route'),
                    points: points,
                    color: AppColors.primary,
                    width: 4,
                  ),
                );
              }
            }

            return Stack(
              children: [
                GoogleMap(
                  initialCameraPosition: CameraPosition(
                    target: LatLng(lat, lng),
                    zoom: AppConstants.defaultZoom,
                  ),
                  markers: markers,
                  polylines: polylines,
                  myLocationEnabled: true,
                  myLocationButtonEnabled: false,
                  zoomControlsEnabled: false,
                  mapToolbarEnabled: false,
                  onMapCreated: (controller) => _mapController = controller,
                ),
                if (state is GpsTracking)
                  Positioned(
                    bottom: 16,
                    left: 16,
                    right: 16,
                    child: Container(
                      padding: const EdgeInsets.all(AppSizes.paddingMD),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(AppSizes.radiusMD),
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 4))],
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _buildInfoItem(Icons.speed, '${state.speed?.toStringAsFixed(1) ?? '0'} km/h', 'Kecepatan'),
                          Container(width: 1, height: 40, color: AppColors.divider),
                          _buildInfoItem(Icons.explore, '${state.heading?.toStringAsFixed(0) ?? '0'}°', 'Arah'),
                          Container(width: 1, height: 40, color: AppColors.divider),
                          _buildInfoItem(Icons.location_on, '${state.latitude.toStringAsFixed(4)}', 'Latitude'),
                        ],
                      ),
                    ),
                  ),
                Positioned(
                  bottom: state is GpsTracking ? 100 : 16,
                  right: 16,
                  child: Column(
                    children: [
                      FloatingActionButton.small(
                        heroTag: 'center',
                        onPressed: () {
                          if (state is GpsTracking) {
                            _mapController?.animateCamera(
                              CameraUpdate.newLatLng(LatLng(state.latitude, state.longitude)),
                            );
                          }
                        },
                        child: const Icon(Icons.my_location),
                      ),
                    ],
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildInfoItem(IconData icon, String value, String label) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: AppColors.primary, size: 20),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 10)),
      ],
    );
  }

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }
}
