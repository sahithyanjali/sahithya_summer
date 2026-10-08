import SwiftUI

public struct HomeView: View {
    @ObservedObject var viewModel: AppViewModel
    @State private var showingQuickDonate = false

    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // Hero Mission Card
                    ZStack(alignment: .bottomLeading) {
                        LinearGradient(
                            colors: [Color.orange, Color.orange.opacity(0.85), Color.red.opacity(0.8)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                        .frame(height: 180)
                        .cornerRadius(16)

                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Image(systemName: "heart.circle.fill")
                                    .font(.title3)
                                Text("Sphoorthi Seva Trust")
                                    .font(.headline)
                                    .fontWeight(.heavy)
                                Spacer()
                                Text("Reg: 402/2021")
                                    .font(.caption2)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 3)
                                    .background(Color.white.opacity(0.2))
                                    .cornerRadius(6)
                            }

                            Text("Nourishing Lives, Empowering Communities")
                                .font(.title3)
                                .fontWeight(.bold)
                                .lineLimit(2)

                            Text("Daily Annadana, Vidya educational kits, and emergency rural medical relief.")
                                .font(.caption)
                                .opacity(0.9)
                        }
                        .foregroundColor(.white)
                        .padding(16)
                    }
                    .padding(.horizontal)

                    // Live Statistics Card
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Image(systemName: "chart.line.uptrend.xyaxis")
                                .foregroundColor(.orange)
                            Text("Live Transparency Metrics")
                                .font(.subheadline)
                                .fontWeight(.bold)
                            Spacer()
                            if viewModel.isLoading {
                                ProgressView()
                                    .scaleEffect(0.8)
                            } else {
                                Text("Backend Live")
                                    .font(.caption2)
                                    .fontWeight(.bold)
                                    .foregroundColor(.green)
                            }
                        }

                        HStack(spacing: 12) {
                            StatBox(title: "Total Raised", value: "₹\(Int(viewModel.totalRaised).formatted())", subtitle: "100% Audited")
                            StatBox(title: "Donors", value: "\(viewModel.totalDonors)", subtitle: "80G Compliant")
                            StatBox(title: "Active Drives", value: "\(viewModel.events.count)", subtitle: "Bangalore & Rural")
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(16)
                    .shadow(color: Color.black.opacity(0.04), radius: 6, x: 0, y: 2)
                    .padding(.horizontal)

                    // Quick Actions
                    HStack(spacing: 12) {
                        NavigationLink(destination: DonationView(viewModel: viewModel)) {
                            HStack {
                                Image(systemName: "heart.fill")
                                Text("Donate Seva")
                                    .fontWeight(.bold)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(Color.orange)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                        }

                        NavigationLink(destination: VolunteerView(viewModel: viewModel)) {
                            HStack {
                                Image(systemName: "person.crop.circle.badge.plus")
                                Text("Volunteer")
                                    .fontWeight(.bold)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(Color(.systemGray6))
                            .foregroundColor(.primary)
                            .cornerRadius(12)
                        }
                    }
                    .padding(.horizontal)

                    // Upcoming Events Feed
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("Active Civic & Seva Drives")
                                .font(.headline)
                                .fontWeight(.bold)
                            Spacer()
                            Text("\(viewModel.events.count) Active")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .padding(.horizontal)

                        ForEach(viewModel.events) { event in
                            VStack(alignment: .leading, spacing: 6) {
                                HStack {
                                    Text(event.date)
                                        .font(.caption2)
                                        .fontWeight(.bold)
                                        .foregroundColor(.red)
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(Color.red.opacity(0.1))
                                        .cornerRadius(4)
                                    Spacer()
                                    if let cat = event.category {
                                        Text(cat)
                                            .font(.caption2)
                                            .foregroundColor(.secondary)
                                    }
                                }

                                Text(event.title)
                                    .font(.subheadline)
                                    .fontWeight(.bold)

                                Text(event.desc)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                    .lineLimit(2)

                                HStack {
                                    Image(systemName: "mappin.and.ellipse")
                                        .foregroundColor(.orange)
                                    Text(event.location)
                                        .font(.caption2)
                                        .foregroundColor(.secondary)
                                }
                            }
                            .padding()
                            .background(Color(.systemBackground))
                            .cornerRadius(12)
                            .shadow(color: Color.black.opacity(0.03), radius: 4, x: 0, y: 1)
                            .padding(.horizontal)
                        }
                    }
                }
                .padding(.vertical)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Sphoorthi Seva")
            .navigationBarTitleDisplayMode(.inline)
            .refreshable {
                await viewModel.fetchAllData()
            }
        }
    }
}

struct StatBox: View {
    let title: String
    let value: String
    let subtitle: String

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title)
                .font(.caption2)
                .foregroundColor(.secondary)
            Text(value)
                .font(.subheadline)
                .fontWeight(.heavy)
                .lineLimit(1)
            Text(subtitle)
                .font(.system(size: 9))
                .foregroundColor(.green)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(8)
        .background(Color(.systemGray6))
        .cornerRadius(8)
    }
}
