import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/utils/responsive.dart';
import '../../../shared/models/car.dart';
import '../../cars/bloc/car_bloc.dart';
import '../../cars/bloc/car_event.dart';
import '../../cars/bloc/car_state.dart';
import '../bloc/booking_bloc.dart';
import '../bloc/booking_event.dart';
import '../bloc/booking_state.dart';

class CreateBookingPage extends StatefulWidget {
  final String carId;

  const CreateBookingPage({super.key, required this.carId});

  @override
  State<CreateBookingPage> createState() => _CreateBookingPageState();
}

class _CreateBookingPageState extends State<CreateBookingPage> {
  int _currentStep = 0;
  DateTime? _startDate;
  DateTime? _endDate;
  final _pickupController = TextEditingController();
  final _dropoffController = TextEditingController();
  bool _withDriver = false;
  Car? _car;
  final _dateFormat = DateFormat('dd MMM yyyy');

  @override
  void dispose() {
    _pickupController.dispose();
    _dropoffController.dispose();
    super.dispose();
  }

  int get _totalDays {
    if (_startDate == null || _endDate == null) return 0;
    final days = _endDate!.difference(_startDate!).inDays;
    return days > 0 ? days : 1;
  }

  double get _carPrice => _car?.pricePerDay ?? 0;
  double get _driverFee => _withDriver ? 150000.0 * _totalDays : 0;
  double get _totalPrice => (_carPrice * _totalDays) + _driverFee;

