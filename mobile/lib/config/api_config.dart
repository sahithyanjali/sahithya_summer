class ApiConfig {
  // Base backend endpoint (running on Cloud Run or local dev proxy)
  static const String baseUrl = 'https://api.sevasphoorthi.org/api/v1';
  static const Duration timeoutDuration = Duration(seconds: 15);

  // Endpoints
  static const String authPhoneLogin = '/auth/send-otp';
  static const String authSendOtp = '/auth/send-otp';
  static const String authVerifyOtp = '/auth/verify-otp';
  static const String volunteerProfile = '/profile';
  static const String volunteerSkills = '/skills';
  static const String volunteerAvailability = '/volunteer/availability';
  static const String volunteerVerifyId = '/profile/upload-id';
  static const String opportunities = '/opportunities';
  static const String applications = '/applications';
  static const String assignments = '/schedule';
  static const String qrCheckIn = '/attendance/qr-checkin';
  static const String notifications = '/notifications';
  static const String engagements = '/engagements';
}
