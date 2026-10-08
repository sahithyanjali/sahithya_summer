# Sphoorthi Seva Trust — Android Native Application

Official Android native application for **Sphoorthi Seva Trust (Reg: 402/2021)** built with **Kotlin 1.9+**, **Jetpack Compose**, and **Material 3**.

## Highlights
- **Jetpack Compose UI**: Modern declarative UI with custom theme, high contrast readability, and smooth micro-interactions.
- **SwipeRefresh & Live Networking**: Pull-to-refresh connected via **Retrofit 2** to the Sphoorthi Seva live backend API.
- **UPI Deep-Linking**: Native `upi://pay` intent integration for frictionless instant contributions via Google Pay, PhonePe, and Paytm.
- **80G Tax Exemption**: Automatic issuance and storage of 80G tax receipt records.

## Project Structure
```text
android/
├── build.gradle                          # Top-level Gradle configuration
├── settings.gradle                       # Project module definitions (:app)
├── README.md                             # Android development documentation
└── app/
    ├── build.gradle                      # App-level dependencies (Compose, Retrofit, Coil)
    └── src/main/
        ├── AndroidManifest.xml           # Permissions (Internet, Camera, UPI intents)
        ├── java/org/sevasphoorthi/
        │   ├── MainActivity.kt           # NavHost & BottomNavigation scaffold
        │   ├── data/
        │   │   ├── DataModels.kt         # Donation, EventFeed, ReliefCamp data classes
        │   │   └── SevaApiService.kt     # Retrofit REST API interface
        │   └── ui/
        │       ├── HomeScreen.kt         # SwipeRefresh home feed & live audit counters
        │       └── DonationScreen.kt     # Preset amount selector & 80G form
        └── res/
            └── values/
                ├── strings.xml           # Localized app strings
                ├── colors.xml            # NGO saffron & emerald brand palette
                └── themes.xml            # Material 3 window styling
```

## Building in Android Studio
1. Open Android Studio (Hedgehog or later).
2. Select **Open** and choose the `android/` directory.
3. Allow Gradle to sync dependencies.
4. Run on an Android 14 emulator or physical device via USB debugging.
5. To generate a debug APK from terminal:
   ```bash
   ./gradlew assembleDebug
   ```
