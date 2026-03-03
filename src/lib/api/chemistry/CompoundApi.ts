import { ChemistryGraphResponse, CompoundSDFDataResponse } from "./compoundModels"

export default interface CompoundApi {
  doPubChemGraphGetAll(page: number, pageSize: number): Promise<ChemistryGraphResponse>

  doPubChemGraphGetCompoundDataByName(name: string, page: number, pageSize: number): Promise<ChemistryGraphResponse>

  doPubChemGetCompoundSDFDataByCid(cid: number): Promise<CompoundSDFDataResponse>
}
