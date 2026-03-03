"use client"

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import OutlinedInput from "@mui/material/OutlinedInput"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import ListItemText from "@mui/material/ListItemText"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import Radio from "@mui/material/Radio"
import RadioGroup from "@mui/material/RadioGroup"
import Checkbox from "@mui/material/Checkbox"
import { useTranslation } from "../../../../../../node_modules/react-i18next"
import i18n from "@/config/i18n"
import { SquareIcon, TriangleIcon } from "@/app/_components/common/fontAwesomeIcons"
import Tooltip from "@mui/material/Tooltip"
import WebGLRenderingCtx, { useWebGLRenderingCtx } from "@/lib/hooks/webGLHooks"
import { X_AXIS_INDEX, Y_AXIS_INDEX, Z_AXIS_INDEX } from "@/lib/constants"
import InputSlider from "./InputSlider"
import { toRadians, radiansToDegrees } from "@/lib/features/math/conversionCalculator"
import UnitCircle from "@/app/math/geometry/_components/UnitCircle"
import * as linalg from "@/lib/features/math/linalgCalculator"
import {
  SceneSettings,
  TextureOption,
  drawIsoscelesTriangle,
  drawSampleRectangle,
  drawRectangle,
  drawLetterFWithTransformedMatrix,
  drawLetterF,
  drawCircleFs,
  drawCircleFsWithTrackingCamera,
  drawLetterFWithTextureOptions,
  drawLetterFWithTextureFiltering,
  drawTextureWithDistancePolygons,
  drawCubeWithTexture,
} from "./webglEditorControls"
import { createConvolutionKernal, ConvolutionKernal, renderImage } from "./webglEditorImageProcessing"
import FormLabel from "@mui/material/FormLabel"
import FormControlLabel from "@mui/material/FormControlLabel"

interface GeometryWebGLEditorProps {
  translations: Record<string, string | Record<string, string>>
}

export default function GeometryWebGLEditor({ translations }: GeometryWebGLEditorProps) {
  useEffect(() => {
    i18n.addResourceBundle("en", "translation", translations, true, true)
  }, [translations])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [webGLContext, setWebGLContext] = useState<WebGL2RenderingContext | null>(null)
  const memoizedWebGLContext = useMemo(() => webGLContext, [webGLContext])

  useEffect(() => {
    console.debug("Re-render GeometryWebGLEditor")
  })

  useEffect(() => {
    console.debug("Render GeometryWebGLEditor for the first time")
  }, [])

  useEffect(() => {
    const { current: currentCanvasRef } = canvasRef
    if (!currentCanvasRef) {
      return
    }

    const gl = currentCanvasRef!.getContext("webgl2")
    if (!gl) {
      throw new Error("WebGL is not supported")
    }
    setWebGLContext(gl)

    const webglProgram = drawSampleRectangle(gl)

    return () => {
      if (webglProgram) {
        const { webglContext, program } = webglProgram
        webglContext.deleteProgram(program)
      }
    }
  }, [setWebGLContext])

  const ToolPanelMemo = memo(ToolPanel)

  return (
    <WebGLRenderingCtx value={memoizedWebGLContext}>
      <UnitCircle />
      <div id="geometry-webgl-editor" className="grid max-h-256 max-w-512 grid-cols-[30%_70%] grid-rows-1 gap-4 p-3">
        <ToolPanelMemo />
        <canvas ref={canvasRef} className="m-2 bg-black p-2" style={{ width: "100%", height: "100%" }} />
      </div>
    </WebGLRenderingCtx>
  )
}

const ITEM_HEIGHT = 42
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 100,
    },
  },
}

function createImageEffects() {
  return [
    "normal",
    "gaussianBlur",
    "gaussianBlur2",
    "gaussianBlur3",
    "unsharpen",
    "sharpness",
    "sharpen",
    "edgeDetect",
    "edgeDetect2",
    "edgeDetect3",
    "edgeDetect4",
    "edgeDetect5",
    "edgeDetect6",
    "sobelHorizontal",
    "sobelVertical",
    "previtHorizontal",
    "previtVertical",
    "boxBlur",
    "triangleBlur",
    "emboss",
  ]
}

const transformationSequences = {
  TRS: ["translate", "rotate", "scale"],
  TSR: ["translate", "scale", "rotate"],
  SRT: ["scale", "rotate", "translate"],
}

