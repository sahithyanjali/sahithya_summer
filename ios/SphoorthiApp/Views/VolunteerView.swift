import SwiftUI

public struct VolunteerView: View {
    @ObservedObject var viewModel: AppViewModel
    @State private var fullName: String = ""
    @State private var phone: String = ""
    @State private var city: String = "Bangalore"
    @State private var interestArea: String = "Annadana Food Distribution"
    @State private var availability: String = "Weekends Only"
    @State private var isRegistered: Bool = false

    let interestOptions = [
        "Annadana Food Distribution",
        "Vidya Teaching & Kit Distribution",
        "Mega Blood Donation Drives",
        "Rural Afforestation & Environment",
        "Disaster Emergency Logistics"
    ]

    let availabilityOptions = ["Weekends Only", "Weekdays", "Full-time Active", "On-call Emergency"]

    public var body: some View {
        Form {
            Section(header: Text("Join As A Seva Volunteer")) {
                TextField("Full Legal Name", text: $fullName)
                TextField("WhatsApp / Mobile Number", text: $phone)
                    .keyboardType(.phonePad)
                TextField("City / District", text: $city)
            }

            Section(header: Text("Your Seva Preferences")) {
                Picker("Interest Area", selection: $interestArea) {
                    ForEach(interestOptions, id: \.self) { opt in
                        Text(opt).tag(opt)
                    }
                }

                Picker("Availability", selection: $availability) {
                    ForEach(availabilityOptions, id: \.self) { opt in
                        Text(opt).tag(opt)
                    }
                }
            }

            Section {
                Button(action: {
                    isRegistered = true
                }) {
                    HStack {
                        Spacer()
                        Image(systemName: "person.badge.shield.checkmark.fill")
                        Text("Register for Volunteer Seva")
                            .fontWeight(.bold)
                        Spacer()
                    }
                }
                .listRowBackground(Color.orange)
                .foregroundColor(.white)
            }

            Section(header: Text("Volunteer Community Impact")) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("• Over 1,200 active volunteers across Karnataka")
                        .font(.caption)
                    Text("• Verified digital certificate of appreciation after every drive")
                        .font(.caption)
                    Text("• Free field gear, food, and volunteer logistics provided")
                        .font(.caption)
                }
                .foregroundColor(.secondary)
            }
        }
        .navigationTitle("Volunteer Portal")
        .alert("Welcome to Sphoorthi Seva!", isPresented: $isRegistered) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Thank you, \(fullName.isEmpty ? "Volunteer" : fullName)! Our volunteer coordinator will reach out to your WhatsApp shortly with orientation details.")
        }
    }
}
