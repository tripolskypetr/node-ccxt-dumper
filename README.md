# node-ccxt-dumper

**LLM Trading Backtest Kit** - a system for technical analysis of cryptocurrency markets using CCXT and generating reports for LLM models.

## Project Description

node-ccxt-dumper is a TypeScript library and HTTP API for fetching and analyzing data from cryptocurrency exchanges. The project provides comprehensive technical analysis of trading instruments across various timeframes, including calculation of technical indicators, pattern detection, and generation of text reports optimized for LLM analysis.

### Key Features

- **Multi-level Analysis**: Analysis across 6 different timeframes (from 2 minutes to 1 hour)
- **Technical Indicators**: RSI, MACD, Bollinger Bands, EMA, SMA, Stochastic RSI, ATR, ADX, CCI, and more
- **Historical Data**: Storage of 3 to 7 days of data depending on timeframe
- **Patterns**: Detection of reversal and continuation patterns
- **Support/Resistance Levels**: Automatic calculation of key levels
- **Fibonacci Levels**: Calculation of retracement and extension levels
- **Volume Analysis**: VWAP, volume profiles, anomaly detection
- **TTL Caching**: Result caching for performance optimization
- **REST API**: HTTP endpoints for retrieving reports

### Architecture

The project is organized using separation of concerns with Dependency Injection:

```
src/
├── lib/
│   ├── services/
│   │   ├── base/          # Base services (Exchange, Mongo, Bootstrap, Error)
│   │   ├── math/          # Math services for technical analysis
│   │   ├── client/        # Client services for report generation
│   │   ├── db/            # Database services
│   │   ├── history/       # History and aggregation services
│   │   └── job/           # Job schedulers
│   ├── core/              # DI system (types, provide, inject)
│   └── common/            # Common utilities (BaseCRUD)
├── model/                 # Data models (ICandleData)
├── schema/                # Mongoose schemas
├── routes/                # HTTP routes (export.ts)
└── config/                # Configuration (app, ccxt, mongo)
```

### Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript 5.8
- **Exchange API**: CCXT 4.5
- **Database**: MongoDB (Mongoose 8.13)
- **HTTP Framework**: Hono 4.7
- **Technical Analysis**: trading-signals 6.9
- **DI Container**: di-kit 1.0
- **Utilities**: functools-kit, dayjs, lodash-es

## Installation

```bash
npm install node-ccxt-dumper
```

## Build

```bash
npm run build
```

The build is performed using Rollup and creates a bundle in the `build/` directory.

## Docker Deployment

### Using Docker Compose (Recommended)

The project includes Docker Compose configurations for different deployment scenarios.

#### 1. Deploy with Pre-built Image

Use the pre-built image from Docker Hub:

```bash
cd config
docker-compose up -d
```

This will:
- Pull `tripolskypetr/node-ccxt-dumper:latest` from Docker Hub
- Run the application on port 30050 (mapped to host)
- Use host network mode for optimal performance
- Mount logs directory for persistent logging
- Auto-restart on failure with health checks

#### 2. Deploy with Port Mapping

Alternative configuration with explicit port mapping:

```bash
cd docker/ccxt-dumper
docker-compose up -d
```

This configuration:
- Maps container port 30050 to host port 80
- Provides access to `host.docker.internal` for connecting to host services
- Suitable for connecting to MongoDB running on host machine

#### 3. Deploy MongoDB

To run MongoDB in Docker:

```bash
cd docker/mongo
docker-compose up -d
```

This starts:
- MongoDB Community Server 8.0.4
- Exposed on port 27017
- Persistent data storage in `./mongo_data`

### Building Docker Image

To build your own Docker image:

```bash
# First, build the project
npm run build

# Build Docker image
docker build -t node-ccxt-dumper:latest .

# Run the container
docker run -d \
  -p 30050:30050 \
  -v $(pwd)/logs:/app/logs \
  -e CC_MONGO_CONNECTION_STRING=mongodb://host.docker.internal:27017/node-ccxt-dumper?wtimeoutMS=15000 \
  -e TZ=Asia/Tashkent \
  --name ccxt-dumper \
  node-ccxt-dumper:latest
```

### Environment Configuration

Create a `.env` file in the same directory as `docker-compose.yaml`:

