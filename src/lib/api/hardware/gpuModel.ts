export default interface RawGPUResponse {
  [key: string]: {
    "Model name": string
    Launch: Date
    "Code name": string
    "Fab (nm)": string
    "Transistors (million)": number
    "Die size (mm)": number | string
    "Bus interface": string
    "Core clock (MHz)": number
    "Memory clock (MHz)": number
    "Core config": string
    "Memory Size (MiB)": string
    "Memory Bandwidth (GB/s)": number
    "Memory Bus type": string
    "Memory Bus width (bit)": number
    "Fillrate MOps/s": number
    "Fillrate MPixels/s": number
    "Fillrate MTexels/s": number
    "Fillrate MVertices/s": number
    "Latest API support Direct3D": number
    "TDP (Watts)": string
    Vendor: string
    Model: string
    "Die size"?: string
    "Model (Codename)"?: string
    "Model (Code name)"?: string
  }
}

export interface GPU {
  id: string
  modelName: string
  launch: Date
  codeName: string
  fabNm: string
  transistorsMillion: number
  dieSizeMm: number | string
  busInterface: string
  coreClockMHz: number
  memoryClockMHz: number
  coreConfig: string
  memorySizeMiB: string
  memoryBandwidthGbPerSec: number
  memoryBusType: string
  memoryBusWidthBit: number
  fillrateMOpsPerSec: number
  fillrateMPixelsPerSec: number
  fillrateMTexelsPerSec: number
  fillrateMVerticesPerSec: number
  latestAPISupportDirect3D: number
  tdpWatts: string
  vendor: string
  model: string
  dieSize?: string
  modelCodename?: string
  modelCodeName?: string
}
