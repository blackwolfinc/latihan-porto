import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/constants/app_constants.dart';

class LoadingShimmer extends StatelessWidget {
  final double height;
  final double width;
  final double borderRadius;

  const LoadingShimmer({
    super.key,
    this.height = 20,
    this.width = double.infinity,
    this.borderRadius = 8,
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.shimmerBase,
      highlightColor: AppColors.shimmerHighlight,
      child: Container(
        height: height,
        width: width,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
    );
  }
}

class CarCardShimmer extends StatelessWidget {
  const CarCardShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Shimmer.fromColors(
        baseColor: AppColors.shimmerBase,
        highlightColor: AppColors.shimmerHighlight,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: AppSizes.cardImageHeight,
              width: double.infinity,
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSizes.paddingMD),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(height: 18, width: 180, color: Colors.white),
                  const SizedBox(height: 8),
                  Container(height: 14, width: 120, color: Colors.white),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Container(height: 24, width: 70, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8))),
                      const SizedBox(width: 8),
                      Container(height: 24, width: 70, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8))),
                      const SizedBox(width: 8),
                      Container(height: 24, width: 70, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8))),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(height: 18, width: 140, color: Colors.white),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class BookingCardShimmer extends StatelessWidget {
  const BookingCardShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Shimmer.fromColors(
        baseColor: AppColors.shimmerBase,
        highlightColor: AppColors.shimmerHighlight,
        child: Padding(
          padding: const EdgeInsets.all(AppSizes.paddingMD),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(height: 18, width: 160, color: Colors.white),
                  Container(height: 24, width: 80, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12))),
                ],
              ),
              const SizedBox(height: 12),
              Container(height: 14, width: 200, color: Colors.white),
              const SizedBox(height: 8),
              Container(height: 14, width: 150, color: Colors.white),
              const SizedBox(height: 16),
              Container(height: 1, color: Colors.white),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(height: 14, width: 60, color: Colors.white),
                  Container(height: 18, width: 120, color: Colors.white),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ListShimmer extends StatelessWidget {
  final int itemCount;
  final Widget Function(BuildContext, int)? itemBuilder;

  const ListShimmer({
    super.key,
    this.itemCount = 5,
    this.itemBuilder,
  });

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: itemCount,
      itemBuilder: itemBuilder ??
          (context, index) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Shimmer.fromColors(
                  baseColor: AppColors.shimmerBase,
                  highlightColor: AppColors.shimmerHighlight,
                  child: Container(
                    height: 80,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
    );
  }
}
