package org.sevasphoorthi

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Place
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import org.sevasphoorthi.ui.HomeScreen
import org.sevasphoorthi.ui.DonationScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colorScheme = lightColorScheme(
                    primary = androidx.compose.ui.graphics.Color(0xFFEA580C),
                    secondary = androidx.compose.ui.graphics.Color(0xFFD97706),
                    tertiary = androidx.compose.ui.graphics.Color(0xFF16A34A)
                )
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainAppScaffold()
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScaffold() {
    val navController = rememberNavController()
    var selectedItem by remember { mutableIntStateOf(0) }

    val items = listOf("Home", "Donate", "Volunteer", "Camps")
    val icons = listOf(Icons.Default.Home, Icons.Default.Favorite, Icons.Default.Person, Icons.Default.Place)

    Scaffold(
        bottomBar = {
            NavigationBar {
                items.forEachIndexed { index, item ->
                    NavigationBarItem(
                        icon = { Icon(icons[index], contentDescription = item) },
                        label = { Text(item) },
                        selected = selectedItem == index,
                        onClick = {
                            selectedItem = index
                            when (index) {
                                0 -> navController.navigate("home")
                                1 -> navController.navigate("donate")
                                2 -> navController.navigate("volunteer")
                                3 -> navController.navigate("camps")
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = "home",
            modifier = Modifier.padding(innerPadding)
        ) {
            composable("home") { HomeScreen(onNavigateToDonate = { navController.navigate("donate") }) }
            composable("donate") { DonationScreen() }
            composable("volunteer") { Text("Volunteer Portal", modifier = Modifier.padding(innerPadding)) }
            composable("camps") { Text("Active Camps", modifier = Modifier.padding(innerPadding)) }
        }
    }
}
