import StocksResponseDto from "./stockMarketModel"

export default interface FinanceStockMarketApi {
  getStockByTicker(ticker: string, page: number, pageSize: number): Promise<StocksResponseDto>
}
