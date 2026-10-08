import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../config/routes.dart';
import '../core/services/volunteer_service.dart';
import '../core/services/matching_service.dart';
import '../models/opportunity_model.dart';

class OpportunityDetailsScreen extends StatelessWidget {
  final OpportunityModel? opportunity;

  const OpportunityDetailsScreen({super.key, this.opportunity});

  @override
  Widget build(BuildContext context) {
    if (opportunity == null) {
      return const Scaffold(body: Center(child: Text('Opportunity not found')));
    }

    final opp = opportunity!;
    final profile = context.watch<VolunteerService>().profile;
    final match = profile != null
        ? context.read<MatchingService>().calculateMatch(volunteer: profile, opportunity: opp)
        : null;

    return Scaffold(
      appBar: AppBar(title: const Text('Opportunity Details')),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: AppTheme.borderSlate)),
        ),
        child: ElevatedButton(
          onPressed: opp.assignedCount >= opp.capacity
              ? null
              : () {
                  Navigator.pushNamed(
                    context,
                    AppRoutes.applyOpportunity,
                    arguments: {'opportunity': opp},
                  );
                },
          child: Text(
            opp.assignedCount >= opp.capacity ? 'Slot Quota Full' : 'Express Interest & Apply',
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Category & Status
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  opp.category.replaceAll('_', ' '),
                  style: const TextStyle(fontWeight: FontWeight.w800, color: AppTheme.primaryOrange, fontSize: 12),
                ),
                Text(
                  'Urgency: ${opp.urgencyLevel}',
                  style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.red, fontSize: 11),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              opp.title,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppTheme.deepNavy),
            ),
            const SizedBox(height: 12),

            // Pega AI Match breakdown card
            if (match != null) ...[
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppTheme.deepNavy,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Pega AI Match Score',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                        Text(
                          '${match.totalScore}%',
                          style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.w900, fontSize: 16),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ...match.reasons.map((r) => Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: Row(
                            children: [
                              const Icon(Icons.check, size: 14, color: Colors.greenAccent),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(r, style: const TextStyle(color: Colors.white70, fontSize: 11)),
                              ),
                            ],
                          ),
                        )),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Event Metadata Box
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppTheme.borderSlate),
              ),
              child: Column(
                children: [
                  _buildMetaRow(Icons.calendar_today, 'Date & Timing', '${opp.date} (${opp.startTime} - ${opp.endTime})'),
                  const Divider(height: 16),
                  _buildMetaRow(Icons.location_on, 'Venue / Meeting Point', opp.venue),
                  const Divider(height: 16),
                  _buildMetaRow(Icons.group, 'Volunteer Quota', '${opp.assignedCount} / ${opp.capacity} assigned'),
                  const Divider(height: 16),
                  _buildMetaRow(Icons.star, 'Expected Impact', opp.expectedImpact),
                ],
              ),
            ),
            const SizedBox(height: 20),

            const Text('Event Description & Tasks', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 6),
            Text(opp.description, style: const TextStyle(fontSize: 12.5, color: Colors.black87, height: 1.4)),
            const SizedBox(height: 20),

            const Text('Required Skills', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 6,
              children: opp.skillsRequired
                  .map((s) => Chip(
                        label: Text(s, style: const TextStyle(fontSize: 11)),
                        backgroundColor: AppTheme.primaryOrange.withOpacity(0.08),
                      ))
                  .toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetaRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: AppTheme.primaryOrange),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 10.5, color: Colors.black54)),
              Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ],
    );
  }
}
