package com.tradecompounding.journal.presentation.journal

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun JournalScreen(
    onNavigateToTradeDetail: (String) -> Unit,
    onNavigateToEditTrade: (String) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedFilter by remember { mutableStateOf("ALL") } // ALL, LONG, SHORT, WINS, LOSSES
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Trade Journal Logs", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                placeholder = { Text("Search by symbol (e.g. BTCUSDT)") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.12f)
                )
            )

            // Filter Chips Flow / Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.FilterList,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.size(18.dp)
                )
                
                val filters = listOf("ALL", "LONG", "SHORT", "WINS", "LOSSES")
                filters.forEach { filter ->
                    FilterChip(
                        selected = selectedFilter == filter,
                        onClick = { selectedFilter = filter },
                        label = { Text(filter, fontSize = 11.sp, fontWeight = FontWeight.Bold) }
                    )
                }
            }

            // Journal List Columns
            val mockTrades = listOf(
                JournalMockTrade("1", "AVAXUSDT", "LONG", 28.40, 29.54, 50.0, "+$57.00", "+4.01%", "May 20, 04:10 PM", true),
                JournalMockTrade("2", "BTCUSDT", "LONG", 65100.0, 66400.0, 0.04, "+$52.00", "+2.00%", "May 20, 12:30 PM", true),
                JournalMockTrade("3", "SOLUSDT", "LONG", 142.50, 141.20, 15.0, "-$19.50", "-0.91%", "May 19, 10:48 PM", false),
                JournalMockTrade("4", "ETHUSDT", "SHORT", 3450.0, 3415.0, 1.2, "+$42.00", "+1.01%", "May 18, 08:30 PM", true),
                JournalMockTrade("5", "BTCUSDT", "LONG", 64200.0, 65484.0, 0.05, "+$64.20", "+2.00%", "May 18, 09:12 AM", true)
            ).filter {
                val matchesSearch = it.symbol.contains(searchQuery, ignoreCase = true)
                val matchesFilter = when (selectedFilter) {
                    "ALL" -> true
                    "LONG" -> it.type == "LONG"
                    "SHORT" -> it.type == "SHORT"
                    "WINS" -> it.isWin
                    "LOSSES" -> !it.isWin
                    else -> true
                }
                matchesSearch && matchesFilter
            }

            if (mockTrades.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        "No compounded trades match filters.",
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .weight(1f)
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(mockTrades.size) { index ->
                        val t = mockTrades[index]
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            onClick = { onNavigateToTradeDetail(t.id) },
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(t.symbol, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            text = t.type,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (t.type == "LONG") Color(0xFF00C853) else Color(0xFFD50000),
                                            modifier = Modifier
                                                .background(
                                                    if (t.type == "LONG") Color(0xFF00C853).copy(alpha = 0.1f) else Color(0xFFD50000).copy(alpha = 0.1f),
                                                    shape = RoundedCornerShape(4.dp)
                                                )
                                                .padding(horizontal = 4.dp, vertical = 2.dp)
                                        )
                                    }
                                    
                                    Text(
                                        text = t.pnl,
                                        fontWeight = FontWeight.Bold,
                                        color = if (t.isWin) Color(0xFF00C853) else Color(0xFFD50000)
                                    )
                                }

                                Spacer(modifier = Modifier.height(6.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = "Entry: $${t.entryPrice}  •  Exit: $${t.exitPrice}",
                                        fontSize = 12.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    Text(
                                        text = t.pnlPercentage,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = if (t.isWin) Color(0xFF00C853) else Color(0xFFD50000)
                                    )
                                }

                                Spacer(modifier = Modifier.height(4.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(t.dateString, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f))
                                    TextButton(
                                        onClick = { onNavigateToEditTrade(t.id) },
                                        contentPadding = PaddingValues(0.dp),
                                        modifier = Modifier.height(24.dp)
                                    ) {
                                        Text("Edit", fontSize = 12.sp)
                                    }
                                }
                            }
                        }
                    }
                    
                    item {
                        Spacer(modifier = Modifier.height(24.dp))
                    }
                }
            }
        }
    }
}

data class JournalMockTrade(
    val id: String,
    val symbol: String,
    val type: String,
    val entryPrice: Double,
    val exitPrice: Double,
    val quantity: Double,
    val pnl: String,
    val pnlPercentage: String,
    val dateString: String,
    val isWin: Boolean
)
