import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_constants.dart';
import '../../../shared/widgets/custom_app_bar.dart';
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
  final _litersController = TextEditingController();
  final _costPerLiterController = TextEditingController();
  final _odometerController = TextEditingController();
  final _stationController = TextEditingController();
  final _notesController = TextEditingController();
  String _fuelType = 'Pertamax';
  String? _receiptPhotoPath;
  final _imagePicker = ImagePicker();

  @override
  void dispose() {
    _litersController.dispose();
    _costPerLiterController.dispose();
    _odometerController.dispose();
    _stationController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  double get _totalCost {
    final liters = double.tryParse(_litersController.text) ?? 0;
    final costPerLiter = double.tryParse(_costPerLiterController.text) ?? 0;
    return liters * costPerLiter;
  }

  Future<void> _pickPhoto() async {
    final image = await _imagePicker.pickImage(
      source: ImageSource.camera,
      maxWidth: AppConstants.maxImageWidth,
      maxHeight: AppConstants.maxImageHeight,
      imageQuality: AppConstants.imageQuality,
    );
    if (image != null) {
      setState(() => _receiptPhotoPath = image.path);
    }
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      context.read<DriverBloc>().add(SubmitFuelLog(
            carId: '',
            liters: double.parse(_litersController.text),
            costPerLiter: double.parse(_costPerLiterController.text),
            odometer: double.parse(_odometerController.text),
            fuelType: _fuelType,
            stationName: _stationController.text.isNotEmpty ? _stationController.text : null,
            receiptPhotoPath: _receiptPhotoPath,
            notes: _notesController.text.isNotEmpty ? _notesController.text : null,
          ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => DriverBloc(apiClient: ApiClient()),
      child: Scaffold(
        appBar: const CustomAppBar(title: 'Catatan BBM'),
        body: BlocListener<DriverBloc, DriverState>(
          listener: (context, state) {
            if (state is FuelLogSubmitted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Catatan BBM berhasil disimpan!'), backgroundColor: AppColors.success),
              );
              Navigator.pop(context);
            } else if (state is DriverError) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(state.message), backgroundColor: AppColors.error),
              );
            }
          },
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppSizes.paddingMD),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Isi data pengisian BBM', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 20),
                  DropdownButtonFormField<String>(
                    value: _fuelType,
                    decoration: const InputDecoration(
                      labelText: 'Jenis BBM',
                      prefixIcon: Icon(Icons.local_gas_station),
                    ),
                    items: ['Pertalite', 'Pertamax', 'Pertamax Turbo', 'Dexlite', 'Pertamina Dex', 'Solar']
                        .map((type) => DropdownMenuItem(value: type, child: Text(type)))
                        .toList(),
                    onChanged: (value) => setState(() => _fuelType = value ?? 'Pertamax'),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _litersController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Jumlah (Liter)',
                      hintText: 'Contoh: 35.5',
                      prefixIcon: Icon(Icons.water_drop),
                    ),
                    onChanged: (_) => setState(() {}),
                    validator: (value) {
                      if (value == null || value.isEmpty) return 'Jumlah tidak boleh kosong';
                      if (double.tryParse(value) == null) return 'Format angka tidak valid';
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _costPerLiterController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Harga per Liter (Rp)',
                      hintText: 'Contoh: 13900',
                      prefixIcon: Icon(Icons.attach_money),
                    ),
                    onChanged: (_) => setState(() {}),
                    validator: (value) {
                      if (value == null || value.isEmpty) return 'Harga tidak boleh kosong';
                      if (double.tryParse(value) == null) return 'Format angka tidak valid';
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  if (_totalCost > 0)
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(AppSizes.radiusSM),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Total Biaya:', style: TextStyle(fontWeight: FontWeight.w500)),
                          Text(
                            'Rp ${_formatCurrency(_totalCost)}',
                            style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary, fontSize: 16),
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _odometerController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Odometer (km)',
                      hintText: 'Contoh: 45230',
                      prefixIcon: Icon(Icons.speed),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) return 'Odometer tidak boleh kosong';
                      if (double.tryParse(value) == null) return 'Format angka tidak valid';
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _stationController,
                    decoration: const InputDecoration(
                      labelText: 'Nama SPBU (Opsional)',
                      hintText: 'Contoh: SPBU Pertamina 31.125.01',
                      prefixIcon: Icon(Icons.location_on),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _notesController,
                    maxLines: 2,
                    decoration: const InputDecoration(
                      labelText: 'Catatan (Opsional)',
                      hintText: 'Tambah catatan...',
                      prefixIcon: Icon(Icons.notes),
                      alignLabelWithHint: true,
                    ),
                  ),
                  const SizedBox(height: 16),
                  OutlinedButton.icon(
                    onPressed: _pickPhoto,
                    icon: const Icon(Icons.camera_alt),
                    label: Text(_receiptPhotoPath != null ? 'Foto struk terpilih' : 'Foto Struk (Opsional)'),
                    style: OutlinedButton.styleFrom(minimumSize: const Size(double.infinity, 52)),
                  ),
                  const SizedBox(height: 24),
                  BlocBuilder<DriverBloc, DriverState>(
                    builder: (context, state) {
                      return ElevatedButton(
                        onPressed: state is DriverLoading ? null : _submit,
                        child: state is DriverLoading
                            ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : const Text('Simpan'),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
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
    return buffer.toString();
  }
}
