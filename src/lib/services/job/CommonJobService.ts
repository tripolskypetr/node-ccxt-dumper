import { TYPES } from "../../core/types";
import { inject } from "../../core/di";
import { log } from "pinolog";
import { not, Operator, singlerun, singleshot, Source } from "functools-kit";
import BootstrapService from "../base/BootstrapService";
import ShortTermHistoryService from "../history/ShortTermHistoryService";
import SwingTermHistoryService from "../history/SwingTermHistoryService";
import LongTermHistoryService from "../history/LongTermHistoryService";
import MicroTermHistoryService from "../history/MicroTermHistoryService";
import { CC_SYMBOL_LIST } from "../../../config/params";

const JOB_INTERVAL = 30 * 1_000;

const SYMBOL_LIST = CC_SYMBOL_LIST.split(",").map((symbol) => symbol.trim());

export class CommonJobService {
  private readonly bootstrapService = inject<BootstrapService>(
    TYPES.bootstrapService
  );
  private readonly shortTermHistoryService = inject<ShortTermHistoryService>(
    TYPES.shortTermHistoryService
  );
  private readonly swingTermHistoryService = inject<SwingTermHistoryService>(
    TYPES.swingTermHistoryService
  );
  private readonly longTermHistoryService = inject<LongTermHistoryService>(
    TYPES.longTermHistoryService
  );
  private readonly microTermHistoryService = inject<MicroTermHistoryService>(
    TYPES.microTermHistoryService
  );

  protected run = async (symbol: string) => {
    log("commonJobService run", {
      symbol,
    });
    {
      await this.shortTermHistoryService.execute(symbol);
      await this.swingTermHistoryService.execute(symbol);
      await this.longTermHistoryService.execute(symbol);
      await this.microTermHistoryService.execute(symbol);
    }
  };

  protected init = singleshot(async () => {
    log("commonJobService init");
    if (this.bootstrapService.isRepl) {
      return;
    }
    if (this.bootstrapService.isNoJob) {
      return;
    }
    if (this.bootstrapService.isWorker) {
      return;
    }
    Source.fromInterval(JOB_INTERVAL)
      .operator(Operator.skip(1))
      .connect(
        singlerun(async () => {
          for (const symbol of SYMBOL_LIST) {
            try {
              await this.run(symbol);
            } catch {
              log(`commonJobService job failed symbol=${symbol}`);
            }
          }
        })
      );
  });
}

export default CommonJobService;
