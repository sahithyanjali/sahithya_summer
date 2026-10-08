import { DartFile } from "../types";

export const FLUTTER_DART_FILES: DartFile[] = [
  {
    name: "pubspec.yaml",
    path: "pubspec.yaml",
    description: "App configuration and production-grade dependency management.",
    content: `name: seva_sphoorthi_app
description: Professional Mobile Application for Seva Sphoorthi NGO.
version: 1.0.0+1

environment:
  sdk: ">=3.2.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter

  # Navigation & State management
  go_router: ^13.0.0
  provider: ^6.1.1

  # API Communication & Network state
  dio: ^5.4.0
  connectivity_plus: ^5.0.2

  # Cache & Media rendering
  cached_network_image: ^3.3.1
  shimmer: ^3.0.0

  # Payment Gateway
  razorpay_flutter: ^1.3.5

  # Storage & Utilities
  shared_preferences: ^2.2.2
  url_launcher: ^6.2.4
  intl: ^0.19.0

  # Firebase Core and Integration services
  firebase_core: ^2.24.0
  firebase_messaging: ^14.7.10
  firebase_analytics: ^10.7.4
  firebase_crashlytics: ^3.4.9

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1

flutter:
  uses-material-design: true
  assets:
    - assets/images/logo.png
    - assets/images/hero_banner.jpg
    - assets/images/education_camp.jpg
    - assets/images/food_drive.jpg`
  },
  {
    name: "main.dart",
    path: "lib/main.dart",
    description: "The application bootstrap, initializing Firebase services, local dependencies, and app state providers.",
    content: `import 'dart:async';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'routes/app_router.dart';
import 'core/providers/volunteer_provider.dart';
import 'core/providers/donation_provider.dart';
import 'core/providers/theme_provider.dart';
import 'services/notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Guard main execution tree to report errors in Crashlytics.
  runZonedGuarded<Future<void>>(() async {
    // Initialise Firebase Core.
    await Firebase.initializeApp();

    // Configure Crashlytics reporting parameters.
    FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterFatalError;

    // Load SharedPreferences for local storage needs.
    final sharedPrefs = await SharedPreferences.getInstance();

    // Initialize notification channels.
    final notificationService = NotificationService();
    await notificationService.initialize();

    runApp(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => VolunteerProvider()),
          ChangeNotifierProvider(create: (_) => DonationProvider(sharedPrefs)),
          ChangeNotifierProvider(create: (_) => ThemeProvider(sharedPrefs)),
        ],
        child: const SevaSphoorthiApp(),
      ),
    );
  }, (error, stack) => FirebaseCrashlytics.instance.recordError(error, stack, fatal: true));
}

class SevaSphoorthiApp extends StatelessWidget {
  const SevaSphoorthiApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);

    return MaterialApp.router(
      title: 'Seva Sphoorthi',
      debugShowCheckedModeBanner: false,
      routerConfig: AppRouter.router,
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: 'Inter',
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFFF5722), // Warm energetic orange fitting NGO values
          brightness: Brightness.light,
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        fontFamily: 'Inter',
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFFF5722),
          brightness: Brightness.dark,
        ),
      ),
      themeMode: themeProvider.themeMode,
    );
  }
}`
  },
  {
    name: "app_router.dart",
    path: "lib/routes/app_router.dart",
    description: "App router configuring layout pathways for multi-feature navigation drawers.",
    content: `import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../features/home/home_screen.dart';
import '../features/about/about_screen.dart';
import '../features/programs/programs_screen.dart';
import '../features/gallery/gallery_screen.dart';
import '../features/events/events_screen.dart';
import '../features/volunteer/volunteer_screen.dart';
import '../features/donations/donation_screen.dart';
import '../features/profile/profile_screen.dart';
import '../features/contact/contact_screen.dart';

class AppRouter {
  static final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();

  static final GoRouter router = GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    errorBuilder: (context, state) => Scaffold(
      body: Center(child: Text('Page not found: \${state.error}')),
    ),
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/about',
        builder: (context, state) => const AboutScreen(),
      ),
      GoRoute(
        path: '/programs',
        builder: (context, state) => const ProgramsScreen(),
      ),
      GoRoute(
        path: '/gallery',
        builder: (context, state) => const GalleryScreen(),
      ),
      GoRoute(
        path: '/events',
        builder: (context, state) => const EventsScreen(),
      ),
      GoRoute(
        path: '/volunteer',
        builder: (context, state) => const VolunteerScreen(),
      ),
      GoRoute(
        path: '/donations',
        builder: (context, state) => const DonationScreen(),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileScreen(),
      ),
      GoRoute(
        path: '/contact',
        builder: (context, state) => const ContactScreen(),
      ),
    ],
  );
}`
  },
  {
    name: "volunteer_provider.dart",
    path: "lib/core/providers/volunteer_provider.dart",
    description: "State management system using Dio to post volunteer registration forms to central backends.",
    content: `import 'package:flutter/material.dart';
import 'package:dio/dio.dart';

class VolunteerProvider extends ChangeNotifier {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'https://sevasphoorthi.com/api',
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));

  bool _isSubmitting = false;
  bool get isSubmitting => _isSubmitting;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  bool _registrationSuccess = false;
  bool get registrationSuccess => _registrationSuccess;

  void resetState() {
    _isSubmitting = false;
    _errorMessage = null;
    _registrationSuccess = false;
    notifyListeners();
  }

  Future<bool> registerVolunteer({
    required String fullName,
    required String email,
    required String phone,
    required String interestArea,
    required String credentials,
  }) async {
    _isSubmitting = true;
    _errorMessage = null;
    _registrationSuccess = false;
    notifyListeners();

    try {
      final response = await _dio.post('/volunteer/register', data: {
        'fullName': fullName,
        'email': email,
        'phone': phone,
        'interestArea': interestArea,
        'experienceText': credentials,
      });

      if (response.statusCode == 200 || response.statusCode == 201) {
        _registrationSuccess = true;
        _isSubmitting = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = 'Registration returned error response code from sevasphoorthi.com';
        _isSubmitting = false;
        notifyListeners();
        return false;
      }
    } on DioException catch (e) {
      _errorMessage = e.message ?? 'A connectivity issue happened. Please check your internet connection.';
      _isSubmitting = false;
      notifyListeners();
      return false;
    } catch (e) {
      _errorMessage = 'An unexpected system error occurred: \${e.toString()}';
      _isSubmitting = false;
      notifyListeners();
      return false;
    }
  }
}`
  },
  {
    name: "donation_provider.dart",
    path: "lib/core/providers/donation_provider.dart",
    description: "Manages donation process and saves payment receipts locally using SharedPreferences.",
    content: `import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DonationRecord {
  final String donorName;
  final String amount;
  final String date;
  final String paymentId;
  final String purpose;

  DonationRecord({
    required this.donorName,
    required this.amount,
    required this.date,
    required this.paymentId,
    required this.purpose,
  });

  Map<String, dynamic> toJson() => {
    'donorName': donorName,
    'amount': amount,
    'date': date,
    'paymentId': paymentId,
    'purpose': purpose,
  };

  factory DonationRecord.fromJson(Map<String, dynamic> json) => DonationRecord(
    donorName: json['donorName'],
    amount: json['amount'],
    date: json['date'],
    paymentId: json['paymentId'],
    purpose: json['purpose'],
  );
}

class DonationProvider extends ChangeNotifier {
  final SharedPreferences _prefs;
  List<DonationRecord> _history = [];

  DonationProvider(this._prefs) {
    _loadHistory();
  }

  List<DonationRecord> get history => _history;

  void _loadHistory() {
    final String? data = _prefs.getString('seva_donation_history');
    if (data != null) {
      try {
        final List decoded = jsonDecode(data);
        _history = decoded.map((item) => DonationRecord.fromJson(item)).toList();
        notifyListeners();
      } catch (e) {
        _history = [];
      }
    }
  }

  Future<void> saveDonation({
    required String donorName,
    required double amount,
    required String paymentId,
    required String purpose,
  }) async {
    final newRecord = DonationRecord(
      donorName: donorName,
      amount: amount.toStringAsFixed(2),
      date: DateTime.now().toLocal().toString().split('.')[0],
      paymentId: paymentId,
      purpose: purpose,
    );

    _history.insert(0, newRecord);
    final String encoded = jsonEncode(_history.map((r) => r.toJson()).toList());
    await _prefs.setString('seva_donation_history', encoded);
    notifyListeners();
  }
}`
  },
  {
    name: "theme_provider.dart",
    path: "lib/core/providers/theme_provider.dart",
    description: "Persistent theme switcher using SharedPreferences for local configuration styling.",
    content: `import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeProvider extends ChangeNotifier {
  final SharedPreferences _prefs;
  ThemeMode _themeMode = ThemeMode.light;

  ThemeProvider(this._prefs) {
    _loadTheme();
  }

  ThemeMode get themeMode => _themeMode;

  void _loadTheme() {
    final int? modeIndex = _prefs.getInt('seva_theme_mode');
    if (modeIndex != null) {
      _themeMode = ThemeMode.values[modeIndex];
      notifyListeners();
    }
  }

  Future<void> toggleTheme(bool isDark) async {
    _themeMode = isDark ? ThemeMode.dark : ThemeMode.light;
    await _prefs.setInt('seva_theme_mode', _themeMode.index);
    notifyListeners();
  }
}`
  },
  {
    name: "home_screen.dart",
    path: "lib/features/home/home_screen.dart",
    description: "NGO Banner and announcements dashboard rendering the Material 3 app layout.",
    content: `import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Seva Sphoorthi',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 24),
        ),
        foregroundColor: Colors.white,
        backgroundColor: Theme.of(context).colorScheme.primary,
        actions: [
          IconButton(
            icon: const Icon(Icons.account_circle, size: 28),
            onPressed: () => context.push('/profile'),
          ),
        ],
      ),
      drawer: _buildDrawer(context),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. NGO BANNER
            _buildHeroBanner(context),
            
            // 2. WELCOME STATEMENT
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Supporting Hope. Designing Smiles.',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.primary
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Seva Sphoorthi Charitable Trust transforms less fortunate communities by nourishing life essentials: Clean food, complete education, and health camps.',
                    style: TextStyle(fontSize: 15, height: 1.4, color: Colors.grey),
                  ),
                ],
              ),
            ),

            // 3. QUICK ACTION GRID
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: GridView.count(
                crossAxisCount: 3,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                children: [
                  _buildQuickAction(context, Icons.volunteer_activism, 'Volunteer', '/volunteer'),
                  _buildQuickAction(context, Icons.favorite, 'Sponsor', '/donations'),
                  _buildQuickAction(context, Icons.photo_library, 'Gallery', '/gallery'),
                ],
              ),
            ),

            // 4. LATEST ANNOUNCEMENTS
            _buildSectionHeader(context, 'Latest News', () {}),
            _buildAnnouncementsSlider(context),

            // 5. UPCOMING EVENTS
            _buildSectionHeader(context, 'Upcoming Events', () => context.push('/events')),
            _buildNextEventCard(context),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroBanner(BuildContext context) {
    return Container(
      height: 200,
      decoration: const BoxDecoration(
        color: Colors.black,
        image: DecorationImage(
          image: NetworkImage('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200'),
          fit: BoxFit.cover,
          opacity: 0.75,
        ),
      ),
      child: Container(
        padding: const EdgeInsets.all(20),
        alignment: Alignment.bottomLeft,
        child: const Column(
          mainAxisAlignment: MainAxisAlignment.end,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'MAKE AN IMPACT TODAY',
              style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, letterSpacing: 1.2),
            ),
            Text(
              'Empowering the needy with dignity and self-sufficiency',
              style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickAction(BuildContext context, IconData icon, String text, String route) {
    return InkWell(
      onTap: () => context.push(route),
      borderRadius: BorderRadius.circular(12),
      child: Ink(
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.primary.withOpacity(0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Theme.of(context).colorScheme.primary.withOpacity(0.2)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: Theme.of(context).colorScheme.primary, size: 28),
            const SizedBox(height: 8),
            Text(text, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          TextButton(onPressed: onTap, child: const Text('View All')),
        ],
      ),
    );
  }

  Widget _buildAnnouncementsSlider(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Row(
        children: [
          Icon(Icons.campaign, color: Colors.orange, size: 30),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Vidya Education Drive 2026 launched!',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                SizedBox(height: 4),
                Text(
                  'We aim to sponsor materials for 250 deserving rural students this academic season.',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNextEventCard(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.withOpacity(0.2)),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: Image.network(
              'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800',
              height: 140,
              width: double.infinity,
              fit: BoxFit.cover,
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text(
                        '15 JUNE 2026',
                        style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 11),
                      ),
                    ),
                    const Text('8:00 AM - 1:00 PM', style: TextStyle(color: Colors.grey, fontSize: 12)),
                  ],
                ),
                const SizedBox(height: 12),
                const Text(
                  'Sphoorthi Mega Blood Donation Drive',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Location: NGO Town Hall Office, Bangalore. Participate and help save lives.',
                  style: TextStyle(fontSize: 13, color: Colors.grey),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDrawer(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          UserAccountsDrawerHeader(
            accountName: const Text('Seva Volunteer'),
            accountEmail: const Text('volunteer@sevasphoorthi.com'),
            currentAccountPicture: CircleAvatar(
              backgroundColor: Colors.white,
              child: Icon(Icons.person, color: Theme.of(context).colorScheme.primary, size: 40),
            ),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
          ListTile(
            leading: const Icon(Icons.home),
            title: const Text('Home Dashboard'),
            onTap: () => context.pop(),
          ),
          ListTile(
            leading: const Icon(Icons.info),
            title: const Text('About & Mission'),
            onTap: () {
              context.pop();
              context.push('/about');
            },
          ),
          ListTile(
            leading: const Icon(Icons.category),
            title: const Text('Active Programs'),
            onTap: () {
              context.pop();
              context.push('/programs');
            },
          ),
          ListTile(
            leading: const Icon(Icons.event),
            title: const Text('Events Registration'),
            onTap: () {
              context.pop();
              context.push('/events');
            },
          ),
          ListTile(
            leading: const Icon(Icons.volunteer_activism),
            title: const Text('Join as Volunteer'),
            onTap: () {
              context.pop();
              context.push('/volunteer');
            },
          ),
          ListTile(
            leading: const Icon(Icons.monetization_on),
            title: const Text('Donate Now (Razorpay)'),
            onTap: () {
              context.pop();
              context.push('/donations');
            },
          ),
          ListTile(
            leading: const Icon(Icons.photo_library),
            title: const Text('Gallery Grid'),
            onTap: () {
              context.pop();
              context.push('/gallery');
            },
          ),
          ListTile(
            leading: const Icon(Icons.contact_mail),
            title: const Text('Contact & Map'),
            onTap: () {
              context.pop();
              context.push('/contact');
            },
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.settings),
            title: const Text('Settings Mode'),
            onTap: () {
              context.pop();
              context.push('/profile');
            },
          ),
        ],
      ),
    );
  }
}`
  },
  {
    name: "about_screen.dart",
    path: "lib/features/about/about_screen.dart",
    description: "About screen expressing user-facing charitable mission statements and corporate parameters.",
    content: `import 'package:flutter/material.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('About & Mission', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20)),
        backgroundColor: theme.colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildValuesCard(
              context, 
              Icons.emoji_nature, 
              'Our Core Vision', 
              'To design an empowered society where everyone has self-sufficiency, nutrition, awareness, and equal educational access.',
            ),
            const SizedBox(height: 16),
            _buildValuesCard(
              context, 
              Icons.gavel, 
              'Our Humble Mission', 
              'Constructing reliable pipelines delivering daily hot meals, medical checkup programs, and active rural school supplies to children.',
            ),
            const SizedBox(height: 24),
            Text(
              'Registered Corporate Identity',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: theme.colorScheme.primary),
            ),
            const SizedBox(height: 8),
            const Card(
              margin: EdgeInsets.zero,
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Seva Sphoorthi Trust', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    SizedBox(height: 4),
                    Text('Type: NGO / Public Charitable Trust', style: TextStyle(color: Colors.grey, fontSize: 13)),
                    Text('Reg No: IV-185/2021-22', style: TextStyle(color: Colors.grey, fontSize: 13)),
                    Text('Registered Office: Nelamangala, Bangalore Suburbs, India.', style: TextStyle(color: Colors.grey, fontSize: 13)),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildValuesCard(BuildContext context, IconData icon, String title, String body) {
    final primary = Theme.of(context).colorScheme.primary;
    return Card(
      clipBehavior: Clip.antiAlias,
      child: Container(
        decoration: BoxDecoration(
          border: Border(left: BorderSide(color: primary, width: 4)),
        ),
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: primary),
                const SizedBox(width: 8),
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ],
            ),
            const SizedBox(height: 8),
            Text(body, style: const TextStyle(fontSize: 14, height: 1.4, color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}`
  },
  {
    name: "programs_screen.dart",
    path: "lib/features/programs/programs_screen.dart",
    description: "Multi-program sponsorship view showing targeted benchmarks and active progress meters.",
    content: `import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class SponsorshipProgram {
  final String id;
  final String title;
  final String tagline;
  final String desc;
  final double goal;
  final double raised;
  final String imgUrl;

  const SponsorshipProgram({
    required this.id,
    required this.title,
    required this.tagline,
    required this.desc,
    required this.goal,
    required this.raised,
    required this.imgUrl,
  });
}

class ProgramsScreen extends StatefulWidget {
  const ProgramsScreen({super.key});

  @override
  State<ProgramsScreen> createState() => _ProgramsScreenState();
}

class _ProgramsScreenState extends State<ProgramsScreen> {
  String _searchQuery = "";
  final List<SponsorshipProgram> _programs = const [
    SponsorshipProgram(
      id: 'aahara',
      title: 'Aahara Hunger Relief Drive',
      tagline: 'Nourishing wholesome meals daily',
      desc: 'Providing healthy, hot midday meals for hundreds of homeless individuals, daily laborers, and children living in Bangalore suburbs.',
      goal: 250000,
      raised: 184200,
      imgUrl: 'https://images.unsplash.com/photo-1594708767771-a7502209ff51?q=80&w=600',
    ),
    SponsorshipProgram(
      id: 'vidya',
      title: 'Vidya Child Education Support',
      tagline: 'Sponsor educational supplies & books',
      desc: 'Distributing complete school backpacks, notebooks, uniforms, and stationary to children in rural public schools to promote active attendance.',
      goal: 300000,
      raised: 215000,
      imgUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600',
    ),
    SponsorshipProgram(
      id: 'vaidya',
      title: 'Vaidya Medical Checkup Camps',
      tagline: 'Free health checkups & eye screenings',
      desc: 'Setting up monthly portable diagnostic camps in remote villages, offering consultation with skilled doctors, health metrics testings, and free medicines.',
      goal: 150000,
      raised: 75000,
      imgUrl: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?q=80&w=600',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final filteredList = _programs
        .where((p) => p.title.toLowerCase().contains(_searchQuery.toLowerCase()))
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('NGO Sponsorship Programs', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: TextField(
              onChanged: (val) => setState(() => _searchQuery = val),
              decoration: InputDecoration(
                hintText: 'Search campaigns...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16),
              ),
            ),
          ),
          Expanded(
            child: filteredList.isEmpty
                ? const Center(child: Text('No active programs match your search.'))
                : ListView.builder(
                    itemCount: filteredList.length,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    itemBuilder: (context, idx) {
                      final prog = filteredList[idx];
                      final percent = (prog.raised / prog.goal).clamp(0.0, 1.0);
                      return Card(
                        margin: const EdgeInsets.only(bottom: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        clipBehavior: Clip.antiAlias,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Image.network(prog.imgUrl, height: 150, fit: BoxFit.cover),
                            Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(prog.title, style: const TextStyle(fontWeight: FontWeight.extrabold, fontSize: 16)),
                                  Text(prog.tagline, style: TextStyle(color: Theme.of(context).colorScheme.primary, fontSize: 13, fontStyle: FontStyle.italic)),
                                  const SizedBox(height: 8),
                                  Text(prog.desc, style: const TextStyle(fontSize: 13, color: Colors.grey, height: 1.3)),
                                  const SizedBox(height: 12),
                                  LinearProgressIndicator(value: percent),
                                  const SizedBox(height: 8),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text('Raised: ₹\${prog.raised.toInt()}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                                      Text('Goal: ₹\${prog.goal.toInt()}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  ElevatedButton(
                                    onPressed: () => context.push('/donations'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Theme.of(context).colorScheme.primary,
                                      foregroundColor: Colors.white,
                                      minimumSize: const Size(double.infinity, 38),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                    child: const Text('Back Sponsorship / Donate Now', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}`
  },
  {
    name: "gallery_screen.dart",
    path: "lib/features/gallery/gallery_screen.dart",
    description: "Responsive photo grid showing impact delivery captures inside rural districts.",
    content: `import 'package:flutter/material.dart';

class GalleryScreen extends StatelessWidget {
  const GalleryScreen({super.key});

  final List<Map<String, String>> _photos = const [
    { 'url': 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=500', 'caption': 'Smiles at Vidya backpack delivery event' },
    { 'url': 'https://images.unsplash.com/photo-1594708767771-a7502209ff51?q=80&w=500', 'caption': 'Meals preparation for the Aahara hunger drive' },
    { 'url': 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=500', 'caption': 'Volunteer team planning rural medical camps' },
    { 'url': 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=500', 'caption': 'Community gathering at Blood Donation venue' },
    { 'url': 'https://images.unsplash.com/photo-1469571486090-7db5538d73b1?q=80&w=500', 'caption': 'Supplying blankets during winter' },
    { 'url': 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=500', 'caption': 'Tutoring workshop organized by members' },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('NGO Media Gallery', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20)),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: GridView.builder(
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 0.85,
        ),
        itemCount: _photos.length,
        padding: const EdgeInsets.all(12),
        itemBuilder: (context, idx) {
          final photo = _photos[idx];
          return InkWell(
            onTap: () => _showPreviewDialog(context, photo['url']!, photo['caption']!),
            child: Card(
              clipBehavior: Clip.antiAlias,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Expanded(
                    child: Image.network(photo['url']!, fit: BoxFit.cover),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Text(
                      photo['caption']!,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  void _showPreviewDialog(BuildContext context, String url, String caption) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Image.network(url, fit: BoxFit.contain),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.85),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(caption, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}`
  },
  {
    name: "events_screen.dart",
    path: "lib/features/events/events_screen.dart",
    description: "Upcoming schedules sheet featuring quick navigation triggers to volunteer forms.",
    content: `import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class EventsScreen extends StatelessWidget {
  const EventsScreen({super.key});

  final List<Map<String, dynamic>> _events = const [
    {
      'id': 'blood',
      'title': 'Sphoorthi Mega Blood Donation Drive',
      'date': '15 JUNE 2026',
      'time': '8:00 AM - 1:00 PM',
      'location': 'NGO Civil Town Hall, Bangalore',
      'desc': 'Collaborating with central hospitals to construct secure blood stores. Free health certification diagnostics will be performed for donors.',
      'img': 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800',
    },
    {
      'id': 'plantation',
      'title': 'Rural Afforestation Plantation Weekend',
      'date': '28 JUNE 2026',
      'time': '9:30 AM - 3:00 PM',
      'location': 'Nelamangala Village Suburbs',
      'desc': 'Planting 300 medicinal tree saplings and building organic mulching systems. High impact environmental workshop.',
      'img': 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=800',
    }
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Community Events', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20)),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: ListView.builder(
        itemCount: _events.length,
        padding: const EdgeInsets.all(16.0),
        itemBuilder: (context, idx) {
          final ev = _events[idx];
          return Card(
            margin: const EdgeInsets.only(bottom: 20),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            clipBehavior: Clip.antiAlias,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Image.network(ev['img'], height: 160, fit: BoxFit.cover),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.red.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              ev['date'],
                              style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 11),
                            ),
                          ),
                          Text(ev['time'], style: const TextStyle(color: Colors.grey, fontSize: 12)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(ev['title'], style: const TextStyle(fontWeight: FontWeight.extrabold, fontSize: 17)),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.location_on, size: 14, color: Colors.grey),
                          const SizedBox(width: 4),
                          Expanded(child: Text(ev['location'], style: const TextStyle(fontSize: 12, color: Colors.grey, overflow: TextOverflow.ellipsis))),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(ev['desc'], style: const TextStyle(fontSize: 13.5, color: Colors.grey, height: 1.35)),
                      const SizedBox(height: 14),
                      OutlinedButton.icon(
                        onPressed: () => context.push('/volunteer'),
                        icon: const Icon(Icons.volunteer_activism, size: 16),
                        label: const Text('Register as Volunteer for Event', style: TextStyle(fontWeight: FontWeight.extrabold, fontSize: 12)),
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size(double.infinity, 40),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}`
  },
  {
    name: "volunteer_screen.dart",
    path: "lib/features/volunteer/volunteer_screen.dart",
    description: "Input validator form triggering volunteer profile logs via ChangeNotifier.",
    content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/providers/volunteer_provider.dart';

class VolunteerScreen extends StatefulWidget {
  const VolunteerScreen({super.key});

  @override
  State<VolunteerScreen> createState() => _VolunteerScreenState();
}

class _VolunteerScreenState extends State<VolunteerScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCont = TextEditingController();
  final _emailCont = TextEditingController();
  final _phoneCont = TextEditingController();
  final _expCont = TextEditingController();
  String _selectedArea = "Education";

  @override
  void dispose() {
    _nameCont.dispose();
    _emailCont.dispose();
    _phoneCont.dispose();
    _expCont.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final prov = Provider.of<VolunteerProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Join as Volunteer', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20)),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: prov.registrationSuccess
            ? _buildSuccessBanner(context)
            : Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text(
                      'Serve the Community',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Gain experience, help those in need, and make new local connections. Become a part of Seva Sphoorthi.',
                      style: TextStyle(color: Colors.grey, fontSize: 13.5),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    TextFormField(
                      controller: _nameCont,
                      decoration: const InputDecoration(labelText: 'Full Name *', border: OutlineInputBorder()),
                      validator: (v) => v == null || v.isEmpty ? 'Specify name' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _emailCont,
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(labelText: 'Email Address *', border: OutlineInputBorder()),
                      validator: (v) => v == null || !v.contains('@') ? 'Enter a valid email' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _phoneCont,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(labelText: 'Phone Number *', border: OutlineInputBorder()),
                      validator: (v) => v == null || v.length < 8 ? 'Enter valid contact number' : null,
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: _selectedArea,
                      decoration: const InputDecoration(labelText: 'Core Interest Field', border: OutlineInputBorder()),
                      items: const [
                        DropdownMenuItem(value: 'Education', child: Text('Education Support (Vidya)')),
                        DropdownMenuItem(value: 'FoodDrive', child: Text('Midday Meals (Aahara)')),
                        DropdownMenuItem(value: 'Medical', child: Text('Rural Health Camps (Vaidya)')),
                        DropdownMenuItem(value: 'Admin', child: Text('Administrative Support')),
                      ],
                      onChanged: (val) {
                        if (val != null) setState(() => _selectedArea = val);
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _expCont,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        labelText: 'Past Work Credentials / Skills',
                        alignLabelWithHint: true,
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 24),
                    if (prov.errorMessage != null)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Text(prov.errorMessage!, style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
                      ),
                    ElevatedButton(
                      onPressed: prov.isSubmitting ? null : _submitForm,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Theme.of(context).colorScheme.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: prov.isSubmitting
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Text('Submit Enrollment Form', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    ),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildSuccessBanner(BuildContext context) {
    return Card(
      color: Colors.teal.shade50,
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            const Icon(Icons.check_circle, size: 64, color: Colors.teal),
            const SizedBox(height: 14),
            const Text('Enrollment Complete!', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text(
              'Your application is registered. We will send notifications about upcoming campaigns to your phone state shortly.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey, height: 1.3),
            ),
            const SizedBox(height: 20),
            TextButton(
              onPressed: () {
                Provider.of<VolunteerProvider>(context, listen: false).resetState();
                _nameCont.clear();
                _emailCont.clear();
                _phoneCont.clear();
                _expCont.clear();
              },
              child: const Text('Submit Another Form'),
            ),
          ],
        ),
      ),
    );
  }

  void _submitForm() {
    if (_formKey.currentState!.validate()) {
      Provider.of<VolunteerProvider>(context, listen: false).registerVolunteer(
        fullName: _nameCont.text,
        email: _emailCont.text,
        phone: _phoneCont.text,
        interestArea: _selectedArea,
        credentials: _expCont.text,
      );
    }
  }
}`
  },
  {
    name: "donation_screen.dart",
    path: "lib/features/donations/donation_screen.dart",
    description: "Razorpay Checkout framework integrating automated receipt logging via SharedPreferences.",
    content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../../core/providers/donation_provider.dart';

class DonationScreen extends StatefulWidget {
  const DonationScreen({super.key});

  @override
  State<DonationScreen> createState() => _DonationScreenState();
}

class _DonationScreenState extends State<DonationScreen> {
  late Razorpay _razorpay;
  final _formKey = GlobalKey<FormState>();
  final _nameCont = TextEditingController();
  final _emailCont = TextEditingController();
  final _amountCont = TextEditingController(text: "1000");
  String _selectedPurpose = "General Trust Fund";
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handleSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handleError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleWallet);
  }

  @override
  void dispose() {
    _razorpay.clear();
    _nameCont.dispose();
    _emailCont.dispose();
    _amountCont.dispose();
    super.dispose();
  }

  void _launchRazorpaySDK() {
    if (!_formKey.currentState!.validate()) return;

    final double amount = double.tryParse(_amountCont.text) ?? 1000;
    final options = {
      'key': 'rzp_live_SEVASPHOORTHY1',
      'amount': (amount * 100).toInt(), // amount in paisa
      'name': 'Seva Sphoorthi Trust',
      'description': _selectedPurpose,
      'prefill': {
        'contact': '9999999999',
        'email': _emailCont.text,
      },
      'external': {
        'wallets': ['paytm']
      }
    };

    setState(() => _isProcessing = true);
    try {
      _razorpay.open(options);
    } catch (e) {
      setState(() => _isProcessing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not load Razorpay frame: \${e.toString()}')),
      );
    }
  }

  void _handleSuccess(PaymentSuccessResponse response) async {
    setState(() => _isProcessing = false);
    final double amount = double.tryParse(_amountCont.text) ?? 1000;
    final donationProv = Provider.of<DonationProvider>(context, listen: false);
    await donationProv.saveDonation(
      donorName: _nameCont.text.isEmpty ? "Anonymous" : _nameCont.text,
      amount: amount,
      paymentId: response.paymentId ?? 'pay_seva_MOCK\${DateTime.now().millisecondsSinceEpoch}',
      purpose: _selectedPurpose,
    );

    _showSuccessDialog();
  }

  void _handleError(PaymentFailureResponse response) {
    setState(() => _isProcessing = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Payment Failed: \${response.message ?? "User cancelled flow"}')),
    );
  }

  void _handleWallet(ExternalWalletResponse response) {
    setState(() => _isProcessing = false);
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.favorite, color: Colors.red),
            SizedBox(width: 8),
            Text('Thank You!'),
          ],
        ),
        content: const Text('Your donation is successfully transacted and credited to Seva Sphoorthi Trust, Bangalore. Check historical ledger in your profile.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Donate via Razorpay', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('Secured Payment Gateway', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 6),
              const Text('Your donations are eligible for 50% Tax Exemption under Sector 80G.', style: TextStyle(color: Colors.grey, fontSize: 13)),
              const SizedBox(height: 20),
              TextFormField(
                controller: _nameCont,
                decoration: const InputDecoration(labelText: 'Donor Name', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _emailCont,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(labelText: 'Email Inbox *', border: OutlineInputBorder()),
                validator: (v) => v == null || !v.contains('@') ? 'Enter a valid email' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _amountCont,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Contribution Amount (INR) *', border: OutlineInputBorder(), prefixText: '₹ '),
                validator: (v) => v == null || double.tryParse(v) == null ? 'Enter valid number value' : null,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _selectedPurpose,
                decoration: const InputDecoration(labelText: 'Support Campaign Allocation', border: OutlineInputBorder()),
                items: const [
                  DropdownMenuItem(value: 'General Trust Fund', child: Text('General Trust Initiatives')),
                  DropdownMenuItem(value: 'Aahara Meals', child: Text('Hunger Relief (Aahara)')),
                  DropdownMenuItem(value: 'Vidya Supplies', child: Text('Kids Education Supplies (Vidya)')),
                  DropdownMenuItem(value: 'Vaidya Diagnostics', child: Text('Village Health Camps (Vaidya)')),
                ],
                onChanged: (v) {
                  if (v != null) setState(() => _selectedPurpose = v);
                },
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isProcessing ? null : _launchRazorpaySDK,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _isProcessing
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Initiate Payment Frame', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}`
  },
  {
    name: "contact_screen.dart",
    path: "lib/features/contact/contact_screen.dart",
    description: "Launch pad integrating url_launcher triggers for cellular calls, emails, and coordinates.",
    content: `import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class ContactScreen extends StatelessWidget {
  const ContactScreen({super.key});

  Future<void> _launchURL(String urlString) async {
    final Uri url = Uri.parse(urlString);
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      throw Exception('Could not launch \$urlString');
    }
  }

  @override
  Widget build(BuildContext context) {
    final primary = Theme.of(context).colorScheme.primary;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Contact & Location', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20)),
        backgroundColor: primary,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Card(
              child: Padding(
                padding: EdgeInsets.all(20.0),
                child: Column(
                  children: [
                    Icon(Icons.location_on, size: 40, color: Colors.orange),
                    SizedBox(height: 8),
                    Text('Registered Head Office', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    SizedBox(height: 4),
                    Text(
                      'No. 45, Seva Nilaya, Nelamangala Suburban Taluk, Bangalore rural district, Karnataka - 562123.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey, fontSize: 13, height: 1.3),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            _buildContactButton(
              icon: Icons.phone,
              title: 'Call Trust Support',
              subtitle: '+91 99015 67483',
              onTap: () => _launchURL('tel:+919901567483'),
            ),
            _buildContactButton(
              icon: Icons.email,
              title: 'Send Official Email',
              subtitle: 'info@sevasphoorthi.com',
              onTap: () => _launchURL('mailto:info@sevasphoorthi.com'),
            ),
            _buildContactButton(
              icon: Icons.map,
              title: 'Open in Google Maps',
              subtitle: 'Navigate to Nelamangala Office',
              onTap: () => _launchURL('https://maps.google.com/?q=Nelamangala,Bangalore'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContactButton({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: ListTile(
        leading: Icon(icon, color: Colors.orange),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text(subtitle, style: const TextStyle(color: Colors.grey, fontSize: 13)),
        trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey),
        onTap: onTap,
      ),
    );
  }
}`
  },
  {
    name: "profile_screen.dart",
    path: "lib/features/profile/profile_screen.dart",
    description: "Personal stats card with live active themes configurations and shared donation statements.",
    content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/providers/donation_provider.dart';
import '../../core/providers/theme_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final donateProv = Provider.of<DonationProvider>(context);
    final themeProv = Provider.of<ThemeProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Volunteer Profile', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            color: Theme.of(context).colorScheme.primary.withOpacity(0.08),
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 40,
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  child: const Icon(Icons.person, size: 48, color: Colors.white),
                ),
                const SizedBox(height: 12),
                const Text('Seva Volunteer', style: TextStyle(fontWeight: FontWeight.extrabold, fontSize: 18)),
                const Text('volunteer@sevasphoorthi.com', style: TextStyle(color: Colors.grey, fontSize: 13)),
              ],
            ),
          ),
          SwitchListTile(
            title: const Text('Dark Theme Mode', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            subtitle: const Text('Toggle custom Material dark palette settings', style: TextStyle(fontSize: 12)),
            value: themeProv.themeMode == ThemeMode.dark,
            onChanged: (val) => themeProv.toggleTheme(val),
          ),
          const Divider(),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Text('Contribution History', style: TextStyle(fontWeight: FontWeight.extrabold, fontSize: 15)),
          ),
          Expanded(
            child: donateProv.history.isEmpty
                ? const Center(
                    child: Text('No sponsorship records registered yet.', style: TextStyle(color: Colors.grey)),
                  )
                : ListView.builder(
                    itemCount: donateProv.history.length,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemBuilder: (context, idx) {
                      final rec = donateProv.history[idx];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          leading: const Icon(Icons.receipt_long, color: Colors.orange),
                          title: Text('Sponsor: \${rec.purpose}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          subtitle: RichText(
                            text: TextSpan(
                              style: const TextStyle(color: Colors.grey, fontSize: 11),
                              children: [
                                TextSpan(text: 'ID: \${rec.paymentId}\\n'),
                                TextSpan(text: 'Date: \${rec.date}'),
                              ],
                            ),
                          ),
                          trailing: Text('₹\${rec.amount}', style: const TextStyle(fontWeight: FontWeight.black, color: Colors.orange, fontSize: 14)),
                        ),
                      );
                    },
                  ),
          )
        ],
      ),
    );
  }
}`
  },
  {
    name: "notification_service.dart",
    path: "lib/services/notification_service.dart",
    description: "Configures Firebase Cloud Messaging setup to receive notifications and handle instant route hops.",
    content: `import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import '../routes/app_router.dart';

class NotificationService {
  final FirebaseMessaging _fcm = FirebaseMessaging.instance;

  Future<void> initialize() async {
    // Request notification permission metrics.
    await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    // Fetch the specific FCM push token (this is used to register against the server).
    String? token = await _fcm.getToken();
    debugPrint("Firebase Messaging Registration Token: \$token");

    // Listening when messaging arrives in foreground
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint("FCM Notification Received in Foreground: \${message.notification?.title}");
    });

    // Listening to user tap when notification opens app from background state
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      _handleNotificationPayload(message.data);
    });
  }

  void _handleNotificationPayload(Map<String, dynamic> data) {
    final String? screenTarget = data['target_screen'];
    if (screenTarget != null) {
      // Direct jump using our AppRouter system (deep-linking effect)
      if (screenTarget == 'volunteer') {
        AppRouter.router.push('/volunteer');
      } else if (screenTarget == 'donation') {
        AppRouter.router.push('/donations');
      } else if (screenTarget == 'events') {
        AppRouter.router.push('/events');
      } else if (screenTarget == 'programs') {
        AppRouter.router.push('/programs');
      }
    }
  }
}`
  }
];
