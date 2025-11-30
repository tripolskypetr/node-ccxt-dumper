import { log } from "pinolog";
import BaseCRUD from "../../common/BaseCRUD";
import {
  ICandleDataDto,
  ICandleDataRow,
  CandleDataModel,
} from "../../../schema/CandleData.schema";

export class CandleDataDbService extends BaseCRUD(CandleDataModel) {
  public async create(dto: ICandleDataDto): Promise<ICandleDataRow> {
    log("candleDataDbService create", {
      dto,
    });
    return await super.create(dto);
  }

  public async update(
    id: string,
    dto: ICandleDataDto
  ): Promise<ICandleDataRow> {
    log("candleDataDbService update", {
      dto,
      id,
    });
    return await super.update(id, dto);
  }

  public async findAll(
    filterData: object,
    sort = { timestamp: -1 },
    pagination = { limit: 200 }
  ): Promise<ICandleDataRow[]> {
    log("candleDataDbService findAll", {
      filterData,
      sort,
      pagination,
    });
    return await super.findAll(filterData, sort, pagination);
  }

  public async findByFilter(
    filterData: object,
    sort = { timestamp: -1 }
  ): Promise<any> {
    log("candleDataDbService findByFilter", {
      filterData,
    });
    return await super.findByFilter(filterData, sort);
  }

  public async findById(id: string): Promise<ICandleDataRow> {
    log("candleDataDbService findById", {
      id,
    });
    return await super.findById(id);
  }
}

export default CandleDataDbService;
