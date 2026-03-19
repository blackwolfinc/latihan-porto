import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/constants/app_constants.dart';
import '../models/car.dart';
import 'status_badge.dart';

class CarCard extends StatelessWidget {
  final Car car;
  final VoidCallback? onTap;
  final bool isCompact;

  const CarCard({
    super.key,
    required this.car,
    this.onTap,
    this.isCompact = false,
  });

  @override
  Widget build(BuildContext context) {
    if (isCompact) {
      return _buildCompactCard(context);
    }
    return _buildFullCard(context);
  }

  Widget _buildFullCard(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSizes.radiusLG),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              child: SizedBox(
                height: AppSizes.cardImageHeight,
                width: double.infinity,
                child: car.images.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: car.images.first,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(
                          color: AppColors.shimmerBase,
                          child: const Center(child: CircularProgressIndicator()),
                        ),
                        errorWidget: (context, url, error) => Container(
                          color: AppColors.shimmerBase,
                          child: const Icon(Icons.directions_car, size: 64, color: Colors.grey),
                        ),
                      )
                    : Container(
                        color: AppColors.shimmerBase,
                        child: const Icon(Icons.directions_car, size: 64, color: Colors.grey),
                      ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSizes.paddingMD),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          car.name,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      StatusBadge(
                        label: car.status == 'AVAILABLE' ? 'Tersedia' : 'Tidak Tersedia',
                        color: car.status == 'AVAILABLE' ? AppColors.success : AppColors.error,
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${car.brand} ${car.model} - ${car.year}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      _buildSpecChip(Icons.people, '${car.seats} kursi'),
                      const SizedBox(width: 8),
                      _buildSpecChip(Icons.settings, car.transmission),
                      const SizedBox(width: 8),
                      _buildSpecChip(Icons.local_gas_station, car.fuelType),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      if (car.rating != null)
                        Row(
                          children: [
                            const Icon(Icons.star, color: Colors.amber, size: 18),
                            const SizedBox(width: 4),
                            Text(
                              car.rating!.toStringAsFixed(1),
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                            ),
                            if (car.reviewCount != null)
                              Text(
                                ' (${car.reviewCount})',
                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: AppColors.textSecondary,
                                    ),
                              ),
                          ],
                        ),
                      Text(
                        car.formattedPricePerDay,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCompactCard(BuildContext context) {
    return SizedBox(
      width: 200,
      child: Card(
        margin: const EdgeInsets.only(right: 12),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppSizes.radiusLG),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                child: SizedBox(
                  height: 120,
                  width: double.infinity,
                  child: car.images.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: car.images.first,
                          fit: BoxFit.cover,
                          placeholder: (context, url) => Container(color: AppColors.shimmerBase),
                          errorWidget: (context, url, error) => Container(
                            color: AppColors.shimmerBase,
                            child: const Icon(Icons.directions_car, size: 40, color: Colors.grey),
                          ),
                        )
                      : Container(
                          color: AppColors.shimmerBase,
                          child: const Icon(Icons.directions_car, size: 40, color: Colors.grey),
                        ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      car.name,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      car.category,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      car.formattedPricePerDay,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSpecChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(AppSizes.radiusSM),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppColors.textSecondary),
          const SizedBox(width: 4),
          Text(
            label,
            style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }
}
