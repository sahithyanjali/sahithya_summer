import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../config/routes.dart';
import '../core/services/volunteer_service.dart';
import '../models/volunteer_profile_model.dart';

class RegistrationScreen extends StatefulWidget {
  const RegistrationScreen({super.key});

  @override
  State<RegistrationScreen> createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _cityController = TextEditingController();
  bool _termsAgreed = false;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final profile = context.read<VolunteerService>().profile;
    if (profile != null) {
      if (profile.fullName.isNotEmpty) _nameController.text = profile.fullName;
      if (profile.email.isNotEmpty) _emailController.text = profile.email;
      if (profile.phone.isNotEmpty) _phoneController.text = profile.phone;
      if (profile.city.isNotEmpty) _cityController.text = profile.city;
      _termsAgreed = profile.termsAccepted;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _cityController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Volunteer Registration'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Join 10,000+ Seva Volunteers',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: AppTheme.deepNavy,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Complete your onboarding application to be assigned to food relief, educational camps, and medical drives.',
              style: TextStyle(fontSize: 12.5, color: Colors.black54),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Full Name *',
                hintText: 'Enter your legal full name',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                labelText: 'Email Address *',
                hintText: 'name@example.com',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'Mobile Phone *',
                hintText: '10-digit mobile number',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _cityController,
              decoration: const InputDecoration(
                labelText: 'City / Operating District',
                hintText: 'e.g. Bengaluru, Mumbai, Pune',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Checkbox(
                  value: _termsAgreed,
                  onChanged: (v) => setState(() => _termsAgreed = v ?? false),
                ),
                const Expanded(
                  child: Text(
                    'I agree to the Seva Sphoorthi Code of Conduct and background check review policy.',
                    style: TextStyle(fontSize: 12),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: (_termsAgreed && !_isSaving)
                  ? () async {
                      setState(() => _isSaving = true);
                      final service = context.read<VolunteerService>();
                      final existing = service.profile;

                      final updated = VolunteerProfileModel(
                        userId: existing?.userId ?? '',
                        fullName: _nameController.text.trim().isNotEmpty
                            ? _nameController.text.trim()
                            : (existing?.fullName ?? ''),
                        email: _emailController.text.trim().isNotEmpty
                            ? _emailController.text.trim()
                            : (existing?.email ?? ''),
                        phone: _phoneController.text.trim().isNotEmpty
                            ? _phoneController.text.trim()
                            : (existing?.phone ?? ''),
                        city: _cityController.text.trim().isNotEmpty
                            ? _cityController.text.trim()
                            : (existing?.city ?? ''),
                        skills: existing?.skills ?? [],
                        availability: existing?.availability ?? {},
                        identityVerified: existing?.identityVerified ?? false,
                        identityDocType: existing?.identityDocType ?? 'Aadhaar Card',
                        backgroundCheckStatus: existing?.backgroundCheckStatus ?? 'PENDING',
                        termsAccepted: true,
                        serviceHoursCompleted: existing?.serviceHoursCompleted ?? 0.0,
                        completedAssignmentsCount: existing?.completedAssignmentsCount ?? 0,
                      );

                      await service.updateProfile(updated);

                      if (mounted) {
                        setState(() => _isSaving = false);
                        Navigator.pushNamed(context, AppRoutes.skills);
                      }
                    }
                  : null,
              child: _isSaving
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Proceed to Skills & Availability'),
            ),
          ],
        ),
      ),
    );
  }
}
