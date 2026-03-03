"use client"

import React from "react"
import { useParams } from "next/navigation"
import { useGetCompoundSDFDataByCidQuery } from "@/lib/features/chemistry/pubChemCompoundApiSlice"
import SDFViewer from "./SDFViewer"

export default function SDFWithRTK() {
  const params = useParams()

  const cid = Number.parseInt(params.cid as string)
  const { data } = useGetCompoundSDFDataByCidQuery(cid)

  if (!data) return null
  return <SDFViewer compoundData={data} />
}
