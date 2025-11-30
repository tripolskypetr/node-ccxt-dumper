import "./core/provide";

import { init, inject } from "./core/di";
import { TYPES } from "./core/types";

// Base services
import BootstrapService from "./services/base/BootstrapService";
import ErrorService from "./services/base/ErrorService";
import ExchangeService from "./services/base/ExchangeService";
import MongoService from "./services/base/MongoService";

// Math services
import LongTermMathService from "./services/math/LongTermMathService";
import MicroTermMathService from "./services/math/MicroTermMathService";
import ShortTermMathService from "./services/math/ShortTermMathService";
import SlopeDataMathService from "./services/math/SlopeDataMathService";
import SwingTermMathService from "./services/math/SwingTermMathService";
import VolumeDataMathService from "./services/math/VolumeDataMathService";

// Client services
import LongTermClientService from "./services/client/LongTermClientService";
import MicroTermClientService from "./services/client/MicroTermClientService";
import ShortTermClientService from "./services/client/ShortTermClientService";
import SlopeDataClientService from "./services/client/SlopeDataClientService";
import SwingTermClientService from "./services/client/SwingTermClientService";
import VolumeDataClientService from "./services/client/VolumeDataClientService";

// DB services
import LongTermDbService from "./services/db/LongTermDbService";
import MicroTermDbService from "./services/db/MicroTermDbService";
import ShortTermDbService from "./services/db/ShortTermDbService";
import SwingTermDbService from "./services/db/SwingTermDbService";
import CandleDataDbService from "./services/db/CandleDataDbService";

// History services
import FifteenMinuteCandleHistoryService from "./services/history/FifteenMinuteCandleHistoryService";
import HourCandleHistoryService from "./services/history/HourCandleHistoryService";
import LongTermHistoryService from "./services/history/LongTermHistoryService";
import MicroTermHistoryService from "./services/history/MicroTermHistoryService";
import OneMinuteCandleHistoryService from "./services/history/OneMinuteCandleHistoryService";
import ShortTermHistoryService from "./services/history/ShortTermHistoryService";
import SwingTermHistoryService from "./services/history/SwingTermHistoryService";
import ThirtyMinuteCandleHistoryService from "./services/history/ThirtyMinuteCandleHistoryService";

// Job services
import CommonJobService from "./services/job/CommonJobService";

// View services
import CandleViewService from "./services/view/CandleViewService";
import LongTermViewService from "./services/view/LongTermViewService";
import MicroTermViewService from "./services/view/MicroTermViewService";
import ShortTermViewService from "./services/view/ShortTermViewService";
import SwingTermViewService from "./services/view/SwingTermViewService";

// Base services
const baseServices = {
    bootstrapService: inject<BootstrapService>(TYPES.bootstrapService),
    errorService: inject<ErrorService>(TYPES.errorService),
    exchangeService: inject<ExchangeService>(TYPES.exchangeService),
    mongoService: inject<MongoService>(TYPES.mongoService),
}

// Math services
const mathServices = {
    longTermMathService: inject<LongTermMathService>(TYPES.longTermMathService),
    microTermMathService: inject<MicroTermMathService>(TYPES.microTermMathService),
    shortTermMathService: inject<ShortTermMathService>(TYPES.shortTermMathService),
    slopeDataMathService: inject<SlopeDataMathService>(TYPES.slopeDataMathService),
    swingTermMathService: inject<SwingTermMathService>(TYPES.swingTermMathService),
    volumeDataMathService: inject<VolumeDataMathService>(TYPES.volumeDataMathService),
}

// Client services
const clientServices = {
    longTermClientService: inject<LongTermClientService>(TYPES.longTermClientService),
    microTermClientService: inject<MicroTermClientService>(TYPES.microTermClientService),
    shortTermClientService: inject<ShortTermClientService>(TYPES.shortTermClientService),
    slopeDataClientService: inject<SlopeDataClientService>(TYPES.slopeDataClientService),
    swingTermClientService: inject<SwingTermClientService>(TYPES.swingTermClientService),
    volumeDataClientService: inject<VolumeDataClientService>(TYPES.volumeDataClientService),
}

// DB services
const dbServices = {
    candleDataDbService: inject<CandleDataDbService>(TYPES.candleDataDbService),
    longTermDbService: inject<LongTermDbService>(TYPES.longTermDbService),
    microTermDbService: inject<MicroTermDbService>(TYPES.microTermDbService),
    shortTermDbService: inject<ShortTermDbService>(TYPES.shortTermDbService),
    swingTermDbService: inject<SwingTermDbService>(TYPES.swingTermDbService),
}

// History services
const historyServices = {
    fifteenMinuteCandleHistoryService: inject<FifteenMinuteCandleHistoryService>(TYPES.fifteenMinuteCandleHistoryService),
    hourCandleHistoryService: inject<HourCandleHistoryService>(TYPES.hourCandleHistoryService),
    longTermHistoryService: inject<LongTermHistoryService>(TYPES.longTermHistoryService),
    microTermHistoryService: inject<MicroTermHistoryService>(TYPES.microTermHistoryService),
    oneMinuteCandleHistoryService: inject<OneMinuteCandleHistoryService>(TYPES.oneMinuteCandleHistoryService),
    shortTermHistoryService: inject<ShortTermHistoryService>(TYPES.shortTermHistoryService),
    swingTermHistoryService: inject<SwingTermHistoryService>(TYPES.swingTermHistoryService),
    thirtyMinuteCandleHistoryService: inject<ThirtyMinuteCandleHistoryService>(TYPES.thirtyMinuteCandleHistoryService),
}

// Job services
const jobServices = {
    commonJobService: inject<CommonJobService>(TYPES.commonJobService),
}

// View services
const viewServices = {
    candleViewService: inject<CandleViewService>(TYPES.candleViewService),
    longTermViewService: inject<LongTermViewService>(TYPES.longTermViewService),
    microTermViewService: inject<MicroTermViewService>(TYPES.microTermViewService),
    shortTermViewService: inject<ShortTermViewService>(TYPES.shortTermViewService),
    swingTermViewService: inject<SwingTermViewService>(TYPES.swingTermViewService),
}

const signal = {
    ...baseServices,
    ...mathServices,
    ...clientServices,
    ...dbServices,
    ...historyServices,
    ...jobServices,
    ...viewServices,
}

init();

export { signal }

Object.assign(globalThis, { signal });

export default signal;
