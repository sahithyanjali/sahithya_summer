import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../core/services/volunteer_service.dart';

class EngagementHistoryScreen extends StatelessWidget {
  const EngagementHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final volunteerService = context.watch<VolunteerService>();
    final profile = volunteerService.profile;
    final completedAssignments = volunteerService.assignments.where(
      (a) => a.status == 'ATTENDED' || a.status == 'COMPLETED',
    ).toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Engagement & Service Hours')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Summary Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppTheme.primaryDarkOrange, AppTheme.primaryOrange],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primaryOrange.withOpacity(0.3),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'TOTAL VERIFIED VOLUNTEER SERVICE',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${(profile?.serviceHoursCompleted ?? 0.0).toStringAsFixed(1)} Hours',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Icon(Icons.military_tech, color: Colors.amber, size: 20),
                      const SizedBox(width: 6),
                      Text(
                        'Tier: Seva Champion (${profile?.completedAssignmentsCount ?? 0} Drives Completed)',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            const Text('Completed Volunteer Camps', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800)),
            const SizedBox(height: 12),

            if (completedAssignments.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.borderSlate),
                ),
                child: const Column(
                  children: [
                    Icon(Icons.history_edu_outlined, size: 48, color: Colors.black26),
                    SizedBox(height: 8),
                    Text(
                      'No Verified Camps Completed Yet',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Your attended seva shifts and audited service hours will appear here.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 11, color: Colors.black54),
                    ),
                  ],
                ),
              )
            else
              ...completedAssignments.map((a) => _buildPastCampItem(
                    a.opportunityTitle,
                    a.date,
                    a.venue,
                    '${a.serviceHours}h logged',
                    true,
                  )),
          ],
        ),
      ),
    );
  }

  Widget _buildPastCampItem(String title, String date, String location, String hours, bool verified) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.borderSlate),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                const SizedBox(height: 4),
                Text('$date • $location', style: const TextStyle(fontSize: 11, color: Colors.black54)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(hours, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.primaryOrange)),
              const SizedBox(height: 2),
              const Row(
                children: [
                  Icon(Icons.check_circle, size: 12, color: AppTheme.emeraldSuccess),
                  SizedBox(width: 3),
                  Text('Audited', style: TextStyle(fontSize: 10, color: AppTheme.emeraldSuccess)),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
