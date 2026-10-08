class ApplicationModel {
  final String applicationId;
  final String opportunityId;
  final String opportunityTitle;
  final String volunteerId;
  final String status; // 'APPLIED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
  final int matchScore;
  final DateTime appliedAt;

  ApplicationModel({
    required this.applicationId,
    required this.opportunityId,
    required this.opportunityTitle,
    required this.volunteerId,
    required this.status,
    required this.matchScore,
    required this.appliedAt,
  });

  factory ApplicationModel.fromJson(Map<String, dynamic> json) {
    return ApplicationModel(
      applicationId: json['applicationId'] ?? json['id'] ?? '',
      opportunityId: json['opportunityId'] ?? '',
      opportunityTitle: json['opportunityTitle'] ?? '',
      volunteerId: json['volunteerId'] ?? '',
      status: json['status'] ?? 'APPLIED',
      matchScore: json['matchScore'] ?? 0,
      appliedAt: json['appliedAt'] != null
          ? (DateTime.tryParse(json['appliedAt']) ?? DateTime.now())
          : (json['appliedDate'] != null
              ? (DateTime.tryParse(json['appliedDate']) ?? DateTime.now())
              : DateTime.now()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'applicationId': applicationId,
      'opportunityId': opportunityId,
      'opportunityTitle': opportunityTitle,
      'volunteerId': volunteerId,
      'status': status,
      'matchScore': matchScore,
      'appliedAt': appliedAt.toIso8601String(),
    };
  }
}
