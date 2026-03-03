import type { PayloadAction } from "@reduxjs/toolkit"
import { createSlice } from "@reduxjs/toolkit"
import { RootState } from "@/lib/store"

type AxisDomain = Array<number | string>

export interface D3State {
  xAxisDomain: AxisDomain
  yAxisDomain: AxisDomain
}

const initialState: D3State = {
  xAxisDomain: [0, 0],
  yAxisDomain: [0, 0],
}

export const d3Slice = createSlice({
  name: "d3",
  initialState,
  reducers: {
    setXAxisDomain: (state, action: PayloadAction<{ chartId: string; data: AxisDomain }>) => {
      const { chartId, data } = action.payload
      console.debug(`set xAxisDomain: ${chartId}`)
      state.xAxisDomain = data
    },
  },
})

export default d3Slice.reducer

export const { setXAxisDomain } = d3Slice.actions

export const getXAxisDomain = (state: RootState, chartId: string) => {
  console.debug(`get xAxisDomain for chartId=${chartId}`)
  return state.d3.xAxisDomain
}
