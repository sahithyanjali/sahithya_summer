import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../core/services/volunteer_service.dart';
import '../models/assignment_model.dart';

class MyScheduleScreen extends StatelessWidget {
  const MyScheduleScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final volunteerService = context.watch<VolunteerService>();
    final assignments = volunteerService.assignments;

    return Scaffold(
      appBar: AppBar(title: const Text('My Volunteer Schedule')),
      body: volunteerService.isLoading && assignments.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : volunteerService.errorMessage != null && assignments.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.calendar_today_outlined, size: 48, color: Colors.grey),
                      const SizedBox(height: 12),
                      Text(
                        volunteerService.errorMessage!,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: () => volunteerService.fetchAssignments(),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: () => volunteerService.fetchAssignments(),
                  child: assignments.isEmpty
                      ? ListView(
                          children: [
                            SizedBox(
                              height: MediaQuery.of(context).size.height * 0.7,
                              child: const Center(
                                child: Text(
                                  'No upcoming shifts scheduled.',
                                  style: TextStyle(color: Colors.black54),
                                ),
                              ),
                            ),
                          ],
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: assignments.length,
                          itemBuilder: (context, index) {
                            final a = assignments[index];
                            return Container(
                              margin: const EdgeInsets.only(bottom: 14),
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: AppTheme.borderSlate),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: AppTheme.emeraldSuccess.withOpacity(0.1),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          a.status,
                                          style: const TextStyle(
                                            fontSize: 10.5,
                                            fontWeight: FontWeight.bold,
                                            color: AppTheme.emeraldSuccess,
                                          ),
                                        ),
                                      ),
                                      Text('${a.serviceHours} Hours', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  Text(
                                    a.opportunityTitle,
                                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppTheme.deepNavy),
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      const Icon(Icons.calendar_today, size: 14, color: Colors.grey),
                                      const SizedBox(width: 6),
                                      Text('${a.date} (${a.time})', style: const TextStyle(fontSize: 12, color: Colors.black87)),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      const Icon(Icons.location_on, size: 14, color: Colors.grey),
                                      const SizedBox(width: 6),
                                      Expanded(
                                        child: Text(a.venue, style: const TextStyle(fontSize: 11.5, color: Colors.black54)),
                                      ),
                                    ],
                                  ),
                                  const Divider(height: 20),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      const Text('Attendance QR Check-in', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                      TextButton.icon(
                                        icon: const Icon(Icons.qr_code, size: 18),
                                        label: const Text('Show QR Pass'),
                                        onPressed: () => _showQrModal(context, a),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                ),
    );
  }

  void _showQrModal(BuildContext context, AssignmentModel a) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Volunteer Attendance Pass', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
              const SizedBox(height: 6),
              const Text('Present this QR code to the on-site camp coordinator to log your service hours.',
                  textAlign: TextAlign.center, style: TextStyle(fontSize: 11.5, color: Colors.black54)),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.borderSlate),
                ),
                child: SizedBox(
                  width: 180,
                  height: 180,
                  child: Center(
                    child: Text(
                      'QR: ${a.qrToken}',
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text('Assignment ID: ${a.assignmentId}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
            ],
          ),
        );
      },
    );
  }
}
