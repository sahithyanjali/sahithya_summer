package org.sevasphoorthi.data

data class Donation(
    val id: String,
    val donorName: String,
    val amount: Double,
    val purpose: String,
    val date: String,
    val panMasked: String? = null
)

data class EventFeed(
    val id: String,
    val title: String,
    val date: String,
    val time: String,
    val location: String,
    val desc: String,
    val img: String,
    val category: String? = null,
    val volunteersRegistered: Int? = null,
    val targetVolunteers: Int? = null
)

data class ReliefCamp(
    val id: String,
    val name: String,
    val location: String,
    val coordinator: String,
    val mealsServed: Int,
    val mealsTarget: Int,
    val status: String,
    val lastVerifiedAt: String
)

data class DonationsResponse(
    val success: Boolean,
    val count: Int,
    val totalSum: Double,
    val donations: List<Donation>
)

data class EventsResponse(
    val success: Boolean,
    val count: Int,
    val events: List<EventFeed>
)

data class CampsResponse(
    val success: Boolean,
    val count: Int,
    val camps: List<ReliefCamp>
)

data class DonationRequest(
    val donorName: String,
    val amount: Double,
    val purpose: String,
    val pan: String
)
