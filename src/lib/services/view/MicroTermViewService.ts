import { log } from "pinolog";
import { inject } from "../../core/di";
import { TYPES } from "../../core/types";
import MicroTermDbService from "../db/MicroTermDbService";

export class MicroTermViewService {
  private readonly microTermDbService: MicroTermDbService =
    inject<MicroTermDbService>(TYPES.microTermDbService);

  public getData = async (
    symbol: string,
    limit: number = 100,
    offset: number = 0
  ) => {
    log("microTermViewService getData called", {
      symbol,
      limit,
      offset,
    });

    const result = await this.microTermDbService.paginate(
      { symbol },
      { limit, offset },
      { date: -1 }
    );

    log("microTermViewService returning data", {
      count: result.rows.length,
      total: result.total,
    });

    return result;
  };
}

export default MicroTermViewService;
