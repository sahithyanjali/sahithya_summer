import SwiftUI

public struct CampTrackingView: View {
    @ObservedObject var viewModel: AppViewModel

    public var body: some View {
        NavigationStack {
            List {
                Section(header: Text("Active Rural Relief Camps")) {
                    ForEach(viewModel.camps) { camp in
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Text(camp.name)
                                    .font(.subheadline)
                                    .fontWeight(.bold)
                                Spacer()
                                Text(camp.status.uppercased())
                                    .font(.caption2)
                                    .fontWeight(.heavy)
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(camp.status.lowercased() == "active" ? Color.green.opacity(0.15) : Color.orange.opacity(0.15))
                                    .foregroundColor(camp.status.lowercased() == "active" ? .green : .orange)
                                    .cornerRadius(4)
                            }

                            HStack {
                                Image(systemName: "mappin.circle.fill")
                                    .foregroundColor(.red)
                                Text(camp.location)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }

                            // Progress bar
                            VStack(alignment: .leading, spacing: 3) {
                                HStack {
                                    Text("Meals Served:")
                                        .font(.caption2)
                                        .foregroundColor(.secondary)
                                    Text("\(camp.mealsServed) / \(camp.mealsTarget)")
                                        .font(.caption2)
                                        .fontWeight(.bold)
                                    Spacer()
                                    let pct = Double(camp.mealsServed) / Double(max(camp.mealsTarget, 1)) * 100
                                    Text("\(Int(pct))%")
                                        .font(.caption2)
                                        .fontWeight(.bold)
                                        .foregroundColor(.orange)
                                }

                                ProgressView(value: Double(camp.mealsServed), total: Double(max(camp.mealsTarget, 1)))
                                    .tint(.orange)
                            }

                            HStack {
                                Text("Coordinator: \(camp.coordinator)")
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                                Spacer()
                                Text("Verified: \(camp.lastVerifiedAt)")
                                    .font(.system(size: 9))
                                    .foregroundColor(.secondary)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
            .navigationTitle("Camp Tracking")
            .refreshable {
                await viewModel.fetchCamps()
            }
        }
    }
}
