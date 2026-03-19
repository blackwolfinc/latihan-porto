import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/constants/app_constants.dart';

class InspectionFormPage extends StatefulWidget {
  final String bookingId;

  const InspectionFormPage({super.key, required this.bookingId});

  @override
  State<InspectionFormPage> createState() => _InspectionFormPageState();
}

class _InspectionFormPageState extends State<InspectionFormPage> {
  final _notesController = TextEditingController();
  bool _isSubmitting = false;
  String _inspectionType = 'PRE_RENTAL';

  final Map<String, String> _exteriorChecks = {
    'body': 'Baik',
    'cat': 'Baik',
    'ban': 'Baik',
    'lampu': 'Baik',
    'kaca': 'Baik',
  };

  final Map<String, String> _interiorChecks = {
    'jok': 'Baik',
    'dashboard': 'Baik',
    'ac': 'Baik',
    'audio': 'Baik',
  };

  final Map<String, String> _engineChecks = {
    'suara_mesin': 'Baik',
    'oli': 'Baik',
    'radiator': 'Baik',
  };

  final List<String> _photoPaths = [];
  final _conditions = ['Baik', 'Cukup', 'Rusak'];
  final _exteriorLabels = {'body': 'Body', 'cat': 'Cat', 'ban': 'Ban', 'lampu': 'Lampu', 'kaca': 'Kaca'};
  final _interiorLabels = {'jok': 'Jok', 'dashboard': 'Dashboard', 'ac': 'AC', 'audio': 'Audio'};
  final _engineLabels = {'suara_mesin': 'Suara Mesin', 'oli': 'Oli', 'radiator': 'Radiator'};

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _takePhoto() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.camera, imageQuality: 80);
    if (image != null) {
      setState(() => _photoPaths.add(image.path));
    }
  }

  Future<void> _submit() async {
    setState(() => _isSubmitting = true);
    try {
      final apiClient = ApiClient();
      await apiClient.post(
        ApiEndpoints.createInspection(widget.bookingId),
        data: {
          'type': _inspectionType,
          'exteriorChecklist': _exteriorChecks,
          'interiorChecklist': _interiorChecks,
          'engineChecklist': _engineChecks,
          'notes': _notesController.text.isNotEmpty ? _notesController.text : null,
          'overallCondition': _calculateOverallCondition(),
          'fuelLevel': 100.0,
          'odometer': 0.0,
        },
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Inspeksi berhasil disimpan'), backgroundColor: AppColors.success),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Gagal menyimpan inspeksi'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  String _calculateOverallCondition() {
    final allChecks = {..._exteriorChecks, ..._interiorChecks, ..._engineChecks};
    if (allChecks.values.any((v) => v == 'Rusak')) return 'POOR';
    if (allChecks.values.any((v) => v == 'Cukup')) return 'FAIR';
    return 'GOOD';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Formulir Inspeksi')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSizes.paddingMD),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Type selector
            Card(
              child: Padding(
                padding: const EdgeInsets.all(AppSizes.paddingMD),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _inspectionType == 'PRE_RENTAL' ? 'Inspeksi Sebelum Rental' : 'Inspeksi Setelah Rental',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    SegmentedButton<String>(
                      segments: const [
                        ButtonSegment(value: 'PRE_RENTAL', label: Text('Sebelum')),
                        ButtonSegment(value: 'POST_RENTAL', label: Text('Sesudah')),
                      ],
                      selected: {_inspectionType},
                      onSelectionChanged: (values) {
                        setState(() => _inspectionType = values.first);
                      },
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Exterior
            _buildCheckSection(context, 'Eksterior', _exteriorChecks, _exteriorLabels),
            const SizedBox(height: 12),

            // Interior
            _buildCheckSection(context, 'Interior', _interiorChecks, _interiorLabels),
            const SizedBox(height: 12),

            // Engine
            _buildCheckSection(context, 'Mesin', _engineChecks, _engineLabels),
            const SizedBox(height: 16),

            // Photos
            Card(
              child: Padding(
                padding: const EdgeInsets.all(AppSizes.paddingMD),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Foto Dokumentasi',
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        ..._photoPaths.map((path) => ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Stack(
                                children: [
                                  Image.file(File(path), width: 80, height: 80, fit: BoxFit.cover),
                                  Positioned(
                                    top: 0,
                                    right: 0,
                                    child: GestureDetector(
                                      onTap: () => setState(() => _photoPaths.remove(path)),
                                      child: Container(
                                        padding: const EdgeInsets.all(2),
                                        decoration: const BoxDecoration(color: AppColors.error, shape: BoxShape.circle),
                                        child: const Icon(Icons.close, color: Colors.white, size: 14),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            )),
                        GestureDetector(
                          onTap: _takePhoto,
                          child: Container(
                            width: 80,
                            height: 80,
                            decoration: BoxDecoration(
                              border: Border.all(color: AppColors.divider, width: 2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.camera_alt, color: AppColors.textSecondary),
                                Text('Tambah', style: TextStyle(fontSize: 10, color: AppColors.textSecondary)),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Notes
            TextField(
              controller: _notesController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Catatan',
                hintText: 'Catatan tambahan tentang kondisi kendaraan',
                alignLabelWithHint: true,
              ),
            ),
            const SizedBox(height: 24),

            // Submit
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submit,
                child: _isSubmitting
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Simpan Inspeksi'),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildCheckSection(
    BuildContext context,
    String title,
    Map<String, String> checks,
    Map<String, String> labels,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSizes.paddingMD),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            ...checks.entries.map((entry) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(labels[entry.key] ?? entry.key),
                    DropdownButton<String>(
                      value: entry.value,
                      underline: const SizedBox.shrink(),
                      items: _conditions.map((c) {
                        Color textColor;
                        switch (c) {
                          case 'Baik':
                            textColor = AppColors.success;
                            break;
                          case 'Cukup':
                            textColor = AppColors.warning;
                            break;
                          case 'Rusak':
                            textColor = AppColors.error;
                            break;
                          default:
                            textColor = AppColors.textPrimary;
                        }
                        return DropdownMenuItem(
                          value: c,
                          child: Text(c, style: TextStyle(color: textColor, fontWeight: FontWeight.w500)),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setState(() => checks[entry.key] = value ?? 'Baik');
                      },
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
