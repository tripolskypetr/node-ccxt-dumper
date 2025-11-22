import mongoose, { Document, Schema } from "mongoose";

interface IShortTermDto {
  symbol: string;
  rsi9: number | null;
  stochasticRSI9: number | null;
  macd8_21_5: number | null;
  signal5: number | null;
  adx14: number | null;
  plusDI14: number | null;
  minusDI14: number | null;
  atr9: number | null;
  cci14: number | null;
  bollingerWidth10_2: number | null;
  bollingerUpper10_2: number | null;
  bollingerMiddle10_2: number | null;
  bollingerLower10_2: number | null;
  stochasticK5_3_3: number | null;
  stochasticD5_3_3: number | null;
  momentum8: number | null;
  roc5: number | null;
  roc10: number | null;
  sma50: number | null;
  ema8: number | null;
  ema21: number | null;
  dema21: number | null;
  wma20: number | null;
  currentPrice: number | null;
  support: number | null;
  resistance: number | null;
  volumeTrend: string | null;
  lookbackPeriod: string;
  bodySize: number;
  closePrice: number;
  date: Date;
}

interface ShortTermDocument extends IShortTermDto, Document {}

interface IShortTermRow extends IShortTermDto {
  id: string;
}

const ShortTermSchema: Schema<ShortTermDocument> = new Schema({
  symbol: { type: String, required: true },
  rsi9: { type: Number, required: false, default: null },
  stochasticRSI9: { type: Number, required: false, default: null },
  macd8_21_5: { type: Number, required: false, default: null },
  signal5: { type: Number, required: false, default: null },
  adx14: { type: Number, required: false, default: null },
  plusDI14: { type: Number, required: false, default: null },
  minusDI14: { type: Number, required: false, default: null },
  atr9: { type: Number, required: false, default: null },
  cci14: { type: Number, required: false, default: null },
  bollingerWidth10_2: { type: Number, required: false, default: null },
  bollingerUpper10_2: { type: Number, required: false, default: null },
  bollingerMiddle10_2: { type: Number, required: false, default: null },
  bollingerLower10_2: { type: Number, required: false, default: null },
  stochasticK5_3_3: { type: Number, required: false, default: null },
  stochasticD5_3_3: { type: Number, required: false, default: null },
  momentum8: { type: Number, required: false, default: null },
  roc5: { type: Number, required: false, default: null },
  roc10: { type: Number, required: false, default: null },
  sma50: { type: Number, required: false, default: null },
  ema8: { type: Number, required: false, default: null },
  ema21: { type: Number, required: false, default: null },
  dema21: { type: Number, required: false, default: null },
  wma20: { type: Number, required: false, default: null },
  currentPrice: { type: Number, required: false, default: null },
  support: { type: Number, required: false, default: null },
  resistance: { type: Number, required: false, default: null },
  volumeTrend: { type: String, required: false, default: null },
  lookbackPeriod: { type: String, required: false, default: '144 candles (36 hours)' },
  bodySize: { type: Number, required: true },
  closePrice: { type: Number, required: true },
  date: { type: Date, required: true },
});

const ShortTermModel = mongoose.model<ShortTermDocument>("short-term-items", ShortTermSchema);

export {
  ShortTermModel,
  IShortTermDto,
  ShortTermDocument,
  IShortTermRow,
};