```bash
CC_MONGO_CONNECTION_STRING=mongodb://host.docker.internal:27017/node-ccxt-dumper?wtimeoutMS=15000
CC_SYMBOL_LIST=BTCUSDT,ETHUSDT,SOLUSDT,XRPUSDT,BNBUSDT
```

### Docker Image Details

- **Base Image**: `oven/bun:1.2.19-alpine`
- **Runtime**: Bun (alternative to Node.js)
- **Exposed Port**: 30050
- **Health Check**: `GET /health_check` every 30 seconds
- **Resource Limits**: 8 CPU cores (configurable in docker-compose.yaml)
- **Timezone**: Asia/Tashkent (configurable via `TZ` environment variable)

### Health Check

The container includes a health check endpoint:

```bash
curl http://localhost:30050/health_check
```

Health check configuration:
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3 attempts before marking unhealthy

### Logs

Application logs are persisted to the `./logs` directory (mounted as volume):

```bash
# View logs from Docker container
docker-compose logs -f app

# View application log files
tail -f ./logs/http_export.log
```

### Full Stack Deployment

To deploy the complete stack (MongoDB + Application):

```bash
# 1. Start MongoDB
cd docker/mongo
docker-compose up -d

# 2. Wait for MongoDB to be ready
sleep 5

# 3. Start the application
cd ../ccxt-dumper
docker-compose up -d

# 4. Verify all services are running
docker ps
```

## API Endpoints

All endpoints accept POST requests with body:

```json
{
  "requestId": "unique-request-id",
  "serviceName": "service-name"
}
```

Successful response:

```json
{
  "data": "...markdown report...",
  "status": "ok",
  "error": "",
  "requestId": "unique-request-id",
  "serviceName": "service-name"
}
```

Error response:

```json
{
  "status": "error",
  "error": "error message",
  "requestId": "unique-request-id",
  "serviceName": "service-name"
}
```

### Analytical Reports (Math Services)

#### POST `/export/long-term/:symbol`
Long-term analysis on 1-hour timeframe (7 days history, 336 candles).

**Includes:**
- RSI (14), MACD (12/26/9), Bollinger Bands (20), Stochastic RSI
- EMA (9, 21, 50), SMA (50, 200)
- ATR (14), ADX (14), CCI (20), MOM (10)
- Support/resistance levels
- Fibonacci levels (23.6%, 38.2%, 50%, 61.8%, 78.6%, 100%, 127.2%, 161.8%)
- Patterns (reversal and continuation)
- Last 15 candles with full data

**Example:**
```bash
curl -X POST http://localhost:30050/export/long-term/BTCUSDT \
  -H "Content-Type: application/json" \
  -d '{"requestId": "req-001", "serviceName": "trading-bot"}'
```

#### POST `/export/swing-term/:symbol`
Medium-term analysis on 15-minute timeframe (7 days history, 672 candles).

**Includes:**
- Same indicators as long-term, but optimized for 15-minute timeframe
- Fast EMAs (9, 21) and slow SMAs (50, 100)
- RSI with period 14
- Bollinger Bands (20)

**Example:**
```bash
curl -X POST http://localhost:30050/export/swing-term/ETHUSDT \
  -H "Content-Type: application/json" \
  -d '{"requestId": "req-002", "serviceName": "trading-bot"}'
```

#### POST `/export/short-term/:symbol`
Short-term analysis on 5-minute timeframe (7 days history, 2016 candles).

**Includes:**
- Fast indicators for scalping
- RSI (14), EMA (9, 21), SMA (50)
- Bollinger Bands (20)
- MACD (12/26/9)
- Short-term pattern analysis

**Example:**
```bash
curl -X POST http://localhost:30050/export/short-term/BNBUSDT \
  -H "Content-Type: application/json" \
  -d '{"requestId": "req-003", "serviceName": "trading-bot"}'
```

#### POST `/export/micro-term/:symbol`
Ultra-short-term analysis on 2-minute timeframe (3 days history, 2160 candles).

**Includes:**
- Ultra-fast indicators
- RSI (14), EMA (5, 13), SMA (20)
- Bollinger Bands (10)
- Micro-patterns for high-frequency trading

**Example:**
```bash
curl -X POST http://localhost:30050/export/micro-term/SOLUSDT \
  -H "Content-Type: application/json" \
  -d '{"requestId": "req-004", "serviceName": "trading-bot"}'
```

