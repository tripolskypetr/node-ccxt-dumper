import { inject } from "../../core/di";
import ShortTermMathService from "../math/ShortTermMathService";
import { TYPES } from "../../core/types";
import {
  CANCELED_PROMISE_SYMBOL,
  createAwaiter,
  randomString,
  singleshot,
  TIMEOUT_SYMBOL,
  waitForNext,
} from "functools-kit";
import ExchangeService from "../base/ExchangeService";
import BootstrapService from "../base/BootstrapService";
import { WorkerName } from "../../../enum/WorkerName";

type IShortTermMathService = {
    [key in keyof ShortTermMathService]: any
}

type TShortTermMathService = Omit<
  IShortTermMathService,
  keyof {
    exchangeService: never;
    shortTermHistoryService: never;
  }
>;

const REQUEST_MESSAGE = `${WorkerName.ShortTermWorker}_request` as const;
const RESPONSE_MESSAGE = `${WorkerName.ShortTermWorker}_response` as const;

const REQUEST_TIMEOUT = 2 * 60 * 1_000;

interface IShortTermRequestMessage {
  topic: typeof REQUEST_MESSAGE;
  data: {
    requestId: string;
    methodName: string;
    symbol: string;
  };
}

interface IShortTermResponseMessage {
  topic: typeof RESPONSE_MESSAGE;
  data: {
    requestId: string;
    result: any;
  };
}

type Data = ReturnType<ShortTermMathService["getShortTermAnalysis"]>;

export class ShortTermClientService implements TShortTermMathService {
  private readonly shortTermMathService = inject<ShortTermMathService>(
    TYPES.shortTermMathService
  );
  private readonly bootstrapService = inject<BootstrapService>(
    TYPES.bootstrapService
  );

  public generateShortTermReport = async (symbol: string) => {
    const requestId = randomString();
    this.bootstrapService.broadcast(REQUEST_MESSAGE, {
      requestId,
      methodName: "generateShortTermReport",
      symbol,
    });
    const result = await waitForNext<IShortTermResponseMessage>(
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
      throw new Error("shortTermClientService generateShortTermReport timeout");
    }
    return result.data.result;
  };

  public getShortTermAnalysis = async (symbol: string): Promise<Data> => {
    const requestId = randomString();
    this.bootstrapService.broadcast(REQUEST_MESSAGE, {
      requestId,
      methodName: "getShortTermAnalysis",
      symbol,
    });
    const result = await waitForNext<IShortTermResponseMessage>(
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
      throw new Error("shortTermClientService getShortTermAnalysis timeout");
    }
    return result.data.result;
  };

  protected init = singleshot(() => {
    if (!this.bootstrapService.isShortTermWorker) {
      return;
    }
    this.bootstrapService.listen<IShortTermRequestMessage>(
      REQUEST_MESSAGE,
      async ({ methodName, requestId, symbol }) => {
        if (methodName === "generateShortTermReport") {
          this.bootstrapService.broadcast<IShortTermResponseMessage>(
            RESPONSE_MESSAGE,
            {
              requestId,
              result:
                await this.shortTermMathService.generateShortTermReport(symbol),
            }
          );
        }
        if (methodName === "getShortTermAnalysis") {
          this.bootstrapService.broadcast<IShortTermResponseMessage>(
            RESPONSE_MESSAGE,
            {
              requestId,
              result:
                await this.shortTermMathService.getShortTermAnalysis(symbol),
            }
          );
        }
      }
    );
  });
}

export default ShortTermClientService;
