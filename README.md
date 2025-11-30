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
├── routes/                # HTTP routes (export.ts, view.ts, exchange.ts)
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

## Installation & Setup

There are two main ways to run the application:

### Option 1: Docker Deployment (Recommended for Production)

See the [Docker Deployment](#docker-deployment) section below for detailed instructions using:
- `config/docker-compose.yaml` - Host network mode (recommended)
- `docker/ccxt-dumper/docker-compose.yaml` - Port mapping mode

### Option 2: Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/tripolskypetr/node-ccxt-dumper.git
   cd node-ccxt-dumper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your MongoDB connection and symbol list
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

   The build is performed using Rollup and creates a bundle in the `build/` directory.

5. **Setup MongoDB indexes** (required for optimal performance)

   Start the REPL console:
   ```bash
   npm run start:repl
   ```

   Create indexes in the REPL:
   ```javascript
   signal.mongoService.restoreIndexes()
   ```

   Expected output:
   ```
   Created index symbol_1_date_-1 on short-term-items
   Created index symbol_1_date_-1 on swing-term-items
   Created index symbol_1_date_-1 on long-term-items
   Created index symbol_1_date_-1 on micro-term-items
   Created index symbol_1_interval_1_timestamp_-1 on candle-data-items
   ```

**Why indexes are important:**
- Dramatically improves query performance for symbol-based lookups
- Enables fast time-range queries on candle data
- Optimizes pagination in view endpoints
- Essential for handling large historical datasets

**Note:** Indexes are created automatically on first use, but running `restoreIndexes()` ensures all required indexes exist before starting the service.

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

The API provides two types of endpoints:

### POST Endpoints (Production)
Accept POST requests with body containing `requestId` and `serviceName`:

```json
{
  "requestId": "unique-request-id",
  "serviceName": "service-name"
}
```

### GET Endpoints (Simplified)
Accept GET requests with query parameters (no requestId/serviceName required):

```bash
# For export endpoints - symbol is in URL path
GET /export/long-term/BTCUSDT

# For exchange endpoints - parameters are query strings
GET /exchange/candles?symbol=BTCUSDT&interval=1h&limit=100&since=1234567890
```

**Response format:**

Successful response:

```json
{
  "data": "...data or markdown report...",
  "status": "ok",
  "error": "",
  "requestId": "auto-generated-id"
}
```

Error response:

```json
{
  "status": "error",
  "error": "error message",
  "requestId": "auto-generated-id"
}
```

### Exchange API (Candle Data with Caching)

#### GET `/exchange/candles`
Fetch candle data with database caching. This endpoint automatically caches candles in MongoDB to reduce exchange API calls.

**Query Parameters:**
- `symbol` - Trading pair (e.g., `BTCUSDT`)
- `interval` - Candle interval (`1m`, `3m`, `5m`, `15m`, `30m`, `1h`, `2h`, `4h`, `6h`, `8h`)
- `limit` - Number of candles to fetch (default: `100`)
- `since` - Unix timestamp in milliseconds (default: `0`)

**Caching Strategy:**
- First checks MongoDB for cached candles matching the request
- If sufficient cached data exists, returns from database
- Otherwise, fetches from exchange API and saves to database
- Prevents duplicate entries using `findByFilter` check

**Example:**
```bash
# Fetch 100 hourly candles for BTCUSDT
curl "http://localhost:30050/exchange/candles?symbol=BTCUSDT&interval=1h&limit=100&since=1640000000000"

# Fetch 50 15-minute candles for ETHUSDT
curl "http://localhost:30050/exchange/candles?symbol=ETHUSDT&interval=15m&limit=50&since=1640000000000"
```

**Response:**
```json
{
  "data": [
    {
      "timestamp": 1640000000000,
      "open": 46000.5,
      "high": 46500.0,
      "low": 45800.0,
      "close": 46200.0,
      "volume": 1234.56
    }
  ],
  "status": "ok",
  "error": "",
  "requestId": "auto-generated-id"
}
```

#### POST `/exchange/candles`
Same as GET endpoint but accepts JSON body with all parameters.

**Request Body:**
```json
{
  "requestId": "unique-request-id",
  "serviceName": "service-name",
  "symbol": "BTCUSDT",
  "interval": "1h",
  "limit": 100,
  "since": 1640000000000
}
```

### View API (Database Query with Pagination)

View endpoints provide direct access to stored analysis data from MongoDB with pagination support.

#### GET `/view/long-term`
#### POST `/view/long-term`
Query long-term analysis data from database with pagination.

**Query Parameters (GET):**
- `symbol` - Trading pair (e.g., `BTCUSDT`)
- `limit` - Number of records to fetch (default: `100`)
- `offset` - Number of records to skip (default: `0`)

**Example (GET):**
```bash
curl "http://localhost:30050/view/long-term?symbol=BTCUSDT&limit=50&offset=0"
```

**Response:**
```json
{
  "data": {
    "rows": [
      {
        "id": "...",
        "symbol": "BTCUSDT",
        "rsi14": 65.5,
        "macd12_26_9": 120.3,
        "currentPrice": 46500.0,
        "date": "2024-01-15T10:00:00.000Z"
      }
    ],
    "total": 150
  },
  "status": "ok",
  "error": "",
  "requestId": "auto-generated-id"
}
```

#### GET `/view/swing-term`
#### POST `/view/swing-term`
Query swing-term (15-minute) analysis data with pagination.

**Example (GET):**
```bash
curl "http://localhost:30050/view/swing-term?symbol=ETHUSDT&limit=100&offset=0"
```

#### GET `/view/short-term`
#### POST `/view/short-term`
Query short-term (5-minute) analysis data with pagination.

**Example (GET):**
```bash
curl "http://localhost:30050/view/short-term?symbol=BNBUSDT&limit=100&offset=0"
```

#### GET `/view/micro-term`
#### POST `/view/micro-term`
Query micro-term (2-minute) analysis data with pagination.

**Example (GET):**
```bash
curl "http://localhost:30050/view/micro-term?symbol=SOLUSDT&limit=100&offset=0"
```

### Analytical Reports (Math Services)

All analytical endpoints are available in both POST and GET versions.

#### POST `/export/long-term/:symbol`
#### GET `/export/long-term/:symbol`
Long-term analysis on 1-hour timeframe (7 days history, 336 candles).

**Includes:**
- RSI (14), MACD (12/26/9), Bollinger Bands (20), Stochastic RSI
- EMA (9, 21, 50), SMA (50, 200)
- ATR (14), ADX (14), CCI (20), MOM (10)
- Support/resistance levels
- Fibonacci levels (23.6%, 38.2%, 50%, 61.8%, 78.6%, 100%, 127.2%, 161.8%)
- Patterns (reversal and continuation)
- Last 15 candles with full data

**Example (POST):**
```bash
curl -X POST http://localhost:30050/export/long-term/BTCUSDT \
  -H "Content-Type: application/json" \
  -d '{"requestId": "req-001", "serviceName": "trading-bot"}'
```

**Example (GET):**
```bash
curl http://localhost:30050/export/long-term/BTCUSDT
```

#### POST `/export/swing-term/:symbol`
#### GET `/export/swing-term/:symbol`
Medium-term analysis on 15-minute timeframe (7 days history, 672 candles).

**Includes:**
- Same indicators as long-term, but optimized for 15-minute timeframe
- Fast EMAs (9, 21) and slow SMAs (50, 100)
- RSI with period 14
- Bollinger Bands (20)

**Example (GET):**
```bash
curl http://localhost:30050/export/swing-term/ETHUSDT
```

#### POST `/export/short-term/:symbol`
#### GET `/export/short-term/:symbol`
Short-term analysis on 5-minute timeframe (7 days history, 2016 candles).

**Includes:**
- Fast indicators for scalping
- RSI (14), EMA (9, 21), SMA (50)
- Bollinger Bands (20)
- MACD (12/26/9)
- Short-term pattern analysis

**Example (GET):**
```bash
curl http://localhost:30050/export/short-term/BNBUSDT
```

#### POST `/export/micro-term/:symbol`
#### GET `/export/micro-term/:symbol`
Ultra-short-term analysis on 2-minute timeframe (3 days history, 2160 candles).

**Includes:**
- Ultra-fast indicators
- RSI (14), EMA (5, 13), SMA (20)
- Bollinger Bands (10)
- Micro-patterns for high-frequency trading

**Example (GET):**
```bash
curl http://localhost:30050/export/micro-term/SOLUSDT
```

#### POST `/export/slope-data/:symbol`
#### GET `/export/slope-data/:symbol`
Analysis of slopes and trend lines.

**Includes:**
- Calculation of slope angles for EMA/SMA
- Trend strength determination
- Rate of price change
- Divergences between price and indicators

**Example (GET):**
```bash
curl http://localhost:30050/export/slope-data/ADAUSDT
```

#### POST `/export/volume-data/:symbol`
#### GET `/export/volume-data/:symbol`
Detailed trading volume analysis.

**Includes:**
- VWAP (Volume Weighted Average Price)
- Volume profile
- Anomalous volume detection
- Correlation between volume and price movement
- Volume Rate of Change (VROC)

**Example (GET):**
```bash
curl http://localhost:30050/export/volume-data/XRPUSDT
```

### Historical Data (History Services)

All history endpoints are available in both POST and GET versions.

#### POST `/export/history/one-minute/:symbol`
#### GET `/export/history/one-minute/:symbol`
History of 1-minute candles.

**Example (GET):**
```bash
curl http://localhost:30050/export/history/one-minute/BTCUSDT
```

#### POST `/export/history/fifteen-minute/:symbol`
#### GET `/export/history/fifteen-minute/:symbol`
History of 15-minute candles.

**Example (GET):**
```bash
curl http://localhost:30050/export/history/fifteen-minute/BTCUSDT
```

#### POST `/export/history/thirty-minute/:symbol`
#### GET `/export/history/thirty-minute/:symbol`
History of 30-minute candles.

**Example (GET):**
```bash
curl http://localhost:30050/export/history/thirty-minute/BTCUSDT
```

#### POST `/export/history/hour/:symbol`
#### GET `/export/history/hour/:symbol`
History of hourly candles.

**Example (GET):**
```bash
curl http://localhost:30050/export/history/hour/BTCUSDT
```

#### POST `/export/history/long-term/:symbol`
#### GET `/export/history/long-term/:symbol`
History of long-term analyses (30-minute TTL, 7 days).

**Includes:**
- Stored long-term analysis results
- Indicator change trends
- Historical signals

**Example (GET):**
```bash
curl http://localhost:30050/export/history/long-term/BTCUSDT
```

#### POST `/export/history/swing-term/:symbol`
#### GET `/export/history/swing-term/:symbol`
History of medium-term analyses (15-minute TTL, 7 days).

**Example (GET):**
```bash
curl http://localhost:30050/export/history/swing-term/ETHUSDT
```

#### POST `/export/history/short-term/:symbol`
#### GET `/export/history/short-term/:symbol`
History of short-term analyses (5-minute TTL, 7 days).

**Example (GET):**
```bash
curl http://localhost:30050/export/history/short-term/BNBUSDT
```

#### POST `/export/history/micro-term/:symbol`
#### GET `/export/history/micro-term/:symbol`
History of ultra-short-term analyses (2-minute TTL, 3 days).

**Example (GET):**
```bash
curl http://localhost:30050/export/history/micro-term/SOLUSDT
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

### Getting candles with caching (GET)

```javascript
const symbol = 'BTCUSDT';
const interval = '1h';
const limit = 100;
const since = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days ago

const response = await fetch(
  `http://localhost:30050/exchange/candles?symbol=${symbol}&interval=${interval}&limit=${limit}&since=${since}`
);

const result = await response.json();

if (result.status === 'ok') {
  console.log('Received candles:', result.data.length);
  console.log('First candle:', result.data[0]);
} else {
  console.error('Error:', result.error);
}
```

### Getting long-term analysis (GET - Simplified)

```javascript
const response = await fetch('http://localhost:30050/export/long-term/BTCUSDT');

const result = await response.json();

if (result.status === 'ok') {
  console.log('Long-term analysis report:');
  console.log(result.data); // Markdown-formatted report
  console.log('Request ID:', result.requestId); // Auto-generated
} else {
  console.error('Error:', result.error);
}
```

### Getting long-term analysis (POST - Production)

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

### Batch fetching all timeframes (GET - Simplified)

```javascript
const symbol = 'ETHUSDT';

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
    fetch(`http://localhost:30050${endpoint}/${symbol}`).then(r => r.json())
  )
);

