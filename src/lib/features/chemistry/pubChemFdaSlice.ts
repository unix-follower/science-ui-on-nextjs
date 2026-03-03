import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { FoodAdditiveSubstanceResponseDto } from "@/lib/api/chemistry/FoodAdditiveResponse"
import { getBackendURL } from "@/config/config"
import { makeUrlForGetAllFoodAdditives } from "@/lib/api/utils"
import { PaginationParams } from "@/lib/api/common"

const tag = "pubChemFda"

export const pubChemFdaSlice = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: getBackendURL() }),
  reducerPath: "chemistryPubChemFdaApi",
  tagTypes: [tag],
  endpoints: (build) => ({
    getAll: build.query<FoodAdditiveSubstanceResponseDto, PaginationParams>({
      query: ({ page = 1, pageSize = 10 }) => `${makeUrlForGetAllFoodAdditives()}?page=${page}&pageSize=${pageSize}`,
      providesTags: [tag],
    }),
  }),
})

export const { useGetAllQuery } = pubChemFdaSlice
