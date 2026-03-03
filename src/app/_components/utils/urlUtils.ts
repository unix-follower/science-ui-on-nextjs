import { ReadonlyURLSearchParams } from "next/navigation"

interface PaginationParams {
  page: string | null
  pageSize: string | null
}

export function parsePaginationParams(
  searchParams: ReadonlyURLSearchParams | PaginationParams,
  isZeroBasePage = false,
) {
  let pageStr: string | null
  let sizeStr: string | null
  if (searchParams instanceof ReadonlyURLSearchParams) {
    pageStr = searchParams.get("page")
    sizeStr = searchParams.get("pageSize")
  } else {
    pageStr = searchParams.page
    sizeStr = searchParams.pageSize
  }

  const defaultPageStr = isZeroBasePage ? "0" : "1"
  const defaultPageSizeStr = "10"

  let page = Number.parseInt(pageStr ?? defaultPageStr)
  let size = Number.parseInt(sizeStr ?? defaultPageSizeStr)
  if (isNaN(page)) {
    page = Number.parseInt(defaultPageStr)
  }
  if (isNaN(page)) {
    size = Number.parseInt(defaultPageSizeStr)
  }

  return [page, size]
}
