import SwiftUI

public struct CertificateView: View {
    let volunteerName: String
    let certificateId: String
    let issueDate: String
    let hoursServed: Int

    public init(
        volunteerName: String = "Sphoorthi Seva Volunteer",
        certificateId: String = "SEVA-CERT-2026-8942",
        issueDate: String = "21 September 2026",
        hoursServed: Int = 36
    ) {
        self.volunteerName = volunteerName
        self.certificateId = certificateId
        self.issueDate = issueDate
        self.hoursServed = hoursServed
    }

    public var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Certificate Frame
                VStack(spacing: 14) {
                    HStack {
                        Image(systemName: "seal.fill")
                            .font(.largeTitle)
                            .foregroundColor(.orange)
                        VStack(alignment: .leading) {
                            Text("SPHOORTHI SEVA TRUST")
                                .font(.headline)
                                .fontWeight(.heavy)
                                .foregroundColor(.orange)
                            Text("Government Registered Public Charitable Trust • 80G Compliant")
                                .font(.system(size: 9))
                                .foregroundColor(.secondary)
                        }
                    }

                    Divider()

                    Text("CERTIFICATE OF SEVA & APPRECIATION")
                        .font(.subheadline)
                        .fontWeight(.heavy)
                        .tracking(1.5)

                    Text("This is proudly presented to")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    Text(volunteerName)
                        .font(.title2)
                        .fontWeight(.heavy)
                        .foregroundColor(.primary)

                    Text("In sincere gratitude for exemplary civic dedication and selfless seva, contributing \(hoursServed) hours of verified fieldwork across rural Annadana & Vidya education relief initiatives.")
                        .font(.caption)
                        .multilineTextAlignment(.center)
                        .foregroundColor(.secondary)
                        .padding(.horizontal)

                    Divider()

                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Certificate ID:")
                                .font(.system(size: 8))
                                .foregroundColor(.secondary)
                            Text(certificateId)
                                .font(.system(size: 9, weight: .bold, design: .monospaced))
                            Text("Issued: \(issueDate)")
                                .font(.system(size: 8))
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                        VStack(alignment: .trailing, spacing: 2) {
                            Text("Trustee Secretary")
                                .font(.caption2)
                                .fontWeight(.bold)
                            Text("Sphoorthi Seva Trust")
                                .font(.system(size: 8))
                                .foregroundColor(.secondary)
                        }
                    }
                }
                .padding(20)
                .background(Color(.systemBackground))
                .cornerRadius(16)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.orange.opacity(0.4), lineWidth: 2)
                )
                .shadow(color: Color.black.opacity(0.06), radius: 8, x: 0, y: 3)
                .padding()

                // Share / Download actions
                HStack(spacing: 12) {
                    Button(action: {
                        // Trigger iOS share sheet
                    }) {
                        HStack {
                            Image(systemName: "square.and.arrow.up")
                            Text("Share Certificate")
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.orange)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                    }

                    Button(action: {
                        // Trigger PDF export
                    }) {
                        HStack {
                            Image(systemName: "arrow.down.doc.fill")
                            Text("Download PDF")
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(.systemGray5))
                        .foregroundColor(.primary)
                        .cornerRadius(12)
                    }
                }
                .padding(.horizontal)
            }
        }
        .navigationTitle("Certificate")
        .background(Color(.systemGroupedBackground))
    }
}
