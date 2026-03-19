import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/constants/app_constants.dart';
import '../../../shared/models/notification_model.dart';
import '../../../shared/widgets/empty_state.dart';

class NotificationListPage extends StatefulWidget {
  const NotificationListPage({super.key});

  @override
  State<NotificationListPage> createState() => _NotificationListPageState();
}

class _NotificationListPageState extends State<NotificationListPage> {
  List<NotificationModel> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() => _isLoading = true);
    try {
      final apiClient = ApiClient();
      final response = await apiClient.get(ApiEndpoints.notifications);
      final list = (response.data['data'] as List)
          .map((json) => NotificationModel.fromJson(json as Map<String, dynamic>))
          .toList();
      setState(() {
        _notifications = list;
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _markAsRead(String id) async {
    try {
      final apiClient = ApiClient();
      await apiClient.put(ApiEndpoints.markNotificationRead(id));
      setState(() {
        final index = _notifications.indexWhere((n) => n.id == id);
        if (index >= 0) {
          _notifications[index] = _notifications[index].copyWith(isRead: true, readAt: DateTime.now());
        }
      });
    } catch (_) {}
  }

  Future<void> _markAllAsRead() async {
    try {
      final apiClient = ApiClient();
      await apiClient.put(ApiEndpoints.markAllNotificationsRead);
      setState(() {
        _notifications = _notifications
            .map((n) => n.copyWith(isRead: true, readAt: DateTime.now()))
            .toList();
      });
    } catch (_) {}
  }

  IconData _getNotificationIcon(String type) {
    switch (type) {
      case 'BOOKING':
        return Icons.receipt_long;
      case 'PAYMENT':
        return Icons.payment;
      case 'DRIVER':
        return Icons.person;
      case 'PROMO':
        return Icons.local_offer;
      case 'SYSTEM':
        return Icons.settings;
      default:
        return Icons.notifications;
    }
  }

  Color _getNotificationColor(String type) {
    switch (type) {
      case 'BOOKING':
        return AppColors.primary;
      case 'PAYMENT':
        return AppColors.success;
      case 'DRIVER':
        return AppColors.secondary;
      case 'PROMO':
        return Colors.purple;
      case 'SYSTEM':
        return AppColors.textSecondary;
      default:
        return AppColors.primary;
    }
  }

  String _timeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays > 7) {
      return DateFormat('dd MMM yyyy').format(dateTime);
    } else if (difference.inDays > 0) {
      return '${difference.inDays} hari lalu';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} jam lalu';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} menit lalu';
    } else {
      return 'Baru saja';
    }
  }

  void _onNotificationTap(NotificationModel notification) {
    if (!notification.isRead) {
      _markAsRead(notification.id);
    }

    if (notification.referenceId != null && notification.referenceType != null) {
      switch (notification.referenceType) {
        case 'BOOKING':
          context.push('/bookings/${notification.referenceId}');
          break;
        case 'PAYMENT':
          context.push('/payment/${notification.referenceId}');
          break;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = _notifications.where((n) => !n.isRead).length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifikasi'),
        actions: [
          if (unreadCount > 0)
            TextButton(
              onPressed: _markAllAsRead,
              child: const Text(
                'Tandai Dibaca',
                style: TextStyle(color: AppColors.primary, fontSize: 12),
              ),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _notifications.isEmpty
              ? const EmptyState(
                  icon: Icons.notifications_none,
                  title: 'Belum ada notifikasi',
                  subtitle: 'Notifikasi akan muncul di sini',
                )
              : RefreshIndicator(
                  onRefresh: _loadNotifications,
                  child: ListView.separated(
                    itemCount: _notifications.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (context, index) {
                      final notification = _notifications[index];
                      final iconColor = _getNotificationColor(notification.type);

                      return Container(
                        color: notification.isRead ? null : AppColors.primary.withOpacity(0.03),
                        child: ListTile(
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: AppSizes.paddingMD,
                            vertical: AppSizes.paddingSM,
                          ),
                          leading: Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: iconColor.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(AppSizes.radiusSM),
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
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 2),
                              Text(
                                notification.body,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                _timeAgo(notification.createdAt),
                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: AppColors.textSecondary,
                                      fontSize: 11,
                                    ),
                              ),
                            ],
                          ),
                          trailing: !notification.isRead
                              ? Container(
                                  width: 10,
                                  height: 10,
                                  decoration: const BoxDecoration(
                                    color: AppColors.primary,
                                    shape: BoxShape.circle,
                                  ),
                                )
                              : null,
                          onTap: () => _onNotificationTap(notification),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
