import 'package:flutter/material.dart';
import '../screens/01_splash_screen.dart';
import '../screens/02_login_otp_screen.dart';
import '../screens/03_registration_screen.dart';
import '../screens/04_volunteer_profile_screen.dart';
import '../screens/05_identity_verification_screen.dart';
import '../screens/06_skills_screen.dart';
import '../screens/07_availability_screen.dart';
import '../screens/08_opportunity_feed_screen.dart';
import '../screens/09_opportunity_details_screen.dart';
import '../screens/10_apply_opportunity_screen.dart';
import '../screens/11_my_applications_screen.dart';
import '../screens/12_my_schedule_screen.dart';
import '../screens/13_notifications_screen.dart';
import '../screens/14_engagement_history_screen.dart';
import '../screens/15_profile_settings_screen.dart';

class AppRoutes {
  static const String splash = '/';
  static const String loginOtp = '/login-otp';
  static const String registration = '/registration';
  static const String volunteerProfile = '/volunteer-profile';
  static const String identityVerification = '/identity-verification';
  static const String skills = '/skills';
  static const String availability = '/availability';
  static const String opportunityFeed = '/opportunities';
  static const String opportunityDetails = '/opportunity-details';
  static const String applyOpportunity = '/apply-opportunity';
  static const String myApplications = '/my-applications';
  static const String mySchedule = '/my-schedule';
  static const String notifications = '/notifications';
  static const String engagementHistory = '/engagement-history';
  static const String profileSettings = '/profile-settings';

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case splash:
        return MaterialPageRoute(builder: (_) => const SplashScreen());
      case loginOtp:
        return MaterialPageRoute(builder: (_) => const LoginOtpScreen());
      case registration:
        return MaterialPageRoute(builder: (_) => const RegistrationScreen());
      case volunteerProfile:
        return MaterialPageRoute(builder: (_) => const VolunteerProfileScreen());
      case identityVerification:
        return MaterialPageRoute(builder: (_) => const IdentityVerificationScreen());
      case skills:
        return MaterialPageRoute(builder: (_) => const SkillsScreen());
      case availability:
        return MaterialPageRoute(builder: (_) => const AvailabilityScreen());
      case opportunityFeed:
        return MaterialPageRoute(builder: (_) => const OpportunityFeedScreen());
      case opportunityDetails:
        final args = settings.arguments as Map<String, dynamic>?;
        return MaterialPageRoute(
          builder: (_) => OpportunityDetailsScreen(opportunity: args?['opportunity']),
        );
      case applyOpportunity:
        final args = settings.arguments as Map<String, dynamic>?;
        return MaterialPageRoute(
          builder: (_) => ApplyOpportunityScreen(opportunity: args?['opportunity']),
        );
      case myApplications:
        return MaterialPageRoute(builder: (_) => const MyApplicationsScreen());
      case mySchedule:
        return MaterialPageRoute(builder: (_) => const MyScheduleScreen());
      case notifications:
        return MaterialPageRoute(builder: (_) => const NotificationsScreen());
      case engagementHistory:
        return MaterialPageRoute(builder: (_) => const EngagementHistoryScreen());
      case profileSettings:
        return MaterialPageRoute(builder: (_) => const ProfileSettingsScreen());
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(child: Text('Route not found: ${settings.name}')),
          ),
        );
    }
  }
}
