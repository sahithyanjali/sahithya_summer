class NotificationModel {
  final String notificationId;
  final String userId;
  final String title;
  final String message;
  final String type; // 'APPLICATION_UPDATE' | 'REMINDER' | 'MATCH' | 'BROADCAST'
  final bool read;
  final DateTime createdAt;

  NotificationModel({
    required this.notificationId,
    required this.userId,
    required this.title,
    required this.message,
    required this.type,
    required this.read,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      notificationId: json['notificationId'] ?? json['id'] ?? '',
      userId: json['userId'] ?? '',
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      type: json['type'] ?? 'BROADCAST',
      read: json['read'] ?? json['isRead'] ?? false,
      createdAt: json['createdAt'] != null
          ? (DateTime.tryParse(json['createdAt']) ?? DateTime.now())
          : (json['timestamp'] != null
              ? (DateTime.tryParse(json['timestamp']) ?? DateTime.now())
              : DateTime.now()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'notificationId': notificationId,
      'userId': userId,
      'title': title,
      'message': message,
      'type': type,
      'read': read,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
