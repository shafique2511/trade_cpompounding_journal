package com.tradecompounding.journal

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Analytics
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.tradecompounding.journal.presentation.addtrade.AddTradeScreen
import com.tradecompounding.journal.presentation.addtrade.EditTradeScreen
import com.tradecompounding.journal.presentation.analytics.AnalyticsScreen
import com.tradecompounding.journal.presentation.dashboard.DashboardScreen
import com.tradecompounding.journal.presentation.exportbackup.ExportBackupScreen
import com.tradecompounding.journal.presentation.journal.JournalScreen
import com.tradecompounding.journal.presentation.journal.TradeDetailScreen
import com.tradecompounding.journal.presentation.navigation.Screen
import com.tradecompounding.journal.presentation.settings.SettingsScreen
import com.tradecompounding.journal.presentation.theme.TradeCompoundingJournalTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState);
        setContent {
            TradeCompoundingJournalTheme {
                val navController = rememberNavController()
                
                // Track active navigation route for BottomNavigationBar styling
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    bottomBar = {
                        // Display bottom bar only for main root destinations
                        val bottomDestinations = listOf("dashboard", "journal", "analytics", "settings")
                        if (currentRoute in bottomDestinations) {
                            NavigationBar {
                                NavigationBarItem(
                                    selected = currentRoute == "dashboard",
                                    onClick = { navController.navigate("dashboard") { popUpTo("dashboard") { saveState = true }; launchSingleTop = true; restoreState = true } },
                                    icon = { Icon(Icons.Default.Dashboard, contentDescription = "Dashboard") },
                                    label = { Text("Dashboard") }
                                )
                                NavigationBarItem(
                                    selected = currentRoute == "journal",
                                    onClick = { navController.navigate("journal") { popUpTo("dashboard") { saveState = true }; launchSingleTop = true; restoreState = true } },
                                    icon = { Icon(Icons.Default.Book, contentDescription = "Journal") },
                                    label = { Text("Journal") }
                                )
                                NavigationBarItem(
                                    selected = currentRoute == "analytics",
                                    onClick = { navController.navigate("analytics") { popUpTo("dashboard") { saveState = true }; launchSingleTop = true; restoreState = true } },
                                    icon = { Icon(Icons.Default.Analytics, contentDescription = "Analytics") },
                                    label = { Text("Analytics") }
                                )
                                NavigationBarItem(
                                    selected = currentRoute == "settings",
                                    onClick = { navController.navigate("settings") { popUpTo("dashboard") { saveState = true }; launchSingleTop = true; restoreState = true } },
                                    icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                                    label = { Text("Settings") }
                                )
                            }
                        }
                    }
                ) { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = "dashboard",
                        modifier = Modifier.padding(innerPadding)
                    ) {
                        composable(Screen.Dashboard.route) {
                            DashboardScreen(
                                onNavigateToAddTrade = { navController.navigate("add_trade") },
                                onNavigateToTradeDetail = { tradeId -> navController.navigate(Screen.TradeDetail.createRoute(tradeId)) }
                            )
                        }
                        
                        composable(Screen.Journal.route) {
                            JournalScreen(
                                onNavigateToTradeDetail = { tradeId -> navController.navigate(Screen.TradeDetail.createRoute(tradeId)) },
                                onNavigateToEditTrade = { tradeId -> navController.navigate(Screen.EditTrade.createRoute(tradeId)) }
                            )
                        }
                        
                        composable(Screen.Analytics.route) {
                            AnalyticsScreen()
                        }
                        
                        composable(Screen.Settings.route) {
                            SettingsScreen(
                                onNavigateToExportBackup = { navController.navigate("export_backup") }
                            )
                        }
                        
                        composable(Screen.AddTrade.route) {
                            AddTradeScreen(
                                onNavigateBack = { navController.popBackStack() },
                                onTradeSaved = { navController.popBackStack() }
                            )
                        }

                        composable(
                            route = Screen.EditTrade.route,
                            arguments = listOf(navArgument("tradeId") { type = NavType.StringType })
                        ) { backStackEntry ->
                            val tradeId = backStackEntry.arguments?.getString("tradeId") ?: ""
                            EditTradeScreen(
                                tradeId = tradeId,
                                onNavigateBack = { navController.popBackStack() },
                                onTradeUpdated = { navController.popBackStack() }
                            )
                        }

                        composable(
                            route = Screen.TradeDetail.route,
                            arguments = listOf(navArgument("tradeId") { type = NavType.StringType })
                        ) { backStackEntry ->
                            val tradeId = backStackEntry.arguments?.getString("tradeId") ?: ""
                            TradeDetailScreen(
                                tradeId = tradeId,
                                onNavigateBack = { navController.popBackStack() },
                                onNavigateToEdit = { id -> navController.navigate(Screen.EditTrade.createRoute(id)) },
                                onTradeDeleted = { navController.popBackStack() }
                            )
                        }

                        composable("export_backup") {
                            ExportBackupScreen(
                                onNavigateBack = { navController.popBackStack() },
                                onExportCSV = {},
                                onRestoreBackup = {}
                            )
                        }
                    }
                }
            }
        }
    }
}
