export interface Node {
  id: string
  label: string
  properties: { [key: string]: unknown }
}

export interface Edge {
  id: string
  source: string
  target: string
  label: string
  properties: { [key: string]: unknown }
}

export interface Point2dDto {
  x: number
  y: number
}

export interface Point3dDto {
  x: number
  y: number
  z: number
}
