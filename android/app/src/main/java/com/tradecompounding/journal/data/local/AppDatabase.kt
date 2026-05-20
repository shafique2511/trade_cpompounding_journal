package com.tradecompounding.journal.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.tradecompounding.journal.data.dao.TradeDao
import com.tradecompounding.journal.data.entity.TradeEntity

@Database(entities = [TradeEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun tradeDao(): TradeDao
}