results.forEach((result, i) => {
  console.log(`\n=== ${endpoints[i]} ===`);
  if (result.status === 'ok') {
    console.log(result.data);
    console.log('Request ID:', result.requestId); // Auto-generated
  } else {
    console.error('Error:', result.error);
  }
});
```

### Batch fetching all timeframes (POST - Production)

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
CC_SYMBOL_LIST=BTCUSDT,ETHUSDT,SOLUSDT,XRPUSDT,BNBUSDT
CC_GET_CANDLES_MIN_CANDLES_FOR_MEDIAN=20
CC_GET_CANDLES_PRICE_ANOMALY_THRESHOLD_FACTOR=1000
CC_GET_CANDLES_RETRY_COUNT=3
CC_GET_CANDLES_RETRY_DELAY_MS=5000
CC_AVG_PRICE_CANDLES_COUNT=5
```

### Environment Variables

#### Basic Configuration

- **CC_MONGO_CONNECTION_STRING** (default: `mongodb://localhost:27017/node-ccxt-dumper?wtimeoutMS=15000`)
  - MongoDB connection string
  - Used for storing candle data and analysis results

- **CC_SYMBOL_LIST** (default: `BTCUSDT,ETHUSDT,SOLUSDT,XRPUSDT,BNBUSDT`)
  - Comma-separated list of trading symbols to monitor
  - Format: BASE+QUOTE without slash (e.g., BTCUSDT, not BTC/USDT)

