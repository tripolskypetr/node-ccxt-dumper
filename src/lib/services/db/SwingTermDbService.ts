import { log } from "pinolog";
import BaseCRUD from "../../common/BaseCRUD";
import {
  ISwingTermDto,
  ISwingTermRow,
  SwingTermModel,
} from "../../../schema/SwingTerm.schema";

export class SwingTermDbService extends BaseCRUD(SwingTermModel) {
  public async create(dto: ISwingTermDto): Promise<ISwingTermRow> {
    log("swingTermDbService create", {
      dto,
    });
    return await super.create(dto);
  };

  public async update(id: string, dto: ISwingTermDto): Promise<ISwingTermRow> {
    log("swingTermDbService update", {
      dto,
      id,
    });
    return await super.update(id, dto);
  };

  public async findAll(filterData: object = {}): Promise<ISwingTermRow[]> {
    log("swingTermDbService findAll", {
      filterData,
    });
    return await super.findAll(filterData);
  }

  public async findById(id: string): Promise<ISwingTermRow> {
    log("swingTermDbService findById", {
      id,
    });
    return await super.findById(id);
  }

  public async findLastBySymbol(symbol: string): Promise<ISwingTermRow | null> {
    log("swingTermDbService findLastBySymbol", {
      symbol,
    });
    return await super.findByFilter({ symbol }, { date: -1 });
  }
}

export default SwingTermDbService;
