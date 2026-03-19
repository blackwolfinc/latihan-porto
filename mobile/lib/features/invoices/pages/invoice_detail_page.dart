import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_constants.dart';
import '../../../shared/models/invoice.dart';

class InvoiceDetailPage extends StatefulWidget {
  final String invoiceId;

  const InvoiceDetailPage({super.key, required this.invoiceId});

  @override
  State<InvoiceDetailPage> createState() => _InvoiceDetailPageState();
}

class _InvoiceDetailPageState extends State<InvoiceDetailPage> {
  bool _isLoading = true;
  Invoice? _invoice;

  @override
  void initState() {
    super.initState();
    _loadInvoice();
  }

  Future<void> _loadInvoice() async {
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(milliseconds: 400));
    setState(() {
      _invoice = _getDemoInvoice();
      _isLoading = false;
    });
  }

  Invoice _getDemoInvoice() {
    final demos = {
      '1': Invoice(
        id: '1',
        bookingId: 'b1',
        invoiceNumber: 'INV-2026-0001',
        issueDate: DateTime(2026, 3, 10),
        dueDate: DateTime(2026, 3, 17),
        subtotal: 2500000,
        taxRate: 11,
        taxAmount: 275000,
        discount: 0,
        totalAmount: 2775000,
        status: 'PAID',
        customerName: 'Budi Santoso',
        carInfo: 'Toyota Avanza 2024',
        startDate: DateTime(2026, 3, 10),
        endDate: DateTime(2026, 3, 15),
        paidAt: DateTime(2026, 3, 11),
        items: [
          const InvoiceItem(
            id: 'i1',
            description: 'Sewa Toyota Avanza (5 hari)',
            quantity: 5,
            unitPrice: 500000,
            amount: 2500000,
          ),
        ],
      ),
      '2': Invoice(
        id: '2',
        bookingId: 'b2',
        invoiceNumber: 'INV-2026-0002',
        issueDate: DateTime(2026, 3, 15),
        dueDate: DateTime(2026, 3, 22),
        subtotal: 4200000,
        taxRate: 11,
        taxAmount: 462000,
        discount: 200000,
        totalAmount: 4462000,
        status: 'SENT',
        customerName: 'Siti Aminah',
        carInfo: 'Honda CR-V 2025',
        startDate: DateTime(2026, 3, 18),
        endDate: DateTime(2026, 3, 24),
        items: [
          const InvoiceItem(
            id: 'i2',
            description: 'Sewa Honda CR-V (6 hari)',
            quantity: 6,
            unitPrice: 700000,
            amount: 4200000,
          ),
        ],
      ),
      '3': Invoice(
        id: '3',
        bookingId: 'b3',
        invoiceNumber: 'INV-2026-0003',
        issueDate: DateTime(2026, 3, 1),
        dueDate: DateTime(2026, 3, 8),
        subtotal: 1800000,
        taxRate: 11,
        taxAmount: 198000,
        discount: 0,
        totalAmount: 1998000,
        status: 'OVERDUE',
        customerName: 'Ahmad Fauzi',
        carInfo: 'Daihatsu Xenia 2024',
        startDate: DateTime(2026, 3, 2),
        endDate: DateTime(2026, 3, 5),
        items: [
          const InvoiceItem(
            id: 'i3',
            description: 'Sewa Daihatsu Xenia (3 hari)',
            quantity: 3,
            unitPrice: 450000,
            amount: 1350000,
          ),
          const InvoiceItem(
            id: 'i4',
            description: 'Sopir',
            quantity: 3,
            unitPrice: 150000,
            amount: 450000,
          ),
        ],
      ),
      '4': Invoice(
        id: '4',
        bookingId: 'b4',
        invoiceNumber: 'INV-2026-0004',
        issueDate: DateTime(2026, 3, 18),
        dueDate: DateTime(2026, 3, 25),
        subtotal: 3500000,
        taxRate: 11,
        taxAmount: 385000,
        discount: 350000,
        totalAmount: 3535000,
        status: 'DRAFT',
        customerName: 'Dewi Lestari',
        carInfo: 'Mitsubishi Pajero 2025',
        startDate: DateTime(2026, 3, 20),
        endDate: DateTime(2026, 3, 25),
        items: [
          const InvoiceItem(
            id: 'i5',
            description: 'Sewa Mitsubishi Pajero (5 hari)',
            quantity: 5,
            unitPrice: 700000,
            amount: 3500000,
          ),
        ],
      ),
    };

    return demos[widget.invoiceId] ??
        Invoice(
          id: widget.invoiceId,
          bookingId: 'b0',
          invoiceNumber: 'INV-2026-0000',
          issueDate: DateTime.now(),
          dueDate: DateTime.now().add(const Duration(days: 7)),
          subtotal: 1000000,
          taxRate: 11,
          taxAmount: 110000,
          discount: 0,
          totalAmount: 1110000,
          status: 'DRAFT',
          customerName: 'Pelanggan',
          carInfo: 'Mobil',
          items: [
            const InvoiceItem(
              id: 'i0',
              description: 'Sewa Mobil',
              quantity: 1,
              unitPrice: 1000000,
              amount: 1000000,
            ),
          ],
        );
  }

  String _formatCurrency(double amount) {
    final formatted = amount.toStringAsFixed(0).replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
        );
    return 'Rp $formatted';
  }

  String _formatDate(DateTime date) {
    return DateFormat('dd MMMM yyyy', 'id').format(date);
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'PAID':
        return AppColors.success;
      case 'SENT':
        return AppColors.info;
      case 'OVERDUE':
        return AppColors.error;
      case 'CANCELLED':
        return const Color(0xFF757575);
      default:
        return const Color(0xFF757575);
    }
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'DRAFT':
        return 'Draft';
      case 'SENT':
        return 'Terkirim';
      case 'PAID':
        return 'Lunas';
      case 'OVERDUE':
        return 'Jatuh Tempo';
      case 'CANCELLED':
        return 'Dibatalkan';
      default:
        return status;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_invoice?.invoiceNumber ?? 'Invoice'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: () {},
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _invoice == null
              ? const Center(child: Text('Invoice tidak ditemukan'))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _buildInvoicePreview(),
                      const SizedBox(height: 24),
                      _buildActionButtons(),
                      const SizedBox(height: 32),
                    ],
                  ),
                ),
    );
  }

  Widget _buildInvoicePreview() {
    final invoice = _invoice!;
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppSizes.radiusMD),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.04),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(12),
                topRight: Radius.circular(12),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'INVOICE',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w800,
                            color: AppColors.primary,
                            letterSpacing: 2,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          invoice.invoiceNumber,
                          style: TextStyle(
                            fontSize: 14,
                            color: AppColors.textSecondary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    _buildStatusBadge(invoice.status),
                  ],
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // From / To
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Dari',
                            style: TextStyle(
                              fontSize: 11,
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Caritahub Rental',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Jakarta, Indonesia',
                            style: TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Kepada',
                            style: TextStyle(
                              fontSize: 11,
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            invoice.customerName ?? '-',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            invoice.carInfo ?? '-',
                            style: TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Dates
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8F9FA),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: _buildDateInfo(
                          'Tanggal',
                          _formatDate(invoice.issueDate),
                        ),
                      ),
                      Container(
                        width: 1,
                        height: 32,
                        color: AppColors.divider,
                      ),
                      Expanded(
                        child: _buildDateInfo(
                          'Jatuh Tempo',
                          _formatDate(invoice.dueDate),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Items header
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(8),
                      topRight: Radius.circular(8),
                    ),
                  ),
                  child: const Row(
                    children: [
                      Expanded(
                        flex: 4,
                        child: Text(
                          'Deskripsi',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                          ),
                        ),
                      ),
                      Expanded(
                        flex: 1,
                        child: Text(
                          'Qty',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      Expanded(
                        flex: 2,
                        child: Text(
                          'Harga',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                          ),
                          textAlign: TextAlign.right,
                        ),
                      ),
                      Expanded(
                        flex: 2,
                        child: Text(
                          'Jumlah',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                          ),
                          textAlign: TextAlign.right,
                        ),
                      ),
                    ],
                  ),
                ),

                // Items rows
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.divider),
                    borderRadius: const BorderRadius.only(
                      bottomLeft: Radius.circular(8),
                      bottomRight: Radius.circular(8),
                    ),
                  ),
                  child: Column(
                    children: invoice.items.asMap().entries.map((entry) {
                      final item = entry.value;
                      final isLast = entry.key == invoice.items.length - 1;
                      return Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 10),
                        decoration: BoxDecoration(
                          border: isLast
                              ? null
                              : Border(
                                  bottom: BorderSide(color: AppColors.divider),
                                ),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              flex: 4,
                              child: Text(
                                item.description,
                                style: const TextStyle(fontSize: 12),
                              ),
                            ),
                            Expanded(
                              flex: 1,
                              child: Text(
                                '${item.quantity}',
                                style: const TextStyle(fontSize: 12),
                                textAlign: TextAlign.center,
                              ),
                            ),
                            Expanded(
                              flex: 2,
                              child: Text(
                                _formatCurrency(item.unitPrice),
                                style: const TextStyle(fontSize: 11),
                                textAlign: TextAlign.right,
                              ),
                            ),
                            Expanded(
                              flex: 2,
                              child: Text(
                                _formatCurrency(item.amount),
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                ),
                                textAlign: TextAlign.right,
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 16),

                // Totals
                const Divider(),
                const SizedBox(height: 8),
                _buildTotalRow('Subtotal', _formatCurrency(invoice.subtotal)),
                if (invoice.discount > 0)
                  _buildTotalRow(
                    'Diskon',
                    '- ${_formatCurrency(invoice.discount)}',
                    valueColor: AppColors.success,
                  ),
                _buildTotalRow(
                  'PPN ${invoice.taxRate.toStringAsFixed(0)}%',
                  _formatCurrency(invoice.taxAmount),
                ),
                const SizedBox(height: 8),
                const Divider(thickness: 2),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'TOTAL',
                      style: TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 15,
                      ),
                    ),
                    Text(
                      _formatCurrency(invoice.totalAmount),
                      style: TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 18,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),

                if (invoice.isPaid && invoice.paidAt != null) ...[
                  const SizedBox(height: 16),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.success.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: AppColors.success.withOpacity(0.3),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.check_circle,
                          color: AppColors.success,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Dibayar pada ${_formatDate(invoice.paidAt!)}',
                            style: TextStyle(
                              color: AppColors.success,
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateInfo(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTotalRow(String label, String value, {Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: valueColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    final color = _statusColor(status);
    final label = _statusLabel(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  Widget _buildActionButtons() {
    final invoice = _invoice!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (invoice.canPay)
          ElevatedButton.icon(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Mengarahkan ke halaman pembayaran...'),
                ),
              );
            },
            icon: const Icon(Icons.payment),
            label: const Text('Bayar Sekarang'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 52),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        if (invoice.canPay) const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Mengunduh PDF invoice...')),
            );
          },
          icon: const Icon(Icons.picture_as_pdf),
          label: const Text('Download PDF'),
          style: OutlinedButton.styleFrom(
            minimumSize: const Size(double.infinity, 48),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Membagikan invoice...')),
            );
          },
          icon: const Icon(Icons.share),
          label: const Text('Bagikan'),
          style: OutlinedButton.styleFrom(
            minimumSize: const Size(double.infinity, 48),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ],
    );
  }
}
