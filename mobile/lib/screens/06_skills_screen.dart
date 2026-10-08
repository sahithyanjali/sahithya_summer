import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../core/services/volunteer_service.dart';

class SkillsScreen extends StatefulWidget {
  const SkillsScreen({super.key});

  @override
  State<SkillsScreen> createState() => _SkillsScreenState();
}

class _SkillsScreenState extends State<SkillsScreen> {
  final List<String> _availableSkills = [
    'Meal Preparation & Packing',
    'Food Distribution Logistics',
    'Primary English & Math Tutoring',
    'Foundational Literacy Mentorship',
    'Basic First Aid & Triage',
    'Crowd & Queue Management',
    'Blood Donor Registration Desk',
    'Senior Citizen Companionship',
    'Relief Inventory Sorting',
  ];

  late Set<String> _selectedSkills;

  @override
  void initState() {
    super.initState();
    final profile = context.read<VolunteerService>().profile;
    _selectedSkills = Set.from(profile?.skills ?? []);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Volunteer Skills Taxonomy'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Select Your Service Capabilities',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppTheme.deepNavy),
            ),
            const SizedBox(height: 6),
            const Text(
              'Pega AI matching uses these competencies to rank opportunities (40% algorithm weight).',
              style: TextStyle(fontSize: 12, color: Colors.black54),
            ),
            const SizedBox(height: 20),
            Wrap(
              spacing: 8,
              runSpacing: 10,
              children: _availableSkills.map((skill) {
                final isSelected = _selectedSkills.contains(skill);
                return FilterChip(
                  label: Text(skill),
                  selected: isSelected,
                  selectedColor: AppTheme.primaryOrange.withOpacity(0.15),
                  checkmarkColor: AppTheme.primaryOrange,
                  labelStyle: TextStyle(
                    color: isSelected ? AppTheme.primaryOrange : AppTheme.deepNavy,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    fontSize: 12.5,
                  ),
                  onSelected: (selected) {
                    setState(() {
                      if (selected) {
                        _selectedSkills.add(skill);
                      } else {
                        _selectedSkills.remove(skill);
                      }
                    });
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () async {
                final service = context.read<VolunteerService>();
                if (service.profile != null) {
                  final updated = service.profile!.copyWith(skills: _selectedSkills.toList());
                  await service.updateProfile(updated);
                }
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Skills updated successfully! Match scores recalculated.')),
                  );
                  Navigator.pop(context);
                }
              },
              child: const Text('Save Capabilities'),
            ),
          ],
        ),
      ),
    );
  }
}
