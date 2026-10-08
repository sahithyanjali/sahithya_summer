package org.sevasphoorthi.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import org.sevasphoorthi.data.DonationRequest
import org.sevasphoorthi.data.SevaApiService

@Composable
fun DonationScreen() {
    val coroutineScope = rememberCoroutineScope()
    val apiService = remember { SevaApiService.create() }

    var selectedAmount by remember { mutableDoubleStateOf(1000.0) }
    var donorName by remember { mutableStateOf("") }
    var panNumber by remember { mutableStateOf("") }
    var selectedPurpose by remember { mutableStateOf("Annadana Hot Meals") }
    var isSubmitting by remember { mutableStateOf(false) }
    var submissionSuccess by remember { mutableStateOf(false) }

    val presetAmounts = listOf(500.0, 1000.0, 2500.0, 5000.0)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            "Select Seva Contribution",
            fontWeight = FontWeight.Bold,
            fontSize = 16.sp,
            color = Color(0xFF0F172A)
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            presetAmounts.forEach { amt ->
                OutlinedButton(
                    onClick = { selectedAmount = amt },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = if (selectedAmount == amt) Color(0xFFEA580C) else Color.Transparent,
                        contentColor = if (selectedAmount == amt) Color.White else Color(0xFF1E293B)
                    )
                ) {
                    Text("₹${amt.toInt()}", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }
        }

        OutlinedTextField(
            value = donorName,
            onValueChange = { donorName = it },
            label = { Text("Full Name (as per PAN)") },
            modifier = Modifier.fillMaxWidth()
        )

        OutlinedTextField(
            value = panNumber,
            onValueChange = { panNumber = it.uppercase() },
            label = { Text("PAN Number (for 80G Tax Exemption)") },
            modifier = Modifier.fillMaxWidth()
        )

        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF3C7)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text(
                    "📜 80G Tax Benefit",
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    color = Color(0xFF92400E)
                )
                Text(
                    "All donations qualify for 50% deduction under Section 80G. An official receipt is issued instantly.",
                    fontSize = 11.sp,
                    color = Color(0xFFB45309)
                )
            }
        }

        Button(
            onClick = {
                coroutineScope.launch {
                    isSubmitting = true
                    try {
                        apiService.submitDonation(
                            DonationRequest(
                                donorName = donorName.ifEmpty { "Anonymous Donor" },
                                amount = selectedAmount,
                                purpose = selectedPurpose,
                                pan = panNumber
                            )
                        )
                        submissionSuccess = true
                    } catch (e: Exception) {
                        // handle error
                    } finally {
                        isSubmitting = false
                    }
                }
            },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEA580C)),
            enabled = !isSubmitting
        ) {
            if (isSubmitting) {
                CircularProgressView()
            } else {
                Text(
                    "Complete Seva ₹${selectedAmount.toInt()}",
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }

        if (submissionSuccess) {
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFDCFCE7)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    "✅ Thank you! Your donation has been recorded with a verified 80G receipt.",
                    color = Color(0xFF166534),
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    modifier = Modifier.padding(12.dp)
                )
            }
        }
    }
}

@Composable
fun CircularProgressView() {
    CircularProgressIndicator(
        modifier = Modifier.size(20.dp),
        color = Color.White,
        strokeWidth = 2.dp
    )
}
