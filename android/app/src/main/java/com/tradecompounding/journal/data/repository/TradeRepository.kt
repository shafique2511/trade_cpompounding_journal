package com.tradecompounding.journal.data.repository

import com.tradecompounding.journal.data.dao.TradeDao
import com.tradecompounding.journal.data.entity.TradeEntity
import kotlinx.coroutines.flow.Flow

interface TradeRepository {
    fun getAllTrades(): Flow<List<TradeEntity>>
    suspend fun getTradeById(id: String): TradeEntity?
    suspend fun insertTrade(trade: TradeEntity)
    suspend fun updateTrade(trade: TradeEntity)
    suspend fun deleteTrade(trade: TradeEntity)
    suspend fun clearAllTrades()
}

class TradeRepositoryImpl(private val tradeDao: TradeDao) : TradeRepository {
    override fun getAllTrades(): Flow<List<TradeEntity>> = tradeDao.getAllTradesChronologically()
    
    override suspend fun getTradeById(id: String): TradeEntity? = tradeDao.getTradeById(id)
    
    override suspend fun insertTrade(trade: TradeEntity) = tradeDao.insertTrade(trade)
    
    override suspend fun updateTrade(trade: TradeEntity) = tradeDao.updateTrade(trade)
    
    override suspend fun deleteTrade(trade: TradeEntity) = tradeDao.deleteTrade(trade)
    
    override suspend fun clearAllTrades() = tradeDao.clearAllTrades()
}