#### Data Quality & Validation Parameters

- **CC_GET_CANDLES_MIN_CANDLES_FOR_MEDIAN** (default: `20`)
  - Minimum number of candles required to use median instead of average for reference price calculation
  - Used in candle validation to detect incomplete/corrupted data
  - If candles ≥ 20: uses median (more reliable statistics)
  - If candles < 20: uses average (more stable for small datasets)

- **CC_GET_CANDLES_PRICE_ANOMALY_THRESHOLD_FACTOR** (default: `1000`)
  - Factor to detect anomalously low prices (incomplete candles indicator)
  - Minimum valid price = `referencePrice / threshold_factor`
  - Example: if BTC reference price = 50,000 USD, minimum valid price = 50 USD
  - Protects against corrupted exchange data and incomplete candles

#### Retry & Reliability Parameters

- **CC_GET_CANDLES_RETRY_COUNT** (default: `3`)
  - Number of retry attempts when fetching candles from exchange fails
  - Handles network issues, rate limits, and temporary exchange API problems
  - After all retries fail, the last error is thrown

- **CC_GET_CANDLES_RETRY_DELAY_MS** (default: `5000`)
  - Delay in milliseconds between retry attempts
  - Prevents excessive load on exchange API during issues
  - Gives exchange API time to recover from temporary failures

