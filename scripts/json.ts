import fs from "fs";
import path from "path";

const BASE_URL = process.env.API_URL || "http://localhost:30050";
const SYMBOL_LIST = process.env.SYMBOL_LIST || "BTCUSDT,ETHUSDT,BNBUSDT,SOLUSDT,XRPUSDT";
const DUMP_DIR = "./dump/json";

// Symbols to download data for
const SYMBOLS = SYMBOL_LIST.split(",").map(symbol => symbol.trim());

// Calculate date range for last 7 days
const now = Date.now();
const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

// All available view range endpoints
const VIEW_ENDPOINTS = [
  "/view/long-term-range",
  "/view/short-term-range",
  "/view/swing-term-range",
  "/view/micro-term-range",
];

// Create dump directory if it doesn't exist
if (!fs.existsSync(DUMP_DIR)) {
  fs.mkdirSync(DUMP_DIR, { recursive: true });
  console.log(`[OK] Created directory: ${DUMP_DIR}`);
}

async function downloadData(endpoint: string, symbol: string): Promise<void> {
  const url = `${BASE_URL}${endpoint}?symbol=${symbol}&startDate=${sevenDaysAgo}&endDate=${now}&limit=10000&offset=0`;

  console.log(url);

  // Create unique filename per symbol and endpoint
  const endpointName = endpoint
    .replace("/view/", "")
    .replace(/\//g, "-")
    .replace(/-$/, "");

  const filename = `${symbol}_${endpointName}.json`;
  const filepath = path.join(DUMP_DIR, filename);

  try {
    console.log(`[DOWNLOAD] ${endpoint} for ${symbol}...`);

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`[ERROR] Failed to download ${endpoint} for ${symbol}: ${response.status} ${response.statusText}`);
      return;
    }

    const json = await response.json();

    fs.writeFileSync(filepath, JSON.stringify(json, null, 2), "utf-8");
    console.log(`[SAVED] ${filename} (${JSON.stringify(json).length} bytes)`);
  } catch (error) {
    console.error(`[ERROR] ${endpoint} for ${symbol}:`, error);
  }
}

async function downloadAllData(): Promise<void> {
  console.log(`\n[START] Downloading JSON data from ${BASE_URL}\n`);
  console.log(`[INFO] Symbols: ${SYMBOLS.join(", ")}`);
  console.log(`[INFO] Output directory: ${DUMP_DIR}`);
  console.log(`[INFO] Date range: ${new Date(sevenDaysAgo).toISOString()} to ${new Date(now).toISOString()}`);
  console.log(`[INFO] Total files to download: ${SYMBOLS.length * VIEW_ENDPOINTS.length}\n`);

  for (const symbol of SYMBOLS) {
    console.log(`\n[PROCESSING] ${symbol}...`);

    for (const endpoint of VIEW_ENDPOINTS) {
      await downloadData(endpoint, symbol);

      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`\n[COMPLETE] Download complete!`);
  console.log(`[SUMMARY] Total files: ${SYMBOLS.length * VIEW_ENDPOINTS.length}`);
  console.log(`[SUMMARY] Directory: ${DUMP_DIR}`);

  // Create a summary file with download info
  const summaryContent = `# Trading Data JSON Download

## Overview

This directory contains JSON candle data for cryptocurrency trading analysis.

## Symbols Analyzed

${SYMBOLS.map(s => `- ${s}`).join("\n")}

## Data Types

### Historical Candle Data (Last 7 Days)
1. **Long Term** - Long-term candle data (4h timeframe)
2. **Short Term** - Short-term candle data (1h timeframe)
3. **Swing Term** - Swing-term candle data (15m timeframe)
4. **Micro Term** - Micro-term candle data (1m timeframe)

## File Naming Convention

Files are named using the pattern: \`{SYMBOL}_{endpoint-name}.json\`

Examples:
- \`BTCUSDT_hour-range.json\`
- \`BTCUSDT_one-minute-range.json\`
- \`ETHUSDT_long-term-range.json\`

## Data Format

Each file contains an array of OHLCV (Open, High, Low, Close, Volume) candles with:

- **timestamp** - Unix timestamp in milliseconds
- **date** - ISO 8601 date string
- **open** - Opening price
- **high** - Highest price in period
- **low** - Lowest price in period
- **close** - Closing price
- **volume** - Trading volume

## Date Range

Start: ${new Date(sevenDaysAgo).toISOString()}
End: ${new Date(now).toISOString()}

## Generated

${new Date().toISOString()}

Total Files: ${SYMBOLS.length * VIEW_ENDPOINTS.length}
Base URL: ${BASE_URL}
`;

  fs.writeFileSync(path.join(DUMP_DIR, "README.md"), summaryContent, "utf-8");
  console.log(`[README] Created README.md with download summary`);
}

// Run the download
downloadAllData().catch((error) => {
  console.error("[FATAL]", error);
  process.exit(1);
});
