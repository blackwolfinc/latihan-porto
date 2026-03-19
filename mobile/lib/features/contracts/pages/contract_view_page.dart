import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/constants/app_constants.dart';
import '../../../shared/widgets/custom_app_bar.dart';

class ContractViewPage extends StatefulWidget {
  final String bookingId;

  const ContractViewPage({super.key, required this.bookingId});

  @override
  State<ContractViewPage> createState() => _ContractViewPageState();
}

class _ContractViewPageState extends State<ContractViewPage> {
  bool _isLoading = true;
  bool _isSigning = false;
  bool _isSigned = false;
  String? _error;
  Map<String, dynamic>? _contractData;
  Map<String, dynamic>? _bookingData;

  @override
  void initState() {
    super.initState();
    _loadContract();
  }

  Future<void> _loadContract() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final apiClient = ApiClient();
      final contractResponse = await apiClient.get(ApiEndpoints.contract(widget.bookingId));
      final bookingResponse = await apiClient.get(ApiEndpoints.bookingById(widget.bookingId));

      if (mounted) {
        setState(() {
          _contractData = contractResponse.data['data'] as Map<String, dynamic>?;
          _bookingData = bookingResponse.data['data'] as Map<String, dynamic>?;
          _isSigned = _contractData?['isSigned'] as bool? ?? false;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = 'Gagal memuat kontrak. Silakan coba lagi.';
        });
      }
    }
  }

  Future<void> _signContract() async {
    setState(() => _isSigning = true);
    try {
      final apiClient = ApiClient();
      await apiClient.post(ApiEndpoints.signContract(widget.bookingId));
      if (mounted) {
        setState(() {
          _isSigned = true;
          _isSigning = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Kontrak berhasil ditandatangani'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSigning = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Gagal menandatangani kontrak'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  String _formatCurrency(double amount) {
    return amount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (m) => '${m[1]}.',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'Kontrak Sewa'),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 48, color: Colors.grey),
                      const SizedBox(height: 8),
                      Text(_error!, style: const TextStyle(color: AppColors.textSecondary)),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadContract,
                        child: const Text('Coba Lagi'),
                      ),
                    ],
                  ),
                )
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(AppSizes.paddingMD),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Booking Summary Card
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(AppSizes.paddingMD),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(AppSizes.radiusMD),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.05),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Ringkasan Pemesanan',
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                            ),
                            const Divider(height: 20),
                            if (_bookingData != null) ...[
                              _buildInfoRow('ID Booking', '#${widget.bookingId.length > 8 ? widget.bookingId.substring(0, 8) : widget.bookingId}'),
                              if (_bookingData!['car'] != null)
                                _buildInfoRow('Mobil', '${_bookingData!['car']['brand']} ${_bookingData!['car']['model']}'),
                              _buildInfoRow('Status', _bookingData!['status'] as String? ?? '-'),
                              _buildInfoRow('Total', 'Rp ${_formatCurrency((_bookingData!['totalAmount'] as num?)?.toDouble() ?? 0)}'),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Contract Terms
                      Text(
                        'Syarat dan Ketentuan',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(AppSizes.paddingMD),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(AppSizes.radiusMD),
                          border: Border.all(color: AppColors.divider),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildTermSection('1. Ketentuan Umum',
                                'Penyewa setuju untuk menggunakan kendaraan sesuai dengan ketentuan yang berlaku di Caritahub Rental. Kendaraan hanya boleh digunakan untuk keperluan yang sah menurut hukum.'),
                            _buildTermSection('2. Jangka Waktu Sewa',
                                'Jangka waktu sewa dimulai dari tanggal pengambilan hingga tanggal pengembalian yang telah disepakati. Keterlambatan pengembalian akan dikenakan denda sesuai tarif harian.'),
                            _buildTermSection('3. Kondisi Kendaraan',
                                'Penyewa wajib menjaga kondisi kendaraan selama masa sewa. Kerusakan yang disebabkan oleh kelalaian penyewa menjadi tanggung jawab penyewa.'),
                            _buildTermSection('4. Bahan Bakar',
                                'Kendaraan diserahkan dengan tangki penuh dan harus dikembalikan dengan kondisi tangki penuh. Apabila tidak, akan dikenakan biaya pengisian bahan bakar.'),
                            _buildTermSection('5. Asuransi',
                                'Kendaraan dilindungi oleh asuransi dasar. Penyewa bertanggung jawab atas biaya excess sesuai ketentuan asuransi yang berlaku.'),
                            _buildTermSection('6. Larangan',
                                'Penyewa dilarang: menggunakan kendaraan untuk balap, membawa barang ilegal, menyewakan ulang kendaraan kepada pihak ketiga, atau memodifikasi kendaraan tanpa izin.'),
                            _buildTermSection('7. Pembatalan',
                                'Pembatalan yang dilakukan kurang dari 24 jam sebelum waktu pengambilan akan dikenakan biaya pembatalan sebesar 50% dari total biaya sewa.'),
                            _buildTermSection('8. Force Majeure',
                                'Kedua belah pihak dibebaskan dari kewajiban apabila terjadi keadaan memaksa seperti bencana alam, perang, atau kebijakan pemerintah.'),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Digital Signature
                      const Divider(),
                      const SizedBox(height: 16),
                      Text(
                        'Tanda Tangan Digital',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      Container(
                        width: double.infinity,
                        height: 150,
                        decoration: BoxDecoration(
                          color: _isSigned ? AppColors.success.withOpacity(0.05) : Colors.grey.shade50,
                          borderRadius: BorderRadius.circular(AppSizes.radiusMD),
                          border: Border.all(
                            color: _isSigned ? AppColors.success.withOpacity(0.3) : AppColors.divider,
                            width: 2,
                            style: _isSigned ? BorderStyle.solid : BorderStyle.none,
                          ),
                        ),
                        child: Center(
                          child: _isSigned
                              ? Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(Icons.verified, color: AppColors.success, size: 48),
                                    const SizedBox(height: 8),
                                    Text(
                                      'Kontrak telah ditandatangani',
                                      style: TextStyle(
                                        color: AppColors.success,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                )
                              : Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.draw, size: 40, color: Colors.grey.shade400),
                                    const SizedBox(height: 8),
                                    Text(
                                      'Area tanda tangan',
                                      style: TextStyle(color: Colors.grey.shade500),
                                    ),
                                  ],
                                ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Sign Button
                      if (!_isSigned)
                        ElevatedButton(
                          onPressed: _isSigning ? null : _signContract,
                          child: _isSigning
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              : const Text('Tandatangani'),
                        ),
                      const SizedBox(height: 12),

                      // Download PDF Button
                      OutlinedButton.icon(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Mengunduh PDF kontrak...')),
                          );
                        },
                        icon: const Icon(Icons.picture_as_pdf),
                        label: const Text('Download PDF'),
                      ),
                      const SizedBox(height: 32),
                    ],
                  ),
                ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13)),
        ],
      ),
    );
  }

  Widget _buildTermSection(String title, String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
          const SizedBox(height: 4),
          Text(
            content,
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 13, height: 1.5),
          ),
        ],
      ),
    );
  }
}
