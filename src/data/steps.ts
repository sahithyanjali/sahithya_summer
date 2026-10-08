import { AppStep } from "../types";

export const APP_STEPS: AppStep[] = [
  {
    id: 1,
    title: "1. Core App Bootstrap & Navigation Setup",
    teaser: "Bootstrap folder trees, pubspec.yaml components, and routing paths.",
    description: "Initialize the project, declare the foundational packages (GoRouter, Provider, Dio), set up the MaterialApp.router configuration, and construct directory maps.",
    terminalCommands: [
      "flutter create --org com.sevasphoorthi.app seva_sphoorthi_app",
      "flutter pub add go_router provider dio cached_network_image firebase_core connectivity_plus shared_preferences url_launcher razorpay_flutter"
    ],
    filesCreated: [
      "pubspec.yaml",
      "lib/main.dart",
      "lib/routes/app_router.dart"
    ],
    filesModified: []
  },
  {
    id: 2,
    title: "2. Build Home & Announcements Dashboard",
    teaser: "Construct the central feed, announcements marquee, and action hubs.",
    description: "Launch the HomeScreen. Structure the responsive NGO banner, Quick Action buttons leading to critical modules, scrolling announcement cards, and next-event showcases.",
    terminalCommands: [
      "mkdir -p lib/features/home",
      "touch lib/features/home/home_screen.dart"
    ],
    filesCreated: ["lib/features/home/home_screen.dart"],
    filesModified: ["lib/routes/app_router.dart"]
  },
  {
    id: 3,
    title: "3. Build About US & Active Programs",
    teaser: "Inform users of the NGO's mission, vision, and core support campaigns.",
    description: "Create screens detail pages for the mission/vision statement, and a search-enabled listings screen showcasing active programs like Aahara (Meal Drive) and Vidya (Education supplies).",
    terminalCommands: [
      "mkdir -p lib/features/about lib/features/programs",
      "touch lib/features/about/about_screen.dart lib/features/programs/programs_screen.dart"
    ],
    filesCreated: [
      "lib/features/about/about_screen.dart",
      "lib/features/programs/programs_screen.dart"
    ],
    filesModified: ["lib/routes/app_router.dart"]
  },
  {
    id: 4,
    title: "4. Create Activity Gallery & Upcoming Events Grid",
    teaser: "Build responsive media grids and interactive schedule listings.",
    description: "Build an media viewer with image zoom capabilities, and an active schedules list featuring details of charitable events and a CTA leading to registration forms.",
    terminalCommands: [
      "mkdir -p lib/features/gallery lib/features/events",
      "touch lib/features/gallery/gallery_screen.dart lib/features/events/events_screen.dart"
    ],
    filesCreated: [
      "lib/features/gallery/gallery_screen.dart",
      "lib/features/events/events_screen.dart"
    ],
    filesModified: ["lib/routes/app_router.dart"]
  },
  {
    id: 5,
    title: "5. Integrate Volunteer Registration & Validation (Dio API)",
    teaser: "Build interactive registration forms with client-side validators.",
    description: "Deploy the VolunteerScreen form. Establish form validation rules (Email/Phone structures), load state overlays, and model local notifications after Dio transacts data.",
    terminalCommands: [
      "mkdir -p lib/features/volunteer lib/core/providers",
      "touch lib/core/providers/volunteer_provider.dart lib/features/volunteer/volunteer_screen.dart"
    ],
    filesCreated: [
      "lib/core/providers/volunteer_provider.dart",
      "lib/features/volunteer/volunteer_screen.dart"
    ],
    filesModified: ["lib/main.dart"]
  },
  {
    id: 6,
    title: "6. Integrate Razorpay Donation Gateway & Local Receipts",
    teaser: "Deploy checkout forms, Razorpay SDK frames, and history ledger.",
    description: "Create the Razorpay donation module. Support dynamic billing inputs, render payment sheets, capture success tokens, and store receipts on device via SharedPreferences.",
    terminalCommands: [
      "mkdir -p lib/features/donations",
      "touch lib/core/providers/donation_provider.dart lib/features/donations/donation_screen.dart"
    ],
    filesCreated: [
      "lib/core/providers/donation_provider.dart",
      "lib/features/donations/donation_screen.dart"
    ],
    filesModified: ["lib/main.dart"]
  },
  {
    id: 7,
    title: "7. Build Contact Module with Interactive Map Markers",
    teaser: "Connect dial pad triggers, mail clients, and Google maps markers.",
    description: "Deploy launcher coordinates using url_launcher for tel: and mailto: vectors. Map deep-linking binds user navigation directly to sevasphoorthi.com HQ in Nelamangala.",
    terminalCommands: [
      "mkdir -p lib/features/contact",
      "touch lib/features/contact/contact_screen.dart"
    ],
    filesCreated: ["lib/features/contact/contact_screen.dart"],
    filesModified: ["lib/routes/app_router.dart"]
  },
  {
    id: 8,
    title: "8. Deploy Profile & Cloud Messages Testbed (FCM)",
    teaser: "Setup Firebase Push messaging and deep routing routines.",
    description: "Launch user profiles displaying active volunteer statuses and invoice tracking ledger. Setup Firebase Cloud Messaging services to handle notifications with deep link actions.",
    terminalCommands: [
      "mkdir -p lib/features/profile lib/services",
      "touch lib/features/profile/profile_screen.dart lib/services/notification_service.dart"
    ],
    filesCreated: [
      "lib/features/profile/profile_screen.dart",
      "lib/services/notification_service.dart"
    ],
    filesModified: ["lib/main.dart"]
  },
  {
    id: 9,
    title: "9. Build Dharma Careers Hub (Jobs Matching)",
    teaser: "Setup filters for Garland Makers, maintenance experts, and Helpers.",
    description: "Deploy the CareersScreen form. Create high-fidelity listings for cultural roles, and integrate text filters for locations, keywords, and specific temple organization classifications.",
    terminalCommands: [
      "mkdir -p lib/features/jobs lib/core/models",
      "touch lib/features/jobs/jobs_screen.dart lib/core/models/job_model.dart"
    ],
    filesCreated: [
      "lib/features/jobs/jobs_screen.dart",
      "lib/core/models/job_model.dart"
    ],
    filesModified: ["lib/routes/app_router.dart"]
  },
  {
    id: 10,
    title: "10. Deploy Services Offered Directory",
    teaser: "Launch detailed listings categorizing community and youth services.",
    description: "Integrate the ServicesScreen showing Youth Programs (Sanskar), Skill Development, and outreach lines, and connect action triggers back to volunteer signups.",
    terminalCommands: [
      "mkdir -p lib/features/services",
      "touch lib/features/services/services_screen.dart"
    ],
    filesCreated: ["lib/features/services/services_screen.dart"],
    filesModified: ["lib/routes/app_router.dart"]
  }
];
