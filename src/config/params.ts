declare function parseInt(value: unknown): number;

export const CC_MONGO_CONNECTION_STRING = process.env.CC_MONGO_CONNECTION_STRING || "mongodb://localhost:27017/node-ccxt-dumper?wtimeoutMS=15000";
export const CC_SYMBOL_LIST = process.env.CC_SYMBOL_LIST || "BTCUSDT,ETHUSDT,SOLUSDT,XRPUSDT,BNBUSDT";
export const CC_GET_CANDLES_MIN_CANDLES_FOR_MEDIAN  = parseInt(process.env.CC_GET_CANDLES_MIN_CANDLES_FOR_MEDIAN) || 20;
export const CC_GET_CANDLES_PRICE_ANOMALY_THRESHOLD_FACTOR = parseInt(process.env.CC_GET_CANDLES_PRICE_ANOMALY_THRESHOLD_FACTOR) || 1_000;
export const CC_GET_CANDLES_RETRY_COUNT = parseInt(process.env.CC_GET_CANDLES_RETRY_COUNT) || 3;
export const CC_GET_CANDLES_RETRY_DELAY_MS = parseInt(process.env.CC_GET_CANDLES_RETRY_DELAY_MS) || 5_000;
export const CC_AVG_PRICE_CANDLES_COUNT = parseInt(process.env.CC_AVG_PRICE_CANDLES_COUNT) || 5;
