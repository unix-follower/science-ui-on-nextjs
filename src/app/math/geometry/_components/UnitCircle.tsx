"use client"
import React, { useEffect, useRef, useState } from "react"

interface UnitCirclePoint {
  x: number
  y: number
  angle: number
}

interface UnitCircleProps {
  className?: string
  width?: number
  height?: number
  value?: number
  xLabel?: string
  yLabel?: string
  onAngleChange?: (point: UnitCirclePoint) => void
}

interface UnitCircleSettings {
  canvas: HTMLCanvasElement
  width: number
  height: number
  value: number
  xLabel: string
  yLabel: string
  onAngleChange?: (point: UnitCirclePoint) => void
}

function create({ canvas, width, height, value, xLabel, yLabel, onAngleChange }: UnitCircleSettings) {
  const ctx = canvas.getContext("2d")!

  const halfWidth = width / 2
  const halfHeight = height / 2
  const gridSize = Math.floor(Math.min(halfWidth, halfHeight) * 0.8)
  const centerX = Math.floor(width / 2)
  const centerY = Math.floor(height / 2)
  let moving = false
  const cursorRadius = 10

  let angle = modClamp(value + Math.PI, Math.PI * 2)
  let circlePointX = 0
  let circlePointY = 0
  let flash = false

  setInterval(function () {
    flash = !flash
    if (!moving) {
      drawCircle(ctx, angle)
    }
  }, 500)

  drawCircle(ctx, angle)

  function start() {
    moving = true
    drawCircle(ctx, angle)
  }

  function stop() {
    moving = false
    drawCircle(ctx, angle)
  }

  canvas.addEventListener("mousedown", (event) => {
    const position = toLocal(event, canvas)
    if (inCircle(position.x, position.y)) {
      start()

      const moveHandler = (event: MouseEvent) => {
        trackMouse(event)
      }

      const upHandler = () => {
        stop()
        // Remove move and up listeners after mouse is released
        document.removeEventListener("mousemove", moveHandler)
        document.removeEventListener("mouseup", upHandler)
      }

      document.addEventListener("mousemove", moveHandler)
      document.addEventListener("mouseup", upHandler)
    }
  })

  function trackMouse(e: MouseEvent) {
    const position = toLocal(e, canvas)

    angle = Math.atan2(-position.y, position.x)
    drawCircle(ctx, angle)
    const v = modClamp(angle + Math.PI, 2 * Math.PI)
    if (onAngleChange) {
      onAngleChange({
        x: Math.sin(v),
        y: Math.cos(v),
        angle: v,
      })
    }
  }

  function modClamp(v: number, range: number, rangeStart?: number) {
    const start = rangeStart || 0
    if (range < 0.00001) {
      return start
    }
    v -= start
    if (v < 0) {
      v -= Math.floor(v / range) * range
    } else {
      v = v % range
    }
    return v + start
  }

  function toLocal(e: MouseEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left - halfWidth
    const y = e.clientY - rect.top - halfHeight
    return { x, y }
  }

  function computeCircleCenter() {
    const circleSin = Math.sin(angle)
    const circleCos = Math.cos(angle)

    circlePointX = circleCos * gridSize
    circlePointY = -circleSin * gridSize
  }

  function inCircle(x: number, y: number) {
    computeCircleCenter()
    const dx = Math.abs(x - circlePointX)
    const dy = Math.abs(y - circlePointY)
    return dx * dx + dy * dy < cursorRadius * cursorRadius
  }

  function drawCircle(ctx: CanvasRenderingContext2D, angle: number) {
    computeCircleCenter()

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.save()
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    ctx.translate(centerX, centerY)
    drawGrid()
    drawTriangle()
    drawCircle()
    drawCursor()
    drawCoords()
    ctx.restore()

    function drawGrid() {
      for (let y = -1; y <= 1; y++) {
        const position = y * gridSize

        ctx.fillStyle = "#ccc"
        ctx.fillRect(-halfWidth, position, width, 1)
        ctx.fillRect(position, -halfWidth, 1, width)

        ctx.font = "10pt serif"
        ctx.fillStyle = "#888"
        ctx.fillText(String(y), position + 5, 12)
        if (y) {
          ctx.fillText(String(-y), 5, position + 12)
        }
      }
    }

    function drawCoords() {
      ctx.font = "10pt sans-serif"
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
      for (let y = -2; y <= 2; y++) {
        for (let x = -2; x <= 2; x++) {
          drawText(x, y)
        }
      }
      ctx.fillStyle = "#000"
      drawText(0, 0)

      function drawText(x: number, y: number) {
        ctx.fillText(xLabel + Math.sin(angle).toFixed(2), circlePointX / 2 + x - 25, y - 5)
        ctx.fillText(yLabel + (-Math.cos(angle)).toFixed(2), circlePointX + x - 30, circlePointY / 2 + y)
      }
    }

    function drawTriangle() {
      ctx.fillStyle = "rgba(0, 255, 0, 0.1)"
      ctx.strokeStyle = "#888"
      ctx.beginPath()
      ctx.moveTo(0, 1)
      ctx.lineTo(circlePointX, 1)
      ctx.lineTo(circlePointX, circlePointY)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = "#888"
      ctx.fillRect(0, 0, circlePointX, 1)
      ctx.fillRect(circlePointX, 0, 1, circlePointY)

      function sign(v: number) {
        return v < 0 ? -1 : v > 0 ? 1 : 0
      }

      const arrowSize = 7
      const backX = circlePointX - sign(circlePointX) * arrowSize
      const backY = circlePointY - sign(circlePointY) * arrowSize

      ctx.fillStyle = "#000"
      ctx.beginPath()
      ctx.moveTo(circlePointX, 1)
      ctx.lineTo(backX, -arrowSize * 0.7)
      ctx.lineTo(backX, +arrowSize * 0.7)
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(circlePointX, circlePointY)
      ctx.lineTo(circlePointX - arrowSize * 0.7, backY)
      ctx.lineTo(circlePointX + arrowSize * 0.7, backY)
      ctx.fill()
    }

    function drawCircle() {
      ctx.strokeStyle = "#00f"
      ctx.beginPath()
      ctx.arc(0, 0, gridSize, 0, 360)
      ctx.closePath()
      ctx.stroke()
    }

    function drawCursor() {
      ctx.strokeStyle = "#000"
      ctx.fillStyle = moving ? "rgba(100, 0, 255, 0.5)" : "rgba(0, 0, 255, " + (flash ? 0.3 : 0.1) + ")"
      ctx.beginPath()
      ctx.arc(circlePointX, circlePointY, cursorRadius, 0, 360)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }
  }
}

export default function UnitCircle({
  className,
  width = 300,
  height = 300,
  value = Math.PI / 5,
  xLabel = "X=",
  yLabel = "Y=",
  onAngleChange,
}: UnitCircleProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [canvasWidth, setCanvasWidth] = useState<number>(width)
  const [canvasHeight, setCanvasHeight] = useState<number>(height)

  useEffect(() => {
    if (window.devicePixelRatio) {
      setCanvasWidth(width * window.devicePixelRatio)
      setCanvasHeight(height * window.devicePixelRatio)
    }
  }, [width, height])

  useEffect(() => {
    const { current: canvas } = canvasRef
    if (canvas) {
      create({ canvas, width, height, value, xLabel, yLabel, onAngleChange })
    }
  }, [width, height, value, xLabel, yLabel, onAngleChange])

  return (
    <canvas
      id="unit-circle-canvas"
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      className={className}
      style={{ width: `${width}px`, height: `${height}px` }}
    ></canvas>
  )
}
