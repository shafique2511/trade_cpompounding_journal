package com.tradecompounding.journal.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "trades")
data class TradeEntity(
    @PrimaryKey val id: String,
    val symbol: String,
    val type: String, // LONG or SHORT
    val entryPrice: Double,
    val exitPrice: Double,
    val quantity: Double,
    val pnl: Double,
    val pnlPercentage: Double,
    val dateTimeEpochMs: Long, // Local device epoch time in Ms
    val startingBalance: Double,
    val endingBalance: Double,
    val notes: String?,
    val rating: Int? // 1-5 stars
)
