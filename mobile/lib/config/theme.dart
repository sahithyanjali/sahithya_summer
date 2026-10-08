import 'package:flutter/material.dart';

class AppTheme {
  // Brand Colors (Saffron / Warm Navy palette)
  static const Color primaryOrange = Color(0xFFEA580C);
  static const Color primaryDarkOrange = Color(0xFFC2410C);
  static const Color deepNavy = Color(0xFF0F172A);
  static const Color surfaceSlate = Color(0xFFF8FAFC);
  static const Color borderSlate = Color(0xFFE2E8F0);
  static const Color emeraldSuccess = Color(0xFF10B981);
  static const Color roseError = Color(0xFFEF4444);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: surfaceSlate,
      primaryColor: primaryOrange,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryOrange,
        primary: primaryOrange,
        secondary: deepNavy,
        surface: Colors.white,
        background: surfaceSlate,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: deepNavy),
        titleTextStyle: TextStyle(
          color: deepNavy,
          fontSize: 18,
          fontWeight: FontWeight.w800,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryOrange,
          foregroundColor: Colors.white,
          minimumSize: const Size.fromHeight(50),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData.dark(useMaterial3: true).copyWith(
      scaffoldBackgroundColor: deepNavy,
      primaryColor: primaryOrange,
      colorScheme: const ColorScheme.dark(
        primary: primaryOrange,
        secondary: Colors.amber,
        surface: Color(0xFF1E293B),
      ),
    );
  }
}
