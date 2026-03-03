import { useCytoscape } from "@/lib/hooks/chemistryHooks"
import { useAppDispatch, useAppSelector } from "@/lib/hooks/hooks"
import {
  getIsAddElementDialogOpened,
  setIsAddElementDialogOpened,
} from "@/lib/features/chemistry/compoundGraphViewerSlice"
import React from "react"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import TextField from "@mui/material/TextField"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import { useTranslation } from "../../../../../../../../node_modules/react-i18next"
import PaperComponent from "@/app/_components/common/PaperComponent"
import { X_FIELD, Y_FIELD } from "@/lib/constants"

const ID_FIELD = "id"
const LABEL_FIELD = "label"

export default function AddNodeDraggableDialog() {
  const cy = useCytoscape()
  const dispatch = useAppDispatch()
  const open = useAppSelector(getIsAddElementDialogOpened)
  const { t } = useTranslation()

  function handleClose() {
    dispatch(setIsAddElementDialogOpened(false))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const id = formData.get(ID_FIELD)!.toString()
    const label = formData.get(LABEL_FIELD)
    const x = Number.parseFloat(formData.get(X_FIELD)?.toString() || "0")
    const y = Number.parseFloat(formData.get(Y_FIELD)?.toString() || "0")

    if (cy) {
      cy.add({
        group: "nodes",
        data: {
          id,
          label,
          position: { x, y },
        },
      })
    }

    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} PaperComponent={PaperComponent} aria-labelledby="draggable-dialog-title">
      <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
        {t("chemistryPubChemGraphCompoundPage.addNode")}
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit} id="addNodeForm">
          <TextField
            autoFocus
            required
            margin="dense"
            id={ID_FIELD}
            name={ID_FIELD}
            label={t("chemistryPubChemGraphCompoundPage.nodeId")}
            type="text"
            fullWidth
            variant="standard"
          />
          <TextField
            autoFocus
            required
            margin="dense"
            id={LABEL_FIELD}
            name={LABEL_FIELD}
            label={t("chemistryPubChemGraphCompoundPage.nodeLabel")}
            type="text"
            fullWidth
            variant="standard"
          />
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
        </form>
      </DialogContent>
      <DialogActions>
        <Button type="submit" form="addNodeForm">
          {t("chemistryPubChemGraphCompoundPage.add")}
        </Button>
        <Button autoFocus onClick={handleClose}>
          {t("common.cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
