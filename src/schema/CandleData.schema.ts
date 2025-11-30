import { CandleInterval } from "backtest-kit";
import mongoose, { Document, Schema } from "mongoose";
import ICandleData from "../model/Candle.model";

interface ICandleDataDto extends ICandleData {
  symbol: string;
  timestamp: number;
  interval: CandleInterval,
}

interface CandleDataDocument extends ICandleDataDto, Document {}

interface ICandleDataRow extends ICandleDataDto {
  id: string;
}

const CandleDataSchema: Schema<CandleDataDocument> = new Schema({
  symbol: { type: String, required: true },
  timestamp: { type: Number, required: true },
  interval: { type: String, required: true },
  open: { type: Number, required: true },
  high: { type: Number, required: true },
  low: { type: Number, required: true },
  close: { type: Number, required: true },
  volume: { type: Number, required: true },
});

const CandleDataModel = mongoose.model<CandleDataDocument>("candle-data-items", CandleDataSchema);

export {
  CandleDataModel,
  ICandleDataDto,
  CandleDataDocument,
  ICandleDataRow,
};
