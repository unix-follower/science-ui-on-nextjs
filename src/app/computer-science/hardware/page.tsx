import React, { Suspense } from "react"
import GPUList from "./_components/GPUList"
import { getGpuBackendURL } from "@/config/config"
import { getApiHttpClientSettings } from "@/lib/api/ApiHttpClient"
import { getTranslations } from "next-intl/server"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const t = await getTranslations("computerScienceHardwarePage")

  const { httpClient } = await searchParams

  const clientSettings = getApiHttpClientSettings(getGpuBackendURL, httpClient as string)

  return (
    <div id="computer-science-hardware-page">
      <Suspense fallback={<div>{t("loading")}</div>}>
        <GPUList httpClientSettings={clientSettings} />
      </Suspense>
    </div>
  )
}
