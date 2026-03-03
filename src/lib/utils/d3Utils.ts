import * as d3 from "d3"

export type D3SelectSVGGElement = ReturnType<typeof d3.select<SVGGElement, unknown>>

export type D3SelectSVGSVGElement = ReturnType<typeof d3.select<SVGSVGElement, unknown>>

export function mapAxisDomain(axis: number | string) {
  if (typeof axis === "string") {
    return new Date(axis)
  }
  return axis
}
