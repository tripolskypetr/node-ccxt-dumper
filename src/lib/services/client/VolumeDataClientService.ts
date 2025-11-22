import { inject } from "../../core/di";
import VolumeDataMathService from "../math/VolumeDataMathService";
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
import LongTermMathService from "../math/LongTermMathService";

type IVolumeDataMathService = {
    [key in keyof VolumeDataMathService]: any
}

type TVolumeDataMathService = Omit<
  IVolumeDataMathService,
  keyof {
    exchangeService: never;
  }
>;

const REQUEST_MESSAGE = `${WorkerName.VolumeDataWorker}_request` as const;
const RESPONSE_MESSAGE = `${WorkerName.VolumeDataWorker}_response` as const;

const REQUEST_TIMEOUT = 2 * 60 * 1_000;

interface IVolumeDataRequestMessage {
  topic: typeof REQUEST_MESSAGE;
  data: {
    requestId: string;
    methodName: string;
    symbol: string;
  };
}

interface IVolumeDataResponseMessage {
  topic: typeof RESPONSE_MESSAGE;
  data: {
    requestId: string;
    result: any;
  };
}

type Data = ReturnType<VolumeDataMathService["getVolumeDataAnalysis"]>;

export class VolumeDataClientService implements TVolumeDataMathService {
  private readonly volumeDataMathService = inject<VolumeDataMathService>(
    TYPES.volumeDataMathService
  );
  private readonly bootstrapService = inject<BootstrapService>(
    TYPES.bootstrapService
  );

  public generateVolumeDataReport = async (symbol: string) => {
    log("volumeDataClientService generateVolumeDataReport", { symbol });
    const requestId = randomString();
    this.bootstrapService.broadcast(REQUEST_MESSAGE, {
      requestId,
      methodName: "generateVolumeDataReport",
      symbol,
    });
    const result = await waitForNext<IVolumeDataResponseMessage>(
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
      throw new Error("volumeDataClientService generateVolumeDataReport timeout");
    }
    return result.data.result;
  };

  public getVolumeDataAnalysis = async (symbol: string): Promise<Data> => {
    log("volumeDataClientService getVolumeDataAnalysis", { symbol });
    const requestId = randomString();
    this.bootstrapService.broadcast(REQUEST_MESSAGE, {
      requestId,
      methodName: "getVolumeDataAnalysis",
      symbol,
    });
    const result = await waitForNext<IVolumeDataResponseMessage>(
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
      throw new Error("volumeDataClientService getVolumeDataAnalysis timeout");
    }
    return result.data.result;
  };

  protected init = singleshot(() => {
    if (!this.bootstrapService.isVolumeDataWorker) {
      return;
    }
    this.bootstrapService.listen<IVolumeDataRequestMessage>(
      REQUEST_MESSAGE,
      async ({ methodName, requestId, symbol }) => {
        if (methodName === "generateVolumeDataReport") {
          this.bootstrapService.broadcast<IVolumeDataResponseMessage>(
            RESPONSE_MESSAGE,
            {
              requestId,
              result:
                await this.volumeDataMathService.generateVolumeDataReport(symbol),
            }
          );
        }
        if (methodName === "getVolumeDataAnalysis") {
          this.bootstrapService.broadcast<IVolumeDataResponseMessage>(
            RESPONSE_MESSAGE,
            {
              requestId,
              result:
                await this.volumeDataMathService.getVolumeDataAnalysis(symbol),
            }
          );
        }
      }
    );
  });
}

export default VolumeDataClientService;