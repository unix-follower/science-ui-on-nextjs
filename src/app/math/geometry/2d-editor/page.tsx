import React, { Suspense } from "react"
import { getI18nDictionary } from "@/app/[lang]/dictionaries"
import GeometryCanvasEditor from "./_components/GeometryCanvasEditor"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { lang } = await searchParams
  const translations = await getI18nDictionary((lang as string) || "en")

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GeometryCanvasEditor translations={translations} />
    </Suspense>
  )
}
