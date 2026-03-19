import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'dart:io';
import '../../../core/constants/app_constants.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';

class VerificationPage extends StatefulWidget {
  const VerificationPage({super.key});

  @override
  State<VerificationPage> createState() => _VerificationPageState();
}

class _VerificationPageState extends State<VerificationPage> {
  final _formKey = GlobalKey<FormState>();
  final _apiClient = ApiClient();
  final _picker = ImagePicker();

  // Form controllers
  final _ktpNumberController = TextEditingController();
  final _ktpNameController = TextEditingController();
  final _ktpAddressController = TextEditingController();
  final _simNumberController = TextEditingController();

  // State
  bool _loading = false;
  bool _submitting = false;
  String? _verificationStatus;
  String? _rejectionReason;
  int _riskScore = 0;

  String? _selectedSimType;
  DateTime? _simExpiryDate;

  File? _ktpPhoto;
  File? _simPhoto;
  File? _selfiePhoto;

  String? _ktpPhotoUrl;
  String? _simPhotoUrl;
  String? _selfiePhotoUrl;

  final List<String> _simTypes = ['A', 'B1', 'B2', 'C'];

  @override
  void initState() {
    super.initState();
    _loadVerification();
  }

  @override
  void dispose() {
    _ktpNumberController.dispose();
    _ktpNameController.dispose();
    _ktpAddressController.dispose();
    _simNumberController.dispose();
    super.dispose();
  }

