import { inject } from "../../core/di";
import SwingTermMathService from "../math/SwingTermMathService";
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

type ISwingTermMathService = {
    [key in keyof SwingTermMathService]: any
}

type TSwingTermMathService = Omit<
  ISwingTermMathService,
  keyof {
    exchangeService: never;
    swingTermHistoryService: never;
  }
>;

type Data = ReturnType<SwingTermMathService["getSwingTermAnalysis"]>

const REQUEST_MESSAGE = `${WorkerName.SwingTermWorker}_request` as const;
const RESPONSE_MESSAGE = `${WorkerName.SwingTermWorker}_response` as const;

const REQUEST_TIMEOUT = 2 * 60 * 1_000;

interface ISwingTermRequestMessage {
  topic: typeof REQUEST_MESSAGE;
  data: {
    requestId: string;
    methodName: string;
    symbol: string;
  };
}

interface ISwingTermResponseMessage {
  topic: typeof RESPONSE_MESSAGE;
  data: {
    requestId: string;
    result: any;
  };
}

export class SwingTermClientService implements TSwingTermMathService {
  private readonly swingTermMathService = inject<SwingTermMathService>(
    TYPES.swingTermMathService
  );
  private readonly bootstrapService = inject<BootstrapService>(
    TYPES.bootstrapService
  );

  public generateSwingTermReport = async (symbol: string) => {
    log("swingTermClientService generateSwingTermReport", { symbol });
    const requestId = randomString();
    this.bootstrapService.broadcast(REQUEST_MESSAGE, {
      requestId,
      methodName: "generateSwingTermReport",
      symbol,
    });
    const result = await waitForNext<ISwingTermResponseMessage>(
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
      throw new Error("swingTermClientService generateSwingTermReport timeout");
    }
    return result.data.result;
  };

  public getSwingTermAnalysis = async (symbol: string): Promise<Data> => {
    log("swingTermClientService getSwingTermAnalysis", { symbol });
    const requestId = randomString();
    this.bootstrapService.broadcast(REQUEST_MESSAGE, {
      requestId,
      methodName: "getSwingTermAnalysis",
      symbol,
    });
    const result = await waitForNext<ISwingTermResponseMessage>(
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
      throw new Error("swingTermClientService getSwingTermAnalysis timeout");
    }
    return result.data.result;
  };

  protected init = singleshot(() => {
    if (!this.bootstrapService.isSwingTermWorker) {
      return;
    }
    this.bootstrapService.listen<ISwingTermRequestMessage>(
      REQUEST_MESSAGE,
      async ({ methodName, requestId, symbol }) => {
        if (methodName === "generateSwingTermReport") {
          this.bootstrapService.broadcast<ISwingTermResponseMessage>(
            RESPONSE_MESSAGE,
            {
              requestId,
              result:
                await this.swingTermMathService.generateSwingTermReport(symbol),
            }
          );
        }
        if (methodName === "getSwingTermAnalysis") {
          this.bootstrapService.broadcast<ISwingTermResponseMessage>(
            RESPONSE_MESSAGE,
            {
              requestId,
              result:
                await this.swingTermMathService.getSwingTermAnalysis(symbol),
            }
          );
        }
      }
    );
  });
}

export default SwingTermClientService;