type TransformationSequenceKey = keyof typeof transformationSequences

function ToolPanel() {
  const { t } = useTranslation()
  const gl = useWebGLRenderingCtx()
  const [sceneRenderFn, setSceneRenderFn] = useState<((settings: SceneSettings) => void) | null>()

  const [threeD, setThreeD] = useState(true)
  const [animationEnabled, setAnimationEnabled] = useState(true)

  const [fieldOfViewRadians, setFieldOfViewRadians] = useState(toRadians(60))
  const [cameraAngleRadians, setCameraAngleRadians] = useState(0)
  const [translation, setTranslation] = useState([0, 0, 0])
  const [rotation, setRotation] = useState([0, 0, 0])
  const [rotationDegrees, setRotationDegrees] = useState(0)
  const [scale, setScale] = useState([1, 1, 1])
  const [textureWrapS, setTextureWrapS] = useState<TextureOption>("REPEAT")
  const [textureWrapT, setTextureWrapT] = useState<TextureOption>("REPEAT")

  const [selectedConvolutionKernel, setSelectedConvolutionKernel] = useState("normal")
  const [selectedImageEffects, setSelectedImageEffects] = useState<string[]>([])

  const convKernels = createConvolutionKernal()

  useEffect(() => {
    console.debug("Re-render ToolPanel")
  })

  useEffect(() => {
    console.debug("Render ToolPanel for the first time")
  }, [])

  useEffect(() => {
    if (sceneRenderFn && gl) {
      const rotationInRadians = toRadians(rotationDegrees)

      sceneRenderFn({
        gl,
        fieldOfViewRadians,
        cameraAngleRadians,
        translation,
        rotation: [
          toRadians(rotation[X_AXIS_INDEX]),
          toRadians(rotation[Y_AXIS_INDEX]),
          toRadians(rotation[Z_AXIS_INDEX]),
        ],
        scale,
        translateX: translation[X_AXIS_INDEX],
        translateY: translation[Y_AXIS_INDEX],
        rotationRadians: rotationInRadians,
        rotationX: Math.sin(rotationInRadians),
        rotationY: Math.cos(rotationInRadians),
        scaleX: scale[X_AXIS_INDEX],
        scaleY: scale[Y_AXIS_INDEX],
        threeD,
        textureWrapS,
        textureWrapT,
      })
    }
  }, [
    sceneRenderFn,
    gl,
    cameraAngleRadians,
    fieldOfViewRadians,
    translation,
    rotation,
    rotationDegrees,
    scale,
    threeD,
    textureWrapS,
    textureWrapT,
  ])

  function handleDrawIsoscelesTriangleClick() {
    if (!gl) {
      return
    }
    setSceneRenderFn(() => (settings: SceneSettings) => drawIsoscelesTriangle(settings))
  }

  function handleDrawRectangleClick() {
    if (!gl) {
      return
    }
    setSceneRenderFn(() => (settings: SceneSettings) => drawRectangle(settings))
  }

  const handleDrawLetterFClick = useCallback(
    (transformationSeq?: string[]) => {
      if (!gl) {
        return
      }

      setSceneRenderFn(() => (settings: SceneSettings) => {
        if (transformationSeq) {
          const {
            fieldOfViewRadians: fieldOfView,
            translation: translateCoords,
            rotation: rotateCoords,
            scale: scaleCoords,
            translateX,
            translateY,
            rotationRadians,
            scaleX,
            scaleY,
            threeD: is3d,
          } = settings

          let matrix: Float32Array<ArrayBufferLike> | number[]
          if (is3d) {
            const aspect = gl.canvas.width / gl.canvas.height
            const zNear = 1
            const zFar = 2000

            matrix = linalg.perspective(fieldOfView || 1, aspect, zNear, zFar)
            for (const transform of transformationSeq) {
              if (transform === "translate" && translateCoords) {
                const [x, y, z] = translateCoords
                matrix = linalg.translate3d(matrix, x, y, z)
              } else if (transform === "rotate" && rotateCoords) {
                const [x, y, z] = rotateCoords
                matrix = linalg.xRotate(matrix, x)
                matrix = linalg.yRotate(matrix, y)
                matrix = linalg.zRotate(matrix, z)
              } else if (transform === "scale" && scaleCoords) {
                const [x, y, z] = scaleCoords
                matrix = linalg.scale3d(matrix, x, y, z)
              }
            }
          } else {
            matrix = linalg.projection(gl.canvas.width, gl.canvas.height)
            for (const transform of transformationSeq) {
              if (transform === "translate" && translateX && translateY) {
                matrix = linalg.translate(matrix, translateX, translateY)
              } else if (transform === "rotate" && rotationRadians) {
                matrix = linalg.rotate(matrix, rotationRadians)
              } else if (transform === "scale" && scaleX && scaleY) {
                matrix = linalg.scale(matrix, scaleX, scaleY)
              }
            }
          }
          settings.transformedMatrix = matrix
          drawLetterFWithTransformedMatrix(settings)
        } else {
          drawLetterF(settings)
        }
      })
    },
    [gl],
  )

  const handleDrawCircleFsClick = useCallback(() => {
    if (!gl) {
      return
    }

    setSceneRenderFn(() => (settings: SceneSettings) => drawCircleFs(settings))
  }, [gl])

  const handleDrawCircleFsWithTrackingCameraClick = useCallback(() => {
    if (!gl) {
      return
    }

    setSceneRenderFn(() => (settings: SceneSettings) => drawCircleFsWithTrackingCamera(settings))
  }, [gl])

  const handleDrawLetterFWithTextureOptionsClick = useCallback(() => {
    if (!gl) {
      return
    }

    setSceneRenderFn(() => (settings: SceneSettings) => drawLetterFWithTextureOptions(settings))
  }, [gl])

  const handleDrawTextureWithFilteringClick = useCallback(() => {
    if (!gl) {
      return
    }

    setSceneRenderFn(() => (settings: SceneSettings) => drawLetterFWithTextureFiltering(settings))
  }, [gl])

  const handleDrawTextureWithDistancePolygonsClick = useCallback(() => {
    if (!gl) {
      return
    }

    setSceneRenderFn(() => (settings: SceneSettings) => drawTextureWithDistancePolygons(settings))
  }, [gl])

  const handleDrawCubeWithTextureClick = useCallback(() => {
    if (!gl) {
      return
    }

    setSceneRenderFn(() => (settings: SceneSettings) => drawCubeWithTexture(settings))
  }, [gl])

  const handleConvKernelOnChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedConvolutionKernel(event.currentTarget.value)
    },
    [setSelectedConvolutionKernel],
  )

  const handleDrawImageClick = useCallback(() => {
    if (!gl) {
      return
    }

    const image = new Image()
    image.src = "/images/wall.jpg"
    setSceneRenderFn(
      () => () =>
        renderImage({
          gl,
          image,
          convolutionKernels: convKernels,
          convolutionKernel: selectedConvolutionKernel,
          effects: selectedImageEffects,
        }),
    )
  }, [setSceneRenderFn, gl, convKernels, selectedConvolutionKernel, selectedImageEffects])

  const handleCameraAngleSliderInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const degrees = Number.parseInt(e.target.value)
      setCameraAngleRadians(toRadians(degrees))
    },
    [setCameraAngleRadians],
  )

  const handleFovSliderInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const degrees = Number.parseInt(e.target.value)
      setFieldOfViewRadians(toRadians(degrees))
    },
    [setFieldOfViewRadians],
  )

  const updateTranslation = useCallback(
    (axisIndex: number, position: number) => {
      const newTranslation = translation.map((coordinate, index) => {
        if (index === axisIndex) {
          return position
        }
        return coordinate
      })
      setTranslation(newTranslation)
    },
    [translation, setTranslation],
  )

  const handleXPositionSliderInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const x = Number.parseInt(e.target.value)
      updateTranslation(X_AXIS_INDEX, x)
    },
    [updateTranslation],
  )

  const handleYPositionSliderInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const y = Number.parseInt(e.target.value)
      updateTranslation(Y_AXIS_INDEX, y)
    },
    [updateTranslation],
  )

  const handleZPositionSliderInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const z = Number.parseInt(e.target.value)
      updateTranslation(Z_AXIS_INDEX, z)
    },
    [updateTranslation],
  )

  const updateScale = useCallback(
    (axisIndex: number, position: number) => {
      const newScale = scale.map((coordinate, index) => {
        if (index === axisIndex) {
          return position
        }
        return coordinate
      })
      setScale(newScale)
    },
    [scale],
  )

  const handleScaleXSliderInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const x = Number.parseInt(e.target.value) / 100
      updateScale(X_AXIS_INDEX, x)
    },
    [updateScale],
  )

  const handleScaleYSliderInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const y = Number.parseInt(e.target.value) / 100
      updateScale(Y_AXIS_INDEX, y)
    },
    [updateScale],
  )

  const handleScaleZSliderInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const z = Number.parseInt(e.target.value) / 100
      updateScale(Z_AXIS_INDEX, z)
    },
    [updateScale],
  )

  const handleTextureWrapSOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setTextureWrapS(e.target.value as TextureOption),
    [],
  )

  const handleTextureWrapTOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setTextureWrapT(e.target.value as TextureOption),
    [],
  )

  return (
    <div
      id="geometry-webgl-editor-tool-panel"
      className="grid shrink-1 grid-cols-1 grid-rows-[10%_30%_10%_40%_10%] gap-2"
    >
      <div className="max-h-40 max-w-[100%]">
        <div>
          <span>{t("geometry3DEditorPage.primitives")}</span>
        </div>
        <div className="max-h-12 max-w-[100%]">
          <Tooltip
            title="Triangle"
            placement="bottom-end"
            sx={{
              "& .MuiTooltip-tooltip": {
                maxWidth: "32px",
              },
            }}
          >
            <button className="max-w-24" onClick={handleDrawIsoscelesTriangleClick}>
              <TriangleIcon />
            </button>
          </Tooltip>
        </div>
        <Tooltip title="Rectangle" placement="bottom-end">
          <button className="max-w-32" onClick={handleDrawRectangleClick}>
            <SquareIcon />
          </button>
        </Tooltip>
      </div>
      <div className="max-h-150 max-w-[100%]">
        <TextDrawingControls
          onDrawLetterFClick={handleDrawLetterFClick}
          onDrawCircleFsClick={handleDrawCircleFsClick}
          onDrawCircleFsWithTrackingCameraClick={handleDrawCircleFsWithTrackingCameraClick}
          onDrawLetterFWithTextureOptionsClick={handleDrawLetterFWithTextureOptionsClick}
        />
      </div>
      <div className="max-h-100 max-w-[100%]">
        <MiscControls animationEnabled={animationEnabled} setAnimationEnabled={setAnimationEnabled} />
      </div>
      <TextureControls
        textureWrapS={textureWrapS}
        textureWrapSOnChange={handleTextureWrapSOnChange}
        textureWrapT={textureWrapT}
        textureWrapTOnChange={handleTextureWrapTOnChange}
        onDrawTextureWithFilteringClick={handleDrawTextureWithFilteringClick}
        onDrawTextureWithDistancePolygonsClick={handleDrawTextureWithDistancePolygonsClick}
        onDrawCubeWithTextureClick={handleDrawCubeWithTextureClick}
      />
      <div className="max-h-150 max-w-[100%]">
        <ImageProcessingControls
          selectedImageEffects={selectedImageEffects}
          convKernels={convKernels}
          handleDrawImageClick={handleDrawImageClick}
          setSelectedImageEffects={setSelectedImageEffects}
          handleConvKernelOnChange={handleConvKernelOnChange}
        />
      </div>
      <div className="max-h-128 max-w-[100%]">
        <div>
          <span>Transformations</span>
        </div>
        <WorldControls
          cameraAngleRadians={cameraAngleRadians}
          fieldOfViewRadians={fieldOfViewRadians}
          threeD={threeD}
          handleCameraAngleSliderInput={handleCameraAngleSliderInput}
          handleFovSliderInput={handleFovSliderInput}
          setThreeD={setThreeD}
        />
        <TranslateControls
          translation={translation}
          xMax={gl?.canvas.width || 360}
          yMax={gl?.canvas.height || 360}
          handleXPositionSliderInput={handleXPositionSliderInput}
          handleYPositionSliderInput={handleYPositionSliderInput}
          handleZPositionSliderInput={handleZPositionSliderInput}
        />
        <ScaleControls
          scale={scale}
          handleScaleXSliderInput={handleScaleXSliderInput}
          handleScaleYSliderInput={handleScaleYSliderInput}
          handleScaleZSliderInput={handleScaleZSliderInput}
        />
        <RotationControls
          rotation={rotation}
          setRotation={setRotation}
          rotationDegrees={rotationDegrees}
          setRotationDegrees={setRotationDegrees}
        />
      </div>
      {/*<div>
        <span>{t("geometry3DEditorPage.lights")}</span>
      </div>*/}
    </div>
  )
}

