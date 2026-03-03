"use client"

import { use, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { TFunction } from "i18next"
import { useTranslation } from "../../../../../../../node_modules/react-i18next"
import i18n from "@/config/i18n"
import { DataGrid, GridColDef } from "@mui/x-data-grid"
import Paper from "@mui/material/Paper"

import { FoodAdditiveSubstanceDto, FoodAdditiveSubstanceResponseDto } from "@/lib/api/chemistry/FoodAdditiveResponse"
import { parsePaginationParams } from "@/app/_components/utils/urlUtils"
import { useGetAllQuery } from "@/lib/features/chemistry/pubChemFdaSlice"

const getRowId = (value: FoodAdditiveSubstanceDto) => value.compoundCid

function createColumns(t: TFunction<"translation", undefined>): GridColDef[] {
  return [
    {
      field: "compoundCid",
      headerName: t("organicChemistryPubChemFoodAdditivesPage.compoundId"),
      type: "number",
      width: 130,
    },
    { field: "name", headerName: t("organicChemistryPubChemFoodAdditivesPage.name"), width: 130 },
    { field: "synonyms", headerName: t("organicChemistryPubChemFoodAdditivesPage.synonyms"), width: 130 },
    {
      field: "molecularWeight",
      headerName: t("organicChemistryPubChemFoodAdditivesPage.molecularWeight"),
      type: "number",
      width: 130,
    },
    {
      field: "molecularFormula",
      headerName: t("organicChemistryPubChemFoodAdditivesPage.molecularFormula"),
      width: 130,
    },
    {
      field: "polarArea",
      headerName: t("organicChemistryPubChemFoodAdditivesPage.polarArea"),
      type: "number",
      width: 130,
    },
    { field: "complexity", headerName: t("organicChemistryPubChemFoodAdditivesPage.complexity"), type: "number" },
    { field: "xlogp", headerName: t("organicChemistryPubChemFoodAdditivesPage.xlogp"), type: "number" },
    {
      field: "heavyAtomCount",
      headerName: t("organicChemistryPubChemFoodAdditivesPage.heavyAtomCount"),
      type: "number",
    },
    {
      field: "hBondDonorCount",
      headerName: t("organicChemistryPubChemFoodAdditivesPage.hBondDonorCount"),
      type: "number",
    },
    {
      field: "hBondAcceptorCount",
      headerName: t("organicChemistryPubChemFoodAdditivesPage.hBondAcceptorCount"),
      type: "number",
    },
    {
      field: "rotatableBondCount",
      headerName: t("organicChemistryPubChemFoodAdditivesPage.rotatableBondCount"),
      type: "number",
    },
    { field: "inchi", headerName: t("organicChemistryPubChemFoodAdditivesPage.inchi") },
    { field: "smiles", headerName: t("organicChemistryPubChemFoodAdditivesPage.smiles") },
    { field: "inchiKey", headerName: t("organicChemistryPubChemFoodAdditivesPage.inchiKey") },
    { field: "iupacName", headerName: t("organicChemistryPubChemFoodAdditivesPage.iupacName") },
    { field: "exactMass", headerName: t("organicChemistryPubChemFoodAdditivesPage.exactMass"), type: "number" },
    {
      field: "monoisotopicMass",
      headerName: t("organicChemistryPubChemFoodAdditivesPage.monoisotopicMass"),
      type: "number",
    },
    { field: "charge", headerName: t("organicChemistryPubChemFoodAdditivesPage.charge"), type: "number" },
    {
      field: "covalentUnitCount",
      headerName: t("organicChemistryPubChemFoodAdditivesPage.covalentUnitCount"),
      type: "number",
    },
    {
      field: "isotopicAtomCount",
      headerName: t("organicChemistryPubChemFoodAdditivesPage.isotopicAtomCount"),
      type: "number",
    },
    {
      field: "totalAtomStereoCount",
      headerName: t("organicChemistryPubChemFoodAdditivesPage.totalAtomStereoCount"),
      type: "number",
    },
    {
      field: "definedAtomStereoCount",
      headerName: t("organicChemistryPubChemFoodAdditivesPage.definedAtomStereoCount"),
      type: "number",
    },
    {
      field: "undefinedAtomStereoCount",
      headerName: t("organicChemistryPubChemFoodAdditivesPage.undefinedAtomStereoCount"),
      type: "number",
    },
    {
      field: "totalBondStereoCount",
      headerName: t("organicChemistryPubChemFoodAdditivesPage.totalBondStereoCount"),
      type: "number",
    },
    {
      field: "definedBondStereoCount",
      headerName: t("organicChemistryPubChemFoodAdditivesPage.definedBondStereoCount"),
      type: "number",
    },
    {
      field: "undefinedBondStereoCount",
      headerName: t("organicChemistryPubChemFoodAdditivesPage.undefinedBondStereoCount"),
      type: "number",
    },
    {
      field: "linkedPubChemLiteratureCount",
      headerName: t("organicChemistryPubChemFoodAdditivesPage.linkedPubChemLiteratureCount"),
      type: "number",
    },
    {
      field: "linkedPubChemPatentCount",
      headerName: t("organicChemistryPubChemFoodAdditivesPage.linkedPubChemPatentCount"),
      type: "number",
    },
    {
      field: "linkedPubChemPatentFamilyCount",
      headerName: t("organicChemistryPubChemFoodAdditivesPage.linkedPubChemPatentFamilyCount"),
      type: "number",
    },
    { field: "meshHeadings", headerName: t("organicChemistryPubChemFoodAdditivesPage.meshHeadings") },
    { field: "annotationContent", headerName: t("organicChemistryPubChemFoodAdditivesPage.annotationContent") },
    {
      field: "annotationTypeCount",
      headerName: t("organicChemistryPubChemFoodAdditivesPage.annotationTypeCount"),
      type: "number",
    },
    {
      field: "linkedBioAssays",
      headerName: t("organicChemistryPubChemFoodAdditivesPage.linkedBioAssays"),
      type: "number",
    },
    {
      field: "createDate",
      headerName: t("organicChemistryPubChemFoodAdditivesPage.createDate"),
      valueFormatter: (value?: string) => {
        if (value == null) {
          return null
        }
        return new Date(value)
      },
    },
    { field: "dataSource", headerName: t("organicChemistryPubChemFoodAdditivesPage.dataSource") },
    { field: "dataSourceCategory", headerName: t("organicChemistryPubChemFoodAdditivesPage.dataSourceCategory") },
    { field: "taggedByPubChem", headerName: t("organicChemistryPubChemFoodAdditivesPage.taggedByPubChem") },
  ]
}

const paginationModel = { page: 1, pageSize: 10 }

interface PubChemFdaMUIDataGridProps {
  foodAdditivesPromise: Promise<FoodAdditiveSubstanceResponseDto>
  translations: Record<string, string | Record<string, string>>
}

const pageSizeOptions = [5, 10, 20, 50, 100]

export default function PubChemFdaMUIDataGrid({ foodAdditivesPromise, translations }: PubChemFdaMUIDataGridProps) {
  const foodAdditiveList = use(foodAdditivesPromise)
  const { t } = useTranslation()

  useEffect(() => {
    i18n.addResourceBundle("en", "translation", translations, true, true)
  }, [translations])

  const foodAdditiveColumns = createColumns(t)
  return (
    <Paper sx={{ height: 400, width: "100%" }}>
      <DataGrid
        getRowId={getRowId}
        rows={foodAdditiveList}
        columns={foodAdditiveColumns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={pageSizeOptions}
        checkboxSelection
        sx={{ border: 0 }}
      />
    </Paper>
  )
}

interface PubChemFdaMUIDataGridWithRTKProps {
  translations: Record<string, string | Record<string, string>>
}

export function PubChemFdaMUIDataGridWithRTK({ translations }: PubChemFdaMUIDataGridWithRTKProps) {
  const searchParams = useSearchParams()
  const [page, pageSize] = parsePaginationParams(searchParams)

  const { t } = useTranslation()

  useEffect(() => {
    i18n.addResourceBundle("en", "translation", translations, true, true)
  }, [translations])

  const columns = createColumns(t)

  const { data } = useGetAllQuery({ page, pageSize })

  return (
    <Paper sx={{ height: 400, width: "100%" }}>
      <DataGrid
        getRowId={getRowId}
        rows={data}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={pageSizeOptions}
        checkboxSelection
        sx={{ border: 0 }}
      />
    </Paper>
  )
}