#### Market Price Calculation

- **CC_AVG_PRICE_CANDLES_COUNT** (default: `5`)
  - Number of recent 1-minute candles used to calculate market price (VWAP)
  - Used in `ExchangeService.getMarketPrice()` method
  - Calculates Volume Weighted Average Price using typical price: `(high + low + close) / 3 * volume`
  - If total volume is zero, returns simple average of close prices

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

### Data Quality Assurance

The system implements comprehensive candle validation ([src/lib/services/view/CandleViewService.ts](src/lib/services/view/CandleViewService.ts)):

1. **Reference Price Calculation**: Uses median (for ≥20 candles) or average (for <20 candles)
2. **Numeric Validation**: Checks for NaN and Infinity values
3. **Range Validation**: Ensures all prices are positive (OHLC > 0, volume ≥ 0)
4. **Anomaly Detection**: Detects incomplete candles with anomalously low prices

This multi-layer validation ensures high-quality data before technical indicator calculation.

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

All requests are logged using the `pinolog` library. Logs include:
- Incoming requests (requestId, serviceName, symbol, parameters)
- Successful responses
- Errors with full stack traces
- Execution time for each request (console.time/timeEnd)

**Log Files:**
- `http_export.log` - All export endpoints (analysis and history)
- `http_exchange.log` - Exchange API candle requests with caching
- `http_view.log` - All view endpoints (long-term, swing-term, short-term, micro-term)

## Performance

- **TTL Caching**: Analysis results are cached for the TTL period to reduce exchange load
- **Database Caching**: Candle data is cached in MongoDB to minimize exchange API calls
- **Smart Cache Strategy**:
  - Checks database first for existing candles
  - Only fetches missing data from exchange
  - Prevents duplicate entries with `findByFilter` validation
- **Parallel Requests**: Ability to process multiple requests simultaneously
- **Optimized Periods**: Each timeframe uses optimal periods for indicators

## License

MIT

## Author

Petr Tripolsky

## Version

1.0.13
