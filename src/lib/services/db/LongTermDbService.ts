import { log } from "pinolog";
import BaseCRUD from "../../common/BaseCRUD";
import {
  ILongTermDto,
  ILongTermRow,
  LongTermModel,
} from "../../../schema/LongTerm.schema";

export class LongTermDbService extends BaseCRUD(LongTermModel) {
  public async create(dto: ILongTermDto): Promise<ILongTermRow> {
    log("longTermDbService create", {
      dto,
    });
    return await super.create(dto);
  };

  public async update(id: string, dto: ILongTermDto): Promise<ILongTermRow> {
    log("longTermDbService update", {
      dto,
      id,
    });
    return await super.update(id, dto);
  };

  public async findAll(filterData: object = {}): Promise<ILongTermRow[]> {
    log("longTermDbService findAll", {
      filterData,
    });
    return await super.findAll(filterData);
  }

  public async findById(id: string): Promise<ILongTermRow> {
    log("longTermDbService findById", {
      id,
    });
    return await super.findById(id);
  }

  public async findLastBySymbol(symbol: string): Promise<ILongTermRow | null> {
    log("longTermDbService findLastBySymbol", {
      symbol,
    });
    return await super.findByFilter({ symbol }, { date: -1 });
  }
}

export default LongTermDbService;
