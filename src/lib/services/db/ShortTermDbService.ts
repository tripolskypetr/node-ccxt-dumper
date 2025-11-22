import { log } from "pinolog";
import BaseCRUD from "../../common/BaseCRUD";
import {
  IShortTermDto,
  IShortTermRow,
  ShortTermModel,
} from "../../../schema/ShortTerm.schema";

export class ShortTermDbService extends BaseCRUD(ShortTermModel) {
  public async create(dto: IShortTermDto): Promise<IShortTermRow> {
    log("shortTermDbService create", {
      dto,
    });
    return await super.create(dto);
  };

  public async update(id: string, dto: IShortTermDto): Promise<IShortTermRow> {
    log("shortTermDbService update", {
      dto,
      id,
    });
    return await super.update(id, dto);
  };

  public async findAll(filterData: object = {}): Promise<IShortTermRow[]> {
    log("shortTermDbService findAll", {
      filterData,
    });
    return await super.findAll(filterData);
  }

  public async findById(id: string): Promise<IShortTermRow> {
    log("shortTermDbService findById", {
      id,
    });
    return await super.findById(id);
  }

  public async findLastBySymbol(symbol: string): Promise<IShortTermRow | null> {
    log("shortTermDbService findLastBySymbol", {
      symbol,
    });
    return await super.findByFilter({ symbol }, { date: -1 });
  }
}

export default ShortTermDbService;
