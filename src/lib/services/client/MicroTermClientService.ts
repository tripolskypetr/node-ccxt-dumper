import { inject } from "../../core/di";
import MicroTermMathService from "../math/MicroTermMathService";
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

type IMicroTermMathService = {
    [key in keyof MicroTermMathService]: any
}

type TMicroTermMathService = Omit<
  IMicroTermMathService,
  keyof {
    exchangeService: never;
  }
>;

const REQUEST_MESSAGE = `${WorkerName.MicroTermWorker}_request` as const;
const RESPONSE_MESSAGE = `${WorkerName.MicroTermWorker}_response` as const;

const REQUEST_TIMEOUT = 60 * 1_000; // 1 minute for ultra-fast micro term

interface IMicroTermRequestMessage {
  topic: typeof REQUEST_MESSAGE;
  data: {
    requestId: string;
    methodName: string;
    symbol: string;
  };
}

interface IMicroTermResponseMessage {
  topic: typeof RESPONSE_MESSAGE;
  data: {
    requestId: string;
    result: any;
  };
}

type Data = ReturnType<MicroTermMathService["getMicroTermAnalysis"]>;

export class MicroTermClientService implements TMicroTermMathService {
  private readonly microTermMathService = inject<MicroTermMathService>(
    TYPES.microTermMathService
  );
  private readonly bootstrapService = inject<BootstrapService>(
    TYPES.bootstrapService
  );

  public generateMicroTermReport = async (symbol: string) => {
    const requestId = randomString();
    this.bootstrapService.broadcast(REQUEST_MESSAGE, {
      requestId,
      methodName: "generateMicroTermReport",
      symbol,
    });
    const result = await waitForNext<IMicroTermResponseMessage>(
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
      throw new Error("microTermClientService generateMicroTermReport timeout");
    }
    return result.data.result;
  };

  public getMicroTermAnalysis = async (symbol: string): Promise<Data> => {
    const requestId = randomString();
    this.bootstrapService.broadcast(REQUEST_MESSAGE, {
      requestId,
      methodName: "getMicroTermAnalysis",
      symbol,
    });
    const result = await waitForNext<IMicroTermResponseMessage>(
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
      throw new Error("microTermClientService getMicroTermAnalysis timeout");
    }
    return result.data.result;
  };

  protected init = singleshot(() => {
    if (!this.bootstrapService.isMicroTermWorker) {
      return;
    }
    this.bootstrapService.listen<IMicroTermRequestMessage>(
      REQUEST_MESSAGE,
      async ({ methodName, requestId, symbol }) => {
        if (methodName === "generateMicroTermReport") {
          this.bootstrapService.broadcast<IMicroTermResponseMessage>(
            RESPONSE_MESSAGE,
            {
              requestId,
              result:
                await this.microTermMathService.generateMicroTermReport(symbol),
            }
          );
        }
        if (methodName === "getMicroTermAnalysis") {
          this.bootstrapService.broadcast<IMicroTermResponseMessage>(
            RESPONSE_MESSAGE,
            {
              requestId,
              result:
                await this.microTermMathService.getMicroTermAnalysis(symbol),
            }
          );
        }
      }
    );
  });
}

export default MicroTermClientService;