import React, { Suspense } from "react"
import Shape from "./_components/Shape"
import { getTranslations } from "next-intl/server"

export default async function Page({}: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const t = await getTranslations("mathGeometryCssShapesPage")

  return (
    <div id="math-geometry-css-shapes-page">
      <Suspense fallback={<div>{t("loading")}</div>}>
        <Shape />
      </Suspense>
    </div>
  )
}
