import React, { Suspense } from "react"
import { getApiHttpClient } from "@/lib/api/ApiHttpClient"
import StockMUIDataGrid, { StockMUIDataGridWithRTK } from "./_components/StockMUIDataGrid"
import { parsePaginationParams } from "@/app/_components/utils/urlUtils"
import { getI18nDictionary } from "@/app/[lang]/dictionaries"
import StockBasicChartCanvasJS from "./_components/StockBasicChartCanvasJS"
import StockD3 from "./_components/StockD3"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { mode, view, ticker, page, pageSize, lang } = await searchParams

  const params = { page: (page as string) || null, pageSize: (pageSize as string) || null }
  const translations = await getI18nDictionary((lang as string) || "en")

  if (mode === "rtk") {
    return <StockMUIDataGridWithRTK translations={translations} />
  }

  const [pageNumber, pageSizeNum] = parsePaginationParams(params)

  const [, client] = getApiHttpClient(mode as string)
  const tickerToSearchFor = (ticker as string) || "KO"
  const stocksPromise = client.getStockByTicker(tickerToSearchFor, pageNumber, pageSizeNum)

  if (view === "d3") {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <StockD3 stocksResponsePromise={stocksPromise} translations={translations} />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StockMUIDataGrid stocksResponsePromise={stocksPromise} translations={translations} />
      <StockBasicChartCanvasJS stocksResponsePromise={stocksPromise} translations={translations} />
    </Suspense>
  )
}
