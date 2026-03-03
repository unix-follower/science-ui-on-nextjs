import { useCytoscape } from "@/lib/hooks/chemistryHooks"
import { useAppDispatch, useAppSelector } from "@/lib/hooks/hooks"
import {
  getIsRemoveElementDialogOpened,
  setIsRemoveElementDialogOpened,
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

const SELECTOR_FIELD = "selector"

export default function RemoveNodeDraggableDialog() {
  const { t } = useTranslation()
  const cy = useCytoscape()
  const dispatch = useAppDispatch()
  const open = useAppSelector(getIsRemoveElementDialogOpened)

  function handleClose() {
    dispatch(setIsRemoveElementDialogOpened(false))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const selector = formData.get(SELECTOR_FIELD)!.toString()

    if (cy) {
      cy.remove(selector)
    }

    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} PaperComponent={PaperComponent} aria-labelledby="draggable-dialog-title">
      <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
        {t("chemistryPubChemGraphCompoundPage.removeNode")}
      </DialogTitle>
      <DialogContent>
        <h1>{t("chemistryPubChemGraphCompoundPage.examples")}</h1>
        <p>
          <span>[id = &#34;1125899906842627&#34;]</span>
        </p>
        <p>
          <span>[label *= &#34;Compound&#34;]</span> -{" "}
          {t("chemistryPubChemGraphCompoundPage.removeCompoundsByLblDescription")}
        </p>
        <p>
          <span>[label *= &#34;Element&#34;]</span> -{" "}
          {t("chemistryPubChemGraphCompoundPage.removeElementByLblDescription")}
        </p>
        <form onSubmit={handleSubmit} id="removeNodeForm">
          <TextField
            autoFocus
            required
            margin="dense"
            id={SELECTOR_FIELD}
            name={SELECTOR_FIELD}
            label={t("chemistryPubChemGraphCompoundPage.selector")}
            type="text"
            fullWidth
            variant="standard"
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button type="submit" form="removeNodeForm">
          {t("chemistryPubChemGraphCompoundPage.remove")}
        </Button>
        <Button autoFocus onClick={handleClose}>
          {t("common.cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
