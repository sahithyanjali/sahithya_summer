import SwiftUI

@main
struct SphoorthiApp: App {
    @StateObject private var viewModel = AppViewModel()

    var body: some Scene {
        WindowGroup {
            TabView {
                HomeView(viewModel: viewModel)
                    .tabItem {
                        Label("Home", systemImage: "house.fill")
                    }

                DonationView(viewModel: viewModel)
                    .tabItem {
                        Label("Donate", systemImage: "heart.fill")
                    }

                VolunteerView(viewModel: viewModel)
                    .tabItem {
                        Label("Volunteer", systemImage: "person.2.fill")
                    }

                CampTrackingView(viewModel: viewModel)
                    .tabItem {
                        Label("Camps", systemImage: "map.fill")
                    }

                CertificateView()
                    .tabItem {
                        Label("Certificate", systemImage: "seal.fill")
                    }
            }
            .tint(.orange)
        }
    }
}
