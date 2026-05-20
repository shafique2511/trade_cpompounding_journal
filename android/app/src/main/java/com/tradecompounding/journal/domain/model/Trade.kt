package com.tradecompounding.journal.domain.model

enum class TradeType {
    LONG, SHORT
}

data class Trade(
    val id: String,
    val symbol: String,
    val type: TradeType,
    val entryPrice: Double,
    val exitPrice: Double,
    val quantity: Double,
    val pnl: Double,
    val pnlPercentage: Double,
    val dateTimeEpochMs: Long,
    val startingBalance: Double,
    val endingBalance: Double,
    val notes: String?,
    val rating: Int?
)