  String _formatCurrency(double amount) {
    final parts = amount.toStringAsFixed(0).split('');
    final buffer = StringBuffer();
    for (int i = 0; i < parts.length; i++) {
      if (i > 0 && (parts.length - i) % 3 == 0) buffer.write('.');
      buffer.write(parts[i]);
    }
    return 'Rp $buffer';
  }

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (_) => CarBloc(apiClient: ApiClient())..add(LoadCarDetail(carId: widget.carId)),
        ),
        BlocProvider(
          create: (_) => BookingBloc(apiClient: ApiClient()),
        ),
      ],
      child: BlocListener<CarBloc, CarState>(
        listener: (context, state) {
          if (state is CarDetailLoaded) {
            setState(() => _car = state.car);
          }
        },
        child: BlocListener<BookingBloc, BookingState>(
          listener: (context, state) {
            if (state is BookingCreated) {
              context.go('/payment/${state.booking.id}');
            } else if (state is BookingError) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(state.message), backgroundColor: AppColors.error),
              );
            }
          },
          child: Scaffold(
            appBar: AppBar(title: const Text('Buat Pemesanan')),
            body: ResponsiveContainer(
              maxWidth: 700,
              padding: isTablet(context) ? const EdgeInsets.symmetric(vertical: 16) : null,
              child: Stepper(
                type: isTablet(context) ? StepperType.horizontal : StepperType.vertical,
              currentStep: _currentStep,
              onStepContinue: _onStepContinue,
              onStepCancel: _onStepCancel,
              onStepTapped: (step) => setState(() => _currentStep = step),
              controlsBuilder: (context, details) {
                return Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: details.onStepContinue,
                          child: Text(_currentStep == 3 ? 'Konfirmasi & Bayar' : 'Lanjut'),
                        ),
                      ),
                      if (_currentStep > 0) ...[
                        const SizedBox(width: 12),
                        Expanded(
                          child: OutlinedButton(
                            onPressed: details.onStepCancel,
                            child: const Text('Kembali'),
                          ),
                        ),
                      ],
                    ],
                  ),
                );
              },
              steps: [
                Step(
                  title: const Text('Pilih Tanggal'),
                  subtitle: _startDate != null && _endDate != null
                      ? Text('${_dateFormat.format(_startDate!)} - ${_dateFormat.format(_endDate!)}')
                      : null,
                  isActive: _currentStep >= 0,
                  state: _currentStep > 0 ? StepState.complete : StepState.indexed,
                  content: _buildDateStep(),
                ),
                Step(
                  title: const Text('Lokasi'),
                  subtitle: _pickupController.text.isNotEmpty ? Text(_pickupController.text) : null,
                  isActive: _currentStep >= 1,
                  state: _currentStep > 1 ? StepState.complete : StepState.indexed,
                  content: _buildLocationStep(),
                ),
                Step(
                  title: const Text('Opsi Driver'),
                  subtitle: Text(_withDriver ? 'Dengan Sopir' : 'Tanpa Sopir'),
                  isActive: _currentStep >= 2,
                  state: _currentStep > 2 ? StepState.complete : StepState.indexed,
                  content: _buildDriverStep(),
                ),
                Step(
                  title: const Text('Ringkasan'),
                  isActive: _currentStep >= 3,
                  content: _buildSummaryStep(),
                ),
              ],
            ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDateStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ListTile(
          contentPadding: EdgeInsets.zero,
          leading: const Icon(Icons.calendar_today, color: AppColors.primary),
          title: const Text('Tanggal Mulai'),
          subtitle: Text(
            _startDate != null ? _dateFormat.format(_startDate!) : 'Pilih tanggal mulai',
          ),
          onTap: () async {
            final date = await showDatePicker(
              context: context,
              initialDate: _startDate ?? DateTime.now().add(const Duration(days: 1)),
              firstDate: DateTime.now(),
              lastDate: DateTime.now().add(const Duration(days: 365)),
            );
            if (date != null) {
              setState(() {
                _startDate = date;
                if (_endDate != null && _endDate!.isBefore(date)) {
                  _endDate = date.add(const Duration(days: 1));
                }
              });
            }
          },
        ),
        ListTile(
          contentPadding: EdgeInsets.zero,
          leading: const Icon(Icons.calendar_today, color: AppColors.secondary),
          title: const Text('Tanggal Selesai'),
          subtitle: Text(
            _endDate != null ? _dateFormat.format(_endDate!) : 'Pilih tanggal selesai',
          ),
          onTap: () async {
            final date = await showDatePicker(
              context: context,
              initialDate: _endDate ?? (_startDate ?? DateTime.now()).add(const Duration(days: 1)),
              firstDate: (_startDate ?? DateTime.now()).add(const Duration(days: 1)),
              lastDate: DateTime.now().add(const Duration(days: 395)),
            );
            if (date != null) {
              setState(() => _endDate = date);
            }
          },
        ),
        if (_totalDays > 0)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              'Durasi: $_totalDays hari',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
                  ),
            ),
          ),
      ],
    );
  }

  Widget _buildLocationStep() {
    return Column(
      children: [
        TextField(
          controller: _pickupController,
          decoration: const InputDecoration(
            labelText: 'Lokasi Penjemputan',
            hintText: 'Masukkan alamat penjemputan',
            prefixIcon: Icon(Icons.location_on, color: AppColors.success),
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _dropoffController,
          decoration: const InputDecoration(
            labelText: 'Lokasi Pengembalian',
            hintText: 'Masukkan alamat pengembalian',
            prefixIcon: Icon(Icons.location_on, color: AppColors.error),
          ),
        ),
      ],
    );
  }

  Widget _buildDriverStep() {
    return Column(
      children: [
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text('Dengan Sopir'),
          subtitle: Text(
            _withDriver
                ? 'Sopir profesional akan mengantar Anda'
                : 'Anda menyetir sendiri',
          ),
          value: _withDriver,
          onChanged: (value) => setState(() => _withDriver = value),
          activeColor: AppColors.primary,
        ),
        if (_withDriver)
          Container(
            padding: const EdgeInsets.all(AppSizes.paddingMD),
            decoration: BoxDecoration(
              color: AppColors.info.withOpacity(0.1),
              borderRadius: BorderRadius.circular(AppSizes.radiusMD),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline, color: AppColors.info),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Biaya sopir Rp 150.000/hari. Sopir akan ditetapkan setelah konfirmasi.',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.info,
                        ),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildSummaryStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (_car != null)
          Container(
            padding: const EdgeInsets.all(AppSizes.paddingMD),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(AppSizes.radiusMD),
              border: Border.all(color: AppColors.divider),
            ),
            child: Row(
              children: [
                const Icon(Icons.directions_car, size: 40, color: AppColors.primary),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_car!.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                      Text('${_car!.category} - ${_car!.transmission}',
                          style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        const SizedBox(height: 16),
        _buildSummaryRow('Tanggal', _startDate != null && _endDate != null
            ? '${_dateFormat.format(_startDate!)} - ${_dateFormat.format(_endDate!)}'
            : '-'),
        _buildSummaryRow('Durasi', '$_totalDays hari'),
        _buildSummaryRow('Penjemputan', _pickupController.text.isNotEmpty ? _pickupController.text : '-'),
        _buildSummaryRow('Pengembalian', _dropoffController.text.isNotEmpty ? _dropoffController.text : '-'),
        _buildSummaryRow('Sopir', _withDriver ? 'Ya' : 'Tidak'),
        const Divider(height: 24),
        _buildSummaryRow('Harga Mobil', '${_formatCurrency(_carPrice)} x $_totalDays hari'),
        if (_withDriver) _buildSummaryRow('Biaya Sopir', _formatCurrency(_driverFee)),
        const Divider(height: 24),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Total', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            Text(
              _formatCurrency(_totalPrice),
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: AppColors.textSecondary)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  void _onStepContinue() {
    if (_currentStep == 0) {
      if (_startDate == null || _endDate == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Silakan pilih tanggal mulai dan selesai')),
        );
        return;
      }
    } else if (_currentStep == 1) {
      if (_pickupController.text.isEmpty || _dropoffController.text.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Silakan isi lokasi penjemputan dan pengembalian')),
        );
        return;
      }
    } else if (_currentStep == 3) {
      _submitBooking();
      return;
    }
    setState(() => _currentStep += 1);
  }

  void _onStepCancel() {
    if (_currentStep > 0) {
      setState(() => _currentStep -= 1);
    }
  }

  void _submitBooking() {
    if (_startDate == null || _endDate == null || _car == null) return;

    context.read<BookingBloc>().add(CreateBooking(
          carId: widget.carId,
          startDate: _startDate!,
          endDate: _endDate!,
          pickupLocation: _pickupController.text,
          dropoffLocation: _dropoffController.text,
          withDriver: _withDriver,
        ));
  }
}
