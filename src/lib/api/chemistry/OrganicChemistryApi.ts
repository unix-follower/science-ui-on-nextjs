import { FoodAdditiveSubstanceResponseDto } from "./FoodAdditiveResponse"

export default interface OrganicChemistryApi {
  getAllPubChemFoodAdditives(page: number, pageSize: number): Promise<FoodAdditiveSubstanceResponseDto>
}
