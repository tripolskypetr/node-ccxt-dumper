export interface ICandleData {
  /** Unix timestamp in milliseconds when candle opened */
  timestamp: number;
  /** Opening price at candle start */
  open: number;
  /** Highest price during candle period */
  high: number;
  /** Lowest price during candle period */
  low: number;
  /** Closing price at candle end */
  close: number;
  /** Trading volume during candle period */
  volume: number;
}

export default ICandleData;
