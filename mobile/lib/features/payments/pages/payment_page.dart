import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/constants/app_constants.dart';

class PaymentPage extends StatefulWidget {
  final String bookingId;

  const PaymentPage({super.key, required this.bookingId});

  @override
  State<PaymentPage> createState() => _PaymentPageState();
}

class _PaymentPageState extends State<PaymentPage> {
  late WebViewController _controller;
  bool _isLoading = true;
  String? _snapUrl;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _initPayment();
  }

  Future<void> _initPayment() async {
    try {
      final apiClient = ApiClient();
      final response = await apiClient.post(
        ApiEndpoints.createPayment(widget.bookingId),
      );
      final data = response.data['data'];
      final snapUrl = data['snapUrl'] as String?;

      if (snapUrl != null && snapUrl.isNotEmpty) {
        setState(() {
          _snapUrl = snapUrl;
        });
        _setupWebView(snapUrl);
      } else {
        setState(() {
          _errorMessage = 'URL pembayaran tidak tersedia.';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Gagal memuat halaman pembayaran.';
        _isLoading = false;
      });
    }
  }

  void _setupWebView(String url) {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) {
            setState(() => _isLoading = true);
          },
          onPageFinished: (_) {
            setState(() => _isLoading = false);
          },
          onNavigationRequest: (request) {
            final uri = request.url;
            if (uri.contains('transaction_status=capture') ||
                uri.contains('transaction_status=settlement')) {
              context.go('/payment-status/${widget.bookingId}?status=success');
              return NavigationDecision.prevent;
            }
            if (uri.contains('transaction_status=pending')) {
              context.go('/payment-status/${widget.bookingId}?status=pending');
              return NavigationDecision.prevent;
            }
            if (uri.contains('transaction_status=deny') ||
                uri.contains('transaction_status=cancel') ||
                uri.contains('transaction_status=expire')) {
              context.go('/payment-status/${widget.bookingId}?status=failed');
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(url));
  }

  Future<bool> _onWillPop() async {
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Tinggalkan Pembayaran?'),
        content: const Text(
          'Pembayaran Anda belum selesai. Apakah Anda yakin ingin keluar?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Tetap di sini'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Keluar', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
    return result ?? false;
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        final shouldPop = await _onWillPop();
        if (shouldPop && context.mounted) {
          context.pop();
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Pembayaran'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () async {
              final shouldPop = await _onWillPop();
              if (shouldPop && context.mounted) {
                context.pop();
              }
            },
          ),
        ),
        body: Stack(
          children: [
            if (_snapUrl != null)
              WebViewWidget(controller: _controller)
            else if (_errorMessage != null)
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(AppSizes.paddingLG),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 64, color: AppColors.error),
                      const SizedBox(height: 16),
                      Text(
                        _errorMessage!,
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: () {
                          setState(() {
                            _isLoading = true;
                            _errorMessage = null;
                          });
                          _initPayment();
                        },
                        child: const Text('Coba Lagi'),
                      ),
                    ],
                  ),
                ),
              ),
            if (_isLoading)
              const Center(child: CircularProgressIndicator()),
          ],
        ),
      ),
    );
  }
}
