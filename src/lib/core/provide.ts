// Base services
import BootstrapService from "../services/base/BootstrapService";
import ErrorService from "../services/base/ErrorService";
import ExchangeService from "../services/base/ExchangeService";
import MongoService from "../services/base/MongoService";

// Math services
import LongTermMathService from "../services/math/LongTermMathService";
import MicroTermMathService from "../services/math/MicroTermMathService";
import ShortTermMathService from "../services/math/ShortTermMathService";
import SlopeDataMathService from "../services/math/SlopeDataMathService";
import SwingTermMathService from "../services/math/SwingTermMathService";
import VolumeDataMathService from "../services/math/VolumeDataMathService";

// Client services
import LongTermClientService from "../services/client/LongTermClientService";
import MicroTermClientService from "../services/client/MicroTermClientService";
import ShortTermClientService from "../services/client/ShortTermClientService";
import SlopeDataClientService from "../services/client/SlopeDataClientService";
import SwingTermClientService from "../services/client/SwingTermClientService";
import VolumeDataClientService from "../services/client/VolumeDataClientService";

// DB services
import LongTermDbService from "../services/db/LongTermDbService";
import MicroTermDbService from "../services/db/MicroTermDbService";
import ShortTermDbService from "../services/db/ShortTermDbService";
import SwingTermDbService from "../services/db/SwingTermDbService";
import CandleDataDbService from "../services/db/CandleDataDbService";

// History services
import FifteenMinuteCandleHistoryService from "../services/history/FifteenMinuteCandleHistoryService";
import HourCandleHistoryService from "../services/history/HourCandleHistoryService";
import LongTermHistoryService from "../services/history/LongTermHistoryService";
import MicroTermHistoryService from "../services/history/MicroTermHistoryService";
import OneMinuteCandleHistoryService from "../services/history/OneMinuteCandleHistoryService";
import ShortTermHistoryService from "../services/history/ShortTermHistoryService";
import SwingTermHistoryService from "../services/history/SwingTermHistoryService";
import ThirtyMinuteCandleHistoryService from "../services/history/ThirtyMinuteCandleHistoryService";

// Job services
import CommonJobService from "../services/job/CommonJobService";

// View services
import CandleViewService from "../services/view/CandleViewService";

import { provide } from "./di";
import { TYPES } from "./types";

// Base services
{
    provide(TYPES.bootstrapService, () => new BootstrapService());
    provide(TYPES.errorService, () => new ErrorService());
    provide(TYPES.exchangeService, () => new ExchangeService());
    provide(TYPES.mongoService, () => new MongoService());
}

// Math services
{
    provide(TYPES.longTermMathService, () => new LongTermMathService());
    provide(TYPES.microTermMathService, () => new MicroTermMathService());
    provide(TYPES.shortTermMathService, () => new ShortTermMathService());
    provide(TYPES.slopeDataMathService, () => new SlopeDataMathService());
    provide(TYPES.swingTermMathService, () => new SwingTermMathService());
    provide(TYPES.volumeDataMathService, () => new VolumeDataMathService());
}

// Client services
{
    provide(TYPES.longTermClientService, () => new LongTermClientService());
    provide(TYPES.microTermClientService, () => new MicroTermClientService());
    provide(TYPES.shortTermClientService, () => new ShortTermClientService());
    provide(TYPES.slopeDataClientService, () => new SlopeDataClientService());
    provide(TYPES.swingTermClientService, () => new SwingTermClientService());
    provide(TYPES.volumeDataClientService, () => new VolumeDataClientService());
}

// DB services
{
    provide(TYPES.longTermDbService, () => new LongTermDbService());
    provide(TYPES.microTermDbService, () => new MicroTermDbService());
    provide(TYPES.shortTermDbService, () => new ShortTermDbService());
    provide(TYPES.swingTermDbService, () => new SwingTermDbService());
    provide(TYPES.candleDataDbService, () => new CandleDataDbService());
}

// History services
{
    provide(TYPES.fifteenMinuteCandleHistoryService, () => new FifteenMinuteCandleHistoryService());
    provide(TYPES.hourCandleHistoryService, () => new HourCandleHistoryService());
    provide(TYPES.longTermHistoryService, () => new LongTermHistoryService());
    provide(TYPES.microTermHistoryService, () => new MicroTermHistoryService());
    provide(TYPES.oneMinuteCandleHistoryService, () => new OneMinuteCandleHistoryService());
    provide(TYPES.shortTermHistoryService, () => new ShortTermHistoryService());
    provide(TYPES.swingTermHistoryService, () => new SwingTermHistoryService());
    provide(TYPES.thirtyMinuteCandleHistoryService, () => new ThirtyMinuteCandleHistoryService());
}

// Job services
{
    provide(TYPES.commonJobService, () => new CommonJobService());
}

// View services
{
    provide(TYPES.candleViewService, () => new CandleViewService());
}
