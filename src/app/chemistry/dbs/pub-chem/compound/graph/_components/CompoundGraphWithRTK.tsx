"use client"

import React from "react"
import { useSearchParams } from "next/navigation"
import { parsePaginationParams } from "@/app/_components/utils/urlUtils"
import {
  useGetCompoundGraphDataByNameQuery,
  useGetAllGraphsQuery,
} from "@/lib/features/chemistry/pubChemCompoundApiSlice"
import { mapGraphResponse } from "@/lib/api/chemistry/mapper"
import CompoundGraphViewer from "./CompoundGraphViewer"

interface CompoundGraphWithRTKProps {
  translations: Record<string, string | Record<string, string>>
}

export default function CompoundGraphWithRTK({ translations }: CompoundGraphWithRTKProps) {
  const searchParams = useSearchParams()

  const [page, pageSize] = parsePaginationParams(searchParams)
  const name = searchParams.get("name")!
  const { data } = useGetCompoundGraphDataByNameQuery({ page, pageSize, name })

  if (!data) return null
  const compoundData = mapGraphResponse(data)
  return <CompoundGraphViewer translations={translations} compoundData={compoundData} />
}

export function CompoundGraphListWithRTK({ translations }: CompoundGraphWithRTKProps) {
  const searchParams = useSearchParams()
  const [page, pageSize] = parsePaginationParams(searchParams)

  const { data } = useGetAllGraphsQuery({ page, pageSize })
  if (!data) return null
  const compoundData = mapGraphResponse(data)
  return <CompoundGraphViewer translations={translations} compoundData={compoundData} />
}
