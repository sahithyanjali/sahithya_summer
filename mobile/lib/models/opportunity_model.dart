class OpportunityModel {
  final String id;
  final String title;
  final String category; // 'FOOD_RELIEF' | 'EDUCATION' | 'HEALTHCARE' | 'BLOOD_DRIVE'
  final String description;
  final String venue;
  final String date;
  final String startTime;
  final String endTime;
  final int capacity;
  final int assignedCount;
  final List<String> skillsRequired;
  final String urgencyLevel; // 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'
  final String expectedImpact;
  final String status; // 'DRAFT' | 'PUBLISHED' | 'FILLED' | 'COMPLETED'

  OpportunityModel({
    required this.id,
    required this.title,
    required this.category,
    required this.description,
    required this.venue,
    required this.date,
    required this.startTime,
    required this.endTime,
    required this.capacity,
    required this.assignedCount,
    required this.skillsRequired,
    required this.urgencyLevel,
    required this.expectedImpact,
    required this.status,
  });

  factory OpportunityModel.fromJson(Map<String, dynamic> json) {
    return OpportunityModel(
      id: json['id'] ?? json['opportunityId'] ?? '',
      title: json['title'] ?? '',
      category: json['category'] ?? 'FOOD_RELIEF',
      description: json['description'] ?? '',
      venue: json['venue'] ?? (json['location'] is Map ? json['location']['venueName'] : json['location']) ?? '',
      date: json['date'] ?? json['scheduledDate'] ?? '',
      startTime: json['startTime'] ?? '09:00',
      endTime: json['endTime'] ?? '13:00',
      capacity: json['capacity'] ?? 20,
      assignedCount: json['assignedCount'] ?? 0,
      skillsRequired: List<String>.from(json['skillsRequired'] ?? json['requiredSkills'] ?? []),
      urgencyLevel: json['urgencyLevel'] ?? 'NORMAL',
      expectedImpact: json['expectedImpact'] ?? '',
      status: json['status'] ?? 'PUBLISHED',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'category': category,
      'description': description,
      'venue': venue,
      'date': date,
      'startTime': startTime,
      'endTime': endTime,
      'capacity': capacity,
      'assignedCount': assignedCount,
      'skillsRequired': skillsRequired,
      'urgencyLevel': urgencyLevel,
      'expectedImpact': expectedImpact,
      'status': status,
    };
  }
}
