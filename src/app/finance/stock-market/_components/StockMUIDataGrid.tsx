"use client"

import { use, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { TFunction } from "i18next"
import { useTranslation } from "../../../../../node_modules/react-i18next"
import i18n from "@/config/i18n"
import { DataGrid, GridColDef } from "@mui/x-data-grid"
import Paper from "@mui/material/Paper"

import StocksResponseDto, { StockDto } from "@/lib/api/finance/stockMarketModel"
import { parsePaginationParams } from "@/app/_components/utils/urlUtils"
import { useGetByTickerQuery } from "@/lib/features/finance/stockMarketSlice"

const getRowId = (value: StockDto) => `${value.ticker}_${value.dateAt}`

function createColumns(t: TFunction<"translation", undefined>): GridColDef[] {
  return [
    { field: "ticker", headerName: t("financeStockMarketPage.ticker") },
    {
      field: "dateAt",
      headerName: t("financeStockMarketPage.date"),
      valueFormatter: (value?: string) => {
        if (value == null) {
          return null
        }
        return new Date(value)
      },
    },
    { field: "capitalGains", headerName: t("financeStockMarketPage.capitalGains"), type: "number", width: 130 },
    { field: "open", headerName: t("financeStockMarketPage.open"), type: "number", width: 130 },
    { field: "high", headerName: t("financeStockMarketPage.high"), type: "number", width: 130 },
    { field: "low", headerName: t("financeStockMarketPage.low"), type: "number", width: 130 },
    { field: "close", headerName: t("financeStockMarketPage.close"), type: "number", width: 130 },
    { field: "adjustedClose", headerName: t("financeStockMarketPage.adjustedClose"), type: "number", width: 130 },
    { field: "volume", headerName: t("financeStockMarketPage.volume"), type: "number", width: 130 },
    { field: "dividends", headerName: t("financeStockMarketPage.dividends"), type: "number", width: 130 },
    { field: "stockSplits", headerName: t("financeStockMarketPage.stockSplits"), type: "number", width: 130 },
  ]
}

const paginationModel = { page: 1, pageSize: 10 }

interface StockMUIDataGridProps {
  stocksResponsePromise: Promise<StocksResponseDto>
  translations: Record<string, string | Record<string, string>>
}

const pageSizeOptions = [5, 10, 20, 50, 100]

export default function StockMUIDataGrid({ stocksResponsePromise, translations }: StockMUIDataGridProps) {
  const stocksResponse = use(stocksResponsePromise)
  const { t } = useTranslation()

  useEffect(() => {
    i18n.addResourceBundle("en", "translation", translations, true, true)
  }, [translations])

  const columns = createColumns(t)
  return (
    <Paper sx={{ height: 400, width: "100%" }}>
      <DataGrid
        getRowId={getRowId}
        rows={stocksResponse.stocks}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={pageSizeOptions}
        checkboxSelection
        sx={{ border: 0 }}
      />
    </Paper>
  )
}

interface StockMUIDataGridWithRTKProps {
  translations: Record<string, string | Record<string, string>>
}

export function StockMUIDataGridWithRTK({ translations }: StockMUIDataGridWithRTKProps) {
  const searchParams = useSearchParams()
  const [page, pageSize] = parsePaginationParams(searchParams)

  const { t } = useTranslation()

  useEffect(() => {
    i18n.addResourceBundle("en", "translation", translations, true, true)
  }, [translations])

  const ticker = searchParams.get("ticker")!
  const { data } = useGetByTickerQuery({ ticker, page, pageSize })

  const columns = createColumns(t)

  return (
    <Paper sx={{ height: 400, width: "100%" }}>
      <DataGrid
        getRowId={getRowId}
        rows={data?.stocks}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={pageSizeOptions}
        checkboxSelection
        sx={{ border: 0 }}
      />
    </Paper>
  )
}
