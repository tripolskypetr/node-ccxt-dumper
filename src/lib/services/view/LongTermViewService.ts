import { log } from "pinolog";
import { inject } from "../../core/di";
import { TYPES } from "../../core/types";
import LongTermDbService from "../db/LongTermDbService";

export class LongTermViewService {
  private readonly longTermDbService: LongTermDbService =
    inject<LongTermDbService>(TYPES.longTermDbService);

  public getData = async (
    symbol: string,
    limit: number = 100,
    offset: number = 0
  ) => {
    log("longTermViewService getData called", {
      symbol,
      limit,
      offset,
    });

    const result = await this.longTermDbService.paginate(
      { symbol },
      { limit, offset },
      { date: -1 }
    );

    log("longTermViewService returning data", {
      count: result.rows.length,
      total: result.total,
    });

    return result;
  };

  public getRange = async (
    symbol: string,
    startDate: number,
    endDate: number,
    limit: number = 100,
    offset: number = 0
  ) => {
    log("longTermViewService getRange called", {
      symbol,
      startDate,
      endDate,
      limit,
      offset,
    });

    const result = await this.longTermDbService.paginate(
      {
        symbol,
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
      { limit, offset },
      { date: -1 }
    );

    log("longTermViewService returning range data", {
      count: result.rows.length,
      total: result.total,
    });

    return result;
  };
}

export default LongTermViewService;
