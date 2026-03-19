import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/constants/app_constants.dart';
import '../../../shared/models/notification_model.dart';
import '../../../shared/widgets/custom_app_bar.dart';
import '../../../shared/widgets/empty_state.dart';

class NotificationListPage extends StatefulWidget {
  const NotificationListPage({super.key});

  @override
  State<NotificationListPage> createState() => _NotificationListPageState();
}

class _NotificationListPageState extends State<NotificationListPage> {
  bool _isLoading = true;
  List<NotificationModel> _notifications = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final apiClient = ApiClient();
      final response = await apiClient.get(ApiEndpoints.notifications);
      final data = response.data['data'] as List;
      if (mounted) {
        setState(() {
          _notifications = data
              .map((json) => NotificationModel.fromJson(json as Map<String, dynamic>))
              .toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = 'Gagal memuat notifikasi';
        });
      }
    }
  }

  Future<void> _markAllAsRead() async {
    try {
      final apiClient = ApiClient();
      await apiClient.post(ApiEndpoints.markAllNotificationsRead);
      if (mounted) {
        setState(() {
          _notifications = _notifications.map((n) => n.copyWith(isRead: true)).toList();
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Semua notifikasi telah ditandai dibaca'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Gagal menandai semua dibaca'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _markAsRead(NotificationModel notification) async {
    if (notification.isRead) return;
    try {
      final apiClient = ApiClient();
      await apiClient.post(ApiEndpoints.markNotificationRead(notification.id));
      if (mounted) {
        setState(() {
          final index = _notifications.indexWhere((n) => n.id == notification.id);
          if (index != -1) {
            _notifications[index] = notification.copyWith(isRead: true);
          }
        });
      }
    } catch (_) {
      // Silently fail
    }
  }

  void _onNotificationTap(NotificationModel notification) {
    _markAsRead(notification);
    if (notification.referenceId != null && notification.referenceType != null) {
      switch (notification.referenceType) {
        case 'BOOKING':
          context.push('/bookings/${notification.referenceId}');
          break;
        case 'PAYMENT':
          context.push('/payment/${notification.referenceId}');
          break;
        case 'CAR':
          context.push('/cars/${notification.referenceId}');
          break;
        default:
          break;
      }
    }
  }

  IconData _getNotificationIcon(String type) {
    switch (type) {
      case 'BOOKING':
        return Icons.calendar_today;
      case 'PAYMENT':
        return Icons.payment;
      case 'DRIVER':
        return Icons.person;
      case 'PROMO':
        return Icons.local_offer;
      case 'SYSTEM':
        return Icons.info;
      default:
        return Icons.notifications;
    }
  }

  Color _getNotificationIconColor(String type) {
    switch (type) {
      case 'BOOKING':
        return AppColors.primary;
      case 'PAYMENT':
        return AppColors.success;
      case 'DRIVER':
        return AppColors.secondary;
      case 'PROMO':
        return AppColors.warning;
      case 'SYSTEM':
        return AppColors.info;
      default:
        return AppColors.textSecondary;
    }
  }

  String _timeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inMinutes < 1) {
      return 'Baru saja';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes} menit lalu';
    } else if (difference.inHours < 24) {
      return '${difference.inHours} jam lalu';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} hari lalu';
    } else if (difference.inDays < 30) {
      return '${(difference.inDays / 7).floor()} minggu lalu';
    } else {
      return '${(difference.inDays / 30).floor()} bulan lalu';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(
        title: 'Notifikasi',
        actions: [
          TextButton(
            onPressed: _notifications.any((n) => !n.isRead) ? _markAllAsRead : null,
            child: const Text(
              'Tandai Semua Dibaca',
              style: TextStyle(color: Colors.white, fontSize: 12),
            ),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? EmptyState(
                  icon: Icons.error_outline,
                  title: 'Terjadi Kesalahan',
                  subtitle: _error,
                  buttonText: 'Coba Lagi',
                  onButtonPressed: _loadNotifications,
                )
              : _notifications.isEmpty
                  ? const EmptyState(
                      icon: Icons.notifications_off_outlined,
                      title: 'Belum ada notifikasi',
                      subtitle: 'Notifikasi Anda akan muncul di sini',
                    )
                  : RefreshIndicator(
                      onRefresh: _loadNotifications,
                      child: ListView.builder(
                        itemCount: _notifications.length,
                        itemBuilder: (context, index) {
                          final notification = _notifications[index];
                          return _buildNotificationTile(notification);
                        },
                      ),
                    ),
    );
  }

  Widget _buildNotificationTile(NotificationModel notification) {
    final iconColor = _getNotificationIconColor(notification.type);
    return Container(
      color: notification.isRead ? Colors.white : const Color(0xFFE3F2FD),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: iconColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            _getNotificationIcon(notification.type),
            color: iconColor,
            size: 22,
          ),
        ),
        title: Text(
          notification.title,
          style: TextStyle(
            fontWeight: notification.isRead ? FontWeight.normal : FontWeight.bold,
            fontSize: 14,
          ),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Text(
            notification.body,
            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        trailing: Text(
          _timeAgo(notification.createdAt),
          style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
        ),
        onTap: () => _onNotificationTap(notification),
      ),
    );
  }
}
