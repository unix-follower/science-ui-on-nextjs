import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import StocksResponseDto from "@/lib/api/finance/stockMarketModel"
import { getBackendURL } from "@/config/config"
import { makeUrlForFinanceStockMarketGetByTicker } from "@/lib/api/utils"
import { PaginationParams } from "@/lib/api/common"

const tag = "FinanceStockMarket"

interface GetByTickerQueryString extends PaginationParams {
  ticker: string
}

export const stockMarketSlice = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: getBackendURL() }),
  reducerPath: "financeStockMarketApi",
  tagTypes: [tag],
  endpoints: (build) => ({
    getByTicker: build.query<StocksResponseDto, GetByTickerQueryString>({
      query: ({ ticker, page = 1, pageSize = 10 }) =>
        `${makeUrlForFinanceStockMarketGetByTicker()}?ticker=${ticker}&page=${page}&pageSize=${pageSize}`,
      providesTags: [tag],
    }),
  }),
})

export const { useGetByTickerQuery } = stockMarketSlice
