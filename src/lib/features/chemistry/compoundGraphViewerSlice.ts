import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "@/lib/store"

export interface CompoundGraphViewerState {
  isAddElementDialogOpened: boolean
  isRemoveElementDialogOpened: boolean
  tappedNodeId: string | null
}

const initialState: CompoundGraphViewerState = {
  isAddElementDialogOpened: false,
  isRemoveElementDialogOpened: false,
  tappedNodeId: null,
}

export const compoundGraphViewerSlice = createSlice({
  name: "compoundGraphViewer",
  initialState,
  reducers: {
    setIsAddElementDialogOpened: (state, action: PayloadAction<boolean>) => {
      state.isAddElementDialogOpened = action.payload
    },
    setIsRemoveElementDialogOpened: (state, action: PayloadAction<boolean>) => {
      state.isRemoveElementDialogOpened = action.payload
    },
    setTappedNodeId: (state, action: PayloadAction<string | null>) => {
      state.tappedNodeId = action.payload
    },
  },
})

export default compoundGraphViewerSlice.reducer

export const { setIsAddElementDialogOpened, setIsRemoveElementDialogOpened, setTappedNodeId } =
  compoundGraphViewerSlice.actions

export const getIsAddElementDialogOpened = (state: RootState) => state.compoundGraphViewer.isAddElementDialogOpened
export const getIsRemoveElementDialogOpened = (state: RootState) =>
  state.compoundGraphViewer.isRemoveElementDialogOpened
export const getTappedNodeId = (state: RootState) => state.compoundGraphViewer.tappedNodeId
