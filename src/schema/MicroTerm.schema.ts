import mongoose, { Document, Schema } from "mongoose";

interface IMicroTermDto {
  symbol: string;
  // Ultra-fast RSI indicators
  rsi9: number | null;
  rsi14: number | null;
  stochasticRSI9: number | null;
  stochasticRSI14: number | null;
  
  // MACD for momentum
  macd8_21_5: number | null;
  signal5: number | null;
  macdHistogram: number | null;
  
  // Bollinger bands
  bollingerUpper8_2: number | null;
  bollingerMiddle8_2: number | null;
  bollingerLower8_2: number | null;
  bollingerWidth8_2: number | null;
  bollingerPosition: number | null;
  
  // Stochastic oscillator
  stochasticK3_3_3: number | null;
  stochasticD3_3_3: number | null;
  stochasticK5_3_3: number | null;
  stochasticD5_3_3: number | null;
  
  // Trend strength and direction
  adx9: number | null;
  plusDI9: number | null;
  minusDI9: number | null;
  
  // Volatility and momentum
  atr5: number | null;
  atr9: number | null;
  cci9: number | null;
  momentum5: number | null;
  momentum10: number | null;
  roc1: number | null;
  roc3: number | null;
  roc5: number | null;

  // Moving averages
  ema3: number | null;
  ema8: number | null;
  ema13: number | null;
  ema21: number | null;
  sma8: number | null;
  dema8: number | null;
  wma5: number | null;
  
  // Volume analysis
  volumeSma5: number | null;
  volumeRatio: number | null;
  volumeTrend: string | null;
  
  // Price action metrics
  currentPrice: number | null;
  priceChange1m: number | null;
  priceChange3m: number | null;
  priceChange5m: number | null;
  
  // Volatility metrics
  volatility5: number | null;
  trueRange: number | null;
  
  // Support/resistance levels
  support: number | null;
  resistance: number | null;
  
  // Market microstructure
  tickDirection: string | null;
  
  // Advanced signals
  squeezeMomentum: number | null;
  pressureIndex: number | null;
  
  // Metadata
  lookbackPeriod: string;
  closePrice: number;
  date: Date;
}

interface MicroTermDocument extends IMicroTermDto, Document {}

interface IMicroTermRow extends IMicroTermDto {
  id: string;
}

const MicroTermSchema: Schema<MicroTermDocument> = new Schema({
  symbol: { type: String, required: true },
  
  // Ultra-fast RSI indicators
  rsi9: { type: Number, required: false, default: null },
  rsi14: { type: Number, required: false, default: null },
  stochasticRSI9: { type: Number, required: false, default: null },
  stochasticRSI14: { type: Number, required: false, default: null },
  
  // MACD for momentum
  macd8_21_5: { type: Number, required: false, default: null },
  signal5: { type: Number, required: false, default: null },
  macdHistogram: { type: Number, required: false, default: null },
  
  // Bollinger bands
  bollingerUpper8_2: { type: Number, required: false, default: null },
  bollingerMiddle8_2: { type: Number, required: false, default: null },
  bollingerLower8_2: { type: Number, required: false, default: null },
  bollingerWidth8_2: { type: Number, required: false, default: null },
  bollingerPosition: { type: Number, required: false, default: null },
  
  // Stochastic oscillator
  stochasticK3_3_3: { type: Number, required: false, default: null },
  stochasticD3_3_3: { type: Number, required: false, default: null },
  stochasticK5_3_3: { type: Number, required: false, default: null },
  stochasticD5_3_3: { type: Number, required: false, default: null },
  
  // Trend strength and direction
  adx9: { type: Number, required: false, default: null },
  plusDI9: { type: Number, required: false, default: null },
  minusDI9: { type: Number, required: false, default: null },
  
  // Volatility and momentum
  atr5: { type: Number, required: false, default: null },
  atr9: { type: Number, required: false, default: null },
  cci9: { type: Number, required: false, default: null },
  momentum5: { type: Number, required: false, default: null },
  momentum10: { type: Number, required: false, default: null },
  roc1: { type: Number, required: false, default: null },
  roc3: { type: Number, required: false, default: null },
  roc5: { type: Number, required: false, default: null },

  // Moving averages
  ema3: { type: Number, required: false, default: null },
  ema8: { type: Number, required: false, default: null },
  ema13: { type: Number, required: false, default: null },
  ema21: { type: Number, required: false, default: null },
  sma8: { type: Number, required: false, default: null },
  dema8: { type: Number, required: false, default: null },
  wma5: { type: Number, required: false, default: null },
  
  // Volume analysis
  volumeSma5: { type: Number, required: false, default: null },
  volumeRatio: { type: Number, required: false, default: null },
  volumeTrend: { type: String, required: false, default: null },
  
  // Price action metrics
  currentPrice: { type: Number, required: false, default: null },
  priceChange1m: { type: Number, required: false, default: null },
  priceChange3m: { type: Number, required: false, default: null },
  priceChange5m: { type: Number, required: false, default: null },
  
  // Volatility metrics
  volatility5: { type: Number, required: false, default: null },
  trueRange: { type: Number, required: false, default: null },
  
  // Support/resistance levels
  support: { type: Number, required: false, default: null },
  resistance: { type: Number, required: false, default: null },
  
  // Market microstructure
  tickDirection: { type: String, required: false, default: null },
  
  // Advanced signals
  squeezeMomentum: { type: Number, required: false, default: null },
  pressureIndex: { type: Number, required: false, default: null },
  
  // Metadata
  lookbackPeriod: { type: String, required: false, default: '60 candles (1 hour)' },
  closePrice: { type: Number, required: true },
  date: { type: Date, required: true },
});

const MicroTermModel = mongoose.model<MicroTermDocument>("micro-term-items", MicroTermSchema);

export {
  MicroTermModel,
  IMicroTermDto,
  MicroTermDocument,
  IMicroTermRow,
};