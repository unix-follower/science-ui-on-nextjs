import Paper, { PaperProps } from "@mui/material/Paper"
import React from "react"
import Draggable from "react-draggable"

export default function PaperComponent(props: PaperProps) {
  const nodeRef = React.useRef<HTMLDivElement>(null)
  return (
    <Draggable
      nodeRef={nodeRef as React.RefObject<HTMLDivElement>}
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} ref={nodeRef} />
    </Draggable>
  )
}
