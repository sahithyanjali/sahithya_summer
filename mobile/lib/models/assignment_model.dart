class AssignmentModel {
  final String assignmentId;
  final String opportunityId;
  final String opportunityTitle;
  final String volunteerId;
  final String date;
  final String time;
  final String venue;
  final String status; // 'CONFIRMED' | 'ATTENDED' | 'MISSED'
  final String qrToken;
  final double serviceHours;

  AssignmentModel({
    required this.assignmentId,
    required this.opportunityId,
    required this.opportunityTitle,
    required this.volunteerId,
    required this.date,
    required this.time,
    required this.venue,
    required this.status,
    required this.qrToken,
    required this.serviceHours,
  });

  factory AssignmentModel.fromJson(Map<String, dynamic> json) {
    return AssignmentModel(
      assignmentId: json['assignmentId'] ?? json['id'] ?? '',
      opportunityId: json['opportunityId'] ?? '',
      opportunityTitle: json['opportunityTitle'] ?? '',
      volunteerId: json['volunteerId'] ?? '',
      date: json['date'] ?? json['scheduledDate'] ?? '',
      time: json['time'] ??
          ((json['startTime'] != null && json['endTime'] != null)
              ? "${json['startTime']} - ${json['endTime']}"
              : ''),
      venue: json['venue'] ?? json['venueName'] ?? '',
      status: json['status'] ?? 'CONFIRMED',
      qrToken: json['qrToken'] ?? (json['assignmentId'] != null ? 'SEVA-AUTH-QR-${json['assignmentId']}' : ''),
      serviceHours: (json['serviceHours'] ?? json['hours'] ?? 4.0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'assignmentId': assignmentId,
      'opportunityId': opportunityId,
      'opportunityTitle': opportunityTitle,
      'volunteerId': volunteerId,
      'date': date,
      'time': time,
      'venue': venue,
      'status': status,
      'qrToken': qrToken,
      'serviceHours': serviceHours,
    };
  }
}