#### POST `/export/slope-data/:symbol`
Analysis of slopes and trend lines.

**Includes:**
- Calculation of slope angles for EMA/SMA
- Trend strength determination
- Rate of price change
- Divergences between price and indicators

**Example:**
```bash
curl -X POST http://localhost:30050/export/slope-data/ADAUSDT \
  -H "Content-Type: application/json" \
  -d '{"requestId": "req-005", "serviceName": "trading-bot"}'
```

#### POST `/export/volume-data/:symbol`
Detailed trading volume analysis.

**Includes:**
- VWAP (Volume Weighted Average Price)
- Volume profile
- Anomalous volume detection
- Correlation between volume and price movement
- Volume Rate of Change (VROC)

**Example:**
```bash
curl -X POST http://localhost:30050/export/volume-data/XRPUSDT \
  -H "Content-Type: application/json" \
  -d '{"requestId": "req-006", "serviceName": "trading-bot"}'
```

### Historical Data (History Services)

#### POST `/export/history/one-minute/:symbol`
History of 1-minute candles.

**Example:**
```bash
curl -X POST http://localhost:30050/export/history/one-minute/BTCUSDT \
  -H "Content-Type: application/json" \
  -d '{"requestId": "req-007", "serviceName": "trading-bot"}'
```

#### POST `/export/history/fifteen-minute/:symbol`
History of 15-minute candles.

**Example:**
```bash
curl -X POST http://localhost:30050/export/history/fifteen-minute/BTCUSDT \
  -H "Content-Type: application/json" \
  -d '{"requestId": "req-008", "serviceName": "trading-bot"}'
```

#### POST `/export/history/thirty-minute/:symbol`
History of 30-minute candles.

**Example:**
```bash
curl -X POST http://localhost:30050/export/history/thirty-minute/BTCUSDT \
  -H "Content-Type: application/json" \
  -d '{"requestId": "req-009", "serviceName": "trading-bot"}'
```

#### POST `/export/history/hour/:symbol`
History of hourly candles.

**Example:**
```bash
curl -X POST http://localhost:30050/export/history/hour/BTCUSDT \
  -H "Content-Type: application/json" \
  -d '{"requestId": "req-010", "serviceName": "trading-bot"}'
```

#### POST `/export/history/long-term/:symbol`
History of long-term analyses (30-minute TTL, 7 days).

**Includes:**
- Stored long-term analysis results
- Indicator change trends
- Historical signals

**Example:**
```bash
curl -X POST http://localhost:30050/export/history/long-term/BTCUSDT \
  -H "Content-Type: application/json" \
  -d '{"requestId": "req-011", "serviceName": "trading-bot"}'
```

#### POST `/export/history/swing-term/:symbol`
History of medium-term analyses (15-minute TTL, 7 days).

**Example:**
```bash
curl -X POST http://localhost:30050/export/history/swing-term/ETHUSDT \
  -H "Content-Type: application/json" \
  -d '{"requestId": "req-012", "serviceName": "trading-bot"}'
```

#### POST `/export/history/short-term/:symbol`
History of short-term analyses (5-minute TTL, 7 days).

**Example:**
```bash
curl -X POST http://localhost:30050/export/history/short-term/BNBUSDT \
  -H "Content-Type: application/json" \
  -d '{"requestId": "req-013", "serviceName": "trading-bot"}'
```

#### POST `/export/history/micro-term/:symbol`
History of ultra-short-term analyses (2-minute TTL, 3 days).

**Example:**
```bash
curl -X POST http://localhost:30050/export/history/micro-term/SOLUSDT \
  -H "Content-Type: application/json" \
  -d '{"requestId": "req-014", "serviceName": "trading-bot"}'
```

## Symbol Format

All endpoints accept symbols in Binance format (without slash): `BASEQUOTE`, for example:
- `BTCUSDT`
- `ETHUSDT`
- `BNBUSDT`
- `SOLUSDT`
- `XRPUSDT`
- `ADAUSDT`

## Timeframes and Retention Periods

