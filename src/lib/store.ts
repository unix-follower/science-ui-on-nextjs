import { Action, combineSlices, ThunkAction } from "@reduxjs/toolkit"
import { configureStore } from "@reduxjs/toolkit"
import { pubChemFdaSlice } from "@/lib/features/chemistry/pubChemFdaSlice"
import { pubChemCompoundApiSlice } from "@/lib/features/chemistry/pubChemCompoundApiSlice"
import { stockMarketSlice } from "@/lib/features/finance/stockMarketSlice"
import { d3Slice } from "@/lib/features/finance/d3Slice"
import { compoundGraphViewerSlice } from "@/lib/features/chemistry/compoundGraphViewerSlice"
import { geometryCanvasEditorSlice } from "@/lib/features/math/geometry/geometryCanvasEditorSlice"

const rootReducer = combineSlices(
  pubChemFdaSlice,
  stockMarketSlice,
  pubChemCompoundApiSlice,
  compoundGraphViewerSlice,
  geometryCanvasEditorSlice,
  d3Slice,
)
export type RootState = ReturnType<typeof rootReducer>

export const setupStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) => {
      return getDefaultMiddleware()
        .concat(pubChemFdaSlice.middleware)
        .concat(pubChemCompoundApiSlice.middleware)
        .concat(stockMarketSlice.middleware)
    },
  })
}

export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore["dispatch"]
export type AppThunk<ThunkReturnType = void> = ThunkAction<ThunkReturnType, RootState, unknown, Action>
