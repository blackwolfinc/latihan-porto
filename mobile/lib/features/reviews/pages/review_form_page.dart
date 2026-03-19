import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/constants/app_constants.dart';
import '../../../shared/widgets/custom_app_bar.dart';

class ReviewFormPage extends StatefulWidget {
  final String bookingId;

  const ReviewFormPage({super.key, required this.bookingId});

  @override
  State<ReviewFormPage> createState() => _ReviewFormPageState();
}

class _ReviewFormPageState extends State<ReviewFormPage> {
  int _carRating = 0;
  int _driverRating = 0;
  bool _hasDriver = false;
  bool _isLoading = false;
  final _commentController = TextEditingController();
  String? _carName;

  @override
  void initState() {
    super.initState();
    _loadBookingInfo();
  }

  Future<void> _loadBookingInfo() async {
    try {
      final apiClient = ApiClient();
      final response = await apiClient.get(ApiEndpoints.bookingById(widget.bookingId));
      final data = response.data['data'];
      if (mounted) {
        setState(() {
          _hasDriver = data['withDriver'] as bool? ?? false;
          final car = data['car'];
          if (car != null) {
            _carName = '${car['brand']} ${car['model']} ${car['year']}';
          }
        });
      }
    } catch (_) {
      // Use defaults if loading fails
    }
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _submitReview() async {
    if (_carRating == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Silakan berikan rating mobil'),
          backgroundColor: AppColors.warning,
        ),
      );
      return;
    }

    if (_hasDriver && _driverRating == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Silakan berikan rating driver'),
          backgroundColor: AppColors.warning,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      final apiClient = ApiClient();
      await apiClient.post(
        ApiEndpoints.createReview(widget.bookingId),
        data: {
          'carRating': _carRating,
          if (_hasDriver) 'driverRating': _driverRating,
          if (_commentController.text.isNotEmpty) 'comment': _commentController.text,
        },
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Review berhasil dikirim. Terima kasih!'),
            backgroundColor: AppColors.success,
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Gagal mengirim review. Silakan coba lagi.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'Beri Review'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSizes.paddingMD),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Car Info Card
            if (_carName != null)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSizes.paddingMD),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(AppSizes.radiusMD),
                  border: Border.all(color: AppColors.divider),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.directions_car, color: AppColors.primary, size: 32),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _carName!,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Booking #${widget.bookingId.length > 8 ? widget.bookingId.substring(0, 8) : widget.bookingId}',
                            style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 24),

            // Car Rating
            Text(
              'Rating Mobil',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            _buildStarSelector(
              currentRating: _carRating,
              onRatingChanged: (rating) => setState(() => _carRating = rating),
            ),
            const SizedBox(height: 24),

            // Driver Rating (if applicable)
            if (_hasDriver) ...[
              Text(
                'Rating Driver',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              _buildStarSelector(
                currentRating: _driverRating,
                onRatingChanged: (rating) => setState(() => _driverRating = rating),
              ),
              const SizedBox(height: 24),
            ],

            // Comment
            Text(
              'Komentar',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _commentController,
              maxLines: 4,
              decoration: const InputDecoration(
                hintText: 'Bagikan pengalaman Anda...',
                alignLabelWithHint: true,
              ),
            ),
            const SizedBox(height: 32),

            // Submit Button
            ElevatedButton(
              onPressed: _isLoading ? null : _submitReview,
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('Kirim Review'),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildStarSelector({
    required int currentRating,
    required ValueChanged<int> onRatingChanged,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(5, (index) {
        final starNumber = index + 1;
        return IconButton(
          iconSize: 44,
          onPressed: () => onRatingChanged(starNumber),
          icon: Icon(
            starNumber <= currentRating ? Icons.star : Icons.star_border,
            color: Colors.amber,
          ),
        );
      }),
    );
  }
}
