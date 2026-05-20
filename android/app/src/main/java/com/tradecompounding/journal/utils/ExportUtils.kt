package com.tradecompounding.journal.utils

import com.tradecompounding.journal.domain.model.Trade

object ExportUtils {

    fun generateCSVString(trades: List<Trade>): String {
        val builder = StringBuilder()
        builder.append("ID,Symbol,Direction,Entry Price,Exit Price,Quantity,Realized PnL,Percentage PnL,Start Balance,End Balance,Epoch Date\n")
        
        for (trade in trades) {
            builder.append("${trade.id},")
            builder.append("${trade.symbol},")
            builder.append("${trade.type.name},")
            builder.append("${trade.entryPrice},")
            builder.append("${trade.exitPrice},")
            builder.append("${trade.quantity},")
            builder.append("${trade.pnl},")
            builder.append("${trade.pnlPercentage},")
            builder.append("${trade.startingBalance},")
            builder.append("${trade.endingBalance},")
            builder.append("${trade.dateTimeEpochMs}\n")
        }
        return builder.toString()
    }
}
