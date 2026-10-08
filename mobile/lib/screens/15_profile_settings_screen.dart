import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../config/routes.dart';
import '../core/services/auth_service.dart';

class ProfileSettingsScreen extends StatelessWidget {
  const ProfileSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = context.read<AuthService>();
    final profile = context.watch<VolunteerService>().profile;

    return Scaffold(
      appBar: AppBar(title: const Text('Account & Settings')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSectionHeader('Preferences'),
          _buildSettingsTile(Icons.language, 'App Language', 'English (IN) / हिन्दी / मराठी'),
          _buildSettingsTile(Icons.notifications_outlined, 'Push Notification Alerts', 'Enabled for assignments'),
          _buildSettingsTile(Icons.dark_mode_outlined, 'Theme Mode', 'System Default'),

          const SizedBox(height: 16),
          _buildSectionHeader('Legal & Compliance'),
          _buildSettingsTile(
            Icons.policy_outlined,
            'Volunteer Code of Conduct',
            profile?.termsAccepted == true ? 'Accepted & Active' : 'Pending Acceptance',
          ),
          _buildSettingsTile(Icons.privacy_tip_outlined, 'Privacy Policy & Data Security', 'GDPR & DPDP Compliant'),

          const SizedBox(height: 16),
          _buildSectionHeader('Session'),
          Container(
            margin: const EdgeInsets.only(bottom: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.borderSlate),
            ),
            child: ListTile(
              leading: const Icon(Icons.logout, color: Colors.red),
              title: const Text('Sign Out', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
              onTap: () {
                authService.logout();
                Navigator.pushNamedAndRemoveUntil(context, AppRoutes.loginOtp, (r) => false);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8, top: 8),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, color: Colors.grey, letterSpacing: 1),
      ),
    );
  }

  Widget _buildSettingsTile(IconData icon, String title, String subtitle) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.borderSlate),
      ),
      child: ListTile(
        leading: Icon(icon, color: AppTheme.primaryOrange, size: 20),
        title: Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 11, color: Colors.black54)),
        trailing: const Icon(Icons.chevron_right, size: 18),
      ),
    );
  }
}
