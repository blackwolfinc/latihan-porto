import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_constants.dart';
import '../../../shared/models/invoice.dart';

class InvoiceListPage extends StatefulWidget {
  const InvoiceListPage({super.key});

  @override
  State<InvoiceListPage> createState() => _InvoiceListPageState();
}

class _InvoiceListPageState extends State<InvoiceListPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = false;
  List<Invoice> _invoices = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadInvoices();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadInvoices() async {
    setState(() => _isLoading = true);
    // Demo data for UI preview
    await Future.delayed(const Duration(milliseconds: 500));
    setState(() {
      _invoices = _generateDemoInvoices();
      _isLoading = false;
    });
  }

  List<Invoice> _generateDemoInvoices() {
    return [
      Invoice(
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
      Invoice(
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
      Invoice(
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
      Invoice(
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
    ];
  }

  List<Invoice> _getFilteredInvoices(int tabIndex) {
    switch (tabIndex) {
      case 1:
        return _invoices
            .where((inv) => inv.status == 'SENT' || inv.status == 'OVERDUE' || inv.status == 'DRAFT')
            .toList();
      case 2:
        return _invoices.where((inv) => inv.status == 'PAID').toList();
      default:
        return _invoices;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Invoice Saya'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        bottom: TabBar(
          controller: _tabController,
          onChanged: (_) => setState(() {}),
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white60,
          indicatorColor: Colors.white,
          indicatorWeight: 3,
          tabs: const [
            Tab(text: 'Semua'),
            Tab(text: 'Belum Bayar'),
            Tab(text: 'Lunas'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: List.generate(3, (tabIndex) {
                final filteredInvoices = _getFilteredInvoices(tabIndex);
                if (filteredInvoices.isEmpty) {
                  return _buildEmptyState(tabIndex);
                }
                return RefreshIndicator(
                  onRefresh: _loadInvoices,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filteredInvoices.length,
                    itemBuilder: (context, index) {
                      return _buildInvoiceCard(filteredInvoices[index]);
                    },
                  ),
                );
              }),
            ),
    );
  }

  Widget _buildEmptyState(int tabIndex) {
    String message;
    switch (tabIndex) {
      case 1:
        message = 'Tidak ada invoice yang belum dibayar';
        break;
      case 2:
        message = 'Belum ada invoice yang lunas';
        break;
      default:
        message = 'Belum ada invoice';
    }
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.receipt_long_outlined,
            size: 64,
            color: Colors.grey.shade400,
          ),
          const SizedBox(height: 16),
          Text(
            message,
            style: TextStyle(
              color: AppColors.textSecondary,
              fontSize: 15,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInvoiceCard(Invoice invoice) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSizes.radiusMD),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppSizes.radiusMD),
        onTap: () => context.push('/invoices/${invoice.id}'),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      invoice.invoiceNumber,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      ),
                    ),
                  ),
                  _buildStatusBadge(invoice.status),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Icon(
                    Icons.directions_car_outlined,
                    size: 16,
                    color: AppColors.textSecondary,
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      invoice.carInfo ?? '-',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Icon(
                    Icons.calendar_today_outlined,
                    size: 16,
                    color: AppColors.textSecondary,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    invoice.startDate != null && invoice.endDate != null
                        ? '${DateFormat('dd MMM').format(invoice.startDate!)} - ${DateFormat('dd MMM yyyy').format(invoice.endDate!)}'
                        : '-',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
              const Divider(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Jatuh tempo: ${DateFormat('dd MMM yyyy').format(invoice.dueDate)}',
                    style: TextStyle(
                      color: invoice.isOverdue
                          ? AppColors.error
                          : AppColors.textSecondary,
                      fontSize: 12,
                      fontWeight:
                          invoice.isOverdue ? FontWeight.w600 : FontWeight.normal,
                    ),
                  ),
                  Text(
                    _formatCurrency(invoice.totalAmount),
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 17,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color bgColor;
    Color textColor;
    String label;

    switch (status) {
      case 'DRAFT':
        bgColor = Colors.grey.shade100;
        textColor = Colors.grey.shade700;
        label = 'Draft';
        break;
      case 'SENT':
        bgColor = AppColors.info.withOpacity(0.1);
        textColor = AppColors.info;
        label = 'Terkirim';
        break;
      case 'PAID':
        bgColor = AppColors.success.withOpacity(0.1);
        textColor = AppColors.success;
        label = 'Lunas';
        break;
      case 'OVERDUE':
        bgColor = AppColors.error.withOpacity(0.1);
        textColor = AppColors.error;
        label = 'Jatuh Tempo';
        break;
      case 'CANCELLED':
        bgColor = Colors.grey.shade100;
        textColor = Colors.grey.shade600;
        label = 'Dibatalkan';
        break;
      default:
        bgColor = Colors.grey.shade100;
        textColor = Colors.grey.shade700;
        label = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: textColor,
          fontSize: 12,
          fontWeight: FontWeight.w600,
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
    return 'Rp $buffer';
  }
}
