import fs from "fs";
import path from "path";

const BASE_URL = process.env.API_URL || "http://localhost:30050";
const SYMBOL_LIST = process.env.SYMBOL_LIST || "BTCUSDT,ETHUSDT,BNBUSDT,SOLUSDT,XRPUSDT";
const DUMP_DIR = "./dump/now";

// Symbols to download reports for
const SYMBOLS = SYMBOL_LIST.split(",").map(symbol => symbol.trim());

// All available export endpoints (current analysis, not history)
const EXPORT_ENDPOINTS = [
  // Math Services Reports
  "/export/long-term/:symbol",
  "/export/short-term/:symbol",
  "/export/swing-term/:symbol",
  "/export/micro-term/:symbol",
];

// Create dump directory if it doesn't exist
if (!fs.existsSync(DUMP_DIR)) {
  fs.mkdirSync(DUMP_DIR, { recursive: true });
  console.log(`[OK] Created directory: ${DUMP_DIR}`);
}

async function downloadReport(endpoint: string, symbol: string): Promise<void> {
  const url = `${BASE_URL}${endpoint.replace(":symbol", symbol)}`;

  console.log(url);

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
  console.log(`\n[START] Downloading current analysis reports from ${BASE_URL}\n`);
  console.log(`[INFO] Symbols: ${SYMBOLS.join(", ")}`);
  console.log(`[INFO] Output directory: ${DUMP_DIR}`);
  console.log(`[INFO] Total reports to download: ${SYMBOLS.length * EXPORT_ENDPOINTS.length}\n`);

  for (const symbol of SYMBOLS) {
    console.log(`\n[PROCESSING] ${symbol}...`);

    for (const endpoint of EXPORT_ENDPOINTS) {
      await downloadReport(endpoint, symbol);

      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`\n[COMPLETE] Download complete!`);
  console.log(`[SUMMARY] Total files: ${SYMBOLS.length * EXPORT_ENDPOINTS.length}`);
  console.log(`[SUMMARY] Directory: ${DUMP_DIR}`);

  // Create a summary file with all reports
  const summaryContent = `# Current Trading Strategy Analysis Reports

## Overview

This directory contains current (real-time) trading analysis reports for cryptocurrency trading.

## Symbols Analyzed

${SYMBOLS.map(s => `- ${s}`).join("\n")}

## Report Types

### Current Analysis Data
1. **Long Term** - 1-Hour candles trading analysis (48 candles lookback, 48 hours)
2. **Short Term** - 15-Minute candles trading analysis
3. **Swing Term** - 30-Minute candles analysis (96 candles lookback, 48 hours)
4. **Micro Term** - 1-Minute candles analysis (60 candles lookback, 1 hour)

## File Naming Convention

Files are named using the pattern: \`{SYMBOL}_{endpoint-name}.md\`

Examples:
- \`BTCUSDT_long-term.md\`
- \`BTCUSDT_short-term.md\`
- \`ETHUSDT_swing-term.md\`
- \`ETHUSDT_micro-term.md\`

## Data Format

Each report contains current market analysis with technical indicators in markdown format:

- **Current Price** - Real-time price data
- **Technical Indicators** - RSI, MACD, Bollinger Bands, EMA, SMA, ATR, ADX, CCI, Stochastic RSI
- **Support/Resistance Levels** - Key price levels
- **Fibonacci Levels** - Retracement and extension levels
- **Patterns** - Reversal and continuation patterns
- **Recent Candles** - Last 15 candles with full OHLCV data

## Usage for LLM Trading Strategy

These reports provide current market conditions that can be used by LLMs to:

1. **Real-Time Analysis** - Analyze current market conditions across multiple timeframes
2. **Entry/Exit Signals** - Identify potential entry and exit points
3. **Trend Confirmation** - Validate trends using multiple indicators
4. **Risk Assessment** - Calculate position sizing based on volatility (ATR)
5. **Pattern Recognition** - Identify current price patterns and formations
6. **Multi-Timeframe Confirmation** - Validate signals across different timeframes
7. **Support/Resistance Trading** - Make decisions based on key price levels

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
