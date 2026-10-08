package org.sevasphoorthi.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.accompanist.swiperefresh.SwipeRefresh
import com.google.accompanist.swiperefresh.rememberSwipeRefreshState
import kotlinx.coroutines.launch
import org.sevasphoorthi.data.EventFeed
import org.sevasphoorthi.data.SevaApiService

@Composable
fun HomeScreen(onNavigateToDonate: () -> Unit) {
    val coroutineScope = rememberCoroutineScope()
    val apiService = remember { SevaApiService.create() }

    var isRefreshing by remember { mutableStateOf(false) }
    var totalRaised by remember { mutableDoubleStateOf(284500.0) }
    var totalDonors by remember { mutableIntStateOf(48) }
    var events by remember { mutableStateOf(listOf<EventFeed>()) }

    fun refreshData() {
        coroutineScope.launch {
            isRefreshing = true
            try {
                val donRes = apiService.getDonations()
                if (donRes.success) {
                    totalRaised = donRes.totalSum
                    totalDonors = donRes.count
                }
                val evRes = apiService.getEvents()
                if (evRes.success) {
                    events = evRes.events
                }
            } catch (e: Exception) {
                // handle offline or fallback
            } finally {
                isRefreshing = false
            }
        }
    }

    LaunchedEffect(Unit) {
        refreshData()
    }

    SwipeRefresh(
        state = rememberSwipeRefreshState(isRefreshing),
        onRefresh = { refreshData() }
    ) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFF8FAFC))
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Hero Card
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Box(
                        modifier = Modifier
                            .background(
                                Brush.horizontalGradient(
                                    listOf(Color(0xFFEA580C), Color(0xFFD97706))
                                )
                            )
                            .padding(16.dp)
                    ) {
                        Column {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    "Sphoorthi Seva Trust",
                                    fontWeight = FontWeight.Black,
                                    fontSize = 18.sp,
                                    color = Color.White
                                )
                                Text(
                                    "Reg: 402/2021",
                                    fontSize = 11.sp,
                                    color = Color.White.copy(alpha = 0.8f)
                                )
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                "Nourishing Lives, Empowering Communities",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = Color.White
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                "Daily Annadana meal drives & Vidya student support.",
                                fontSize = 12.sp,
                                color = Color.White.copy(alpha = 0.9f)
                            )
                        }
                    }
                }
            }

            // Live Transparency Metrics Card
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                "Live Transparency Metrics",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = Color(0xFF1E293B)
                            )
                            Text(
                                "Pull to refresh",
                                fontSize = 10.sp,
                                color = Color(0xFFEA580C)
                            )
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            MetricBox(
                                title = "Raised",
                                value = "₹${totalRaised.toInt()}",
                                modifier = Modifier.weight(1f)
                            )
                            MetricBox(
                                title = "Donors",
                                value = "$totalDonors",
                                modifier = Modifier.weight(1f)
                            )
                            MetricBox(
                                title = "Drives",
                                value = "${events.size}",
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }
            }

            // Quick Donate CTA
            item {
                Button(
                    onClick = onNavigateToDonate,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEA580C))
                ) {
                    Text(
                        "Donate Seva (80G Tax Exemption)",
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }

            // Events List Header
            item {
                Text(
                    "Active Seva & Civic Drives",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = Color(0xFF1E293B)
                )
            }

            // Event items
            items(events) { event ->
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                event.date,
                                fontWeight = FontWeight.Bold,
                                fontSize = 11.sp,
                                color = Color(0xFFDC2626)
                            )
                            Text(
                                event.category ?: "Relief",
                                fontSize = 11.sp,
                                color = Color(0xFF64748B)
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            event.title,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = Color(0xFF0F172A)
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            event.desc,
                            fontSize = 12.sp,
                            color = Color(0xFF64748B)
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            "📍 ${event.location}",
                            fontSize = 11.sp,
                            color = Color(0xFF475569)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun MetricBox(title: String, value: String, modifier: Modifier = Modifier) {
    Card(
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFF1F5F9)),
        modifier = modifier
    ) {
        Column(
            modifier = Modifier.padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(title, fontSize = 10.sp, color = Color(0xFF64748B))
            Text(value, fontWeight = FontWeight.Black, fontSize = 13.sp, color = Color(0xFF0F172A))
        }
    }
}
