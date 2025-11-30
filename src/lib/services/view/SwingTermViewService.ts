import { log } from "pinolog";
import { inject } from "../../core/di";
import { TYPES } from "../../core/types";
import SwingTermDbService from "../db/SwingTermDbService";

export class SwingTermViewService {
  private readonly swingTermDbService: SwingTermDbService =
    inject<SwingTermDbService>(TYPES.swingTermDbService);

  public getData = async (
    symbol: string,
    limit: number = 100,
    offset: number = 0
  ) => {
    log("swingTermViewService getData called", {
      symbol,
      limit,
      offset,
    });

    const result = await this.swingTermDbService.paginate(
      { symbol },
      { limit, offset },
      { date: -1 }
    );

    log("swingTermViewService returning data", {
      count: result.rows.length,
      total: result.total,
    });

    return result;
  };
}

export default SwingTermViewService;
