# Seva Sphoorthi — Native Flutter Mobile App (`mobile/`)

## Architecture & Module Structure

Targeted for **~10,000 registered users** with concurrent read/write scaling, offline resiliency, and strict separation between the Volunteer client and Admin capabilities.

### 15 Native Flutter Screens (Pega Blueprint Aligned)
1. **01_splash_screen.dart**: Brand entry, authentication token check, offline cache sync.
2. **02_login_otp_screen.dart**: Phone OTP & Email magic link authentication with auto-credential detection.
3. **04_registration_screen.dart**: Initial account creation and terms acknowledgment.
4. **04_volunteer_profile_screen.dart**: Demographics, emergency contacts, blood group, address.
5. **05_identity_verification_screen.dart**: Document capture (Aadhaar / Voter / License), criminal background disclosure.
6. **06_skills_screen.dart**: Multi-select skills taxonomy (Food Relief, Teaching, Medical, Logistics).
7. **07_availability_screen.dart**: Recurring morning/afternoon/evening availability matrix.
8. **08_opportunity_feed_screen.dart**: Paginated opportunity feed with category filters and search.
9. **09_opportunity_details_screen.dart**: Detailed event scope, required skills, address map, coordinator contacts.
10. **10_apply_opportunity_screen.dart**: 1-click apply, availability confirmation, real-time match breakdown.
11. **11_my_applications_screen.dart**: Application tracking across statuses (Applied, Review, Approved).
12. **12_my_schedule_screen.dart**: Upcoming confirmed assignments, calendar view, QR check-in token.
13. **13_notifications_screen.dart**: FCM notification inbox with actionable routing.
14. **14_engagement_history_screen.dart**: Total verified service hours, completed camps, digital certificate.
15. **15_profile_settings_screen.dart**: Account preferences, dark mode, language selector, logout.

## Production API Integration
- Base URL: `https://api.sevasphoorthi.org/api/v1`
- Persistent Endpoints:
  - `GET /profile`: Loads volunteer profile, verified status, hours, and capabilities
  - `PUT /profile`: Persists profile edits and capability selections
  - `GET /opportunities`: Live opportunity feed with Pega match weighting
  - `POST /opportunities/:id/apply`: Submits application slot claim and auto-updates assignment schedule
  - `GET /schedule`: Retrieves confirmed shift assignments with QR check-in tokens
  - `GET /applications`: Retrieves active application status pipeline

## Android Firebase Configuration
- Package / Application ID: `org.sevasphoorthi.trust`
- `Firebase.initializeApp()` is invoked in `mobile/lib/main.dart` upon startup.
- To bind your Firebase Project credentials locally:
  1. Register package `org.sevasphoorthi.trust` in your Firebase Console project.
  2. Download your production `google-services.json`.
  3. Place `google-services.json` into `android/app/` (or run `flutterfire configure`).
  4. The Google Services Gradle plugin (`com.google.gms.google-services`) automatically binds Firebase Auth, Firestore, and FCM during local APK generation (`flutter build apk --release`).

