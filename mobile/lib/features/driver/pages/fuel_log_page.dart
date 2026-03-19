import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/constants/app_constants.dart';
import '../../../shared/models/fuel_log.dart';
import '../bloc/driver_bloc.dart';
import '../bloc/driver_event.dart';
import '../bloc/driver_state.dart';

class FuelLogPage extends StatefulWidget {
  const FuelLogPage({super.key});

  @override
  State<FuelLogPage> createState() => _FuelLogPageState();
}

class _FuelLogPageState extends State<FuelLogPage> {
  final _formKey = GlobalKey<FormState>();
  final _literController = TextEditingController();
  final _costController = TextEditingController();
  final _odometerController = TextEditingController();
  final _notesController = TextEditingController();
  String _selectedFuelType = 'Pertalite';
  String? _receiptPhotoPath;
  List<FuelLog> _recentLogs = [];
  bool _isLoadingLogs = false;

  final _fuelTypes = ['Pertalite', 'Pertamax', 'Pertamax Turbo', 'Solar', 'Dexlite', 'Pertamina Dex'];

  @override
  void initState() {
    super.initState();
    _loadRecentLogs();
  }

  Future<void> _loadRecentLogs() async {
    setState(() => _isLoadingLogs = true);
    try {
      final apiClient = ApiClient();
      final response = await apiClient.get(ApiEndpoints.fuelLogs, queryParameters: {'limit': 10});
      final logs = (response.data['data'] as List)
          .map((json) => FuelLog.fromJson(json as Map<String, dynamic>))
          .toList();
      setState(() {
        _recentLogs = logs;
        _isLoadingLogs = false;
      });
    } catch (_) {
      setState(() => _isLoadingLogs = false);
    }
  }

  @override
  void dispose() {
    _literController.dispose();
    _costController.dispose();
    _odometerController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _pickReceiptPhoto() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.camera, imageQuality: 80);
    if (image != null) {
      setState(() => _receiptPhotoPath = image.path);
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => DriverBloc(apiClient: ApiClient()),
      child: BlocConsumer<DriverBloc, DriverState>(
        listener: (context, state) {
          if (state is FuelLogSubmitted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Log BBM berhasil disimpan'), backgroundColor: AppColors.success),
            );
            _formKey.currentState?.reset();
            _literController.clear();
            _costController.clear();
            _odometerController.clear();
            _notesController.clear();
            setState(() => _receiptPhotoPath = null);
            _loadRecentLogs();
          } else if (state is DriverError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.message), backgroundColor: AppColors.error),
            );
          }
        },
        builder: (context, state) {
          return Scaffold(
            appBar: AppBar(title: const Text('Log BBM')),
            body: SingleChildScrollView(
              padding: const EdgeInsets.all(AppSizes.paddingMD),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Catat Pengisian BBM',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _literController,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: const InputDecoration(
                            labelText: 'Jumlah Liter',
                            hintText: 'Contoh: 40.5',
                            prefixIcon: Icon(Icons.local_gas_station),
                            suffixText: 'L',
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) return 'Jumlah liter wajib diisi';
                            if (double.tryParse(value) == null) return 'Masukkan angka yang valid';
                            return null;
                          },
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _costController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            labelText: 'Total Biaya',
                            hintText: 'Contoh: 500000',
                            prefixIcon: Icon(Icons.payments),
                            prefixText: 'Rp ',
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) return 'Total biaya wajib diisi';
                            if (double.tryParse(value) == null) return 'Masukkan angka yang valid';
                            return null;
                          },
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _odometerController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            labelText: 'Odometer',
                            hintText: 'Contoh: 45230',
                            prefixIcon: Icon(Icons.speed),
                            suffixText: 'km',
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) return 'Odometer wajib diisi';
                            if (double.tryParse(value) == null) return 'Masukkan angka yang valid';
                            return null;
                          },
                        ),
                        const SizedBox(height: 12),
                        DropdownButtonFormField<String>(
                          value: _selectedFuelType,
                          decoration: const InputDecoration(
                            labelText: 'Jenis BBM',
                            prefixIcon: Icon(Icons.oil_barrel),
                          ),
                          items: _fuelTypes.map((type) => DropdownMenuItem(value: type, child: Text(type))).toList(),
                          onChanged: (value) => setState(() => _selectedFuelType = value ?? 'Pertalite'),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _notesController,
                          maxLines: 2,
                          decoration: const InputDecoration(
                            labelText: 'Catatan (opsional)',
                            hintText: 'Catatan tambahan',
                            prefixIcon: Icon(Icons.notes),
                          ),
                        ),
                        const SizedBox(height: 12),
                        OutlinedButton.icon(
                          onPressed: _pickReceiptPhoto,
                          icon: const Icon(Icons.camera_alt),
                          label: Text(_receiptPhotoPath != null ? 'Foto diambil' : 'Foto Struk'),
                        ),
                        const SizedBox(height: 20),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: state is DriverLoading
                                ? null
                                : () {
                                    if (_formKey.currentState!.validate()) {
                                      context.read<DriverBloc>().add(SubmitFuelLog(
                                            carId: '',
                                            liters: double.parse(_literController.text),
                                            totalCost: double.parse(_costController.text),
                                            odometer: double.parse(_odometerController.text),
                                            fuelType: _selectedFuelType,
                                            receiptPhotoPath: _receiptPhotoPath,
                                            notes: _notesController.text.isNotEmpty ? _notesController.text : null,
                                          ));
                                    }
                                  },
                            child: state is DriverLoading
                                ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                : const Text('Simpan'),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  Text(
                    'Riwayat Pengisian',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  if (_isLoadingLogs)
                    const Center(child: CircularProgressIndicator())
                  else if (_recentLogs.isEmpty)
                    const Padding(
                      padding: EdgeInsets.all(24),
                      child: Center(child: Text('Belum ada riwayat pengisian', style: TextStyle(color: AppColors.textSecondary))),
                    )
                  else
                    ...(_recentLogs.map((log) => Card(
                          child: ListTile(
                            leading: Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: AppColors.secondary.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(Icons.local_gas_station, color: AppColors.secondary, size: 20),
                            ),
                            title: Text('${log.liters.toStringAsFixed(1)} L - ${log.fuelType}'),
                            subtitle: Text(DateFormat('dd MMM yyyy, HH:mm').format(log.filledAt)),
                            trailing: Text(
                              log.formattedTotalCost,
                              style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.primary),
                            ),
                          ),
                        ))),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
