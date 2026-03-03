import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "@/lib/store"

export interface GeometryCanvasEditorState {
  isDrawRectangleDialogOpened: boolean
}

const initialState: GeometryCanvasEditorState = {
  isDrawRectangleDialogOpened: false,
}

export const geometryCanvasEditorSlice = createSlice({
  name: "geometryCanvasEditor",
  initialState,
  reducers: {
    setIsDrawRectangleDialogOpened: (state, action: PayloadAction<boolean>) => {
      state.isDrawRectangleDialogOpened = action.payload
    },
  },
})

export default geometryCanvasEditorSlice.reducer

export const { setIsDrawRectangleDialogOpened } = geometryCanvasEditorSlice.actions

export const getIsDrawRectangleDialogOpened = (state: RootState) =>
  state.geometryCanvasEditor.isDrawRectangleDialogOpened
