class VolunteerProfileModel {
  final String userId;
  final String fullName;
  final String email;
  final String phone;
  final String city;
  final List<String> skills;
  final Map<String, List<String>> availability; // e.g. {'weekdays': ['MORNING'], 'weekends': ['ALL_DAY']}
  final bool identityVerified;
  final String identityDocType;
  final String backgroundCheckStatus; // 'PENDING' | 'CLEARED' | 'FLAGGED'
  final bool termsAccepted;
  final double serviceHoursCompleted;
  final int completedAssignmentsCount;

  VolunteerProfileModel({
    required this.userId,
    required this.fullName,
    required this.email,
    required this.phone,
    required this.city,
    required this.skills,
    required this.availability,
    required this.identityVerified,
    required this.identityDocType,
    required this.backgroundCheckStatus,
    required this.termsAccepted,
    required this.serviceHoursCompleted,
    required this.completedAssignmentsCount,
  });

  factory VolunteerProfileModel.fromJson(Map<String, dynamic> json) {
    return VolunteerProfileModel(
      userId: json['userId'] ?? json['id'] ?? '',
      fullName: json['fullName'] ?? json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      city: json['city'] ?? (json['address'] is Map ? json['address']['city'] : null) ?? '',
      skills: List<String>.from(json['skills'] ?? []),
      availability: (json['availability'] as Map<String, dynamic>?)?.map(
            (k, v) => MapEntry(k, List<String>.from(v ?? [])),
          ) ??
          {},
      identityVerified: json['identityVerified'] ?? json['idVerified'] ?? false,
      identityDocType: json['identityDocType'] ?? 'Aadhaar',
      backgroundCheckStatus: json['backgroundCheckStatus'] ?? 'PENDING',
      termsAccepted: json['termsAccepted'] ?? false,
      serviceHoursCompleted: (json['serviceHoursCompleted'] ?? json['serviceHours'] ?? 0).toDouble(),
      completedAssignmentsCount: json['completedAssignmentsCount'] ?? json['completedEngagementsCount'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'fullName': fullName,
      'email': email,
      'phone': phone,
      'city': city,
      'skills': skills,
      'availability': availability,
      'identityVerified': identityVerified,
      'identityDocType': identityDocType,
      'backgroundCheckStatus': backgroundCheckStatus,
      'termsAccepted': termsAccepted,
      'serviceHoursCompleted': serviceHoursCompleted,
      'completedAssignmentsCount': completedAssignmentsCount,
    };
  }

  VolunteerProfileModel copyWith({
    String? userId,
    String? fullName,
    String? email,
    String? phone,
    String? city,
    List<String>? skills,
    Map<String, List<String>>? availability,
    bool? identityVerified,
    String? identityDocType,
    String? backgroundCheckStatus,
    bool? termsAccepted,
    double? serviceHoursCompleted,
    int? completedAssignmentsCount,
  }) {
    return VolunteerProfileModel(
      userId: userId ?? this.userId,
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      city: city ?? this.city,
      skills: skills ?? this.skills,
      availability: availability ?? this.availability,
      identityVerified: identityVerified ?? this.identityVerified,
      identityDocType: identityDocType ?? this.identityDocType,
      backgroundCheckStatus: backgroundCheckStatus ?? this.backgroundCheckStatus,
      termsAccepted: termsAccepted ?? this.termsAccepted,
      serviceHoursCompleted: serviceHoursCompleted ?? this.serviceHoursCompleted,
      completedAssignmentsCount: completedAssignmentsCount ?? this.completedAssignmentsCount,
    );
  }
}
