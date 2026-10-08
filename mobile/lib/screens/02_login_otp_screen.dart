import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../config/routes.dart';
import '../core/services/auth_service.dart';

class LoginOtpScreen extends StatefulWidget {
  const LoginOtpScreen({super.key});

  @override
  State<LoginOtpScreen> createState() => _LoginOtpScreenState();
}

class _LoginOtpScreenState extends State<LoginOtpScreen> {
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  bool _otpSent = false;
  int _resendCooldown = 0;
  Timer? _cooldownTimer;
  int _failedAttempts = 0;
  String? _errorMessage;

  @override
  void dispose() {
    _phoneController.dispose();
    _otpController.dispose();
    _cooldownTimer?.cancel();
    super.dispose();
  }

  void _startCooldown() {
    setState(() => _resendCooldown = 25);
    _cooldownTimer?.cancel();
    _cooldownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_resendCooldown > 0) {
        setState(() => _resendCooldown -= 1);
      } else {
        timer.cancel();
      }
    });
  }

  String _getMaskedPhone(String raw) {
    final clean = raw.replaceAll(RegExp(r'\D'), '');
    if (clean.length >= 10) {
      return '+91 ••••• ••${clean.substring(clean.length - 2)}';
    }
    return '+91 ••••• ••${clean.isNotEmpty ? clean.substring(clean.length - 1) : "XX"}';
  }

  @override
  Widget build(BuildContext context) {
    final authService = context.watch<AuthService>();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Volunteer Sign In'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 12),
            const Text(
              'Welcome Back to Seva',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w900,
                color: AppTheme.deepNavy,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              _otpSent
                  ? 'We\'ve sent a 6-digit code to ${_getMaskedPhone(_phoneController.text)}'
                  : 'Enter your 10-digit mobile number to access your volunteer dashboard and rosters.',
              style: const TextStyle(fontSize: 13, color: Colors.black54, height: 1.4),
            ),
            if (_errorMessage != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Row(
                  children: [
                    Icon(Icons.error_outline, color: Colors.red.shade700, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _errorMessage!,
                        style: TextStyle(color: Colors.red.shade800, fontSize: 12),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 28),
            if (!_otpSent) ...[
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                maxLength: 10,
                decoration: InputDecoration(
                  prefixText: '+91  ',
                  prefixStyle: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: AppTheme.deepNavy,
                  ),
                  labelText: 'Mobile Number',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: authService.isLoading
                    ? null
                    : () async {
                        final clean = _phoneController.text.replaceAll(RegExp(r'\D'), '');
                        if (clean.length == 10) {
                          setState(() => _errorMessage = null);
                          final success = await authService.sendOtp(clean);
                          if (success && mounted) {
                            setState(() {
                              _otpSent = true;
                              _failedAttempts = 0;
                            });
                            _startCooldown();
                          }
                        } else {
                          setState(() {
                            _errorMessage = 'Please enter a valid 10-digit mobile number.';
                          });
                        }
                      },
                child: authService.isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Send Verification OTP'),
              ),
            ] else ...[
              AutofillGroup(
                child: TextField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  autofillHints: const [AutofillHints.oneTimeCode],
                  maxLength: 6,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 8,
                  ),
                  decoration: InputDecoration(
                    hintText: '••••••',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: (authService.isLoading || _failedAttempts >= 5)
                    ? null
                    : () async {
                        if (_otpController.text.length != 6) {
                          setState(() {
                            _errorMessage = 'Please enter all 6 digits of your verification code.';
                          });
                          return;
                        }
                        setState(() => _errorMessage = null);
                        final success = await authService.verifyOtp(
                          _phoneController.text,
                          _otpController.text,
                        );
                        if (success && mounted) {
                          Navigator.pushReplacementNamed(
                            context,
                            AppRoutes.opportunityFeed,
                          );
                        } else if (mounted) {
                          setState(() {
                            _failedAttempts += 1;
                            _otpController.clear();
                            if (_failedAttempts >= 5) {
                              _errorMessage = 'Too many failed attempts. Verification temporarily blocked.';
                            } else {
                              _errorMessage = 'Incorrect verification code. Please check your SMS and try again.';
                            }
                          });
                        }
                      },
                child: authService.isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Verify & Enter Portal'),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton(
                    onPressed: () {
                      setState(() {
                        _otpSent = false;
                        _errorMessage = null;
                        _otpController.clear();
                      });
                    },
                    child: const Text('Change Phone Number'),
                  ),
                  if (_resendCooldown > 0)
                    Text(
                      'Resend in ${_resendCooldown}s',
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    )
                  else
                    TextButton(
                      onPressed: authService.isLoading
                          ? null
                          : () async {
                              setState(() => _errorMessage = null);
                              final clean = _phoneController.text.replaceAll(RegExp(r'\D'), '');
                              final success = await authService.sendOtp(clean);
                              if (success && mounted) {
                                _startCooldown();
                              }
                            },
                      child: const Text('Resend Code'),
                    ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
