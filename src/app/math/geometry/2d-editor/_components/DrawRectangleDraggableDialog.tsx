import { useAppDispatch, useAppSelector } from "@/lib/hooks/hooks"
import React from "react"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import TextField from "@mui/material/TextField"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import { useTranslation } from "../../../../../../node_modules/react-i18next"
import PaperComponent from "@/app/_components/common/PaperComponent"
import {
  getIsDrawRectangleDialogOpened,
  setIsDrawRectangleDialogOpened,
} from "@/lib/features/math/geometry/geometryCanvasEditorSlice"
import { X_FIELD, Y_FIELD } from "@/lib/constants"

const WIDTH_FIELD = "width"
const HEIGHT_FIELD = "height"

export interface NewRectangle {
  x: number
  y: number
  width: number
  height: number
}

interface DrawRectangleDraggableDialogProps {
  onSubmit: (data: NewRectangle) => void
}

export default function DrawRectangleDraggableDialog({ onSubmit }: DrawRectangleDraggableDialogProps) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const open = useAppSelector(getIsDrawRectangleDialogOpened)

  function handleClose() {
    dispatch(setIsDrawRectangleDialogOpened(false))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const x = Number.parseFloat(formData.get(X_FIELD)?.toString() || "0")
    const y = Number.parseFloat(formData.get(Y_FIELD)?.toString() || "0")
    const width = Number.parseFloat(formData.get(WIDTH_FIELD)?.toString() || "0")
    const height = Number.parseFloat(formData.get(HEIGHT_FIELD)?.toString() || "0")

    onSubmit({ x, y, width, height })
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} PaperComponent={PaperComponent} aria-labelledby="draggable-dialog-title">
      <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
        {t("geometry2DEditorPage.drawRect")}
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit} id="draw-rect-form">
          <TextField
            autoFocus
            margin="dense"
            id={X_FIELD}
            name={X_FIELD}
            label="x"
            type="number"
            fullWidth
            variant="standard"
          />
          <TextField
            autoFocus
            margin="dense"
            id={Y_FIELD}
            name={Y_FIELD}
            label="y"
            type="number"
            fullWidth
            variant="standard"
          />
          <TextField
            autoFocus
            margin="dense"
            id={WIDTH_FIELD}
            name={WIDTH_FIELD}
            label={t("common.width")}
            type="number"
            fullWidth
            variant="standard"
          />
          <TextField
            autoFocus
            margin="dense"
            id={HEIGHT_FIELD}
            name={HEIGHT_FIELD}
            label={t("common.height")}
            type="number"
            fullWidth
            variant="standard"
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button type="submit" form="draw-rect-form">
          {t("common.draw")}
        </Button>
        <Button autoFocus onClick={handleClose}>
          {t("common.cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
