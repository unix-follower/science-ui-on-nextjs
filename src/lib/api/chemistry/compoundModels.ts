import { Node, Edge, Point2dDto, Point3dDto } from "@/lib/api/models/commonModels"

export interface ChemistryGraphResponse {
  totalCompounds: number
  totalElements: number
  totalEdges: number
  nodes: Node[]
  edges: Edge[]
}

export interface AtomDto {
  id: string | null
  index: number
  bondCount: number
  charge: number | null
  implicitHydrogenCount: number | null
  totalHydrogenCount: number | null
  mapIdx: number
  atomicNumber: number | null
  atomTypeName: string | null
  bondOrderSum: number | null
  covalentRadius: number | null
  exactMass: number | null
  formalCharge: number | null
  formalNeighbourCount: number | null
  massNumber: number | null
  naturalAbundance: number | null
  symbol: string
  valency: number | null
  hybridization: string | null
  maxBondOrder: string | null
  point2d: Point2dDto | null
  point3d: Point3dDto | null
  fractionalPoint3d: Point3dDto | null
  flags: boolean[]
  properties: Record<string, unknown>
}

export interface BondDto {
  id: string | null
  index: number
  fromAtomIndex: number | null
  toAtomIndex: number | null
  atomCount: number
  isAromatic: boolean
  isInRing: boolean
  electronCount: number | null
  bondOrder: string | null
  stereo: string | null
  bond2DCenter: Point2dDto | null
  bond3DCenter: Point3dDto | null
  flags: boolean[]
  properties: Record<string, unknown>
}

export interface ElectronDto {
  id: string | null
  electronCount: number | null
  flags: boolean[]
  properties: Record<string, unknown>
}

export interface CompoundSDFDataResponse {
  id: string
  title: string
  atoms: AtomDto[]
  bonds: BondDto[]
  singleElectrons: ElectronDto[]
  electrons: ElectronDto[]
  flags: boolean[]
  properties: Record<string, unknown>
}
