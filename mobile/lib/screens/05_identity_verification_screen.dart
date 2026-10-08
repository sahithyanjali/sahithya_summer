import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../core/services/volunteer_service.dart';

class IdentityVerificationScreen extends StatefulWidget {
  const IdentityVerificationScreen({super.key});

  @override
  State<IdentityVerificationScreen> createState() => _IdentityVerificationScreenState();
}

class _IdentityVerificationScreenState extends State<IdentityVerificationScreen> {
  String _selectedDocType = 'Aadhaar Card';
  final _docNumberController = TextEditingController();
  bool _noCriminalRecord = false;
  bool _uploaded = false;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    final profile = context.read<VolunteerService>().profile;
    if (profile != null) {
      if (profile.identityDocType.isNotEmpty) {
        _selectedDocType = profile.identityDocType;
      }
      if (profile.identityVerified) {
        _uploaded = true;
        _noCriminalRecord = true;
      }
    }
  }

  @override
  void dispose() {
    _docNumberController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Identity & Background Check'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.blue.withOpacity(0.06),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.blue.withOpacity(0.2)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.shield_outlined, color: Colors.blue, size: 28),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Pega Blueprint Compliance: All volunteers must provide valid government identification and criminal record disclosure before assignment.',
                      style: TextStyle(fontSize: 11.5, color: Colors.blueGrey, height: 1.35),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Government ID Type',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: _selectedDocType,
              decoration: const InputDecoration(border: OutlineInputBorder()),
              items: ['Aadhaar Card', 'Passport', 'Voter ID', 'Driving License']
                  .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                  .toList(),
              onChanged: (v) => setState(() => _selectedDocType = v!),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _docNumberController,
              decoration: const InputDecoration(
                labelText: 'Document Number / ID Hash',
                hintText: 'Enter your official document number',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 20),
            GestureDetector(
              onTap: () {
                setState(() => _uploaded = true);
              },
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border.all(color: AppTheme.borderSlate, style: BorderStyle.solid),
                  borderRadius: BorderRadius.circular(12),
                  color: Colors.white,
                ),
                child: Column(
                  children: [
                    const Icon(Icons.cloud_upload_outlined, color: AppTheme.primaryOrange, size: 36),
                    const SizedBox(height: 8),
                    Text(
                      _uploaded
                          ? 'Document Selected ($_selectedDocType)'
                          : 'Tap to Attach Government ID Scan',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    const SizedBox(height: 4),
                    const Text('Supported: PDF, JPG, PNG (Max 5MB)', style: TextStyle(fontSize: 11, color: Colors.black54)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Switch(
                  value: _noCriminalRecord,
                  activeColor: AppTheme.primaryOrange,
                  onChanged: (v) => setState(() => _noCriminalRecord = v),
                ),
                const Expanded(
                  child: Text(
                    'I solemnly declare that I have no pending criminal charges or convictions.',
                    style: TextStyle(fontSize: 12),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 28),
            ElevatedButton(
              onPressed: (_isSubmitting || !_noCriminalRecord || !_uploaded)
                  ? null
                  : () async {
                      setState(() => _isSubmitting = true);
                      final service = context.read<VolunteerService>();
                      final docName = '${_selectedDocType.toLowerCase().replaceAll(' ', '_')}_id.pdf';
                      final success = await service.submitIdentityDoc(_selectedDocType, docName);

                      if (mounted) {
                        setState(() => _isSubmitting = false);
                        if (success) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Identity documentation submitted for Coordinator verification!')),
                          );
                          Navigator.pop(context);
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Failed to submit document. Please check network connection.')),
                          );
                        }
                      }
                    },
              child: _isSubmitting
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Save & Submit for Audit'),
            ),
          ],
        ),
      ),
    );
  }
}
