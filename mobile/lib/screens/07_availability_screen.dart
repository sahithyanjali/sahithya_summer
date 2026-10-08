import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../core/services/volunteer_service.dart';

class AvailabilityScreen extends StatefulWidget {
  const AvailabilityScreen({super.key});

  @override
  State<AvailabilityScreen> createState() => _AvailabilityScreenState();
}

class _AvailabilityScreenState extends State<AvailabilityScreen> {
  final Map<String, Map<String, bool>> _slots = {
    'Monday - Friday': {
      'Morning (07:00 - 12:00)': false,
      'Afternoon (12:00 - 17:00)': false,
      'Evening (17:00 - 21:00)': false,
    },
    'Saturday - Sunday': {
      'Morning (07:00 - 12:00)': false,
      'Afternoon (12:00 - 17:00)': false,
      'Evening (17:00 - 21:00)': false,
    },
  };
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final profile = context.read<VolunteerService>().profile;
    if (profile != null && profile.availability.isNotEmpty) {
      final weekdays = profile.availability['weekdays'] ?? [];
      final weekends = profile.availability['weekends'] ?? [];

      if (weekdays.contains('MORNING')) _slots['Monday - Friday']!['Morning (07:00 - 12:00)'] = true;
      if (weekdays.contains('AFTERNOON')) _slots['Monday - Friday']!['Afternoon (12:00 - 17:00)'] = true;
      if (weekdays.contains('EVENING')) _slots['Monday - Friday']!['Evening (17:00 - 21:00)'] = true;

      if (weekends.contains('MORNING') || weekends.contains('ALL_DAY')) _slots['Saturday - Sunday']!['Morning (07:00 - 12:00)'] = true;
      if (weekends.contains('AFTERNOON') || weekends.contains('ALL_DAY')) _slots['Saturday - Sunday']!['Afternoon (12:00 - 17:00)'] = true;
      if (weekends.contains('EVENING') || weekends.contains('ALL_DAY')) _slots['Saturday - Sunday']!['Evening (17:00 - 21:00)'] = true;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Availability Matrix'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Recurring Availability Matrix',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppTheme.deepNavy),
            ),
            const SizedBox(height: 6),
            const Text(
              'Specify your recurring time windows for field camp assignments (20% match weight).',
              style: TextStyle(fontSize: 12, color: Colors.black54),
            ),
            const SizedBox(height: 20),
            ..._slots.entries.map((dayEntry) {
              return Container(
                margin: const EdgeInsets.only(bottom: 16),
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
                      dayEntry.key,
                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppTheme.deepNavy),
                    ),
                    const Divider(height: 18),
                    ...dayEntry.value.entries.map((slot) {
                      return CheckboxListTile(
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        title: Text(slot.key, style: const TextStyle(fontSize: 12.5)),
                        value: slot.value,
                        activeColor: AppTheme.primaryOrange,
                        onChanged: (val) {
                          setState(() {
                            _slots[dayEntry.key]![slot.key] = val ?? false;
                          });
                        },
                      );
                    }).toList(),
                  ],
                ),
              );
            }).toList(),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _isSaving
                  ? null
                  : () async {
                      setState(() => _isSaving = true);
                      final service = context.read<VolunteerService>();

                      final List<String> weekdays = [];
                      if (_slots['Monday - Friday']!['Morning (07:00 - 12:00)'] == true) weekdays.add('MORNING');
                      if (_slots['Monday - Friday']!['Afternoon (12:00 - 17:00)'] == true) weekdays.add('AFTERNOON');
                      if (_slots['Monday - Friday']!['Evening (17:00 - 21:00)'] == true) weekdays.add('EVENING');

                      final List<String> weekends = [];
                      if (_slots['Saturday - Sunday']!['Morning (07:00 - 12:00)'] == true) weekends.add('MORNING');
                      if (_slots['Saturday - Sunday']!['Afternoon (12:00 - 17:00)'] == true) weekends.add('AFTERNOON');
                      if (_slots['Saturday - Sunday']!['Evening (17:00 - 21:00)'] == true) weekends.add('EVENING');

                      final updatedAvailability = {
                        'weekdays': weekdays,
                        'weekends': weekends,
                      };

                      if (service.profile != null) {
                        final updated = service.profile!.copyWith(availability: updatedAvailability);
                        await service.updateProfile(updated);
                      }

                      if (mounted) {
                        setState(() => _isSaving = false);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Weekly availability schedule committed!')),
                        );
                        Navigator.pop(context);
                      }
                    },
              child: _isSaving
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Save Availability Matrix'),
            ),
          ],
        ),
      ),
    );
  }
}
