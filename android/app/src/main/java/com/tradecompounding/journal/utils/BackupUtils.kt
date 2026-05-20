package com.tradecompounding.journal.utils

import com.tradecompounding.journal.domain.model.Trade
import com.tradecompounding.journal.domain.model.TradeType

object BackupUtils {

    /**
     * Reconstructs simple JSON string representations of trades.
     */
    fun serializeTradesToJSON(trades: List<Trade>): String {
        val builder = StringBuilder()
        builder.append("[\n")
        trades.forEachIndexed { index, trade ->
            builder.append("  {\n")
            builder.append("    \"id\": \"${trade.id}\",\n")
            builder.append("    \"symbol\": \"${trade.symbol}\",\n")
            builder.append("    \"type\": \"${trade.type.name}\",\n")
            builder.append("    \"entryPrice\": ${trade.entryPrice},\n")
            builder.append("    \"exitPrice\": ${trade.exitPrice},\n")
            builder.append("    \"quantity\": ${trade.quantity},\n")
            builder.append("    \"pnl\": ${trade.pnl},\n")
            builder.append("    \"pnlPercentage\": ${trade.pnlPercentage},\n")
            builder.append("    \"dateTimeEpochMs\": ${trade.dateTimeEpochMs},\n")
            builder.append("    \"startingBalance\": ${trade.startingBalance},\n")
            builder.append("    \"endingBalance\": ${trade.endingBalance},\n")
            builder.append("    \"notes\": ${if (trade.notes != null) "\"${trade.notes}\"" else "null"},\n")
            builder.append("    \"rating\": ${trade.rating ?: "null"}\n")
            builder.append("  }${if (index < trades.size - 1) "," else ""}\n")
        }
        builder.append("]")
        return builder.toString()
    }
}
