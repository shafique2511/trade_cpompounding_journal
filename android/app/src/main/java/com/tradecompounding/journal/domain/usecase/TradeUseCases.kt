package com.tradecompounding.journal.domain.usecase

import com.tradecompounding.journal.data.entity.TradeEntity
import com.tradecompounding.journal.data.repository.TradeRepository
import com.tradecompounding.journal.domain.model.Trade
import com.tradecompounding.journal.domain.model.TradeType
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class GetTradesUseCase(private val repository: TradeRepository) {
    operator fun invoke(): Flow<List<Trade>> {
        return repository.getAllTrades().map { entities ->
            entities.map { it.toDomain() }
        }
    }
}

class AddTradeUseCase(private val repository: TradeRepository) {
    suspend operator fun invoke(trade: Trade) {
        repository.insertTrade(trade.toEntity())
    }
}

class DeleteTradeUseCase(private val repository: TradeRepository) {
    suspend operator fun invoke(trade: Trade) {
        repository.deleteTrade(trade.toEntity())
    }
}

// Extension Mapper functions to map between database and domain entities
fun TradeEntity.toDomain(): Trade {
    return Trade(
        id = id,
        symbol = symbol,
        type = TradeType.valueOf(type),
        entryPrice = entryPrice,
        exitPrice = exitPrice,
        quantity = quantity,
        pnl = pnl,
        pnlPercentage = pnlPercentage,
        dateTimeEpochMs = dateTimeEpochMs,
        startingBalance = startingBalance,
        endingBalance = endingBalance,
        notes = notes,
        rating = rating
    )
}

fun Trade.toEntity(): TradeEntity {
    return TradeEntity(
        id = id,
        symbol = symbol,
        type = type.name,
        entryPrice = entryPrice,
        exitPrice = exitPrice,
        quantity = quantity,
        pnl = pnl,
        pnlPercentage = pnlPercentage,
        dateTimeEpochMs = dateTimeEpochMs,
        startingBalance = startingBalance,
        endingBalance = endingBalance,
        notes = notes,
        rating = rating
    )
}
