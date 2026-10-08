import 'package:flutter/foundation.dart';
import '../network/api_client.dart';
import '../../config/api_config.dart';
import '../../models/volunteer_profile_model.dart';
import '../../models/opportunity_model.dart';
import '../../models/application_model.dart';
import '../../models/assignment_model.dart';
import '../../models/notification_model.dart';

class VolunteerService extends ChangeNotifier {
  final ApiClient _apiClient;

  VolunteerProfileModel? _profile;
  List<OpportunityModel> _opportunities = [];
  List<ApplicationModel> _applications = [];
  List<AssignmentModel> _assignments = [];
  List<NotificationModel> _notifications = [];
  bool _isLoading = false;
  String? _errorMessage;

  VolunteerProfileModel? get profile => _profile;
  List<OpportunityModel> get opportunities => _opportunities;
  List<ApplicationModel> get applications => _applications;
  List<AssignmentModel> get assignments => _assignments;
  List<NotificationModel> get notifications => _notifications;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  VolunteerService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient() {
    loadInitialData();
  }

  /// Fetches initial production data (profile, published opportunities, applications, schedule, and notifications)
  Future<void> loadInitialData() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await Future.wait([
        fetchProfile(),
        fetchOpportunities(),
        fetchApplications(),
        fetchAssignments(),
        fetchNotifications(),
      ]);
    } catch (e) {
      debugPrint('Error loading initial volunteer data: $e');
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Fetches volunteer profile from production API GET /profile
  Future<void> fetchProfile() async {
    try {
      final response = await _apiClient.dio.get(ApiConfig.volunteerProfile);
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        final profileMap = data is Map<String, dynamic> && data.containsKey('profile')
            ? data['profile']
            : data;
        if (profileMap is Map<String, dynamic>) {
          _profile = VolunteerProfileModel.fromJson(profileMap);
          notifyListeners();
        }
      }
    } catch (e) {
      debugPrint('Error fetching volunteer profile: $e');
    }
  }

  /// Fetches live opportunities list from production API GET /opportunities
  Future<void> fetchOpportunities() async {
    try {
      final response = await _apiClient.dio.get(ApiConfig.opportunities);
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        List rawList = [];
        if (data is Map<String, dynamic> && data.containsKey('opportunities')) {
          rawList = data['opportunities'] as List;
        } else if (data is List) {
          rawList = data;
        }
        _opportunities = rawList
            .map((item) => OpportunityModel.fromJson(item as Map<String, dynamic>))
            .toList();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error fetching opportunities: $e');
      _errorMessage = 'Unable to load opportunities from server.';
      notifyListeners();
    }
  }

  /// Fetches submitted applications from production API GET /applications
  Future<void> fetchApplications() async {
    try {
      final response = await _apiClient.dio.get(ApiConfig.applications);
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        List rawList = [];
        if (data is Map<String, dynamic> && data.containsKey('applications')) {
          rawList = data['applications'] as List;
        } else if (data is List) {
          rawList = data;
        }
        _applications = rawList
            .map((item) => ApplicationModel.fromJson(item as Map<String, dynamic>))
            .toList();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error fetching applications: $e');
      _errorMessage = 'Unable to load applications from server.';
      notifyListeners();
    }
  }

  /// Fetches confirmed schedule / assignments from production API GET /schedule
  Future<void> fetchAssignments() async {
    try {
      final response = await _apiClient.dio.get(ApiConfig.assignments);
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        List rawList = [];
        if (data is Map<String, dynamic> && data.containsKey('assignments')) {
          rawList = data['assignments'] as List;
        } else if (data is List) {
          rawList = data;
        }
        _assignments = rawList
            .map((item) => AssignmentModel.fromJson(item as Map<String, dynamic>))
            .toList();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error fetching assignments: $e');
      _errorMessage = 'Unable to load schedule from server.';
      notifyListeners();
    }
  }

  /// Fetches real notifications from production API GET /notifications
  Future<void> fetchNotifications() async {
    try {
      final response = await _apiClient.dio.get(ApiConfig.notifications);
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        List rawList = [];
        if (data is Map<String, dynamic> && data.containsKey('notifications')) {
          rawList = data['notifications'] as List;
        } else if (data is List) {
          rawList = data;
        }
        _notifications = rawList
            .map((item) => NotificationModel.fromJson(item as Map<String, dynamic>))
            .toList();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error fetching notifications: $e');
    }
  }

  /// Updates volunteer profile via production API PUT /profile
  Future<void> updateProfile(VolunteerProfileModel updated) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.dio.put(
        ApiConfig.volunteerProfile,
        data: updated.toJson(),
      );

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        final profileMap = data is Map<String, dynamic> && data.containsKey('profile')
            ? data['profile']
            : data;
        if (profileMap is Map<String, dynamic>) {
          _profile = VolunteerProfileModel.fromJson(profileMap);
        } else {
          _profile = updated;
        }
      } else {
        _profile = updated;
      }
    } catch (e) {
      debugPrint('Error updating volunteer profile: $e');
      _errorMessage = e.toString();
      _profile = updated;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Submits opportunity application via production API POST /opportunities/:id/apply
  Future<bool> applyForOpportunity(String oppId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final payload = {
        if (_profile?.userId != null) 'volunteerId': _profile!.userId,
        if (_profile?.fullName != null) 'volunteerName': _profile!.fullName,
        if (_profile?.email != null) 'volunteerEmail': _profile!.email,
        if (_profile?.phone != null) 'volunteerPhone': _profile!.phone,
      };

      final response = await _apiClient.dio.post(
        '${ApiConfig.opportunities}/$oppId/apply',
        data: payload,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        // Refresh live applications, schedule, and opportunity metrics
        await Future.wait([
          fetchApplications(),
          fetchAssignments(),
          fetchOpportunities(),
        ]);
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Error submitting opportunity application: $e');
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Submits government ID document via production API POST /profile/upload-id
  Future<bool> submitIdentityDoc(String docType, String fileName) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.dio.post(
        ApiConfig.volunteerVerifyId,
        data: {
          'docType': docType,
          'fileName': fileName,
        },
      );

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        final profileMap = data is Map<String, dynamic> && data.containsKey('profile')
            ? data['profile']
            : data;
        if (profileMap is Map<String, dynamic>) {
          _profile = VolunteerProfileModel.fromJson(profileMap);
        }
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Error submitting identity document: $e');
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
