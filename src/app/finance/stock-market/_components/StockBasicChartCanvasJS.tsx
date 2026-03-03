"use client"

import React, { use, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import StocksResponseDto from "@/lib/api/finance/stockMarketModel"
import { useTranslation } from "../../../../../node_modules/react-i18next"
import i18n from "@/config/i18n"
import { ARRAY_FIRST_IDX } from "@/lib/constants"

const CanvasJSChart = dynamic(() => import("@canvasjs/react-charts").then((module) => module.default.CanvasJSChart), {
  ssr: false,
  loading: () => <p>Loading chart...</p>,
})

function createPlotSettings(name: string, dataPoints: { x: Date; y: number }[], type: string = "line") {
  return {
    type,
    name,
    showInLegend: true,
    markerType: "circle",
    markerSize: 10,
    dataPoints: dataPoints,
  }
}

interface StockChartCanvasJSProps {
  stocksResponsePromise: Promise<StocksResponseDto>
  translations: Record<string, string | Record<string, string>>
}

export default function StockBasicChartCanvasJS({ stocksResponsePromise, translations }: StockChartCanvasJSProps) {
  const stocksResponse = use(stocksResponsePromise)
  const { t } = useTranslation()

  useEffect(() => {
    i18n.addResourceBundle("en", "translation", translations, true, true)
  }, [translations])

  const ticker = stocksResponse?.stocks?.[ARRAY_FIRST_IDX]?.ticker || ""

  const mapStockData = (key: keyof (typeof stocksResponse.stocks)[number]) => {
    return stocksResponse.stocks.map((stock) => ({
      x: new Date(stock.dateAt),
      y: stock[key] as number,
    }))
  }

  const openPrices = mapStockData("open")
  const closePrices = mapStockData("close")
  const adjustedClosePrices = mapStockData("adjustedClose")
  const lowPrices = mapStockData("low")
  const highPrices = mapStockData("high")
  const volumes = mapStockData("volume")

  const chartOptions = useMemo(
    () => ({
      animationEnabled: true,
      title: {
        text: t("financeStockMarketPage.chart", { ticker }),
      },
      data: [
        createPlotSettings(t("financeStockMarketPage.open"), openPrices),
        createPlotSettings(t("financeStockMarketPage.close"), closePrices),
        createPlotSettings(t("financeStockMarketPage.adjustedClose"), adjustedClosePrices),
        createPlotSettings(t("financeStockMarketPage.low"), lowPrices),
        createPlotSettings(t("financeStockMarketPage.high"), highPrices),
      ],
    }),
    [t, ticker, openPrices, closePrices, adjustedClosePrices, lowPrices, highPrices],
  )

  const volumeChartOptions = useMemo(
    () => ({
      animationEnabled: true,
      title: {
        text: t("financeStockMarketPage.volumeChart", { ticker }),
      },
      data: [createPlotSettings(t("financeStockMarketPage.volume"), volumes, "scatter")],
    }),
    [t, ticker, volumes],
  )

  return (
    <>
      <CanvasJSChart options={chartOptions} />
      <CanvasJSChart options={volumeChartOptions} />
    </>
  )
}