interface TextDrawingControlsProps {
  onDrawLetterFClick: (transformationSeq?: string[]) => void
  onDrawCircleFsClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  onDrawCircleFsWithTrackingCameraClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  onDrawLetterFWithTextureOptionsClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const TextDrawingControls = memo(function TextDrawingControls({
  onDrawLetterFClick,
  onDrawCircleFsClick,
  onDrawCircleFsWithTrackingCameraClick,
  onDrawLetterFWithTextureOptionsClick,
}: TextDrawingControlsProps) {
  return (
    <div className="flex flex-col">
      <Tooltip title="Letter F" placement="bottom-end">
        <button onClick={() => onDrawLetterFClick()}>
          <i>Letter F</i>
        </button>
      </Tooltip>
      <Tooltip title="Circle of letter F" placement="bottom-end">
        <button onClick={onDrawCircleFsClick}>
          <i>Circle Fs</i>
        </button>
      </Tooltip>
      <Tooltip title="Circle of letter F with tracking camera" placement="bottom-end">
        <button onClick={onDrawCircleFsWithTrackingCameraClick}>
          <i>Circle Fs lookAt</i>
        </button>
      </Tooltip>
      <Tooltip title="F with texture and options" placement="bottom-end">
        <button onClick={onDrawLetterFWithTextureOptionsClick}>
          <i>F with texture and options</i>
        </button>
      </Tooltip>
      {Object.keys(transformationSequences).map((key) => (
        <Tooltip key={key} title={`Letter F (${key})`} placement="bottom-end">
          <button
            onClick={() => {
              const transformationSeq = transformationSequences[key as TransformationSequenceKey]
              onDrawLetterFClick(transformationSeq)
            }}
          >
            <i>Letter F ({key})</i>
          </button>
        </Tooltip>
      ))}
    </div>
  )
})

interface ImageProcessingControlsProps {
  selectedImageEffects: string[]
  convKernels: ConvolutionKernal
  handleDrawImageClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  setSelectedImageEffects: (effects: string[]) => void
  handleConvKernelOnChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

const ImageProcessingControls = memo(function ImageProcessingControls({
  selectedImageEffects,
  convKernels,
  handleDrawImageClick,
  setSelectedImageEffects,
  handleConvKernelOnChange,
}: ImageProcessingControlsProps) {
  const imageEffects = createImageEffects()

  function handleSelectImageEffectsOnChange(event: SelectChangeEvent<typeof imageEffects>) {
    const { value } = event.target
    setSelectedImageEffects(typeof value === "string" ? value.split(",") : value)
  }

  const kernelOptions = Object.keys(convKernels).map((kernel) => <option key={kernel}>{kernel}</option>)

  return (
    <>
      <Tooltip title="Image" placement="bottom-end">
        <button onClick={handleDrawImageClick}>
          <i>Image</i>
        </button>
      </Tooltip>
      <select onChange={handleConvKernelOnChange}>{kernelOptions}</select>
      <FormControl sx={{ m: 1, width: 200 }}>
        <InputLabel id="select-image-effects-label">Effect</InputLabel>
        <Select
          labelId="select-image-effects-label"
          id="select-image-effects"
          multiple
          value={selectedImageEffects}
          onChange={handleSelectImageEffectsOnChange}
          input={<OutlinedInput label="select-image-effects-label" />}
          renderValue={(selected) => selected.join(", ")}
          MenuProps={MenuProps}
        >
          {imageEffects.map((name) => (
            <MenuItem key={name} value={name}>
              <Checkbox checked={selectedImageEffects.includes(name)} />
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  )
})

interface TextureControlsProps {
  textureWrapS: string
  textureWrapSOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  textureWrapT: string
  textureWrapTOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDrawTextureWithFilteringClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  onDrawTextureWithDistancePolygonsClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  onDrawCubeWithTextureClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}

function TextureWrapRadioGroup({
  type,
  value,
  onChange,
}: {
  type: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <FormControl>
      <FormLabel id="texture-wrap-s-radio-group-label">TEXTURE_WRAP_{type.toUpperCase()}</FormLabel>
      <RadioGroup
        aria-labelledby={`texture-wrap-${type}-radio-group-label`}
        defaultValue="REPEAT"
        name={`texture-wrap-${type}-radio-group`}
        value={value}
        onChange={onChange}
      >
        <FormControlLabel value="REPEAT" control={<Radio />} label="REPEAT" />
        <FormControlLabel value="CLAMP_TO_EDGE" control={<Radio />} label="CLAMP_TO_EDGE" />
        <FormControlLabel value="MIRRORED_REPEAT" control={<Radio />} label="MIRRORED_REPEAT" />
      </RadioGroup>
    </FormControl>
  )
}

const TextureControls = memo(function TextureControls({
  textureWrapSOnChange,
  textureWrapS,
  textureWrapT,
  textureWrapTOnChange,
  onDrawTextureWithFilteringClick,
  onDrawTextureWithDistancePolygonsClick,
  onDrawCubeWithTextureClick,
}: TextureControlsProps) {
  return (
    <div className="h-150">
      <TextureWrapRadioGroup type="s" value={textureWrapS} onChange={textureWrapSOnChange} />
      <TextureWrapRadioGroup type="t" value={textureWrapT} onChange={textureWrapTOnChange} />
      <Tooltip title="Texture with filtering" placement="bottom-end">
        <button onClick={onDrawTextureWithFilteringClick}>
          <i>F with filtering</i>
        </button>
      </Tooltip>
      <Tooltip title="Texture with distance polygons" placement="bottom-end">
        <button onClick={onDrawTextureWithDistancePolygonsClick}>
          <i>Distance polygons</i>
        </button>
      </Tooltip>
      <Tooltip title="Cube with texture" placement="bottom-end">
        <button onClick={onDrawCubeWithTextureClick}>
          <i>Cube</i>
        </button>
      </Tooltip>
    </div>
  )
})

interface MiscControlsProps {
  animationEnabled: boolean
  setAnimationEnabled: (value: boolean) => void
}

const MiscControls = memo(function MiscControls({ animationEnabled, setAnimationEnabled }: MiscControlsProps) {
  return (
    <>
      <label htmlFor="animation-toggle">Animation on/off</label>
      <input
        id="animation-toggle"
        type="checkbox"
        checked={animationEnabled}
        onChange={(event) => setAnimationEnabled(event.target.checked)}
      />
    </>
  )
})

interface WorldControlsProps {
  cameraAngleRadians: number
  fieldOfViewRadians: number
  threeD: boolean
  handleCameraAngleSliderInput: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleFovSliderInput: (e: React.ChangeEvent<HTMLInputElement>) => void
  setThreeD: (value: boolean) => void
}

const WorldControls = memo(function WorldControls({
  cameraAngleRadians,
  fieldOfViewRadians,
  threeD,
  handleCameraAngleSliderInput,
  handleFovSliderInput,
  setThreeD,
}: WorldControlsProps) {
  const fieldOfViewInDegrees = Math.floor(radiansToDegrees(fieldOfViewRadians))
  const cameraAngleInDegrees = Math.floor(radiansToDegrees(cameraAngleRadians))

  return (
    <>
      <div>
        <label htmlFor="3d-mode">3D</label>
        <input id="3d-mode" type="checkbox" checked={threeD} onChange={(event) => setThreeD(event.target.checked)} />
      </div>
      <div className="slide-container">
        <p>
          <label htmlFor="fov-slider">Camera angle</label>
          <input
            id="fov-slider"
            className="slider"
            type="range"
            min="-360"
            max="360"
            step="1"
            value={cameraAngleInDegrees}
            onInput={handleCameraAngleSliderInput}
          />
          <span>{cameraAngleInDegrees}°</span>
        </p>
      </div>
      <div className="slide-container">
        <p>
          <label htmlFor="fov-slider">Field of view (FOV)</label>
          <input
            id="fov-slider"
            className="slider"
            type="range"
            min="1"
            max="179"
            step="1"
            value={fieldOfViewInDegrees}
            onInput={handleFovSliderInput}
          />
          <span>{fieldOfViewInDegrees}°</span>
        </p>
      </div>
    </>
  )
})

interface TranslateControlsProps {
  translation: number[]
  xMax: number
  yMax: number
  handleXPositionSliderInput: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleYPositionSliderInput: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleZPositionSliderInput: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const TranslateControls = memo(function TranslateControls({
  translation,
  xMax,
  yMax,
  handleXPositionSliderInput,
  handleYPositionSliderInput,
  handleZPositionSliderInput,
}: TranslateControlsProps) {
  return (
    <div className="slide-container">
      <span>Translate</span>
      <p>
        <label htmlFor="x-position-slider">x</label>
        <input
          id="x-position-slider"
          className="slider"
          type="range"
          min="-360"
          max={xMax}
          step="1"
          value={translation[X_AXIS_INDEX]}
          onInput={handleXPositionSliderInput}
        />
        <span>{translation[X_AXIS_INDEX]}</span>
      </p>
      <p>
        <label htmlFor="y-position-slider">y</label>
        <input
          id="y-position-slider"
          className="slider"
          type="range"
          min="-360"
          max={yMax}
          step="1"
          value={translation[Y_AXIS_INDEX]}
          onInput={handleYPositionSliderInput}
        />
        <span>{translation[Y_AXIS_INDEX]}</span>
      </p>
      <p>
        <label htmlFor="z-position-slider">z</label>
        <input
          id="z-position-slider"
          className="slider"
          type="range"
          min="-360"
          max={yMax}
          step="1"
          value={translation[Z_AXIS_INDEX]}
          onInput={handleZPositionSliderInput}
        />
        <span>{translation[Z_AXIS_INDEX]}</span>
      </p>
    </div>
  )
})

interface ScaleControlsProps {
  scale: number[]
  handleScaleXSliderInput: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleScaleYSliderInput: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleScaleZSliderInput: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const ScaleControls = memo(function ScaleControls({
  scale,
  handleScaleXSliderInput,
  handleScaleYSliderInput,
  handleScaleZSliderInput,
}: ScaleControlsProps) {
  return (
    <div className="slide-container">
      <span>Scale</span>
      <p>
        <label htmlFor="scale-x-slider">x</label>
        <input
          id="scale-x-slider"
          className="slider"
          type="range"
          min="-500"
          max="500"
          step="any"
          value={scale[X_AXIS_INDEX] * 100}
          onInput={handleScaleXSliderInput}
        />
        <span>{scale[X_AXIS_INDEX]}</span>
      </p>
      <p>
        <label htmlFor="scale-y-slider">y</label>
        <input
          id="scale-y-slider"
          className="slider"
          type="range"
          min="-500"
          max="500"
          step="any"
          value={scale[Y_AXIS_INDEX] * 100}
          onInput={handleScaleYSliderInput}
        />
        <span>{scale[Y_AXIS_INDEX]}</span>
      </p>
      <p>
        <label htmlFor="scale-z-slider">z</label>
        <input
          id="scale-z-slider"
          className="slider"
          type="range"
          min="-500"
          max="500"
          step="any"
          value={scale[Z_AXIS_INDEX] * 100}
          onInput={handleScaleZSliderInput}
        />
        <span>{scale[Z_AXIS_INDEX]}</span>
      </p>
    </div>
  )
})

interface RotationControlsProps {
  rotationDegrees: number
  rotation: number[]
  setRotationDegrees: (value: number) => void
  setRotation: (vector: number[]) => void
}

const RotationControls = memo(function RotationControls({
  rotationDegrees,
  setRotationDegrees,
  rotation,
  setRotation,
}: RotationControlsProps) {
  function updateRotation(axisIndex: number, position: number) {
    const newRotation = rotation.map((coordinate, index) => {
      if (index === axisIndex) {
        return position
      }
      return coordinate
    })
    setRotation(newRotation)
  }

  return (
    <>
      <InputSlider label="Rotate" value={rotationDegrees} setValue={setRotationDegrees} />
      <InputSlider label="Rotate x" value={rotation[X_AXIS_INDEX]} setValue={(x) => updateRotation(X_AXIS_INDEX, x)} />
      <InputSlider label="Rotate y" value={rotation[Y_AXIS_INDEX]} setValue={(y) => updateRotation(Y_AXIS_INDEX, y)} />
      <InputSlider label="Rotate z" value={rotation[Z_AXIS_INDEX]} setValue={(z) => updateRotation(Z_AXIS_INDEX, z)} />
    </>
  )
})
