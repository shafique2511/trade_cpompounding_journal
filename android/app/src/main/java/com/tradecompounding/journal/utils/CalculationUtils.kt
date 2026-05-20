package com.tradecompounding.journal.utils

import kotlin.math.roundToInt

object CalculationUtils {

    fun roundToTwoDecimals(value: Double): Double {
        return (value * 100.0).roundToInt() / 100.0
    }

    fun calculateCompoundYield(finalBalance: Double, initialBalance: Double): Double {
        if (initialBalance == 0.0) return 0.0
        return ((finalBalance - initialBalance) / initialBalance) * 100.0
    }
}
