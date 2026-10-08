import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../config/routes.dart';
import '../core/services/volunteer_service.dart';

class VolunteerProfileScreen extends StatelessWidget {
  const VolunteerProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final volunteerService = context.watch<VolunteerService>();
    final profile = volunteerService.profile;

    if (profile == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Volunteer Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => Navigator.pushNamed(context, AppRoutes.profileSettings),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Profile Header Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.borderSlate),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 32,
                    backgroundColor: AppTheme.primaryOrange.withOpacity(0.1),
                    child: Text(
                      profile.fullName.isNotEmpty
                          ? profile.fullName.substring(0, 1).toUpperCase()
                          : 'V',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primaryOrange,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          profile.fullName,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.deepNavy,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${profile.userId} • ${profile.city}',
                          style: const TextStyle(fontSize: 12, color: Colors.black54),
                        ),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppTheme.emeraldSuccess.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            'BG Status: ${profile.backgroundCheckStatus}',
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.emeraldSuccess,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Quick Stats
            Row(
              children: [
                Expanded(
                  child: _buildStatCard(
                    title: 'Total Hours',
                    value: '${profile.serviceHoursCompleted}h',
                    icon: Icons.timer,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatCard(
                    title: 'Assignments',
                    value: '${profile.completedAssignmentsCount}',
                    icon: Icons.check_circle_outline,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Profile Sections
            _buildActionTile(
              title: 'Identity Verification & Docs',
              subtitle: profile.identityVerified ? 'Verified with Govt ID' : 'Action Required',
              icon: Icons.verified_user,
              onTap: () => Navigator.pushNamed(context, AppRoutes.identityVerification),
            ),
            _buildActionTile(
              title: 'Skills & Capabilities',
              subtitle: '${profile.skills.length} skills declared',
              icon: Icons.psychology,
              onTap: () => Navigator.pushNamed(context, AppRoutes.skills),
            ),
            _buildActionTile(
              title: 'Weekly Availability',
              subtitle: 'Weekdays & Weekends configured',
              icon: Icons.event_available,
              onTap: () => Navigator.pushNamed(context, AppRoutes.availability),
            ),
            _buildActionTile(
              title: 'Engagement & Service History',
              subtitle: 'View past camps and digital certificates',
              icon: Icons.history,
              onTap: () => Navigator.pushNamed(context, AppRoutes.engagementHistory),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard({required String title, required String value, required IconData icon}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.borderSlate),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppTheme.primaryOrange, size: 22),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppTheme.deepNavy),
          ),
          Text(title, style: const TextStyle(fontSize: 11, color: Colors.black54)),
        ],
      ),
    );
  }

  Widget _buildActionTile({
    required String title,
    required String subtitle,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.borderSlate),
      ),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppTheme.primaryOrange.withOpacity(0.08),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: AppTheme.primaryOrange, size: 20),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 11.5, color: Colors.black54)),
        trailing: const Icon(Icons.chevron_right, size: 20),
        onTap: onTap,
      ),
    );
  }
}
