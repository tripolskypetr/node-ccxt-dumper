import { fetchApi } from "functools-kit";
import fs from "fs";
import path from "path";

const BASE_URL = process.env.API_URL || "http://localhost:30050";
const SYMBOL_LIST = process.env.SYMBOL_LIST || "BTCUSDT,ETHUSDT,BNBUSDT,SOLUSDT,XRPUSDT";
const DUMP_DIR = "./dump/markdown";

// Symbols to download reports for
const SYMBOLS = SYMBOL_LIST.split(",").map(symbol => symbol.trim());

// All available export endpoints
const EXPORT_ENDPOINTS = [
  // History Services Reports
  "/export/history/long-term/:symbol",
  "/export/history/short-term/:symbol",
  "/export/history/swing-term/:symbol",
  "/export/history/micro-term/:symbol",
];

// Create dump directory if it doesn't exist
if (!fs.existsSync(DUMP_DIR)) {
  fs.mkdirSync(DUMP_DIR, { recursive: true });
  console.log(`[OK] Created directory: ${DUMP_DIR}`);
}

async function downloadReport(endpoint: string, symbol: string): Promise<void> {
  const url = `${BASE_URL}${endpoint.replace(":symbol", symbol)}`;

  console.log(url)

  // Create unique filename per symbol and endpoint
  const endpointName = endpoint
    .replace("/export/", "")
    .replace(/\//g, "-")
    .replace(":symbol", "")
    .replace(/^-/, "")
    .replace(/-$/, "");

  const filename = `${symbol}_${endpointName}.md`;
  const filepath = path.join(DUMP_DIR, filename);

  try {
    console.log(`[DOWNLOAD] ${endpoint} for ${symbol}...`);

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`[ERROR] Failed to download ${endpoint} for ${symbol}: ${response.status} ${response.statusText}`);
      return;
    }

    const markdown = await response.text();

    fs.writeFileSync(filepath, markdown, "utf-8");
    console.log(`[SAVED] ${filename} (${markdown.length} bytes)`);
  } catch (error) {
    console.error(`[ERROR] ${endpoint} for ${symbol}:`, error);
  }
}

async function downloadAllReports(): Promise<void> {
  console.log(`\n[START] Downloading markdown reports from ${BASE_URL}\n`);
  console.log(`[INFO] Symbols: ${SYMBOLS.join(", ")}`);
  console.log(`[INFO] Output directory: ${DUMP_DIR}`);
  console.log(`[INFO] Total reports to download: ${SYMBOLS.length * EXPORT_ENDPOINTS.length}\n`);

  let successCount = 0;
  let failCount = 0;

  for (const symbol of SYMBOLS) {
    console.log(`\n[PROCESSING] ${symbol}...`);

    for (const endpoint of EXPORT_ENDPOINTS) {
      await downloadReport(endpoint, symbol);
      successCount++;

      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`\n[COMPLETE] Download complete!`);
  console.log(`[SUMMARY] Total files: ${SYMBOLS.length * EXPORT_ENDPOINTS.length}`);
  console.log(`[SUMMARY] Directory: ${DUMP_DIR}`);

  // Create a summary file with all reports
  const summaryContent = `# Trading Strategy Analysis Reports

## Overview

This directory contains historical candle data reports for cryptocurrency trading analysis.

## Symbols Analyzed

${SYMBOLS.map(s => `- ${s}`).join("\n")}

## Report Types

### Historical Analysis Data
1. **Long Term** - Long-term analysis history (4h timeframe)
2. **Short Term** - Short-term analysis history (1h timeframe)
3. **Swing Term** - Swing-term analysis history (15m timeframe)
4. **Micro Term** - Micro-term analysis history (1m timeframe)

## File Naming Convention

Files are named using the pattern: \`{SYMBOL}_{endpoint-name}.md\`

Examples:
- \`BTCUSDT_history-long-term.md\`
- \`BTCUSDT_history-short-term.md\`
- \`ETHUSDT_history-swing-term.md\`
- \`ETHUSDT_history-micro-term.md\`

## Data Format

Each report contains historical analysis data with technical indicators in markdown table format:

- **Date** - Human-readable date/time
- **Symbol** - Trading pair
- **Price Data** - Open, High, Low, Close, Volume
- **Technical Indicators** - RSI, MACD, Bollinger Bands, EMA, SMA, ATR, ADX, CCI, Stochastic RSI
- **Support/Resistance Levels** - Key price levels
- **Fibonacci Levels** - Retracement and extension levels
- **Patterns** - Reversal and continuation patterns

## Usage for LLM Trading Strategy

These reports provide historical market data that can be used by LLMs to:

1. **Pattern Recognition** - Identify recurring price patterns and formations
2. **Trend Analysis** - Analyze price trends across multiple timeframes
3. **Support/Resistance** - Determine key price levels from historical data
4. **Volatility Assessment** - Calculate volatility metrics from high/low ranges
5. **Volume Analysis** - Correlate volume with price movements
6. **Backtesting** - Test trading strategies against historical data
7. **Multi-timeframe Confirmation** - Validate signals across different timeframes

## Generated

${new Date().toISOString()}

Total Reports: ${SYMBOLS.length * EXPORT_ENDPOINTS.length}
Base URL: ${BASE_URL}
`;

  fs.writeFileSync(path.join(DUMP_DIR, "README.md"), summaryContent, "utf-8");
  console.log(`[README] Created README.md with report summary`);
}

// Run the download
downloadAllReports().catch((error) => {
  console.error("[FATAL]", error);
  process.exit(1);
});