| Service | Timeframe | Cache TTL | History Period | Candle Count |
|---------|-----------|-----------|----------------|--------------|
| Long Term | 1h | 60 min | 7 days | 100 (analysis 48) |
| Swing Term | 15m | 15 min | 7 days | 672 |
| Short Term | 5m | 5 min | 7 days | 2016 |
| Micro Term | 2m | 2 min | 3 days | 2160 |
| One Minute | 1m | - | - | Current |
| Fifteen Minute | 15m | - | - | Current |
| Thirty Minute | 30m | - | - | Current |
| Hour | 1h | - | - | Current |

## Technical Indicators

### Momentum Indicators
- **RSI** (Relative Strength Index): Overbought/oversold detection
- **Stochastic RSI**: More sensitive version of RSI
- **MOM** (Momentum): Rate of price change
- **CCI** (Commodity Channel Index): Cyclical trends

### Trend Indicators
- **EMA** (Exponential Moving Average): Exponential moving averages (9, 21, 50)
- **SMA** (Simple Moving Average): Simple moving averages (50, 200)
- **MACD** (Moving Average Convergence Divergence): Convergence/divergence of moving averages
- **ADX** (Average Directional Index): Trend strength

### Volatility Indicators
- **Bollinger Bands**: Volatility bands (upper, middle, lower)
- **ATR** (Average True Range): Average true range

### Volume Indicators
- **VWAP** (Volume Weighted Average Price): Volume weighted average price
- **Volume Profile**: Distribution of volumes by price levels
- **VROC** (Volume Rate of Change): Rate of volume change

## Usage Examples

### Getting long-term analysis for BTCUSDT

```javascript
const response = await fetch('http://localhost:30050/export/long-term/BTCUSDT', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    requestId: 'my-unique-id-001',
    serviceName: 'my-trading-bot'
  })
});

const result = await response.json();

if (result.status === 'ok') {
  console.log('Long-term analysis report:');
  console.log(result.data); // Markdown-formatted report
} else {
  console.error('Error:', result.error);
}
```

### Batch fetching all timeframes

```javascript
const symbol = 'ETHUSDT';
const requestId = Date.now().toString();

const endpoints = [
  '/export/long-term',
  '/export/swing-term',
  '/export/short-term',
  '/export/micro-term',
  '/export/volume-data',
  '/export/slope-data'
];

const results = await Promise.all(
  endpoints.map(endpoint =>
    fetch(`http://localhost:30050${endpoint}/${symbol}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, serviceName: 'multi-timeframe-analysis' })
    }).then(r => r.json())
  )
);

results.forEach((result, i) => {
  console.log(`\n=== ${endpoints[i]} ===`);
  if (result.status === 'ok') {
    console.log(result.data);
  } else {
    console.error('Error:', result.error);
  }
});
```

## Configuration

The project uses environment variables for configuration:

```bash
# .env file
CC_MONGO_CONNECTION_STRING=mongodb://localhost:27017/node-ccxt-dumper?wtimeoutMS=15000
```

### Default Configuration

- **Exchange**: Binance (spot market)
- **MongoDB**: `mongodb://localhost:27017/node-ccxt-dumper?wtimeoutMS=15000`
- **Rate Limiting**: Enabled (built-in CCXT rate limiter)
- **Time Adjustment**: Automatic adjustment for server time differences
- **Receive Window**: 60000ms

The exchange configuration is defined in [src/config/ccxt.ts](src/config/ccxt.ts) and uses Binance by default with the following options:
- `defaultType: "spot"` - Spot market trading
- `adjustForTimeDifference: true` - Automatic time synchronization
- `recvWindow: 60000` - Request receive window
- `enableRateLimit: true` - Rate limiting protection

## Candle Data Structure

```typescript
interface ICandleData {
  /** Unix timestamp in milliseconds */
  timestamp: number;
  /** Opening price */
  open: number;
  /** Maximum price */
  high: number;
  /** Minimum price */
  low: number;
  /** Closing price */
  close: number;
  /** Trading volume */
  volume: number;
}
```

## Logging

All requests are logged to `http_export.log` file using the `pinolog` library. Logs include:
- Incoming requests (requestId, serviceName, symbol)
- Successful responses
- Errors with full stack traces
- Execution time for each request (console.time/timeEnd)

## Performance

- **TTL Caching**: Analysis results are cached for the TTL period to reduce exchange load
- **Parallel Requests**: Ability to process multiple requests simultaneously
- **Optimized Periods**: Each timeframe uses optimal periods for indicators

## License

MIT

## Author

Petr Tripolsky

## Version

1.0.13
