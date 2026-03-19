import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/constants/app_constants.dart';
import '../../../shared/widgets/custom_app_bar.dart';

class PaymentPage extends StatefulWidget {
  final String bookingId;

  const PaymentPage({super.key, required this.bookingId});

  @override
  State<PaymentPage> createState() => _PaymentPageState();
}

class _PaymentPageState extends State<PaymentPage> {
  late final WebViewController _controller;
  bool _isLoading = true;
  String? _snapUrl;
  String? _error;

  @override
  void initState() {
    super.initState();
    _initPayment();
  }

  Future<void> _initPayment() async {
    try {
      final apiClient = ApiClient();
      final response = await apiClient.get(ApiEndpoints.midtransSnapUrl(widget.bookingId));
      final snapUrl = response.data['data']['snapUrl'] as String;

      setState(() {
        _snapUrl = snapUrl;
        _error = null;
      });

      _controller = WebViewController()
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..setNavigationDelegate(
          NavigationDelegate(
            onPageStarted: (_) => setState(() => _isLoading = true),
            onPageFinished: (_) => setState(() => _isLoading = false),
            onNavigationRequest: (request) {
              final url = request.url;
              if (url.contains('transaction_status=settlement') ||
                  url.contains('transaction_status=capture') ||
                  url.contains('status_code=200')) {
                context.go('/payment-status/${widget.bookingId}?status=success');
                return NavigationDecision.prevent;
              }
              if (url.contains('transaction_status=pending')) {
                context.go('/payment-status/${widget.bookingId}?status=pending');
                return NavigationDecision.prevent;
              }
              if (url.contains('transaction_status=deny') ||
                  url.contains('transaction_status=cancel') ||
                  url.contains('transaction_status=expire')) {
                context.go('/payment-status/${widget.bookingId}?status=failed');
                return NavigationDecision.prevent;
              }
              return NavigationDecision.navigate;
            },
          ),
        )
        ..loadRequest(Uri.parse(snapUrl));
    } catch (e) {
      setState(() {
        _error = 'Gagal memuat halaman pembayaran. Silakan coba lagi.';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(
        title: 'Pembayaran',
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _initPayment,
          ),
        ],
      ),
      body: _error != null
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(AppSizes.paddingLG),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.payment, size: 64, color: Colors.grey),
                    const SizedBox(height: 16),
                    Text(
                      _error!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _initPayment,
                      child: const Text('Coba Lagi'),
                    ),
                  ],
                ),
              ),
            )
          : Stack(
              children: [
                if (_snapUrl != null) WebViewWidget(controller: _controller),
                if (_isLoading)
                  const Center(child: CircularProgressIndicator()),
              ],
            ),
    );
  }
}
