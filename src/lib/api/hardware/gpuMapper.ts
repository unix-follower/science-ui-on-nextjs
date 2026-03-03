import RawGPUResponse, { GPU } from "./gpuModel"

export function mapToGPUList(rawData: RawGPUResponse): GPU[] {
  return Object.entries(rawData).map(([id, gpuData]) => ({
    id,
    modelName: gpuData["Model name"],
    launch: new Date(gpuData["Launch"]),
    codeName: gpuData["Code name"],
    fabNm: gpuData["Fab (nm)"],
    transistorsMillion: gpuData["Transistors (million)"],
    dieSizeMm: gpuData["Die size (mm)"],
    busInterface: gpuData["Bus interface"],
    coreClockMHz: gpuData["Core clock (MHz)"],
    memoryClockMHz: gpuData["Memory clock (MHz)"],
    coreConfig: gpuData["Core config"],
    memorySizeMiB: gpuData["Memory Size (MiB)"],
    memoryBandwidthGbPerSec: gpuData["Memory Bandwidth (GB/s)"],
    memoryBusType: gpuData["Memory Bus type"],
    memoryBusWidthBit: gpuData["Memory Bus width (bit)"],
    fillrateMOpsPerSec: gpuData["Fillrate MOps/s"],
    fillrateMPixelsPerSec: gpuData["Fillrate MPixels/s"],
    fillrateMTexelsPerSec: gpuData["Fillrate MTexels/s"],
    fillrateMVerticesPerSec: gpuData["Fillrate MVertices/s"],
    latestAPISupportDirect3D: gpuData["Latest API support Direct3D"],
    tdpWatts: gpuData["TDP (Watts)"],
    vendor: gpuData["Vendor"],
    model: gpuData["Model"],
    dieSize: gpuData["Die size"],
    modelCodename: gpuData["Model (Codename)"] !== "nan" ? gpuData["Model (Codename)"] : undefined,
    modelCodeName: gpuData["Model (Code name)"] !== "nan" ? gpuData["Model (Code name)"] : undefined,
  }))
}
