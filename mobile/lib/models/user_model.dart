class UserModel {
  final String userId;
  final String name;
  final String email;
  final String phone;
  final String role; // 'VOLUNTEER' | 'COORDINATOR' | 'ADMIN'
  final String status;
  final DateTime createdAt;

  UserModel({
    required this.userId,
    required this.name,
    required this.email,
    required this.phone,
    required this.role,
    required this.status,
    required this.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      userId: json['userId'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      role: json['role'] ?? 'VOLUNTEER',
      status: json['status'] ?? 'ACTIVE',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'name': name,
      'email': email,
      'phone': phone,
      'role': role,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
