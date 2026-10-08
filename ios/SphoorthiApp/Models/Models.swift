import Foundation

public struct Donation: Identifiable, Codable {
    public let id: String
    public let donorName: String
    public let amount: Double
    public let purpose: String
    public let date: String
    public let panMasked: String?
    public let transactionRef: String?
}

public struct EventFeed: Identifiable, Codable {
    public let id: String
    public let title: String
    public let date: String
    public let time: String
    public let location: String
    public let desc: String
    public let img: String
    public let category: String?
    public let volunteersRegistered: Int?
    public let targetVolunteers: Int?
}

public struct ReliefCamp: Identifiable, Codable {
    public let id: String
    public let name: String
    public let location: String
    public let coordinator: String
    public let mealsServed: Int
    public let mealsTarget: Int
    public let status: String
    public let lastVerifiedAt: String
}

public struct DonationStats: Codable {
    public let totalSum: Double
    public let count: Int
    public let averageDonation: Double
    public let verifiedCount: Int
}
