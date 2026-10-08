import Foundation
import SwiftUI

@MainActor
public class AppViewModel: ObservableObject {
    @Published public var donations: [Donation] = []
    @Published public var events: [EventFeed] = []
    @Published public var camps: [ReliefCamp] = []
    @Published public var totalRaised: Double = 284500
    @Published public var totalDonors: Int = 48
    @Published public var isLoading: Bool = false
    @Published public var lastRefreshed: Date = Date()
    @Published public var bannerMessage: String? = nil

    private let baseURL = "https://ais-dev-f5x7za3ubwqtlmhu6dp2jn-689137031286.asia-southeast1.run.app"

    public init() {
        Task {
            await fetchAllData()
        }
    }

    public func fetchAllData() async {
        isLoading = true
        defer { isLoading = false }

        async let donationsTask = fetchDonations()
        async let eventsTask = fetchEvents()
        async let campsTask = fetchCamps()

        _ = await (donationsTask, eventsTask, campsTask)
        lastRefreshed = Date()
    }

    public func fetchDonations() async {
        guard let url = URL(string: "\(baseURL)/api/v1/donations") else { return }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            struct DonationResponse: Codable {
                let success: Bool
                let count: Int?
                let totalSum: Double?
                let donations: [Donation]
            }
            let res = try JSONDecoder().decode(DonationResponse.self, from: data)
            if res.success {
                self.donations = res.donations
                self.totalDonors = res.count ?? res.donations.count
                self.totalRaised = res.totalSum ?? res.donations.reduce(0) { $0 + $1.amount }
            }
        } catch {
            print("Failed to fetch donations: \(error)")
        }
    }

    public func fetchEvents() async {
        guard let url = URL(string: "\(baseURL)/api/v1/events") else { return }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            struct EventResponse: Codable {
                let success: Bool
                let events: [EventFeed]
            }
            let res = try JSONDecoder().decode(EventResponse.self, from: data)
            if res.success {
                self.events = res.events
            }
        } catch {
            print("Failed to fetch events: \(error)")
        }
    }

    public func fetchCamps() async {
        guard let url = URL(string: "\(baseURL)/api/v1/camps") else { return }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            struct CampResponse: Codable {
                let success: Bool
                let camps: [ReliefCamp]
            }
            let res = try JSONDecoder().decode(CampResponse.self, from: data)
            if res.success {
                self.camps = res.camps
            }
        } catch {
            print("Failed to fetch camps: \(error)")
        }
    }

    public func submitDonation(name: String, amount: Double, purpose: String, pan: String) async -> Bool {
        guard let url = URL(string: "\(baseURL)/api/v1/donations") else { return false }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let payload: [String: Any] = [
            "donorName": name,
            "amount": amount,
            "purpose": purpose,
            "pan": pan
        ]

        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: payload)
            let (data, response) = try await URLSession.shared.data(for: request)
            if let httpRes = response as? HTTPURLResponse, httpRes.statusCode == 200 {
                await fetchDonations()
                self.bannerMessage = "Donation of ₹\(Int(amount)) recorded with 80G certificate!"
                return true
            }
        } catch {
            print("Error submitting donation: \(error)")
        }
        return false
    }
}
