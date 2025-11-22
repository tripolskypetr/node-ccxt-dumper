import { inject } from "../../core/di";
import SlopeDataMathService from "../math/SlopeDataMathService";
import { TYPES } from "../../core/types";
import {
  randomString,
  singleshot,
  TIMEOUT_SYMBOL,
  waitForNext,
} from "functools-kit";
import BootstrapService from "../base/BootstrapService";
import { WorkerName } from "../../../enum/WorkerName";
import { log } from "pinolog";

type ISlopeDataMathService = {
    [key in keyof SlopeDataMathService]: any
}

type TSlopeDataMathService = Omit<
  ISlopeDataMathService,
  keyof {
    exchangeService: never;
  }
>;

const REQUEST_MESSAGE = `${WorkerName.SlopeDataWorker}_request` as const;
const RESPONSE_MESSAGE = `${WorkerName.SlopeDataWorker}_response` as const;

const REQUEST_TIMEOUT = 2 * 60 * 1_000;

interface ISlopeDataRequestMessage {
  topic: typeof REQUEST_MESSAGE;
  data: {
    requestId: string;
    methodName: string;
    symbol: string;
    prices?: number[];
    volumes?: number[];
  };
}

interface ISlopeDataResponseMessage {
  topic: typeof RESPONSE_MESSAGE;
  data: {
    requestId: string;
    result: any;
  };
}

type Data = ReturnType<SlopeDataMathService["getSlopeData"]>

export class SlopeDataClientService implements TSlopeDataMathService {
  private readonly slopeDataMathService = inject<SlopeDataMathService>(
    TYPES.slopeDataMathService
  );
  private readonly bootstrapService = inject<BootstrapService>(
    TYPES.bootstrapService
  );

  public generateSlopeDataReport = async (symbol: string) => {
    log("slopeDataClientService generateSlopeDataReport", { symbol });
    const requestId = randomString();
    this.bootstrapService.broadcast(REQUEST_MESSAGE, {
      requestId,
      methodName: "generateSlopeDataReport",
      symbol,
    });
    const result = await waitForNext<ISlopeDataResponseMessage>(
      this.bootstrapService.getMessageSubject(RESPONSE_MESSAGE),
      ({ data }) => {
        if (data.requestId !== requestId) {
          return false;
        }
        return true;
      },
      REQUEST_TIMEOUT
    );
    if (result === TIMEOUT_SYMBOL) {
      throw new Error("slopeDataClientService generateSlopeDataReport timeout");
    }
    return result.data.result;
  };

  public computeSlope = async (prices: number[], volumes: number[]) => {
    log("slopeDataClientService computeSlope", { pricesLength: prices.length, volumesLength: volumes.length });
    const requestId = randomString();
    this.bootstrapService.broadcast(REQUEST_MESSAGE, {
      requestId,
      methodName: "computeSlope",
      symbol: "",
      prices,
      volumes,
    });
    const result = await waitForNext<ISlopeDataResponseMessage>(
      this.bootstrapService.getMessageSubject(RESPONSE_MESSAGE),
      ({ data }) => {
        if (data.requestId !== requestId) {
          return false;
        }
        return true;
      },
      REQUEST_TIMEOUT
    );
    if (result === TIMEOUT_SYMBOL) {
      throw new Error("slopeDataClientService computeSlope timeout");
    }
    return result.data.result;
  };

  public getSlopeData = async (symbol: string): Promise<Data> => {
    log("slopeDataClientService getSlopeData", { symbol });
    const requestId = randomString();
    this.bootstrapService.broadcast(REQUEST_MESSAGE, {
      requestId,
      methodName: "getSlopeData",
      symbol,
    });
    const result = await waitForNext<ISlopeDataResponseMessage>(
      this.bootstrapService.getMessageSubject(RESPONSE_MESSAGE),
      ({ data }) => {
        if (data.requestId !== requestId) {
          return false;
        }
        return true;
      },
      REQUEST_TIMEOUT
    );
    if (result === TIMEOUT_SYMBOL) {
      throw new Error("slopeDataClientService getSlopeData timeout");
    }
    return result.data.result;
  };

  protected init = singleshot(() => {
    if (!this.bootstrapService.isSlopeDataWorker) {
      return;
    }
    this.bootstrapService.listen<ISlopeDataRequestMessage>(
      REQUEST_MESSAGE,
      async ({ methodName, requestId, symbol, prices, volumes }) => {
        if (methodName === "generateSlopeDataReport") {
          this.bootstrapService.broadcast<ISlopeDataResponseMessage>(
            RESPONSE_MESSAGE,
            {
              requestId,
              result:
                await this.slopeDataMathService.generateSlopeDataReport(symbol),
            }
          );
        }
        if (methodName === "computeSlope") {
          this.bootstrapService.broadcast<ISlopeDataResponseMessage>(
            RESPONSE_MESSAGE,
            {
              requestId,
              result:
                await this.slopeDataMathService.computeSlope(prices!, volumes!),
            }
          );
        }
        if (methodName === "getSlopeData") {
          this.bootstrapService.broadcast<ISlopeDataResponseMessage>(
            RESPONSE_MESSAGE,
            {
              requestId,
              result:
                await this.slopeDataMathService.getSlopeData(symbol),
            }
          );
        }
      }
    );
  });
}

export default SlopeDataClientService;