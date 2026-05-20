package com.tradecompounding.journal.presentation.navigation

sealed class Screen(val route: String, val title: String) {
    object Dashboard : Screen("dashboard", "Dashboard")
    object Journal : Screen("journal", "Journal")
    object AddTrade : Screen("add_trade", "Add Trade")
    object EditTrade : Screen("edit_trade/{tradeId}", "Edit Trade") {
        fun createRoute(tradeId: String) = "edit_trade/$tradeId"
    }
    object TradeDetail : Screen("trade_detail/{tradeId}", "Trade Detail") {
        fun createRoute(tradeId: String) = "trade_detail/$tradeId"
    }
    object Analytics : Screen("analytics", "Analytics")
    object Settings : Screen("settings", "Settings")
    object ExportBackup : Screen("export_backup", "Export/Backup")
}
