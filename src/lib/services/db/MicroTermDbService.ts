import { log } from "pinolog";
import BaseCRUD from "../../common/BaseCRUD";
import {
  IMicroTermDto,
  IMicroTermRow,
  MicroTermModel,
} from "../../../schema/MicroTerm.schema";

export class MicroTermDbService extends BaseCRUD(MicroTermModel) {
  public async create(dto: IMicroTermDto): Promise<IMicroTermRow> {
    log("microTermDbService create", {
      dto,
    });
    return await super.create(dto);
  };

  public async update(id: string, dto: IMicroTermDto): Promise<IMicroTermRow> {
    log("microTermDbService update", {
      dto,
      id,
    });
    return await super.update(id, dto);
  };

  public async findAll(filterData: object = {}): Promise<IMicroTermRow[]> {
    log("microTermDbService findAll", {
      filterData,
    });
    return await super.findAll(filterData);
  }

  public async findById(id: string): Promise<IMicroTermRow> {
    log("microTermDbService findById", {
      id,
    });
    return await super.findById(id);
  }

  public async findLastBySymbol(symbol: string): Promise<IMicroTermRow | null> {
    log("microTermDbService findLastBySymbol", {
      symbol,
    });
    return await super.findByFilter({ symbol }, { date: -1 });
  }
}

export default MicroTermDbService;