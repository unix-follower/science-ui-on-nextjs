import React, { Suspense } from "react"
import { getApiHttpClient } from "@/lib/api/ApiHttpClient"
import PubChemFdaMUIDataGrid, {
  PubChemFdaMUIDataGridWithRTK,
} from "@/app/chemistry/dbs/pub-chem/fda/_components/PubChemFdaMUIDataGrid"
import { parsePaginationParams } from "@/app/_components/utils/urlUtils"
import { getI18nDictionary } from "@/app/[lang]/dictionaries"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { mode, page, pageSize, lang } = await searchParams

  const params = { page: (page as string) || null, pageSize: (pageSize as string) || null }
  const translations = await getI18nDictionary((lang as string) || "en")

  if (mode === "rtk") {
    return <PubChemFdaMUIDataGridWithRTK translations={translations} />
  }

  const [pageNumber, pageSizeNum] = parsePaginationParams(params)

  const [, client] = getApiHttpClient(mode as string)
  const foodAdditives = client.getAllFoodAdditives(pageNumber, pageSizeNum)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PubChemFdaMUIDataGrid foodAdditivesPromise={foodAdditives} translations={translations} />
    </Suspense>
  )
}
