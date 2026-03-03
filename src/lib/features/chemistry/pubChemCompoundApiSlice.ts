import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { getBackendURL } from "@/config/config"
import { makeUrlForPubChemGetAllGraphs, makeUrlForPubChemGetCompoundSDFDataByCid } from "@/lib/api/utils"
import { ChemistryGraphResponse, CompoundSDFDataResponse } from "@/lib/api/chemistry/compoundModels"
import { PaginationParams } from "@/lib/api/common"

const tag = "pubChemCompoundApi"

interface GetCompoundDataByNameQueryString extends PaginationParams {
  name: string
}

export const pubChemCompoundApiSlice = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: getBackendURL() }),
  reducerPath: "chemistryPubChemCompoundApi",
  tagTypes: [tag],
  endpoints: (build) => ({
    getAllGraphs: build.query<ChemistryGraphResponse, PaginationParams>({
      query: ({ page = 1, pageSize = 10 }) => makeUrlForPubChemGetAllGraphs({ page, pageSize }),
      providesTags: [tag],
    }),

    getCompoundGraphDataByName: build.query<ChemistryGraphResponse, GetCompoundDataByNameQueryString>({
      query: ({ page = 1, pageSize = 10, name }) => makeUrlForPubChemGetAllGraphs({ page, pageSize, name }),
      providesTags: [tag],
    }),

    getCompoundSDFDataByCid: build.query<CompoundSDFDataResponse, number>({
      query: (cid) => makeUrlForPubChemGetCompoundSDFDataByCid(cid),
      providesTags: [tag],
    }),
  }),
})

export const { useGetAllGraphsQuery, useGetCompoundGraphDataByNameQuery, useGetCompoundSDFDataByCidQuery } =
  pubChemCompoundApiSlice
