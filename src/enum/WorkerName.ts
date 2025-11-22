export enum WorkerName {
  LongTermWorker = "long_term",
  SwingTermWorker = "swing_term",
  ShortTermWorker = "short_term",
  MicroTermWorker = "micro_term",
  SlopeDataWorker = "slope_data",
  VolumeDataWorker = "volume_data",
}

Object.assign(globalThis, { WorkerName });
