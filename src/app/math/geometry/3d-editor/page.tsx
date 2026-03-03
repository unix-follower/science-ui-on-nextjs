import React, { Suspense } from "react"
import { getI18nDictionary } from "@/app/[lang]/dictionaries"
import GeometryThreeJsEditor from "./_components/GeometryThreeJsEditor"
import GeometryWebGLEditor from "./_components/GeometryWebGLEditor"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { view, lang } = await searchParams
  const translations = await getI18nDictionary((lang as string) || "en")

  if (view === "webgl") {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <GeometryWebGLEditor translations={translations} />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GeometryThreeJsEditor translations={translations} />
    </Suspense>
  )
}
