import 'package:equatable/equatable.dart';

class Car extends Equatable {
  final String id;
  final String brand;
  final String model;
  final int year;
  final String plateNumber;
  final String category;
  final String transmission;
  final String fuelType;
  final int seatCapacity;
  final String color;
  final double pricePerDay;
  final String status;
  final String? branchId;
  final List<String> images;
  final String? description;
  final double? rating;
  final int? reviewCount;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Car({
    required this.id,
    required this.brand,
    required this.model,
    required this.year,
    required this.plateNumber,
    required this.category,
    required this.transmission,
    required this.fuelType,
    required this.seatCapacity,
    required this.color,
    required this.pricePerDay,
    required this.status,
    this.branchId,
    this.images = const [],
    this.description,
    this.rating,
    this.reviewCount,
    this.createdAt,
    this.updatedAt,
  });

  String get fullName => '$brand $model';
  String get name => '$brand $model';
  int get seats => seatCapacity;

  String get formattedPricePerDay {
    final parts = pricePerDay.toStringAsFixed(0).split('');
    final buffer = StringBuffer();
    for (int i = 0; i < parts.length; i++) {
      if (i > 0 && (parts.length - i) % 3 == 0) buffer.write('.');
      buffer.write(parts[i]);
    }
    return 'Rp $buffer/hari';
  }

  factory Car.fromJson(Map<String, dynamic> json) {
    return Car(
      id: json['id'] as String? ?? json['_id'] as String? ?? '',
      brand: json['brand'] as String? ?? '',
      model: json['model'] as String? ?? '',
      year: json['year'] as int? ?? 0,
      plateNumber: json['plateNumber'] as String? ?? '',
      category: json['category'] as String? ?? '',
      transmission: json['transmission'] as String? ?? '',
      fuelType: json['fuelType'] as String? ?? '',
      seatCapacity: json['seatCapacity'] as int? ?? 0,
      color: json['color'] as String? ?? '',
      pricePerDay: (json['pricePerDay'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] as String? ?? 'available',
      branchId: json['branchId'] as String?,
      images: json['images'] != null
          ? List<String>.from(json['images'] as List)
          : [],
      description: json['description'] as String?,
      rating: (json['rating'] as num?)?.toDouble(),
      reviewCount: json['reviewCount'] as int?,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String)
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'brand': brand,
      'model': model,
      'year': year,
      'plateNumber': plateNumber,
      'category': category,
      'transmission': transmission,
      'fuelType': fuelType,
      'seatCapacity': seatCapacity,
      'color': color,
      'pricePerDay': pricePerDay,
      'status': status,
      'branchId': branchId,
      'images': images,
      'description': description,
      'rating': rating,
      'reviewCount': reviewCount,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [id, brand, model, plateNumber];
}
