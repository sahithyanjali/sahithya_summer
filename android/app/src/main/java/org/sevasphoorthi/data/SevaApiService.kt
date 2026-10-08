package org.sevasphoorthi.data

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface SevaApiService {
    @GET("/api/v1/donations")
    suspend fun getDonations(): DonationsResponse

    @GET("/api/v1/events")
    suspend fun getEvents(): EventsResponse

    @GET("/api/v1/camps")
    suspend fun getCamps(): CampsResponse

    @POST("/api/v1/donations")
    suspend fun submitDonation(@Body request: DonationRequest): Map<String, Any>

    companion object {
        private const val BASE_URL = "https://ais-dev-f5x7za3ubwqtlmhu6dp2jn-689137031286.asia-southeast1.run.app/"

        fun create(): SevaApiService {
            return Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(SevaApiService::class.java)
        }
    }
}
