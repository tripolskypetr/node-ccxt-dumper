import { inject } from "../../core/di";
import LongTermMathService from "../math/LongTermMathService";
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

type ILongTermMathService = {
    [key in keyof LongTermMathService]: any
}

type TLongTermMathService = Omit<
  ILongTermMathService,
  keyof {
    exchangeService: never;
    longTermHistoryService: never;
  }
>;

const REQUEST_MESSAGE = `${WorkerName.LongTermWorker}_request` as const;
const RESPONSE_MESSAGE = `${WorkerName.LongTermWorker}_response` as const;

const REQUEST_TIMEOUT = 2 * 60 * 1_000;

interface ILongTermRequestMessage {
  topic: typeof REQUEST_MESSAGE;
  data: {
    requestId: string;
    methodName: string;
    symbol: string;
  };
}

interface ILongTermResponseMessage {
  topic: typeof RESPONSE_MESSAGE;
  data: {
    requestId: string;
    result: any;
  };
}

type Data = ReturnType<LongTermMathService["getLongTermAnalysis"]>;

export class LongTermClientService implements TLongTermMathService {
  private readonly longTermMathService = inject<LongTermMathService>(
    TYPES.longTermMathService
  );
  private readonly bootstrapService = inject<BootstrapService>(
    TYPES.bootstrapService
  );

  public generateLongTermReport = async (symbol: string) => {
    log("longTermClientService generateLongTermReport", { symbol });
    const requestId = randomString();
    this.bootstrapService.broadcast(REQUEST_MESSAGE, {
      requestId,
      methodName: "generateLongTermReport",
      symbol,
    });
    const result = await waitForNext<ILongTermResponseMessage>(
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
      throw new Error("longTermClientService generateLongTermReport timeout");
    }
    return result.data.result;
  };

  public getLongTermAnalysis = async (
    symbol: string
  ): Promise<Data> => {
    log("longTermClientService getLongTermAnalysis", { symbol });
    const requestId = randomString();
    this.bootstrapService.broadcast(REQUEST_MESSAGE, {
      requestId,
      methodName: "getLongTermAnalysis",
      symbol,
    });
    const result = await waitForNext<ILongTermResponseMessage>(
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
      throw new Error("longTermClientService getLongTermAnalysis timeout");
    }
    return result.data.result;
  };

  protected init = singleshot(() => {
    if (!this.bootstrapService.isLongTermWorker) {
      return;
    }
    this.bootstrapService.listen<ILongTermRequestMessage>(
      REQUEST_MESSAGE,
      async ({ methodName, requestId, symbol }) => {
        if (methodName === "generateLongTermReport") {
          this.bootstrapService.broadcast<ILongTermResponseMessage>(
            RESPONSE_MESSAGE,
            {
              requestId,
              result:
                await this.longTermMathService.generateLongTermReport(symbol),
            }
          );
        }
        if (methodName === "getLongTermAnalysis") {
          this.bootstrapService.broadcast<ILongTermResponseMessage>(
            RESPONSE_MESSAGE,
            {
              requestId,
              result:
                await this.longTermMathService.getLongTermAnalysis(symbol),
            }
          );
        }
      }
    );
  });
}

export default LongTermClientService;