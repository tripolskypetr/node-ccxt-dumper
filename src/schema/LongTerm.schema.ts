import mongoose, { Document, Schema } from "mongoose";

interface ILongTermDto {
  symbol: string;
  rsi14: number | null;
  stochasticRSI14: number | null;
  macd12_26_9: number | null;
  signal9: number | null;
  adx14: number | null;
  pdi14: number | null;
  ndi14: number | null;
  atr14: number | null;
  atr14_raw: number | null;
  atr20: number | null;
  cci20: number | null;
  bollinger20_2_upper: number | null;
  bollinger20_2_middle: number | null;
  bollinger20_2_lower: number | null;
  stochastic14_3_3_K: number | null;
  stochastic14_3_3_D: number | null;
  momentum10: number | null;
  dema21: number | null;
  wma20: number | null;
  sma50: number | null;
  ema20: number | null;
  ema34: number | null;
  currentPrice: number;
  support: number | null;
  resistance: number | null;
  volumeTrend: string;
  fibonacciNearestLevel: string;
  fibonacciNearestPrice: number;
  fibonacciDistance: number;
  lookbackPeriod: string;
  bodySize: number;
  closePrice: number;
  date: Date;
}

interface LongTermDocument extends ILongTermDto, Document {}

interface ILongTermRow extends ILongTermDto {
  id: string;
}

const LongTermSchema: Schema<LongTermDocument> = new Schema({
  symbol: { type: String, required: true },
  rsi14: { type: Number, required: false, default: null },
  stochasticRSI14: { type: Number, required: false, default: null },
  macd12_26_9: { type: Number, required: false, default: null },
  signal9: { type: Number, required: false, default: null },
  adx14: { type: Number, required: false, default: null },
  pdi14: { type: Number, required: false, default: null },
  ndi14: { type: Number, required: false, default: null },
  atr14: { type: Number, required: false, default: null },
  atr14_raw: { type: Number, required: false, default: null },
  atr20: { type: Number, required: false, default: null },
  cci20: { type: Number, required: false, default: null },
  bollinger20_2_upper: { type: Number, required: false, default: null },
  bollinger20_2_middle: { type: Number, required: false, default: null },
  bollinger20_2_lower: { type: Number, required: false, default: null },
  stochastic14_3_3_K: { type: Number, required: false, default: null },
  stochastic14_3_3_D: { type: Number, required: false, default: null },
  momentum10: { type: Number, required: false, default: null },
  dema21: { type: Number, required: false, default: null },
  wma20: { type: Number, required: false, default: null },
  sma50: { type: Number, required: false, default: null },
  ema20: { type: Number, required: false, default: null },
  ema34: { type: Number, required: false, default: null },
  currentPrice: { type: Number, required: false, default: 0 },
  support: { type: Number, required: false, default: null },
  resistance: { type: Number, required: false, default: null },
  volumeTrend: { type: String, required: false, default: 'unknown' },
  fibonacciNearestLevel: { type: String, required: false, default: '50.0%' },
  fibonacciNearestPrice: { type: Number, required: false, default: 0 },
  fibonacciDistance: { type: Number, required: false, default: 0 },
  lookbackPeriod: { type: String, required: false, default: '48 candles (48 hours) with SMA(50) from 100 hours' },
  bodySize: { type: Number, required: true },
  closePrice: { type: Number, required: true },
  date: { type: Date, required: true },
});

const LongTermModel = mongoose.model<LongTermDocument>("long-term-items", LongTermSchema);

export {
  LongTermModel,
  ILongTermDto,
  LongTermDocument,
  ILongTermRow,
};