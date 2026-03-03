import React, { Suspense, use } from "react"
import { getApiHttpClient } from "@/lib/api/ApiHttpClient"
import SDFViewer from "./_components/SDFViewer"
import SDFWithRTK from "./_components/SDFWithRTK"
import { CompoundSDFDataResponse } from "@/lib/api/chemistry/compoundModels"

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ cid: number }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { cid } = await params
  const { mode } = await searchParams

  if (mode === "rtk") {
    return <SDFWithRTK />
  }

  const [, client] = getApiHttpClient(mode as string)
  const compoundDataPromise = client.doPubChemGetCompoundSDFDataByCid(cid)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SDFViewerProxy compoundDataPromise={compoundDataPromise} />
    </Suspense>
  )
}

interface SDFViewerProxyProps {
  compoundDataPromise: Promise<CompoundSDFDataResponse>
}

function SDFViewerProxy({ compoundDataPromise }: SDFViewerProxyProps) {
  const compoundData = use(compoundDataPromise)
  return <SDFViewer compoundData={compoundData} />
}
