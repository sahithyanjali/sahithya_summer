import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../core/services/volunteer_service.dart';

class MyApplicationsScreen extends StatelessWidget {
  const MyApplicationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final volunteerService = context.watch<VolunteerService>();
    final apps = volunteerService.applications;

    return Scaffold(
      appBar: AppBar(title: const Text('My Applications')),
      body: volunteerService.isLoading && apps.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : volunteerService.errorMessage != null && apps.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 48, color: Colors.grey),
                      const SizedBox(height: 12),
                      Text(
                        volunteerService.errorMessage!,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: () => volunteerService.fetchApplications(),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: () => volunteerService.fetchApplications(),
                  child: apps.isEmpty
                      ? ListView(
                          children: [
                            SizedBox(
                              height: MediaQuery.of(context).size.height * 0.7,
                              child: Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.assignment_outlined, size: 64, color: Colors.grey[300]),
                                    const SizedBox(height: 12),
                                    const Text('No Active Applications', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                    const SizedBox(height: 4),
                                    const Text('Explore opportunities and submit requests to see status here.', style: TextStyle(fontSize: 12, color: Colors.black54)),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: apps.length,
                          itemBuilder: (context, index) {
                            final app = apps[index];
                            return Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: AppTheme.borderSlate),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(app.applicationId, style: const TextStyle(fontSize: 11, color: Colors.black54, fontWeight: FontWeight.bold)),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: AppTheme.primaryOrange.withOpacity(0.1),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          app.status,
                                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.primaryOrange),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    app.opportunityTitle,
                                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.deepNavy),
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      Text('Match Score: ${app.matchScore}%', style: const TextStyle(fontSize: 11.5, color: Colors.black54)),
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
}
