import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../config/theme.dart';
import '../core/services/volunteer_service.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final volunteerService = context.watch<VolunteerService>();
    final notifications = volunteerService.notifications;

    return Scaffold(
      appBar: AppBar(title: const Text('Notifications')),
      body: RefreshIndicator(
        onRefresh: () => volunteerService.fetchNotifications(),
        child: notifications.isEmpty
            ? ListView(
                children: [
                  SizedBox(
                    height: MediaQuery.of(context).size.height * 0.7,
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.notifications_none_outlined, size: 64, color: Colors.grey[300]),
                          const SizedBox(height: 12),
                          const Text(
                            'No Notifications',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'You have no active alerts or assignment updates.',
                            style: TextStyle(fontSize: 12, color: Colors.black54),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              )
            : ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: notifications.length,
                itemBuilder: (context, index) {
                  final n = notifications[index];
                  final isRead = n.read;
                  final timeStr = DateFormat('dd MMM, hh:mm a').format(n.createdAt);

                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isRead ? Colors.white : Colors.orange.withOpacity(0.04),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isRead
                            ? AppTheme.borderSlate
                            : AppTheme.primaryOrange.withOpacity(0.3),
                      ),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          isRead ? Icons.notifications_outlined : Icons.mark_email_unread_outlined,
                          color: isRead ? Colors.grey : AppTheme.primaryOrange,
                          size: 22,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                n.title,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                  color: AppTheme.deepNavy,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                n.message,
                                style: const TextStyle(fontSize: 11.5, color: Colors.black54),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                timeStr,
                                style: const TextStyle(fontSize: 10, color: Colors.grey),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
      ),
    );
  }
}
