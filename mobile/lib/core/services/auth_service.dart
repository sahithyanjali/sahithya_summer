import 'package:flutter/foundation.dart';
import '../network/api_client.dart';
import '../../config/api_config.dart';
import '../../models/user_model.dart';

class AuthService extends ChangeNotifier {
  final ApiClient _apiClient;
  UserModel? _currentUser;
  bool _isLoading = false;
  String? _errorMessage;

  UserModel? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _currentUser != null;
  String? get errorMessage => _errorMessage;

  AuthService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient() {
    _currentUser = null;
  }

  /// Sends real OTP to mobile number via production backend
  Future<bool> sendOtp(String phoneNumber) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.dio.post(
        ApiConfig.authSendOtp,
        data: {
          'identifier': phoneNumber,
          'type': 'phone',
          'role': 'volunteer',
        },
      );

      final isSuccess = response.statusCode == 200 &&
          (response.data is Map && (response.data['success'] == true));

      if (!isSuccess && response.data is Map && response.data['error'] != null) {
        _errorMessage = response.data['error'].toString();
      }
      return isSuccess;
    } catch (e) {
      debugPrint('Error sending OTP to backend: $e');
      _errorMessage = 'Network error while requesting verification code.';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Verifies OTP code with production backend and stores real session token
  Future<bool> verifyOtp(String phoneNumber, String otp) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.dio.post(
        ApiConfig.authVerifyOtp,
        data: {
          'identifier': phoneNumber,
          'otp': otp,
          'role': 'volunteer',
        },
      );

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        if (data is Map<String, dynamic> && data['success'] == true) {
          final token = data['token'] as String?;
          if (token != null) {
            ApiClient.authToken = token;
          }
          if (data['user'] is Map<String, dynamic>) {
            _currentUser = UserModel.fromJson(data['user'] as Map<String, dynamic>);
          }
          _isLoading = false;
          notifyListeners();
          return true;
        }
        if (data is Map && data['error'] != null) {
          _errorMessage = data['error'].toString();
        }
      }
      return false;
    } catch (e) {
      debugPrint('Error verifying OTP with backend: $e');
      _errorMessage = 'Verification failed. Please check your network connection.';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void logout() {
    _currentUser = null;
    ApiClient.authToken = null;
    notifyListeners();
  }
}
