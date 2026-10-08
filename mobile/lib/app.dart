import 'package:flutter/material.dart';
import 'config/theme.dart';
import 'config/routes.dart';

class SevaVolunteerApp extends StatelessWidget {
  const SevaVolunteerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Seva Sphoorthi Volunteer Portal',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      initialRoute: AppRoutes.splash,
      onGenerateRoute: AppRoutes.generateRoute,
    );
  }
}
