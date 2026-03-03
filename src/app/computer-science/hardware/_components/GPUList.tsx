"use client"

import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Button from "@mui/material/Button"
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid"
import Paper from "@mui/material/Paper"
import PageStyleSettingsDialog from "./PageStyleSettingsDialog"
import { StyleEngineProvider, useStyleEngine } from "@/lib/hooks/styleEngineHooks"
import { ApiHttpClientSettings } from "@/lib/api/ApiHttpClient"
import GpuApiHttpClient from "@/lib/api/hardware/GpuApiHttpClient"
import { mapToGPUList } from "@/lib/api/hardware/gpuMapper"
import { GPU } from "@/lib/api/hardware/gpuModel"
import GpuDetails from "./GpuDetails"
import type GpuDetailsUpdateCallbackParams from "./model"
import { useTranslations } from "next-intl"
import { Translator } from "@/i18n/request"

function createColumns(t: Translator): GridColDef[] {
  return [
    { field: "id", headerName: t("id") },
    { field: "modelName", headerName: t("modelName") },
    { field: "launch", headerName: t("launch") },
    { field: "codeName", headerName: t("codeName") },
    { field: "fabNm", headerName: t("fabNm") },
    { field: "transistorsMillion", headerName: t("transistorsMillion") },
    { field: "dieSizeMm", headerName: t("dieSizeMm") },
    { field: "busInterface", headerName: t("busInterface") },
    { field: "coreClockMHz", headerName: t("coreClockMHz") },
    { field: "memoryClockMHz", headerName: t("memoryClockMHz") },
    { field: "coreConfig", headerName: t("coreConfig") },
    { field: "memorySizeMiB", headerName: t("memorySizeMiB") },
    { field: "memoryBandwidthGbPerSec", headerName: t("memoryBandwidthGbPerSec") },
    { field: "memoryBusType", headerName: t("memoryBusType") },
    { field: "memoryBusWidthBit", headerName: t("memoryBusWidthBit") },
    { field: "fillrateMOpsPerSec", headerName: t("fillrateMOpsPerSec") },
    { field: "fillrateMPixelsPerSec", headerName: t("fillrateMPixelsPerSec") },
    { field: "fillrateMTexelsPerSec", headerName: t("fillrateMTexelsPerSec") },
    { field: "fillrateMVerticesPerSec", headerName: t("fillrateMVerticesPerSec") },
    { field: "latestAPISupportDirect3D", headerName: t("latestAPISupportDirect3D") },
    { field: "tdpWatts", headerName: t("tdpWatts") },
    { field: "vendor", headerName: t("vendor") },
    { field: "model", headerName: t("model") },
    { field: "dieSize", headerName: t("dieSize") },
    { field: "modelCodename", headerName: t("modelCodename") },
    { field: "modelCodeName", headerName: t("modelCodeName") },
  ]
}

interface GPUListProps {
  httpClientSettings: ApiHttpClientSettings
}

const pageSizeOptions = [5, 10, 20, 50, 100]
const paginationModel = { page: 1, pageSize: 10 }

function GPUListStyled({ gpuList }: { gpuList: GPU[] }) {
  const t = useTranslations("computerScienceHardwarePage")
  const { styleEngine, setStyleEngine } = useStyleEngine()
  const [openChangeStyleDialog, setOpenChangeStyleDialog] = useState<boolean>(false)
  const [gpuIdClicked, setGpuIdClicked] = useState<string>("")
  const [gpuDetailsStyleTemplate, setGpuDetailsStyleTemplate] = useState<string>("")

  function handleOpenChangeStyleClick() {
    setOpenChangeStyleDialog(true)
  }

  function handlePageStyleSettingsDialogSubmit({ savedStyleEngine, styleTemplate }: GpuDetailsUpdateCallbackParams) {
    setOpenChangeStyleDialog(false)
    setStyleEngine(savedStyleEngine)
    setGpuDetailsStyleTemplate(styleTemplate)
  }

  function handlePageStyleSettingsDialogClose() {
    setOpenChangeStyleDialog(false)
  }

  function handleOnRowClick(params: GridRowParams) {
    const id = params.id as string
    if (id !== gpuIdClicked) {
      setGpuIdClicked(id)
    }
  }

  const columns = createColumns(t)

  return (
    <div>
      <Button onClick={handleOpenChangeStyleClick}>{t("changeStyle")}</Button>
      {openChangeStyleDialog ? (
        <PageStyleSettingsDialog
          handleSubmit={handlePageStyleSettingsDialogSubmit}
          handleClose={handlePageStyleSettingsDialogClose}
          currentCssEngine={styleEngine}
          currentCssTemplate={gpuDetailsStyleTemplate}
        />
      ) : null}
      <Paper sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={gpuList}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={pageSizeOptions}
          checkboxSelection
          sx={{ border: 0 }}
          onRowClick={handleOnRowClick}
        />
      </Paper>
      {gpuIdClicked && <GpuDetails id={gpuIdClicked} className={gpuDetailsStyleTemplate} />}
    </div>
  )
}

export default function GPUList({ httpClientSettings }: GPUListProps) {
  const t = useTranslations("computerScienceHardwarePage")
  const httpClient = new GpuApiHttpClient(httpClientSettings)

  const { isPending, error, data } = useQuery({
    queryKey: ["gpuData"],
    queryFn: () => httpClient.getData(),
  })

  if (isPending) {
    return <p>{t("loading")}</p>
  }

  if (error) {
    return <p>{t("errorOccurred", { msg: error.message })}</p>
  }

  const gpuList = mapToGPUList(data)
  return (
    <StyleEngineProvider>
      <GPUListStyled gpuList={gpuList} />
    </StyleEngineProvider>
  )
}
