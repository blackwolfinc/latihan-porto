import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:signature_pad_widget/signature_pad_widget.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/constants/app_constants.dart';
import '../../../shared/models/contract.dart';

class ContractViewPage extends StatefulWidget {
  final String bookingId;

  const ContractViewPage({super.key, required this.bookingId});

  @override
  State<ContractViewPage> createState() => _ContractViewPageState();
}

class _ContractViewPageState extends State<ContractViewPage> {
  Contract? _contract;
  bool _isLoading = true;
  bool _isSigning = false;
  final GlobalKey<SignaturePadState> _signaturePadKey = GlobalKey<SignaturePadState>();

  @override
  void initState() {
    super.initState();
    _loadContract();
  }

  Future<void> _loadContract() async {
    try {
      final apiClient = ApiClient();
      final response = await apiClient.get(ApiEndpoints.contract(widget.bookingId));
      setState(() {
        _contract = Contract.fromJson(response.data['data'] as Map<String, dynamic>);
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _signContract() async {
    final signaturePadState = _signaturePadKey.currentState;
    if (signaturePadState == null) return;

    final signatureData = signaturePadState.toImage();
    if (signatureData == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Silakan tanda tangan terlebih dahulu')),
      );
      return;
    }

    setState(() => _isSigning = true);
    try {
      final apiClient = ApiClient();
      await apiClient.post(
        ApiEndpoints.signContract(widget.bookingId),
        data: {
          'signature': 'signature_data_placeholder',
        },
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Kontrak berhasil ditandatangani'), backgroundColor: AppColors.success),
        );
        _loadContract();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Gagal menandatangani kontrak'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _isSigning = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Kontrak Rental'),
        actions: [
          IconButton(
            icon: const Icon(Icons.download),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Mengunduh PDF...')),
              );
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _contract == null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.description_outlined, size: 64, color: Colors.grey),
                      const SizedBox(height: 16),
                      const Text('Kontrak belum tersedia'),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadContract,
                        child: const Text('Muat Ulang'),
                      ),
                    ],
                  ),
                )
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(AppSizes.paddingMD),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Contract header
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(AppSizes.paddingMD),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'No. ${_contract!.contractNumber}',
                                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                          fontWeight: FontWeight.bold,
                                        ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: _contract!.isFullySigned
                                          ? AppColors.success.withOpacity(0.1)
                                          : AppColors.warning.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(
                                      _contract!.statusLabel,
                                      style: TextStyle(
                                        color: _contract!.isFullySigned ? AppColors.success : AppColors.warning,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Terms
                      Text(
                        'Syarat dan Ketentuan',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(AppSizes.paddingMD),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(AppSizes.radiusMD),
                          border: Border.all(color: AppColors.divider),
                        ),
                        constraints: const BoxConstraints(maxHeight: 300),
                        child: SingleChildScrollView(
                          child: Text(
                            _contract!.terms,
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.6),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Signature
                      if (!_contract!.isCustomerSigned) ...[
                        Text(
                          'Tanda Tangan',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          height: 200,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(AppSizes.radiusMD),
                            border: Border.all(color: AppColors.divider),
                          ),
                          child: SignaturePadWidget(
                            key: _signaturePadKey,
                            penColor: Colors.black,
                            penMinWidth: 2.0,
                            penMaxWidth: 4.0,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton.icon(
                            onPressed: () {
                              _signaturePadKey.currentState?.clear();
                            },
                            icon: const Icon(Icons.refresh, size: 18),
                            label: const Text('Hapus Tanda Tangan'),
                          ),
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _isSigning ? null : _signContract,
                            child: _isSigning
                                ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                : const Text('Tandatangani'),
                          ),
                        ),
                      ] else ...[
                        Card(
                          color: AppColors.success.withOpacity(0.05),
                          child: const Padding(
                            padding: EdgeInsets.all(AppSizes.paddingMD),
                            child: Row(
                              children: [
                                Icon(Icons.check_circle, color: AppColors.success),
                                SizedBox(width: 12),
                                Text(
                                  'Kontrak telah ditandatangani',
                                  style: TextStyle(color: AppColors.success, fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                      const SizedBox(height: 16),

                      // Download
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Mengunduh PDF kontrak...')),
                            );
                          },
                          icon: const Icon(Icons.picture_as_pdf),
                          label: const Text('Download PDF'),
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
    );
  }
}
