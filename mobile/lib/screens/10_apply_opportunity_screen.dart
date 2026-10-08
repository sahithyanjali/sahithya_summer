import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../config/routes.dart';
import '../core/services/volunteer_service.dart';
import '../models/opportunity_model.dart';

class ApplyOpportunityScreen extends StatefulWidget {
  final OpportunityModel? opportunity;

  const ApplyOpportunityScreen({super.key, this.opportunity});

  @override
  State<ApplyOpportunityScreen> createState() => _ApplyOpportunityScreenState();
}

class _ApplyOpportunityScreenState extends State<ApplyOpportunityScreen> {
  bool _confirmedAvailability = true;
  bool _confirmedCodeOfConduct = true;

  @override
  Widget build(BuildContext context) {
    if (widget.opportunity == null) {
      return const Scaffold(body: Center(child: Text('Opportunity not specified')));
    }

    final opp = widget.opportunity!;
    final volunteerService = context.watch<VolunteerService>();

    return Scaffold(
      appBar: AppBar(title: const Text('Confirm Application')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppTheme.borderSlate),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    opp.title,
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppTheme.deepNavy),
                  ),
                  const SizedBox(height: 6),
                  Text('${opp.date} • ${opp.startTime} - ${opp.endTime}', style: const TextStyle(fontSize: 12, color: Colors.black54)),
                  const SizedBox(height: 4),
                  Text(opp.venue, style: const TextStyle(fontSize: 11.5, color: Colors.black87)),
                ],
              ),
            ),
            const SizedBox(height: 20),

            const Text('Commitment & Policy Declarations', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5)),
            const SizedBox(height: 8),

            CheckboxListTile(
              contentPadding: EdgeInsets.zero,
              value: _confirmedAvailability,
              activeColor: AppTheme.primaryOrange,
              title: const Text(
                'I confirm that I am available for the full duration of the shift.',
                style: TextStyle(fontSize: 12),
              ),
              onChanged: (v) => setState(() => _confirmedAvailability = v ?? false),
            ),
            CheckboxListTile(
              contentPadding: EdgeInsets.zero,
              value: _confirmedCodeOfConduct,
              activeColor: AppTheme.primaryOrange,
              title: const Text(
                'I will adhere to the Seva safety protocol and coordinator guidelines on site.',
                style: TextStyle(fontSize: 12),
              ),
              onChanged: (v) => setState(() => _confirmedCodeOfConduct = v ?? false),
            ),
            const SizedBox(height: 28),

            ElevatedButton(
              onPressed: (_confirmedAvailability && _confirmedCodeOfConduct && !volunteerService.isLoading)
                  ? () async {
                      final success = await volunteerService.applyForOpportunity(opp.id);
                      if (success && mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Application submitted! Coordinator notified.')),
                        );
                        Navigator.pushReplacementNamed(context, AppRoutes.myApplications);
                      }
                    }
                  : null,
              child: volunteerService.isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Submit Application Slot Request'),
            ),
          ],
        ),
      ),
    );
  }
}
