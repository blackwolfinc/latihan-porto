import 'package:equatable/equatable.dart';

class Inspection extends Equatable {
  final String id;
  final String bookingId;
  final String inspectorId;
  final String type;
  final Map<String, dynamic> exteriorChecklist;
  final Map<String, dynamic> interiorChecklist;
  final Map<String, dynamic> engineChecklist;
  final List<String> damagePhotos;
  final double fuelLevel;
  final double odometer;
  final String? notes;
  final String overallCondition;
  final DateTime inspectedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Inspection({
    required this.id,
    required this.bookingId,
    required this.inspectorId,
    required this.type,
    this.exteriorChecklist = const {},
    this.interiorChecklist = const {},
    this.engineChecklist = const {},
    this.damagePhotos = const [],
    required this.fuelLevel,
    required this.odometer,
    this.notes,
    required this.overallCondition,
    required this.inspectedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Inspection.fromJson(Map<String, dynamic> json) {
    return Inspection(
      id: json['id'] as String,
      bookingId: json['bookingId'] as String,
      inspectorId: json['inspectorId'] as String,
      type: json['type'] as String,
      exteriorChecklist: json['exteriorChecklist'] as Map<String, dynamic>? ?? {},
      interiorChecklist: json['interiorChecklist'] as Map<String, dynamic>? ?? {},
      engineChecklist: json['engineChecklist'] as Map<String, dynamic>? ?? {},
      damagePhotos: (json['damagePhotos'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      fuelLevel: (json['fuelLevel'] as num).toDouble(),
      odometer: (json['odometer'] as num).toDouble(),
      notes: json['notes'] as String?,
      overallCondition: json['overallCondition'] as String,
      inspectedAt: DateTime.parse(json['inspectedAt'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'bookingId': bookingId,
      'inspectorId': inspectorId,
      'type': type,
      'exteriorChecklist': exteriorChecklist,
      'interiorChecklist': interiorChecklist,
      'engineChecklist': engineChecklist,
      'damagePhotos': damagePhotos,
      'fuelLevel': fuelLevel,
      'odometer': odometer,
      'notes': notes,
      'overallCondition': overallCondition,
      'inspectedAt': inspectedAt.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  String get typeLabel {
    switch (type) {
      case 'PRE_RENTAL':
        return 'Inspeksi Awal';
      case 'POST_RENTAL':
        return 'Inspeksi Akhir';
      default:
        return type;
    }
  }

  String get conditionLabel {
    switch (overallCondition) {
      case 'EXCELLENT':
        return 'Sangat Baik';
      case 'GOOD':
        return 'Baik';
      case 'FAIR':
        return 'Cukup';
      case 'POOR':
        return 'Kurang';
      default:
        return overallCondition;
    }
  }

  @override
  List<Object?> get props => [id, bookingId, type, overallCondition];
}
