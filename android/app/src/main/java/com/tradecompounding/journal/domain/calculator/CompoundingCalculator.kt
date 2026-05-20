package com.tradecompounding.journal.domain.calculator

import com.tradecompounding.journal.domain.model.Trade
import com.tradecompounding.journal.domain.model.TradeType

class CompoundingCalculator {

    /**
     * Calculates the PnL of a single trade.
     */
    fun calculatePnL(
        type: TradeType,
        entryPrice: Double,
        exitPrice: Double,
        quantity: Double
    ): Double {
        return if (type == TradeType.LONG) {
            (exitPrice - entryPrice) * quantity
        } else {
            (entryPrice - exitPrice) * quantity
        }
    }

    /**
     * Calculates the PnL percentage relative to the entry trade size.
     */
    fun calculatePnLPercentage(entryPrice: Double, pnl: Double, quantity: Double): Double {
        val totalPositionValue = entryPrice * quantity
        if (totalPositionValue == 0.0) return 0.0
        return (pnl / totalPositionValue) * 100.0
    }

    /**
     * Re-calculates and chains compounding balances for a lists of trades given an initial balance.
     */
    fun recalculateCompoundingChain(trades: List<Trade>, initialBalance: Double): List<Trade> {
        val sortedTrades = trades.sortedBy { it.dateTimeEpochMs }
        var currentBalance = initialBalance
        
        return sortedTrades.map { trade ->
            val start = currentBalance
            val pnl = calculatePnL(trade.type, trade.entryPrice, trade.exitPrice, trade.quantity)
            val pnlPct = calculatePnLPercentage(trade.entryPrice, pnl, trade.quantity)
            val end = currentBalance + pnl
            currentBalance = end
            
            trade.copy(
                startingBalance = start,
                endingBalance = end,
                pnl = pnl,
                pnlPercentage = pnlPct
            )
        }
    }
}
