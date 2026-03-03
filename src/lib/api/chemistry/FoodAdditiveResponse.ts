export interface FoodAdditiveSubstanceDto {
  compoundCid: number
  name: string
  synonyms: string | null | undefined
  molecularWeight: string | null | undefined
  molecularFormula: string | null | undefined
  polarArea: number | null | undefined
  complexity: number | null | undefined
  xlogp: number | null | undefined
  heavyAtomCount: number | null | undefined
  hBondDonorCount: number | null | undefined
  hBondAcceptorCount: number | null | undefined
  rotatableBondCount: number | null | undefined
  inchi: string | null | undefined
  smiles: string | null | undefined
  inchiKey: string | null | undefined
  iupacName: string | null | undefined
  exactMass: number | null | undefined
  monoisotopicMass: number | null | undefined
  charge: number | null | undefined
  covalentUnitCount: number | null | undefined
  isotopicAtomCount: number | null | undefined
  totalAtomStereoCount: number | null | undefined
  definedAtomStereoCount: number | null | undefined
  undefinedAtomStereoCount: number | null | undefined
  totalBondStereoCount: number | null | undefined
  definedBondStereoCount: number | null | undefined
  undefinedBondStereoCount: number | null | undefined
  linkedPubChemLiteratureCount: number | null | undefined
  linkedPubChemPatentCount: number | null | undefined
  linkedPubChemPatentFamilyCount: number | null | undefined
  meshHeadings: string | null | undefined
  annotationContent: string | null | undefined
  annotationTypeCount: number | null | undefined
  linkedBioAssays: number | null | undefined
  createDate: string | Date | null | undefined
  dataSource: string | null | undefined
  dataSourceCategory: string | null | undefined
  taggedByPubChem: string | null | undefined
}

export type FoodAdditiveSubstanceResponseDto = FoodAdditiveSubstanceDto[]
