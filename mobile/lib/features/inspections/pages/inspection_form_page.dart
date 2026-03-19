import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/constants/app_constants.dart';
import '../../../shared/widgets/custom_app_bar.dart';

class InspectionFormPage extends StatefulWidget {
  final String bookingId;

  const InspectionFormPage({super.key, required this.bookingId});

  @override
  State<InspectionFormPage> createState() => _InspectionFormPageState();
}

class _InspectionFormPageState extends State<InspectionFormPage> {
  final _notesController = TextEditingController();
  bool _isLoading = false;
  String _inspectionType = 'PRE_RENTAL';

  // Exterior
  String _bodyCondition = 'Baik';
  String _paintCondition = 'Baik';
  String _tireCondition = 'Baik';
  String _lightCondition = 'Baik';
  String _glassCondition = 'Baik';

  // Interior
  String _seatCondition = 'Baik';
  String _dashboardCondition = 'Baik';
  String _acCondition = 'Baik';
  String _audioCondition = 'Baik';

  // Engine
  String _engineSoundCondition = 'Baik';
  String _oilCondition = 'Baik';
  String _radiatorCondition = 'Baik';

  final List<String> _conditionOptions = ['Baik', 'Cukup', 'Rusak'];

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submitInspection() async {
    setState(() => _isLoading = true);
    try {
      final apiClient = ApiClient();
      await apiClient.post(
        ApiEndpoints.createInspection(widget.bookingId),
        data: {
          'type': _inspectionType,
          'exterior': {
            'body': _bodyCondition,
            'paint': _paintCondition,
            'tires': _tireCondition,
            'lights': _lightCondition,
            'glass': _glassCondition,
          },
          'interior': {
            'seats': _seatCondition,
            'dashboard': _dashboardCondition,
            'ac': _acCondition,
            'audio': _audioCondition,
          },
          'engine': {
            'sound': _engineSoundCondition,
            'oil': _oilCondition,
            'radiator': _radiatorCondition,
          },
          'notes': _notesController.text.isNotEmpty ? _notesController.text : null,
        },
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Inspeksi berhasil disimpan'),
            backgroundColor: AppColors.success,
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Gagal menyimpan inspeksi. Silakan coba lagi.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'Inspeksi Kendaraan'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSizes.paddingMD),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Inspection Type
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppSizes.paddingMD),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.05),
                borderRadius: BorderRadius.circular(AppSizes.radiusMD),
                border: Border.all(color: AppColors.primary.withOpacity(0.2)),
              ),
              child: Column(
                children: [
                  const Icon(Icons.checklist, color: AppColors.primary, size: 40),
                  const SizedBox(height: 8),
                  SegmentedButton<String>(
                    segments: const [
                      ButtonSegment(
                        value: 'PRE_RENTAL',
                        label: Text('Sebelum Rental'),
                        icon: Icon(Icons.login),
                      ),
                      ButtonSegment(
                        value: 'POST_RENTAL',
                        label: Text('Setelah Rental'),
                        icon: Icon(Icons.logout),
                      ),
                    ],
                    selected: {_inspectionType},
                    onSelectionChanged: (Set<String> newSelection) {
                      setState(() => _inspectionType = newSelection.first);
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Exterior Section
            _buildSectionHeader(context, 'Eksterior', Icons.directions_car),
            const SizedBox(height: 12),
            _buildConditionDropdown('Body', _bodyCondition, (v) => setState(() => _bodyCondition = v)),
            _buildConditionDropdown('Cat', _paintCondition, (v) => setState(() => _paintCondition = v)),
            _buildConditionDropdown('Ban', _tireCondition, (v) => setState(() => _tireCondition = v)),
            _buildConditionDropdown('Lampu', _lightCondition, (v) => setState(() => _lightCondition = v)),
            _buildConditionDropdown('Kaca', _glassCondition, (v) => setState(() => _glassCondition = v)),
            const SizedBox(height: 24),

            // Interior Section
            _buildSectionHeader(context, 'Interior', Icons.airline_seat_recline_normal),
            const SizedBox(height: 12),
            _buildConditionDropdown('Jok', _seatCondition, (v) => setState(() => _seatCondition = v)),
            _buildConditionDropdown('Dashboard', _dashboardCondition, (v) => setState(() => _dashboardCondition = v)),
            _buildConditionDropdown('AC', _acCondition, (v) => setState(() => _acCondition = v)),
            _buildConditionDropdown('Audio', _audioCondition, (v) => setState(() => _audioCondition = v)),
            const SizedBox(height: 24),

            // Engine Section
            _buildSectionHeader(context, 'Mesin', Icons.build),
            const SizedBox(height: 12),
            _buildConditionDropdown('Suara Mesin', _engineSoundCondition, (v) => setState(() => _engineSoundCondition = v)),
            _buildConditionDropdown('Oli', _oilCondition, (v) => setState(() => _oilCondition = v)),
            _buildConditionDropdown('Radiator', _radiatorCondition, (v) => setState(() => _radiatorCondition = v)),
            const SizedBox(height: 24),

            // Photo Button
            OutlinedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Fitur kamera akan tersedia di versi berikutnya')),
                );
              },
              icon: const Icon(Icons.camera_alt),
              label: const Text('Tambah Foto Kerusakan'),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(double.infinity, 52),
              ),
            ),
            const SizedBox(height: 16),

            // Notes
            TextField(
              controller: _notesController,
              maxLines: 4,
              decoration: const InputDecoration(
                labelText: 'Catatan',
                hintText: 'Tambahkan catatan inspeksi...',
                alignLabelWithHint: true,
                prefixIcon: Padding(
                  padding: EdgeInsets.only(bottom: 64),
                  child: Icon(Icons.notes),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Submit Button
            ElevatedButton(
              onPressed: _isLoading ? null : _submitInspection,
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('Simpan Inspeksi'),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: AppColors.primary, size: 24),
        const SizedBox(width: 8),
        Text(
          title,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
      ],
    );
  }

  Widget _buildConditionDropdown(String label, String currentValue, ValueChanged<String> onChanged) {
    Color conditionColor;
    switch (currentValue) {
      case 'Baik':
        conditionColor = AppColors.success;
        break;
      case 'Cukup':
        conditionColor = AppColors.warning;
        break;
      case 'Rusak':
        conditionColor = AppColors.error;
        break;
      default:
        conditionColor = AppColors.textSecondary;
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: const TextStyle(fontSize: 14),
            ),
          ),
          Expanded(
            flex: 3,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: conditionColor.withOpacity(0.05),
                borderRadius: BorderRadius.circular(AppSizes.radiusSM),
                border: Border.all(color: conditionColor.withOpacity(0.3)),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: currentValue,
                  isExpanded: true,
                  icon: Icon(Icons.arrow_drop_down, color: conditionColor),
                  items: _conditionOptions.map((option) {
                    Color optionColor;
                    switch (option) {
                      case 'Baik':
                        optionColor = AppColors.success;
                        break;
                      case 'Cukup':
                        optionColor = AppColors.warning;
                        break;
                      case 'Rusak':
                        optionColor = AppColors.error;
                        break;
                      default:
                        optionColor = AppColors.textSecondary;
                    }
                    return DropdownMenuItem(
                      value: option,
                      child: Text(option, style: TextStyle(color: optionColor, fontWeight: FontWeight.w500)),
                    );
                  }).toList(),
                  onChanged: (value) {
                    if (value != null) onChanged(value);
                  },
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
