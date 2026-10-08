import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../config/routes.dart';
import '../core/services/volunteer_service.dart';
import '../core/services/matching_service.dart';
import '../models/opportunity_model.dart';

class OpportunityFeedScreen extends StatefulWidget {
  const OpportunityFeedScreen({super.key});

  @override
  State<OpportunityFeedScreen> createState() => _OpportunityFeedScreenState();
}

class _OpportunityFeedScreenState extends State<OpportunityFeedScreen> {
  String _selectedCategory = 'ALL';
  final _searchController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final volunteerService = context.watch<VolunteerService>();
    final matchingService = context.read<MatchingService>();
    final profile = volunteerService.profile;

    final opportunities = volunteerService.opportunities.where((opp) {
      if (_selectedCategory != 'ALL' && opp.category != _selectedCategory) {
        return false;
      }
      if (_searchController.text.isNotEmpty) {
        final query = _searchController.text.toLowerCase();
        return opp.title.toLowerCase().contains(query) ||
            opp.venue.toLowerCase().contains(query);
      }
      return true;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Volunteer Opportunities'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none),
            onPressed: () => Navigator.pushNamed(context, AppRoutes.notifications),
          ),
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () => Navigator.pushNamed(context, AppRoutes.volunteerProfile),
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 0,
        selectedItemColor: AppTheme.primaryOrange,
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        onTap: (index) {
          if (index == 1) Navigator.pushNamed(context, AppRoutes.mySchedule);
          if (index == 2) Navigator.pushNamed(context, AppRoutes.myApplications);
          if (index == 3) Navigator.pushNamed(context, AppRoutes.volunteerProfile);
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.explore), label: 'Explore'),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_today), label: 'Schedule'),
          BottomNavigationBarItem(icon: Icon(Icons.assignment), label: 'Applications'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
      body: Column(
        children: [
          // Search & Filters
          Container(
            padding: const EdgeInsets.all(12),
            color: Colors.white,
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search camps, locations, or skills...',
                    prefixIcon: const Icon(Icons.search, size: 20),
                    contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 12),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onChanged: (_) => setState(() {}),
                ),
                const SizedBox(height: 8),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip('ALL', 'All Drives'),
                      _buildFilterChip('FOOD_RELIEF', 'Food Relief'),
                      _buildFilterChip('EDUCATION', 'Education'),
                      _buildFilterChip('HEALTHCARE', 'Medical Camps'),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Feed List
          Expanded(
            child: volunteerService.isLoading && opportunities.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : volunteerService.errorMessage != null && opportunities.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.wifi_off, size: 48, color: Colors.grey),
                            const SizedBox(height: 12),
                            Text(
                              volunteerService.errorMessage!,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                            const SizedBox(height: 12),
                            ElevatedButton(
                              onPressed: () => volunteerService.fetchOpportunities(),
                              child: const Text('Retry'),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: () => volunteerService.fetchOpportunities(),
                        child: opportunities.isEmpty
                            ? ListView(
                                children: [
                                  SizedBox(
                                    height: MediaQuery.of(context).size.height * 0.5,
                                    child: const Center(
                                      child: Text(
                                        'No opportunities available at this time.',
                                        style: TextStyle(color: Colors.black54),
                                      ),
                                    ),
                                  ),
                                ],
                              )
                            : ListView.builder(
                                padding: const EdgeInsets.all(12),
                                itemCount: opportunities.length,
                                itemBuilder: (context, index) {
                                  final opp = opportunities[index];
                                  final match = profile != null
                                      ? matchingService.calculateMatch(volunteer: profile, opportunity: opp)
                                      : null;

                                  return _buildOpportunityCard(opp, match?.totalScore ?? 0);
                                },
                              ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String cat, String label) {
    final isSelected = _selectedCategory == cat;
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: ChoiceChip(
        label: Text(label, style: const TextStyle(fontSize: 11)),
        selected: isSelected,
        selectedColor: AppTheme.primaryOrange,
        labelStyle: TextStyle(color: isSelected ? Colors.white : Colors.black87),
        onSelected: (val) {
          if (val) setState(() => _selectedCategory = cat);
        },
      ),
    );
  }

  Widget _buildOpportunityCard(OpportunityModel opp, int matchScore) {
    final isFull = opp.assignedCount >= opp.capacity;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.borderSlate),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          Navigator.pushNamed(
            context,
            AppRoutes.opportunityDetails,
            arguments: {'opportunity': opp},
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryOrange.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      opp.category.replaceAll('_', ' '),
                      style: const TextStyle(
                        fontSize: 9.5,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primaryOrange,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppTheme.emeraldSuccess.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      '★ $matchScore% Match',
                      style: const TextStyle(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w900,
                        color: AppTheme.emeraldSuccess,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                opp.title,
                style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w800, color: AppTheme.deepNavy),
              ),
              const SizedBox(height: 6),
              Text(
                opp.description,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 11.5, color: Colors.black54),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  const Icon(Icons.event, size: 14, color: Colors.grey),
                  const SizedBox(width: 4),
                  Text('${opp.date} • ${opp.startTime}', style: const TextStyle(fontSize: 11)),
                  const Spacer(),
                  Text(
                    isFull ? 'Quota Filled' : '${opp.capacity - opp.assignedCount} slots left',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isFull ? Colors.red : AppTheme.emeraldSuccess,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
