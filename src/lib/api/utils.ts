export function makeUrlForGetAllFoodAdditives(baseUrl?: string) {
  return `${baseUrl ?? ""}/api/v1/chemistry/food-additives`
}

export function makeUrlForFinanceStockMarketGetByTicker(baseUrl?: string) {
  return `${baseUrl ?? ""}/api/v1/finance/stock-market`
}

export function makeUrlForPubChemGetAllGraphs({
  baseUrl,
  page,
  pageSize,
  name,
}: {
  baseUrl?: string
  name?: string
  page: number
  pageSize: number
}) {
  const params = new URLSearchParams()
  if (name) {
    params.set("name", name)
  }

  if (page) {
    params.set("page", String(page))
  }

  if (pageSize) {
    params.set("pageSize", String(pageSize))
  }

  const query = params.size > 0 ? `?${params}` : ""
  return `${baseUrl ?? ""}/api/v1/chemistry/compound/graph${query}`
}

export function makeUrlForPubChemGetCompoundSDFDataByCid(cid: number, baseUrl?: string) {
  return `${baseUrl ?? ""}/api/v1/chemistry/compound/${cid}`
}
