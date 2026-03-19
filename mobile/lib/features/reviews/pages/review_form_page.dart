import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/constants/app_constants.dart';
import '../../../shared/models/booking.dart';

class ReviewFormPage extends StatefulWidget {
  final String bookingId;

  const ReviewFormPage({super.key, required this.bookingId});

  @override
  State<ReviewFormPage> createState() => _ReviewFormPageState();
}

class _ReviewFormPageState extends State<ReviewFormPage> {
  int _carRating = 0;
  int _driverRating = 0;
  final _commentController = TextEditingController();
  bool _isSubmitting = false;
  bool _isLoading = true;
  Booking? _booking;

  @override
  void initState() {
    super.initState();
    _loadBooking();
  }

  Future<void> _loadBooking() async {
    try {
      final apiClient = ApiClient();
      final response = await apiClient.get(ApiEndpoints.bookingById(widget.bookingId));
      setState(() {
        _booking = Booking.fromJson(response.data['data'] as Map<String, dynamic>);
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_carRating == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Silakan beri rating untuk mobil')),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final apiClient = ApiClient();
      await apiClient.post(
        ApiEndpoints.createReview(widget.bookingId),
        data: {
          'carRating': _carRating,
          if (_booking?.withDriver == true && _driverRating > 0) 'driverRating': _driverRating,
          if (_commentController.text.isNotEmpty) 'comment': _commentController.text,
        },
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Terima kasih atas review Anda!'), backgroundColor: AppColors.success),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Gagal mengirim review'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Beri Review')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(AppSizes.paddingMD),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Car info
                  if (_booking?.car != null)
                    Card(
                      child: ListTile(
                        leading: Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            color: AppColors.shimmerBase,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.directions_car, color: Colors.grey),
                        ),
                        title: Text(
                          _booking!.car!.name,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        subtitle: Text('${_booking!.car!.category} - ${_booking!.car!.plateNumber}'),
                      ),
                    ),
                  const SizedBox(height: 16),

                  // Driver info
                  if (_booking?.withDriver == true && _booking?.driver != null)
                    Card(
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: AppColors.primaryLight,
                          child: const Icon(Icons.person, color: Colors.white),
                        ),
                        title: Text(
                          _booking!.driver!.displayName,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        subtitle: const Text('Sopir'),
                      ),
                    ),
                  const SizedBox(height: 24),

                  // Car rating
                  Text(
                    'Rating Mobil',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  _buildStarRating(
                    rating: _carRating,
                    onChanged: (rating) => setState(() => _carRating = rating),
                  ),
                  const SizedBox(height: 20),

                  // Driver rating
                  if (_booking?.withDriver == true) ...[
                    Text(
                      'Rating Sopir',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    _buildStarRating(
                      rating: _driverRating,
                      onChanged: (rating) => setState(() => _driverRating = rating),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Comment
                  Text(
                    'Komentar',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _commentController,
                    maxLines: 5,
                    decoration: const InputDecoration(
                      hintText: 'Ceritakan pengalaman Anda...',
                      alignLabelWithHint: true,
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Submit
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isSubmitting ? null : _submit,
                      child: _isSubmitting
                          ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('Kirim Review'),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildStarRating({required int rating, required ValueChanged<int> onChanged}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(5, (index) {
        final starNumber = index + 1;
        return GestureDetector(
          onTap: () => onChanged(starNumber),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Icon(
              starNumber <= rating ? Icons.star : Icons.star_border,
              color: Colors.amber,
              size: 44,
            ),
          ),
        );
      }),
    );
  }
}
