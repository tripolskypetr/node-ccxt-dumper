import { log } from "pinolog";
import { inject } from "../../core/di";
import { TYPES } from "../../core/types";
import ShortTermDbService from "../db/ShortTermDbService";

export class ShortTermViewService {
  private readonly shortTermDbService: ShortTermDbService =
    inject<ShortTermDbService>(TYPES.shortTermDbService);

  public getData = async (
    symbol: string,
    limit: number = 100,
    offset: number = 0
  ) => {
    log("shortTermViewService getData called", {
      symbol,
      limit,
      offset,
    });

    const result = await this.shortTermDbService.paginate(
      { symbol },
      { limit, offset },
      { date: -1 }
    );

    log("shortTermViewService returning data", {
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
    log("shortTermViewService getRange called", {
      symbol,
      startDate,
      endDate,
      limit,
      offset,
    });

    const result = await this.shortTermDbService.paginate(
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

    log("shortTermViewService returning range data", {
      count: result.rows.length,
      total: result.total,
    });

    return result;
  };
}

export default ShortTermViewService;
