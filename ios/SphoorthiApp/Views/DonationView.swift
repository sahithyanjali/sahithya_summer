import SwiftUI

public struct DonationView: View {
    @ObservedObject var viewModel: AppViewModel
    @State private var selectedAmount: Double = 1000
    @State private var customAmount: String = ""
    @State private var donorName: String = ""
    @State private var donorPan: String = ""
    @State private var selectedPurpose: String = "Annadana Hot Meals"
    @State private var isSubmitting: Bool = false
    @State private var showSuccessAlert: Bool = false

    let presetAmounts: [Double] = [500, 1000, 2500, 5000]
    let causes: [String] = [
        "Annadana Hot Meals",
        "Vidya Student Kit",
        "Rural Healthcare & Medicine",
        "Emergency Disaster Relief"
    ]

    public var body: some View {
        Form {
            Section(header: Text("Choose Seva Contribution")) {
                Picker("Cause", selection: $selectedPurpose) {
                    ForEach(causes, id: \.self) { cause in
                        Text(cause).tag(cause)
                    }
                }

                HStack {
                    ForEach(presetAmounts, id: \.self) { amt in
                        Button(action: {
                            selectedAmount = amt
                            customAmount = ""
                        }) {
                            Text("₹\(Int(amt))")
                                .font(.caption)
                                .fontWeight(.bold)
                                .padding(.vertical, 8)
                                .frame(maxWidth: .infinity)
                                .background(selectedAmount == amt && customAmount.isEmpty ? Color.orange : Color(.systemGray5))
                                .foregroundColor(selectedAmount == amt && customAmount.isEmpty ? .white : .primary)
                                .cornerRadius(8)
                        }
                        .buttonStyle(.plain)
                    }
                }

                TextField("Or enter custom amount (₹)", text: $customAmount)
                    .keyboardType(.numberPad)
                    .onChange(of: customAmount) { val in
                        if let num = Double(val), num > 0 {
                            selectedAmount = num
                        }
                    }
            }

            Section(header: Text("Donor & 80G Tax Exemption Details")) {
                TextField("Full Name (as per PAN)", text: $donorName)
                TextField("PAN Card Number (for 80G Receipt)", text: $donorPan)
                    .textInputAutocapitalization(.characters)
                Text("Donations are 50% tax exempt under Section 80G of Indian IT Act. Unique 80G receipt issued immediately.")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }

            Section {
                Button(action: {
                    Task {
                        isSubmitting = true
                        let amt = Double(customAmount) ?? selectedAmount
                        let success = await viewModel.submitDonation(
                            name: donorName.isEmpty ? "Anonymous Seva Karta" : donorName,
                            amount: amt,
                            purpose: selectedPurpose,
                            pan: donorPan
                        )
                        isSubmitting = false
                        if success {
                            showSuccessAlert = true
                        }
                    }
                }) {
                    HStack {
                        Spacer()
                        if isSubmitting {
                            ProgressView()
                                .tint(.white)
                        } else {
                            Image(systemName: "heart.fill")
                            Text("Complete Seva ₹\(Int(Double(customAmount) ?? selectedAmount))")
                                .fontWeight(.bold)
                        }
                        Spacer()
                    }
                    .padding(.vertical, 4)
                }
                .disabled(isSubmitting)
                .listRowBackground(Color.orange)
                .foregroundColor(.white)
            }

            Section(header: Text("Recent Verified Donors")) {
                ForEach(viewModel.donations.prefix(5)) { d in
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(d.donorName)
                                .font(.subheadline)
                                .fontWeight(.bold)
                            Text(d.purpose)
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                        VStack(alignment: .trailing, spacing: 2) {
                            Text("₹\(Int(d.amount))")
                                .font(.subheadline)
                                .fontWeight(.heavy)
                                .foregroundColor(.orange)
                            Text("80G Verified")
                                .font(.system(size: 9))
                                .foregroundColor(.green)
                        }
                    }
                }
            }
        }
        .navigationTitle("Seva Donation")
        .alert("Donation Received with Gratitude", isPresented: $showSuccessAlert) {
            Button("View Receipt", role: .cancel) {}
        } message: {
            Text("Thank you for your generous seva. Your official 80G tax receipt has been generated and recorded in the transparent audit ledger.")
        }
    }
}
