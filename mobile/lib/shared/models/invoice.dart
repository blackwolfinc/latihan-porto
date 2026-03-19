class Invoice {
  final String id;
  final String bookingId;
  final String invoiceNumber;
  final DateTime issueDate;
  final DateTime dueDate;
  final double subtotal;
  final double taxRate;
  final double taxAmount;
  final double discount;
  final double totalAmount;
  final String status;
  final String? notes;
  final DateTime? paidAt;
  final String? pdfUrl;
  final List<InvoiceItem> items;
  final String? customerName;
  final String? carInfo;
  final DateTime? startDate;
  final DateTime? endDate;

  const Invoice({
    required this.id,
    required this.bookingId,
    required this.invoiceNumber,
    required this.issueDate,
    required this.dueDate,
    required this.subtotal,
    required this.taxRate,
    required this.taxAmount,
    required this.discount,
    required this.totalAmount,
    required this.status,
    this.notes,
    this.paidAt,
    this.pdfUrl,
    this.items = const [],
    this.customerName,
    this.carInfo,
    this.startDate,
    this.endDate,
  });

  factory Invoice.fromJson(Map<String, dynamic> json) {
    return Invoice(
      id: json['id'] as String? ?? '',
      bookingId: json['bookingId'] as String? ?? '',
      invoiceNumber: json['invoiceNumber'] as String? ?? '',
      issueDate: json['issueDate'] != null
          ? DateTime.parse(json['issueDate'] as String)
          : DateTime.now(),
      dueDate: json['dueDate'] != null
          ? DateTime.parse(json['dueDate'] as String)
          : DateTime.now(),
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0,
      taxRate: (json['taxRate'] as num?)?.toDouble() ?? 0,
      taxAmount: (json['taxAmount'] as num?)?.toDouble() ?? 0,
      discount: (json['discount'] as num?)?.toDouble() ?? 0,
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0,
      status: json['status'] as String? ?? 'DRAFT',
      notes: json['notes'] as String?,
      paidAt: json['paidAt'] != null
          ? DateTime.parse(json['paidAt'] as String)
          : null,
      pdfUrl: json['pdfUrl'] as String?,
      items: json['items'] != null
          ? (json['items'] as List)
              .map((item) => InvoiceItem.fromJson(item as Map<String, dynamic>))
              .toList()
          : [],
      customerName: json['customerName'] as String?,
      carInfo: json['carInfo'] as String?,
      startDate: json['startDate'] != null
          ? DateTime.parse(json['startDate'] as String)
          : null,
      endDate: json['endDate'] != null
          ? DateTime.parse(json['endDate'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'bookingId': bookingId,
      'invoiceNumber': invoiceNumber,
      'issueDate': issueDate.toIso8601String(),
      'dueDate': dueDate.toIso8601String(),
      'subtotal': subtotal,
      'taxRate': taxRate,
      'taxAmount': taxAmount,
      'discount': discount,
      'totalAmount': totalAmount,
      'status': status,
      'notes': notes,
      'paidAt': paidAt?.toIso8601String(),
      'pdfUrl': pdfUrl,
      'items': items.map((item) => item.toJson()).toList(),
      'customerName': customerName,
      'carInfo': carInfo,
      'startDate': startDate?.toIso8601String(),
      'endDate': endDate?.toIso8601String(),
    };
  }

  bool get isPaid => status == 'PAID';
  bool get isDraft => status == 'DRAFT';
  bool get isSent => status == 'SENT';
  bool get isOverdue => status == 'OVERDUE';
  bool get isCancelled => status == 'CANCELLED';
  bool get canPay => status == 'SENT' || status == 'OVERDUE';
}

class InvoiceItem {
  final String id;
  final String description;
  final int quantity;
  final double unitPrice;
  final double amount;

  const InvoiceItem({
    required this.id,
    required this.description,
    required this.quantity,
    required this.unitPrice,
    required this.amount,
  });

  factory InvoiceItem.fromJson(Map<String, dynamic> json) {
    return InvoiceItem(
      id: json['id'] as String? ?? '',
      description: json['description'] as String? ?? '',
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      unitPrice: (json['unitPrice'] as num?)?.toDouble() ?? 0,
      amount: (json['amount'] as num?)?.toDouble() ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'description': description,
      'quantity': quantity,
      'unitPrice': unitPrice,
      'amount': amount,
    };
  }
}
