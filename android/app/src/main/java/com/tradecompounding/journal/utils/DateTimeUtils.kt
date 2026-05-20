package com.tradecompounding.journal.utils

import java.text.SimpleDateFormat
import java.util.*

object DateTimeUtils {
    
    private val displayFormat = SimpleDateFormat("MMM dd, yyyy hh:mm a", Locale.getDefault())
    private val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())

    fun formatEpochToReadable(epochMs: Long): String {
        val date = Date(epochMs)
        return displayFormat.format(date)
    }

    fun formatEpochToISO(epochMs: Long): String {
        val date = Date(epochMs)
        return isoFormat.format(date)
    }

    fun getCurrentDeviceTimeEpochMs(): Long {
        return System.currentTimeMillis()
    }
}
