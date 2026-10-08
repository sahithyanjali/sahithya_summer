# Sphoorthi Seva Trust — iOS Native Application

Official iOS native application for **Sphoorthi Seva Trust (Reg: 402/2021)** built with **Swift 5.9** and **SwiftUI** for iOS 16.0+.

## Highlights
- **100% Native SwiftUI Architecture**: Modern MVVM structure with `ObservableObject` and async/await concurrency.
- **Pull-To-Refresh**: Native `.refreshable` synchronizing real-time donation metrics and civic drives from the backend.
- **80G Tax Exemption**: Seamless donor registration with instant tax receipt verification and PAN validation.
- **Relief Camp Tracking**: Live progress bars for field annadana targets across rural Karnataka relief centers.
- **Appreciation Certificates**: Verified digital certificates with SHA-256 integrity checks and iOS share sheet integration.

## Project Structure
```text
ios/
├── Podfile                        # CocoaPods dependencies (Alamofire, Kingfisher, SwiftyJSON)
├── README.md                      # Deployment & setup documentation
└── SphoorthiApp/
    ├── Info.plist                 # Permissions (Camera for QR receipt scan, Location, Photos)
    ├── SphoorthiApp.swift         # @main SwiftUI entrypoint with TabView routing
    ├── Models/
    │   └── Models.swift           # Donation, EventFeed, ReliefCamp, DonationStats
    ├── ViewModels/
    │   └── AppViewModel.swift     # Live API networking & reactive state manager
    └── Views/
        ├── HomeView.swift         # Dashboard with hero mission, live stats & event feed
        ├── DonationView.swift     # Preset ₹500–₹5000 seva picker & 80G tax receipt
        ├── VolunteerView.swift    # Volunteer registration with interest area dispatch
        ├── CampTrackingView.swift # Live camp meal target progress trackers
        └── CertificateView.swift  # Digital seva recognition certificate & export
```

## Running the App in Xcode
1. Ensure Xcode 15+ is installed on macOS.
2. Open terminal in the `ios/` folder and install CocoaPods (if using workspace):
   ```bash
   pod install
   ```
3. Open `SphoorthiApp.xcworkspace` (or `SphoorthiApp.xcodeproj`) in Xcode.
4. Select an iPhone 15 / 16 simulator or connected physical device.
5. Press `Cmd + R` to build and run.
