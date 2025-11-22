import mongoose, { Document, Schema } from "mongoose";

interface ISwingTermDto {
  symbol: string;
  rsi14: number | null;
  stochasticRSI14: number | null;
  macd12_26_9: number | null;
  signal9: number | null;
  adx14: number | null;
  plusDI14: number | null;
  minusDI14: number | null;
  atr14: number | null;
  cci20: number | null;
  bollingerWidth20_2: number | null;
  bollingerUpper20_2: number | null;
  bollingerMiddle20_2: number | null;
  bollingerLower20_2: number | null;
  stochasticK14_3_3: number | null;
  stochasticD14_3_3: number | null;
  momentum8: number | null;
  dema21: number | null;
  wma20: number | null;
  sma20: number | null;
  ema13: number | null;
  ema34: number | null;
  currentPrice: number | null;
  support: number | null;
  resistance: number | null;
  volume: number | null;
  volatility: number | null;
  priceMomentum6: number | null;
  volumeTrend: string | null;
  lookbackPeriod: string;
  bodySize: number;
  closePrice: number;
  date: Date;
}

interface SwingTermDocument extends ISwingTermDto, Document {}

interface ISwingTermRow extends ISwingTermDto {
  id: string;
}

const SwingTermSchema: Schema<SwingTermDocument> = new Schema({
  symbol: { type: String, required: true },
  rsi14: { type: Number, required: false, default: null },
  stochasticRSI14: { type: Number, required: false, default: null },
  macd12_26_9: { type: Number, required: false, default: null },
  signal9: { type: Number, required: false, default: null },
  adx14: { type: Number, required: false, default: null },
  plusDI14: { type: Number, required: false, default: null },
  minusDI14: { type: Number, required: false, default: null },
  atr14: { type: Number, required: false, default: null },
  cci20: { type: Number, required: false, default: null },
  bollingerWidth20_2: { type: Number, required: false, default: null },
  bollingerUpper20_2: { type: Number, required: false, default: null },
  bollingerMiddle20_2: { type: Number, required: false, default: null },
  bollingerLower20_2: { type: Number, required: false, default: null },
  stochasticK14_3_3: { type: Number, required: false, default: null },
  stochasticD14_3_3: { type: Number, required: false, default: null },
  momentum8: { type: Number, required: false, default: null },
  dema21: { type: Number, required: false, default: null },
  wma20: { type: Number, required: false, default: null },
  sma20: { type: Number, required: false, default: null },
  ema13: { type: Number, required: false, default: null },
  ema34: { type: Number, required: false, default: null },
  currentPrice: { type: Number, required: false, default: null },
  support: { type: Number, required: false, default: null },
  resistance: { type: Number, required: false, default: null },
  volume: { type: Number, required: false, default: null },
  volatility: { type: Number, required: false, default: null },
  priceMomentum6: { type: Number, required: false, default: null },
  volumeTrend: { type: String, required: false, default: null },
  lookbackPeriod: { type: String, required: false, default: '96 candles (48 hours)' },
  bodySize: { type: Number, required: true },
  closePrice: { type: Number, required: true },
  date: { type: Date, required: true },
});

const SwingTermModel = mongoose.model<SwingTermDocument>("swing-term-items", SwingTermSchema);

export {
  SwingTermModel,
  ISwingTermDto,
  SwingTermDocument,
  ISwingTermRow,
};