"use client"

import React, { useEffect, useRef } from "react"
import Tooltip from "@mui/material/Tooltip"
import i18n from "@/config/i18n"
import { useAppDispatch, useAppSelector } from "@/lib/hooks/hooks"
import { SquareIcon, TriangleIcon, EraserIcon, CircleIcon } from "@/app/_components/common/fontAwesomeIcons"
import {
  getIsDrawRectangleDialogOpened,
  setIsDrawRectangleDialogOpened,
} from "@/lib/features/math/geometry/geometryCanvasEditorSlice"
import DrawRectangleDraggableDialog, {
  NewRectangle,
} from "@/app/math/geometry/2d-editor/_components/DrawRectangleDraggableDialog"
import { toRadians } from "@/lib/features/math/conversionCalculator"

interface GeometryCanvasEditorProps {
  translations: Record<string, string | Record<string, string>>
}

export default function GeometryCanvasEditor({ translations }: GeometryCanvasEditorProps) {
  useEffect(() => {
    i18n.addResourceBundle("en", "translation", translations, true, true)
  }, [translations])

  const canvasRef = useRef<HTMLCanvasElement>(null)

  function handleOnMouseMove(event: React.MouseEvent<HTMLCanvasElement>) {
    const { offsetX, offsetY } = event.nativeEvent
    console.debug(`onMouseMove: offsetX=${offsetX} offsetY=${offsetY}`)
  }

  return (
    <div id="geometry-canvas-editor" className="grid grid-cols-[12%_88%] grid-rows-1 gap-4">
      <ToolPanel canvasRef={canvasRef} />
      <canvas ref={canvasRef} style={{ width: "100vw", height: "100vh" }} onMouseMove={handleOnMouseMove} />
    </div>
  )
}

interface ToolPanelProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}

function ToolPanel({ canvasRef }: ToolPanelProps) {
  const dispatch = useAppDispatch()
  const isDrawRectangleDialogOpened = useAppSelector(getIsDrawRectangleDialogOpened)

  function handleDrawRectangleClick() {
    dispatch(setIsDrawRectangleDialogOpened(true))
  }

  function handleDrawRightTriangleClick() {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")!
      ctx.beginPath()
      ctx.moveTo(50, 50)
      ctx.lineTo(50, 75)
      ctx.lineTo(100, 75)
      ctx.closePath()
      ctx.stroke()
    }
  }

  function handleDrawCircleClick() {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")!

      const centerX = 0
      const centerY = 0
      const radius = 100
      const angleInRadians = toRadians(45)

      const x = centerX + radius * Math.cos(angleInRadians)
      const y = centerY + radius * Math.sin(angleInRadians)

      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fillStyle = "black"
      ctx.closePath()
      ctx.fill()
    }
  }

  function handleDrawSineClick() {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")!

      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2

      const computeY = (x: number) => {
        return 0 - (canvas.height / 4) * Math.sin((4 * Math.PI * x) / canvas.width) + canvas.height / 2
      }

      for (let x = 0; x < canvas.width; x++) {
        const y = computeY(x)
        ctx.fillRect(x, y, 2, 2)
      }
    }
  }

  function drawRectangle({ x, y, width, height }: NewRectangle) {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")!
      const rectWidth = width || canvas.width / 3
      const rectHeight = height || canvas.height / 3
      ctx.fillRect(x, y, rectWidth, rectHeight)
    }
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")!
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  return (
    <div id="geometry-canvas-editor-tool-panel" className="grid grid-cols-1 grid-rows-3">
      <div>
        <div>
          <span>Primitives</span>
        </div>
        <Tooltip title="Rectangle" placement="bottom-end">
          <button onClick={handleDrawRectangleClick}>
            <SquareIcon />
          </button>
        </Tooltip>
        {isDrawRectangleDialogOpened && <DrawRectangleDraggableDialog onSubmit={drawRectangle} />}
        <Tooltip title="Right triangle" placement="bottom-end">
          <button onClick={handleDrawRightTriangleClick}>
            <TriangleIcon />
          </button>
        </Tooltip>
        <Tooltip title="Circle" placement="bottom-end">
          <button onClick={handleDrawCircleClick}>
            <CircleIcon />
          </button>
        </Tooltip>
        <Tooltip title="Sine" placement="bottom-end">
          <button onClick={handleDrawSineClick}>
            <i>Sine</i>
          </button>
        </Tooltip>
        <Tooltip title="Clear canvas" placement="bottom-end">
          <button onClick={clearCanvas}>
            <EraserIcon />
          </button>
        </Tooltip>
      </div>
    </div>
  )
}
