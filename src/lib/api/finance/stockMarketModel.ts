export interface StockDto {
  ticker: string
  dateAt: string | Date
  open: number
  high: number
  low: number
  close: number
  adjustedClose: number
  volume: number
  dividends: number
  stockSplits: number
  capitalGains: number
}

export default interface StocksResponseDto {
  total: number
  stocks: StockDto[]
}
