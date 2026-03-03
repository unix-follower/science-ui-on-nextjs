import React, { useState } from "react"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import Radio from "@mui/material/Radio"
import RadioGroup from "@mui/material/RadioGroup"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormLabel from "@mui/material/FormLabel"
import Switch from "@mui/material/Switch"
import MenuItem from "@mui/material/MenuItem"
import InputLabel from "@mui/material/InputLabel"
import Select from "@mui/material/Select"
import PaperComponent from "@/app/_components/common/PaperComponent"
import { StyleEngine } from "@/lib/hooks/styleEngineHooks"
import GpuDetailsUpdateCallbackParams from "./model"
import { useTranslations } from "next-intl"

interface PageStyleSettingsDialogProps {
  handleSubmit: (params: GpuDetailsUpdateCallbackParams) => void
  handleClose: () => void
  currentCssEngine: StyleEngine
  currentCssTemplate: string
}

const CSS_ENGINE_FIELD = "cssEngine"

export default function PageStyleSettingsDialog({
  handleSubmit,
  handleClose,
  currentCssEngine,
  currentCssTemplate,
}: PageStyleSettingsDialogProps) {
  const t = useTranslations("computerScienceHardwarePage")
  const [open, setOpen] = useState<boolean>(true)

  if (currentCssEngine === "tw" && currentCssTemplate) {
    currentCssTemplate = currentCssTemplate.substring(3)
  }
  const [cssTemplate, setCssTemplate] = useState(currentCssTemplate)

  function handleDialogClose() {
    setOpen(false)
    handleClose()
  }

  function handleDialogSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const savedStyleEngine = formData.get(CSS_ENGINE_FIELD)!.toString() as StyleEngine
    let styleTemplate = cssTemplate
    if (savedStyleEngine === "tw") {
      styleTemplate = `tw-${cssTemplate}`
    }
    handleSubmit({ savedStyleEngine, styleTemplate })
    handleDialogClose()
  }

  function handleSelectChange(
    event:
      | React.ChangeEvent<HTMLInputElement>
      | (Event & {
          target: { value: unknown; name: string }
        }),
  ) {
    setCssTemplate(event.target.value as string)
  }

  const selectMenuItems = []
  for (let i = 1; i <= 10; i++) {
    selectMenuItems.push(<MenuItem value={`template${i}`}>{t("templateNo", { no: i })}</MenuItem>)
  }

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      PaperComponent={PaperComponent}
      aria-labelledby="draggable-dialog-title"
    >
      <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
        {t("changeStyle")}
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleDialogSubmit} id="changeStyleForm">
          <FormLabel id="css-engine-row-radio-buttons-group-label">{t("engine")}</FormLabel>
          <RadioGroup
            row
            aria-labelledby="css-engine-row-radio-buttons-group-label"
            name={CSS_ENGINE_FIELD}
            defaultValue={currentCssEngine}
          >
            <FormControlLabel value="css" control={<Radio />} label={t("native") + " CSS"} />
            <FormControlLabel value="tw" control={<Radio />} label="Tailwind" />
          </RadioGroup>
          <InputLabel id="css-template-select-label">{t("cssTemplate")}</InputLabel>
          <Select
            labelId="css-template-select-label"
            id="css-template-select"
            value={cssTemplate}
            onChange={handleSelectChange}
            label={t("template")}
          >
            <MenuItem value="">
              <em>{t("none")}</em>
            </MenuItem>
            {selectMenuItems}
          </Select>
          <div>{t("typography")}</div>
          <FormControlLabel
            value="bottom"
            control={<Switch color="primary" slotProps={{ input: { "aria-label": "controlled" } }} disabled={true} />}
            label={t("fontWeightBold")}
            labelPlacement="start"
          />
          <div>{t("colors")}</div>
          <div>{t("spacing")}</div>
          <div>{t("states")}</div>
          <div>{t("flexboxAndGrid")}</div>
          <div>{t("sizing")}</div>
          <div>{t("backgrounds")}</div>
          <div>{t("borders")}</div>
          <div>{t("responsive")}</div>
          <div>{t("layout")}</div>
          <div>{t("filtersAndEffects")}</div>
          <div>{t("tables")}</div>
          <div>{t("interactivity")}</div>
          <div>{t("transitionsAndAnimations")}</div>
          <div>{t("transforms")}</div>
        </form>
      </DialogContent>
      <DialogActions>
        <Button type="submit" form="changeStyleForm">
          {t("save")}
        </Button>
        <Button autoFocus onClick={handleDialogClose}>
          {t("cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