  Future<void> _loadVerification() async {
    setState(() => _loading = true);
    try {
      final response = await _apiClient.get(ApiEndpoints.verificationStatus);
      if (response != null && response.data != null) {
        final data = response.data;
        setState(() {
          _verificationStatus = data['verificationStatus'];
          _rejectionReason = data['rejectionReason'];
          _riskScore = data['riskScore'] ?? 0;
          _ktpNumberController.text = data['ktpNumber'] ?? '';
          _ktpNameController.text = data['ktpName'] ?? '';
          _ktpAddressController.text = data['ktpAddress'] ?? '';
          _simNumberController.text = data['simNumber'] ?? '';
          _selectedSimType = data['simType'];
          _ktpPhotoUrl = data['ktpPhotoUrl'];
          _simPhotoUrl = data['simPhotoUrl'];
          _selfiePhotoUrl = data['selfiePhotoUrl'];
          if (data['simExpiryDate'] != null) {
            _simExpiryDate = DateTime.tryParse(data['simExpiryDate']);
          }
        });
      }
    } catch (_) {
      // No existing verification data
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _pickImage(String type) async {
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      builder: (ctx) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Kamera'),
              onTap: () => Navigator.pop(ctx, ImageSource.camera),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Galeri'),
              onTap: () => Navigator.pop(ctx, ImageSource.gallery),
            ),
          ],
        ),
      ),
    );
    if (source == null) return;

    final picked = await _picker.pickImage(
      source: source,
      maxWidth: AppConstants.maxImageWidth,
      maxHeight: AppConstants.maxImageHeight,
      imageQuality: AppConstants.imageQuality,
    );
    if (picked == null) return;

    setState(() {
      switch (type) {
        case 'ktp':
          _ktpPhoto = File(picked.path);
          break;
        case 'sim':
          _simPhoto = File(picked.path);
          break;
        case 'selfie':
          _selfiePhoto = File(picked.path);
          break;
      }
    });
  }

  Future<void> _selectExpiryDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _simExpiryDate ?? DateTime.now().add(const Duration(days: 365)),
      firstDate: DateTime(2020),
      lastDate: DateTime(2040),
      helpText: 'Pilih tanggal expired SIM',
    );
    if (date != null) {
      setState(() => _simExpiryDate = date);
    }
  }

  Future<void> _submitVerification() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _submitting = true);
    try {
      final body = <String, dynamic>{
        'ktpNumber': _ktpNumberController.text.trim(),
        'ktpName': _ktpNameController.text.trim(),
        'ktpAddress': _ktpAddressController.text.trim(),
        'simNumber': _simNumberController.text.trim(),
        'simType': _selectedSimType,
      };

      if (_simExpiryDate != null) {
        body['simExpiryDate'] = _simExpiryDate!.toIso8601String();
      }

      // In production, upload photos first and get URLs
      // For now, use existing URLs if available
      if (_ktpPhotoUrl != null) body['ktpPhotoUrl'] = _ktpPhotoUrl;
      if (_simPhotoUrl != null) body['simPhotoUrl'] = _simPhotoUrl;
      if (_selfiePhotoUrl != null) body['selfiePhotoUrl'] = _selfiePhotoUrl;

      await _apiClient.post(ApiEndpoints.verificationSubmit, data: body);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Dokumen berhasil dikirim untuk verifikasi'),
            backgroundColor: AppColors.success,
          ),
        );
        _loadVerification();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal mengirim verifikasi: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Verifikasi Identitas'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(AppSizes.paddingMD),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildStatusBanner(),
                  const SizedBox(height: 20),
                  if (_verificationStatus != 'VERIFIED') ...[
                    _buildVerificationForm(),
                  ] else ...[
                    _buildVerifiedInfo(),
                  ],
                ],
              ),
            ),
    );
  }

  Widget _buildStatusBanner() {
    IconData icon;
    Color color;
    String title;
    String subtitle;

    switch (_verificationStatus) {
      case 'PENDING':
        icon = Icons.hourglass_empty;
        color = AppColors.warning;
        title = 'Menunggu Verifikasi';
        subtitle = 'Dokumen Anda sedang dalam antrian untuk direview';
        break;
      case 'IN_REVIEW':
        icon = Icons.rate_review;
        color = AppColors.info;
        title = 'Sedang Direview';
        subtitle = 'Admin sedang memeriksa dokumen Anda';
        break;
      case 'VERIFIED':
        icon = Icons.check_circle;
        color = AppColors.success;
        title = 'Terverifikasi';
        subtitle = 'Identitas Anda telah diverifikasi';
        break;
      case 'REJECTED':
        icon = Icons.cancel;
        color = AppColors.error;
        title = 'Ditolak';
        subtitle = _rejectionReason ?? 'Verifikasi ditolak. Silakan perbaiki dan kirim ulang.';
        break;
      default:
        icon = Icons.info_outline;
        color = AppColors.textSecondary;
        title = 'Belum Diverifikasi';
        subtitle = 'Lengkapi data KTP/SIM untuk verifikasi identitas Anda';
        break;
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSizes.paddingMD),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppSizes.radiusMD),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 40),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 13,
                    color: color.withOpacity(0.8),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVerifiedInfo() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSizes.paddingMD),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildInfoRow('Nama KTP', _ktpNameController.text),
            _buildInfoRow('No. KTP', _ktpNumberController.text),
            _buildInfoRow('Alamat', _ktpAddressController.text),
            _buildInfoRow('No. SIM', _simNumberController.text),
            _buildInfoRow('Tipe SIM', _selectedSimType ?? '-'),
            if (_simExpiryDate != null)
              _buildInfoRow('Expired SIM', DateFormat('dd/MM/yyyy').format(_simExpiryDate!)),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 14,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value.isEmpty ? '-' : value,
              style: const TextStyle(
                fontWeight: FontWeight.w500,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVerificationForm() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // KTP Section
          _buildSectionHeader('Data KTP', Icons.credit_card),
          const SizedBox(height: 12),
          _buildPhotoUpload(
            label: 'Foto KTP',
            file: _ktpPhoto,
            existingUrl: _ktpPhotoUrl,
            onTap: () => _pickImage('ktp'),
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _ktpNumberController,
            decoration: const InputDecoration(
              labelText: 'Nomor KTP',
              hintText: 'Masukkan 16 digit NIK',
              prefixIcon: Icon(Icons.badge),
              border: OutlineInputBorder(),
            ),
            keyboardType: TextInputType.number,
            maxLength: 16,
            validator: (val) {
              if (val == null || val.isEmpty) return 'Nomor KTP wajib diisi';
              if (val.length != 16) return 'Nomor KTP harus 16 digit';
              return null;
            },
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _ktpNameController,
            decoration: const InputDecoration(
              labelText: 'Nama Sesuai KTP',
              prefixIcon: Icon(Icons.person),
              border: OutlineInputBorder(),
            ),
            validator: (val) {
              if (val == null || val.isEmpty) return 'Nama wajib diisi';
              return null;
            },
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _ktpAddressController,
            decoration: const InputDecoration(
              labelText: 'Alamat Sesuai KTP',
              prefixIcon: Icon(Icons.location_on),
              border: OutlineInputBorder(),
            ),
            maxLines: 2,
            validator: (val) {
              if (val == null || val.isEmpty) return 'Alamat wajib diisi';
              return null;
            },
          ),

          const SizedBox(height: 24),

          // SIM Section
          _buildSectionHeader('Data SIM', Icons.drive_eta),
          const SizedBox(height: 12),
          _buildPhotoUpload(
            label: 'Foto SIM',
            file: _simPhoto,
            existingUrl: _simPhotoUrl,
            onTap: () => _pickImage('sim'),
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _simNumberController,
            decoration: const InputDecoration(
              labelText: 'Nomor SIM',
              prefixIcon: Icon(Icons.badge),
              border: OutlineInputBorder(),
            ),
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            value: _selectedSimType,
            decoration: const InputDecoration(
              labelText: 'Tipe SIM',
              prefixIcon: Icon(Icons.category),
              border: OutlineInputBorder(),
            ),
            items: _simTypes.map((type) => DropdownMenuItem(
              value: type,
              child: Text('SIM $type'),
            )).toList(),
            onChanged: (val) => setState(() => _selectedSimType = val),
          ),
          const SizedBox(height: 12),
          InkWell(
            onTap: _selectExpiryDate,
            child: InputDecorator(
              decoration: const InputDecoration(
                labelText: 'Tanggal Expired SIM',
                prefixIcon: Icon(Icons.calendar_today),
                border: OutlineInputBorder(),
              ),
              child: Text(
                _simExpiryDate != null
                    ? DateFormat('dd/MM/yyyy').format(_simExpiryDate!)
                    : 'Pilih tanggal',
                style: TextStyle(
                  color: _simExpiryDate != null ? AppColors.textPrimary : AppColors.textSecondary,
                ),
              ),
            ),
          ),

          const SizedBox(height: 24),

          // Selfie Section
          _buildSectionHeader('Selfie dengan KTP', Icons.camera_front),
          const SizedBox(height: 8),
          Text(
            'Ambil foto selfie sambil memegang KTP di samping wajah Anda',
            style: TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 12),
          _buildPhotoUpload(
            label: 'Selfie dengan KTP',
            file: _selfiePhoto,
            existingUrl: _selfiePhotoUrl,
            onTap: () => _pickImage('selfie'),
            height: 200,
          ),

          const SizedBox(height: 32),

          // Submit Button
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: _submitting ? null : _submitVerification,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppSizes.radiusMD),
                ),
              ),
              child: _submitting
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : const Text(
                      'Kirim untuk Verifikasi',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: AppColors.primary, size: 22),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildPhotoUpload({
    required String label,
    File? file,
    String? existingUrl,
    required VoidCallback onTap,
    double height = 160,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        height: height,
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(AppSizes.radiusMD),
          border: Border.all(
            color: AppColors.divider,
            width: 1.5,
            style: BorderStyle.solid,
          ),
        ),
        child: file != null
            ? ClipRRect(
                borderRadius: BorderRadius.circular(AppSizes.radiusMD),
                child: Image.file(
                  file,
                  fit: BoxFit.cover,
                  width: double.infinity,
                  height: height,
                ),
              )
            : existingUrl != null
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(AppSizes.radiusMD),
                    child: Image.network(
                      existingUrl,
                      fit: BoxFit.cover,
                      width: double.infinity,
                      height: height,
                      errorBuilder: (_, __, ___) => _buildPhotoPlaceholder(label),
                    ),
                  )
                : _buildPhotoPlaceholder(label),
      ),
    );
  }

  Widget _buildPhotoPlaceholder(String label) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.camera_alt_outlined, size: 40, color: AppColors.textSecondary),
          const SizedBox(height: 8),
          Text(
            'Upload $label',
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 14),
          ),
          const SizedBox(height: 4),
          const Text(
            'Ketuk untuk memilih foto',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
          ),
        ],
      ),
    );
  }
}
