import * as webglUtils from "@/lib/utils/webglUtils"
import smallRectangleVertexShader, { rectangleVertexShader } from "./shaders/rectangleVert"
import smallRectangleFragmentShader, { rectangleFragmentShader } from "./shaders/rectangleFrag"
import triangleVertexShader from "./shaders/triangleVert"
import triangleFragmentShader from "./shaders/triangleFrag"
import letterFVertexShader, {
  letterFWithTransformedMatrixVertexShader,
  letterFWithTransformedMatrixVertex3dShader,
  withTextureVertex3dShader,
} from "./shaders/letterFVert"
import letterFFragmentShader, { letterFFragment3dShader, withTextureFragment3dShader } from "./shaders/letterFFrag"
import * as linalg from "@/lib/features/math/linalgCalculator"
import { toRadians } from "@/lib/features/math/conversionCalculator"
import { clearCanvas } from "./webglEditorCommons"

export type TextureOption = "REPEAT" | "CLAMP_TO_EDGE" | "MIRRORED_REPEAT"

export interface SceneSettings {
  gl: WebGL2RenderingContext
  fieldOfViewRadians?: number
  translation?: number[]
  translateX?: number
  translateY?: number
  rotationRadians?: number
  rotation?: number[]
  rotationX?: number
  rotationY?: number
  scale?: number[]
  scaleX?: number
  scaleY?: number
  transformedMatrix?: Float32Array | number[]
  threeD?: boolean
  cameraAngleRadians?: number
  animationEnabled?: boolean
  textureWrapS?: TextureOption
  textureWrapT?: TextureOption
  distance?: number
  divisions?: number
  startAngle?: number
  endAngle?: number
  capStart?: boolean
  capEnd?: boolean
  triangles?: boolean
}

function computeMatrix({ gl, translateX = 200, translateY = 150 }: SceneSettings) {
  let matrix = linalg.projection(gl.canvas.width, gl.canvas.height)
  matrix = linalg.translate(matrix, translateX, translateY)
  matrix = linalg.rotate(matrix, 0)
  return linalg.scale(matrix, 1, 1)
}

function drawTriangles({ gl, offset = 0, count = 6 }: { gl: WebGL2RenderingContext; offset?: number; count?: number }) {
  const primitiveType = gl.TRIANGLES
  gl.drawArrays(primitiveType, offset, count)
}

function setTriangleGeometry(gl: WebGL2RenderingContext) {
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, -100, 150, 125, -175, 100]), gl.STATIC_DRAW)
}

function setRectangleGeometry(gl: WebGL2RenderingContext) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-150, -100, 150, -100, -150, 100, 150, -100, -150, 100, 150, 100]),
    gl.STATIC_DRAW,
  )
}

function setRandomRectangleColors(gl: WebGL2RenderingContext) {
  // Pick 2 random colors.
  const r1 = Math.random()
  const b1 = Math.random()
  const g1 = Math.random()
  const r2 = Math.random()
  const b2 = Math.random()
  const g2 = Math.random()

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([r1, b1, g1, 1, r1, b1, g1, 1, r1, b1, g1, 1, r2, b2, g2, 1, r2, b2, g2, 1, r2, b2, g2, 1]),
    gl.STATIC_DRAW,
  )
}

function setLetterFGeometry(gl: WebGL2RenderingContext) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    // prettier-ignore
    new Float32Array([
      // left column
      0, 0,
      30, 0,
      0, 150,
      0, 150,
      30, 0,
      30, 150,

      // top rung
      30, 0,
      100, 0,
      30, 30,
      30, 30,
      100, 0,
      100, 30,

      // middle rung
      30, 60,
      67, 60,
      30, 90,
      30, 90,
      67, 60,
      67, 90]),
    gl.STATIC_DRAW,
  )
}

function setLetterFGeometry3d(gl: WebGL2RenderingContext, arrayPostProcessor?: (positions: Float32Array) => void) {
  // prettier-ignore
  const points = new Float32Array([
    // left column front
    0,   0,  0,
    0, 150,  0,
    30,   0,  0,
    0, 150,  0,
    30, 150,  0,
    30,   0,  0,

    // top rung front
    30,   0,  0,
    30,  30,  0,
    100,   0,  0,
    30,  30,  0,
    100,  30,  0,
    100,   0,  0,

    // middle rung front
    30,  60,  0,
    30,  90,  0,
    67,  60,  0,
    30,  90,  0,
    67,  90,  0,
    67,  60,  0,

    // left column back
    0,   0,  30,
    30,   0,  30,
    0, 150,  30,
    0, 150,  30,
    30,   0,  30,
    30, 150,  30,

    // top rung back
    30,   0,  30,
    100,   0,  30,
    30,  30,  30,
    30,  30,  30,
    100,   0,  30,
    100,  30,  30,

    // middle rung back
    30,  60,  30,
    67,  60,  30,
    30,  90,  30,
    30,  90,  30,
    67,  60,  30,
    67,  90,  30,

    // top
    0,   0,   0,
    100,   0,   0,
    100,   0,  30,
    0,   0,   0,
    100,   0,  30,
    0,   0,  30,

    // top rung right
    100,   0,   0,
    100,  30,   0,
    100,  30,  30,
    100,   0,   0,
    100,  30,  30,
    100,   0,  30,

    // under top rung
    30,   30,   0,
    30,   30,  30,
    100,  30,  30,
    30,   30,   0,
    100,  30,  30,
    100,  30,   0,

    // between top rung and middle
    30,   30,   0,
    30,   60,  30,
    30,   30,  30,
    30,   30,   0,
    30,   60,   0,
    30,   60,  30,

    // top of middle rung
    30,   60,   0,
    67,   60,  30,
    30,   60,  30,
    30,   60,   0,
    67,   60,   0,
    67,   60,  30,

    // right of middle rung
    67,   60,   0,
    67,   90,  30,
    67,   60,  30,
    67,   60,   0,
    67,   90,   0,
    67,   90,  30,

    // bottom of middle rung.
    30,   90,   0,
    30,   90,  30,
    67,   90,  30,
    30,   90,   0,
    67,   90,  30,
    67,   90,   0,

    // right of bottom
    30,   90,   0,
    30,  150,  30,
    30,   90,  30,
    30,   90,   0,
    30,  150,   0,
    30,  150,  30,

    // bottom
    0,   150,   0,
    0,   150,  30,
    30,  150,  30,
    0,   150,   0,
    30,  150,  30,
    30,  150,   0,

    // left side
    0,   0,   0,
    0,   0,  30,
    0, 150,  30,
    0,   0,   0,
    0, 150,  30,
    0, 150,   0,
  ])
  if (arrayPostProcessor) {
    arrayPostProcessor(points)
  }
  gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW)
}

export function drawIsoscelesTriangle({ gl, translateX = 200, translateY = 150 }: SceneSettings) {
  const program = webglUtils.createProgramFromSources(gl, [triangleVertexShader, triangleFragmentShader])!

  const positionLocation = gl.getAttribLocation(program, "a_position")
  const matrixLocation = gl.getUniformLocation(program, "u_matrix")

  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  setTriangleGeometry(gl)

  gl.enableVertexAttribArray(positionLocation)
  const size = 2
  const type = gl.FLOAT
  const normalize = false
  const stride = 0
  const offset = 0
  gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset)

  function drawScene(gl: WebGL2RenderingContext) {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement)

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    clearCanvas(gl)

    gl.useProgram(program)
    gl.bindVertexArray(vao)

    const matrix = computeMatrix({ gl, translateX, translateY })
    gl.uniformMatrix3fv(matrixLocation, false, matrix)

    drawTriangles({ gl, count: 3 })
  }

  drawScene(gl)
}

export function drawSampleRectangle(gl: WebGL2RenderingContext) {
  const program = webglUtils.createProgramFromSources(gl, [smallRectangleVertexShader, smallRectangleFragmentShader])!

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position")
  const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution")

  const positionBuffer = gl.createBuffer()

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  const positions = [10, 20, 80, 20, 10, 30, 10, 30, 80, 20, 80, 30]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  const vertexArrayObject = gl.createVertexArray()
  gl.bindVertexArray(vertexArrayObject)

  gl.enableVertexAttribArray(positionAttributeLocation)

  const size = 2 // 2 components per iteration
  const type = gl.FLOAT // the data is 32bit floats
  const normalize = false
  const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset = 0 // start at the beginning of the buffer
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

  webglUtils.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement)

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  clearCanvas(gl)

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program)

  gl.bindVertexArray(vertexArrayObject)

  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height)

  drawTriangles({ gl })

  return { webglContext: gl, program }
}

export function drawRectangle({ gl, translateX, translateY }: SceneSettings) {
  const program = webglUtils.createProgramFromSources(gl, [rectangleVertexShader, rectangleFragmentShader])!

  const positionLocation = gl.getAttribLocation(program, "a_position")
  const colorLocation = gl.getAttribLocation(program, "a_color")

  // lookup uniforms
  const matrixLocation = gl.getUniformLocation(program, "u_matrix")!

  // Create set of attributes
  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)

  // Create a buffer for the positons.
  let buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

  setRectangleGeometry(gl)

  // tell the position attribute how to pull data out of the current ARRAY_BUFFER
  gl.enableVertexAttribArray(positionLocation)
  let size = 2
  const type = gl.FLOAT
  const normalize = false
  const stride = 0
  const offset = 0
  gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset)

  // Create a buffer for the colors.
  buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  setRandomRectangleColors(gl)

  // tell the color attribute how to pull data out of the current ARRAY_BUFFER
  gl.enableVertexAttribArray(colorLocation)
  size = 4
  gl.vertexAttribPointer(colorLocation, size, type, normalize, stride, offset)

  webglUtils.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement)

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  clearCanvas(gl)

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program)

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao)

  const matrix = computeMatrix({ gl, translateX, translateY })
  gl.uniformMatrix3fv(matrixLocation, false, matrix)
  drawTriangles({ gl })
}

export function drawLetterF({ gl, translation = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 0] }: SceneSettings) {
  const program = webglUtils.createProgramFromSources(gl, [letterFVertexShader, letterFFragmentShader])!

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position")
  const colorLocation = gl.getUniformLocation(program, "u_color")

  const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution")
  const translationLocation = gl.getUniformLocation(program, "u_translation")
  const rotationLocation = gl.getUniformLocation(program, "u_rotation")
  const scaleLocation = gl.getUniformLocation(program, "u_scale")

  const positionBuffer = gl.createBuffer()

  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)

  gl.enableVertexAttribArray(positionAttributeLocation)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  setLetterFGeometry(gl)

  const size = 2 // 2 components per iteration
  const type = gl.FLOAT // the data is 32bit floats
  const normalize = false
  const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset = 0
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

  const color = [0, 255, 0, 1]

  webglUtils.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement)

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  clearCanvas(gl)
  gl.useProgram(program)
  gl.bindVertexArray(vao)

  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height)
  gl.uniform2fv(translationLocation, translation?.slice(0, 1))
  gl.uniform2fv(rotationLocation, rotation?.slice(0, 1))
  gl.uniform2fv(scaleLocation, scale?.slice(0, 1))
  gl.uniform4fv(colorLocation, color)

  const primitiveType = gl.TRIANGLES
  const count = 18
  gl.drawArrays(primitiveType, offset, count)
}

export function drawLetterFWithTransformedMatrix({ gl, transformedMatrix, threeD = false }: SceneSettings) {
  if (!transformedMatrix) {
    throw Error("The transformed matrix is not provided")
  }

  const offset = 0
  if (threeD) {
    const program = webglUtils.createProgramFromSources(gl, [
      letterFWithTransformedMatrixVertex3dShader,
      letterFFragment3dShader,
    ])!
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    const colorAttributeLocation = gl.getAttribLocation(program, "a_color")

    const matrixLocation = gl.getUniformLocation(program, "u_matrix")

    const positionBuffer = gl.createBuffer()

    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    gl.enableVertexAttribArray(positionAttributeLocation)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    setLetterFGeometry3d(gl)

    const size = 3
    let type: number = gl.FLOAT // the data is 32bit floats
    let normalize = false
    const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

    const colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    setLetterFColors(gl)
    gl.enableVertexAttribArray(colorAttributeLocation)

    type = gl.UNSIGNED_BYTE // the data is 8bit unsigned bytes
    normalize = true // convert from 0-255 to 0.0-1.0
    gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset)

    webglUtils.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement)

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    clearCanvas(gl)

    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)
    gl.useProgram(program)
    gl.bindVertexArray(vao)
    gl.uniformMatrix4fv(matrixLocation, false, transformedMatrix)
    drawTriangles({ gl, offset, count: 16 * 6 })
  } else {
    const program = webglUtils.createProgramFromSources(gl, [
      letterFWithTransformedMatrixVertexShader,
      letterFFragmentShader,
    ])!

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    const colorLocation = gl.getUniformLocation(program, "u_color")

    const positionBuffer = gl.createBuffer()

    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    gl.enableVertexAttribArray(positionAttributeLocation)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    setLetterFGeometry(gl)

    const size = 2 // 2 components per iteration
    const type = gl.FLOAT // the data is 32bit floats
    const normalize = false
    const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

    webglUtils.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement)

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    clearCanvas(gl)
    gl.useProgram(program)
    gl.bindVertexArray(vao)

    const color = [0, 255, 0, 1]

    const matrixLocation = gl.getUniformLocation(program, "u_matrix")
    gl.uniformMatrix3fv(matrixLocation, false, transformedMatrix)
    gl.uniform4fv(colorLocation, color)
    drawTriangles({ gl, offset, count: 18 })
  }
}
export function drawCircleFs({ gl, fieldOfViewRadians, cameraAngleRadians }: SceneSettings) {
  throwIfAnyInvalidNumber([fieldOfViewRadians, cameraAngleRadians])

  const program = webglUtils.createProgramFromSources(
    gl,
    [letterFWithTransformedMatrixVertex3dShader, letterFFragment3dShader],
    [],
    [],
    (err) => {
      throw err
    },
  )!

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position")
  const colorAttributeLocation = gl.getAttribLocation(program, "a_color")

  const matrixLocation = gl.getUniformLocation(program, "u_matrix")

  const positionBuffer = gl.createBuffer()

  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)

  gl.enableVertexAttribArray(positionAttributeLocation)

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  function arrayPostProcessor(points: Float32Array) {
    let matrix = linalg.xRotation(Math.PI)
    matrix = linalg.translate3d(matrix, -50, -75, -15)

    for (let i = 0; i < points.length; i += 3) {
      const vector = linalg.transformVector(matrix, [points[i], points[i + 1], points[i + 2], 1])
      points[i] = vector[0]
      points[i + 1] = vector[1]
      points[i + 2] = vector[2]
    }
  }
  setLetterFGeometry3d(gl, arrayPostProcessor)

  const size = 3
  let type: number = gl.FLOAT
  let normalize = false
  const stride = 0
  const offset = 0
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

  const colorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
  setLetterFColors(gl)

  gl.enableVertexAttribArray(colorAttributeLocation)

  type = gl.UNSIGNED_BYTE
  normalize = true
  gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset)

  function drawScene() {
    const numFs = 5
    const radius = 200

    webglUtils.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement)

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    clearCanvas(gl)

    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)

    gl.useProgram(program)

    gl.bindVertexArray(vao)

    const aspect = gl.canvas.width / gl.canvas.height
    const zNear = 1
    const zFar = 2000
    const projectionMatrix = linalg.perspective(fieldOfViewRadians!, aspect, zNear, zFar)

    let cameraMatrix: Float32Array | number[] = linalg.yRotation(cameraAngleRadians!)
    cameraMatrix = linalg.translate3d(cameraMatrix, 0, 0, radius * 1.5)

    const viewMatrix = linalg.inverse3d(cameraMatrix)

    // create a viewProjection matrix. This will both apply perspective
    // AND move the world so that the camera is effectively the origin
    const viewProjectionMatrix = linalg.multiply3d(projectionMatrix, viewMatrix)

    for (let i = 0; i < numFs; i++) {
      const angle = (i * Math.PI * 2) / numFs

      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const matrix = linalg.translate3d(viewProjectionMatrix, x, 0, z)

      gl.uniformMatrix4fv(matrixLocation, false, matrix)

      const offset = 0
      const count = 16 * 6
      drawTriangles({ gl, offset, count })
    }
  }

  drawScene()
}

function throwIfAnyInvalidNumber(data: (number | undefined)[]) {
  for (const n of data) {
    if (n === undefined || isNaN(n)) {
      throw new Error("Invalid number")
    }
  }
}

export function drawCircleFsWithTrackingCamera({ gl, fieldOfViewRadians, cameraAngleRadians }: SceneSettings) {
  throwIfAnyInvalidNumber([fieldOfViewRadians, cameraAngleRadians])

  const program = webglUtils.createProgramFromSources(
    gl,
    [letterFWithTransformedMatrixVertex3dShader, letterFFragment3dShader],
    [],
    [],
    (err) => {
      throw err
    },
  )!

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position")
  const colorAttributeLocation = gl.getAttribLocation(program, "a_color")
  const matrixLocation = gl.getUniformLocation(program, "u_matrix")

  const positionBuffer = gl.createBuffer()

  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)

  gl.enableVertexAttribArray(positionAttributeLocation)

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  function arrayPostProcessor(points: Float32Array) {
    let matrix = linalg.xRotation(Math.PI)
    matrix = linalg.translate3d(matrix, -50, -75, -15)

    for (let i = 0; i < points.length; i += 3) {
      const vector = linalg.transformVector(matrix, [points[i], points[i + 1], points[i + 2], 1])
      points[i] = vector[0]
      points[i + 1] = vector[1]
      points[i + 2] = vector[2]
    }
  }
  setLetterFGeometry3d(gl, arrayPostProcessor)

  const size = 3
  let type: number = gl.FLOAT
  let normalize = false
  const stride = 0
  const offset = 0
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

  const colorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
  setLetterFColors(gl)

  gl.enableVertexAttribArray(colorAttributeLocation)

  type = gl.UNSIGNED_BYTE
  normalize = true
  gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset)

  function drawScene() {
    const numFs = 5
    const radius = 200

    webglUtils.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement)

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    clearCanvas(gl)

    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)

    gl.useProgram(program)
    gl.bindVertexArray(vao)

    const aspect = gl.canvas.width / gl.canvas.height
    const zNear = 1
    const zFar = 2000
    const projectionMatrix = linalg.perspective(fieldOfViewRadians!, aspect, zNear, zFar)

    // Compute the position of the first F
    const fPosition = [radius, 0, 0]

    // Use matrix math to compute a position on the circle.
    let cameraMatrix = linalg.yRotation(cameraAngleRadians!)
    cameraMatrix = linalg.translate3d(cameraMatrix, 0, 50, radius * 1.5)

    // Get the camera's position from the computed matrix
    const cameraPosition = [cameraMatrix[12], cameraMatrix[13], cameraMatrix[14]]

    const up = [0, 1, 0]

    cameraMatrix = linalg.lookAt(cameraPosition, fPosition, up)

    const viewMatrix = linalg.inverse3d(cameraMatrix)

    // create a viewProjection matrix. This will both apply perspective
    // AND move the world so that the camera is effectively the origin
    const viewProjectionMatrix = linalg.multiply3d(projectionMatrix, viewMatrix)

    // Draw 'F's in a circle
    for (let i = 0; i < numFs; i++) {
      const angle = (i * Math.PI * 2) / numFs

      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const matrix = linalg.translate3d(viewProjectionMatrix, x, 0, z)

      gl.uniformMatrix4fv(matrixLocation, false, matrix)

      const count = 16 * 6
      drawTriangles({ gl, offset, count })
    }
  }

  drawScene()
}

function setLetterFColors(gl: WebGLRenderingContext) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    // prettier-ignore
    new Uint8Array([
      // left column front
      200,  70, 120,
      200,  70, 120,
      200,  70, 120,
      200,  70, 120,
      200,  70, 120,
      200,  70, 120,

      // top rung front
      200,  70, 120,
      200,  70, 120,
      200,  70, 120,
      200,  70, 120,
      200,  70, 120,
      200,  70, 120,

      // middle rung front
      200,  70, 120,
      200,  70, 120,
      200,  70, 120,
      200,  70, 120,
      200,  70, 120,
      200,  70, 120,

      // left column back
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,

      // top rung back
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,

      // middle rung back
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,

      // top
      70, 200, 210,
      70, 200, 210,
      70, 200, 210,
      70, 200, 210,
      70, 200, 210,
      70, 200, 210,

      // top rung right
      200, 200, 70,
      200, 200, 70,
      200, 200, 70,
      200, 200, 70,
      200, 200, 70,
      200, 200, 70,

      // under top rung
      210, 100, 70,
      210, 100, 70,
      210, 100, 70,
      210, 100, 70,
      210, 100, 70,
      210, 100, 70,

      // between top rung and middle
      210, 160, 70,
      210, 160, 70,
      210, 160, 70,
      210, 160, 70,
      210, 160, 70,
      210, 160, 70,

      // top of middle rung
      70, 180, 210,
      70, 180, 210,
      70, 180, 210,
      70, 180, 210,
      70, 180, 210,
      70, 180, 210,

      // right of middle rung
      100, 70, 210,
      100, 70, 210,
      100, 70, 210,
      100, 70, 210,
      100, 70, 210,
      100, 70, 210,

      // bottom of middle rung.
      76, 210, 100,
      76, 210, 100,
      76, 210, 100,
      76, 210, 100,
      76, 210, 100,
      76, 210, 100,

      // right of bottom
      140, 210, 80,
      140, 210, 80,
      140, 210, 80,
      140, 210, 80,
      140, 210, 80,
      140, 210, 80,

      // bottom
      90, 130, 110,
      90, 130, 110,
      90, 130, 110,
      90, 130, 110,
      90, 130, 110,
      90, 130, 110,

      // left side
      160, 160, 220,
      160, 160, 220,
      160, 160, 220,
      160, 160, 220,
      160, 160, 220,
      160, 160, 220,
    ]),
    gl.STATIC_DRAW,
  )
}

export function drawLetterFWithTextureOptions({ gl, textureWrapS, textureWrapT }: SceneSettings) {
  function main() {
    const program = webglUtils.createProgramFromSources(
      gl,
      [withTextureVertex3dShader, withTextureFragment3dShader],
      [],
      [],
      (err) => {
        throw err
      },
    )!

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    const texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord")

    const matrixLocation = gl.getUniformLocation(program, "u_matrix")

    const positionBuffer = gl.createBuffer()

    const vao = gl.createVertexArray()

    gl.bindVertexArray(vao)

    gl.enableVertexAttribArray(positionAttributeLocation)

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    setGeometry(gl)

    let size = 3
    const type = gl.FLOAT
    let normalize = false
    const stride = 0
    const offset = 0
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

    const textureCoordsBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordsBuffer)
    setTextureCoords(gl)

    gl.enableVertexAttribArray(texcoordAttributeLocation)

    size = 2
    normalize = true // convert from 0-255 to 0.0-1.0
    gl.vertexAttribPointer(texcoordAttributeLocation, size, type, normalize, stride, offset)

    const texture = gl.createTexture()

    gl.activeTexture(gl.TEXTURE0)

    gl.bindTexture(gl.TEXTURE_2D, texture)

    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]))

    const image = new Image()
    image.src = "/images/f-texture.png"
    image.addEventListener("load", function () {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      gl.generateMipmap(gl.TEXTURE_2D)
      drawScene()
    })

    const wrapS = textureWrapS != undefined ? gl[textureWrapS] : gl.REPEAT
    const wrapT = textureWrapT != undefined ? gl[textureWrapT] : gl.REPEAT

    drawScene()

    function drawScene() {
      webglUtils.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement)

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

      clearCanvas(gl)

      gl.enable(gl.DEPTH_TEST)

      gl.useProgram(program)

      gl.bindVertexArray(vao)

      const scaleFactor = 2.5
      const size = 80 * scaleFactor
      const x = gl.canvas.width / 2 - size / 2
      const y = gl.canvas.height - size - 60

      let matrix = linalg.orthographic(0, gl.canvas.width, gl.canvas.height, 0, -1, 1)
      matrix = linalg.translate3d(matrix, x, y, 0)
      matrix = linalg.scale3d(matrix, size, size, 1)
      matrix = linalg.translate3d(matrix, 0.5, 0.5, 0)

      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT)

      gl.uniformMatrix4fv(matrixLocation, false, matrix)

      drawTriangles({ gl, offset: 0, count: 6 })
    }
  }

  function setGeometry(gl: WebGL2RenderingContext) {
    // prettier-ignore
    const positions = new Float32Array([
      -0.5,  0.5, 0.5,
       0.5,  0.5, 0.5,
      -0.5, -0.5, 0.5,
      -0.5, -0.5, 0.5,
       0.5,  0.5, 0.5,
       0.5, -0.5, 0.5,
    ])

    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
  }

  function setTextureCoords(gl: WebGL2RenderingContext) {
    gl.bufferData(
      gl.ARRAY_BUFFER,
      // prettier-ignore
      new Float32Array([
        -3, -1,
         2, -1,
        -3,  4,
        -3,  4,
         2, -1,
         2,  4,
      ]),
      gl.STATIC_DRAW,
    )
  }

  main()
}

export function drawLetterFWithTextureFiltering({ gl }: SceneSettings) {
  function main() {
    const program = webglUtils.createProgramFromSources(
      gl,
      [withTextureVertex3dShader, withTextureFragment3dShader],
      [],
      [],
      (err) => {
        throw err
      },
    )!

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    const textureCoordsAttributeLocation = gl.getAttribLocation(program, "a_texcoord")
    const matrixLocation = gl.getUniformLocation(program, "u_matrix")
    const positionBuffer = gl.createBuffer()

    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    gl.enableVertexAttribArray(positionAttributeLocation)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    setGeometry(gl)

    let size = 3
    const type = gl.FLOAT
    let normalize = false
    const stride = 0
    const offset = 0
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

    const textureCoordsBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordsBuffer)
    setTextureCoords(gl)

    gl.enableVertexAttribArray(textureCoordsAttributeLocation)

    size = 2
    normalize = true
    gl.vertexAttribPointer(textureCoordsAttributeLocation, size, type, normalize, stride, offset)

    let allocateFBTexture = true
    let framebufferWidth = 0 // set at render time
    let framebufferHeight = 0 // set at render time
    const framebuffer = gl.createFramebuffer()
    const fbTexture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, fbTexture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fbTexture, 0)

    const texture = gl.createTexture()

    gl.activeTexture(gl.TEXTURE0)

    gl.bindTexture(gl.TEXTURE_2D, texture)

    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]))

    const image = new Image()
    image.src = "/images/mip-low-res-example.png"
    image.addEventListener("load", function () {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      gl.generateMipmap(gl.TEXTURE_2D)
    })

    const fieldOfViewRadians = toRadians(60)

    requestAnimationFrame(drawScene)

    function drawScene(time: number) {
      time *= 0.001 // convert to seconds

      if (
        webglUtils.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement, window.devicePixelRatio) ||
        allocateFBTexture
      ) {
        allocateFBTexture = false
        framebufferWidth = gl.canvas.width / 4
        framebufferHeight = gl.canvas.height / 4
        gl.bindTexture(gl.TEXTURE_2D, fbTexture)
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          framebufferWidth,
          framebufferHeight,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          null,
        )
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
      gl.viewport(0, 0, framebufferWidth, framebufferHeight)

      // Clear the framebuffer texture.
      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.enable(gl.DEPTH_TEST)
      gl.enable(gl.CULL_FACE)
      gl.useProgram(program)
      gl.bindVertexArray(vao)

      const aspect = gl.canvas.width / gl.canvas.height
      const zNear = 1
      const zFar = 2000
      const projectionMatrix = linalg.perspective(fieldOfViewRadians, aspect, zNear, zFar)

      const cameraPosition = [0, 0, 3]
      const up = [0, 1, 0]
      const target = [0, 0, 0]

      const cameraMatrix = linalg.lookAt(cameraPosition, target, up)
      const viewMatrix = linalg.inverse3d(cameraMatrix)
      const viewProjectionMatrix = linalg.multiply3d(projectionMatrix, viewMatrix)

      const settings = [
        { x: -1, y: -3, z: -30, filter: gl.NEAREST },
        { x: 0, y: -3, z: -30, filter: gl.LINEAR },
        { x: 1, y: -3, z: -30, filter: gl.NEAREST_MIPMAP_LINEAR },
        { x: -1, y: -1, z: -10, filter: gl.NEAREST },
        { x: 0, y: -1, z: -10, filter: gl.LINEAR },
        { x: 1, y: -1, z: -10, filter: gl.NEAREST_MIPMAP_LINEAR },
        { x: -1, y: 1, z: 0, filter: gl.NEAREST },
        { x: 0, y: 1, z: 0, filter: gl.LINEAR },
        { x: 1, y: 1, z: 0, filter: gl.LINEAR_MIPMAP_NEAREST },
      ]
      const xSpacing = 1.2
      const ySpacing = 0.7
      settings.forEach(function (s) {
        const z = -5 + s.z
        const r = Math.abs(z) * Math.sin(fieldOfViewRadians * 0.5)
        const x = Math.sin(time * 0.2) * r
        const y = Math.cos(time * 0.2) * r * 0.5
        const r2 = 1 + r * 0.2

        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, s.filter)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

        const matrix = linalg.translate3d(viewProjectionMatrix, x + s.x * xSpacing * r2, y + s.y * ySpacing * r2, z)

        gl.uniformMatrix4fv(matrixLocation, false, matrix)

        drawTriangles({ gl, offset: 0, count: 6 })
      })

      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

      clearCanvas(gl)

      gl.bindTexture(gl.TEXTURE_2D, fbTexture)
      // prettier-ignore
      gl.uniformMatrix4fv(matrixLocation, false, [
        2, 0, 0, 0,
        0, 2, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ])

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      requestAnimationFrame(drawScene)
    }
  }

  function setGeometry(gl: WebGL2RenderingContext) {
    // prettier-ignore
    const positions = new Float32Array([
      -0.5, -0.5, 0.5,
       0.5, -0.5, 0.5,
      -0.5,  0.5, 0.5,
      -0.5,  0.5, 0.5,
       0.5, -0.5, 0.5,
       0.5,  0.5, 0.5,
    ])

    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
  }

  function setTextureCoords(gl: WebGL2RenderingContext) {
    gl.bufferData(
      gl.ARRAY_BUFFER,
      // prettier-ignore
      new Float32Array([
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,
      ]),
      gl.STATIC_DRAW,
    )
  }

  main()
}

export function drawTextureWithDistancePolygons({ gl }: SceneSettings) {
  const zDepth = 50

  function main() {
    const program = webglUtils.createProgramFromSources(
      gl,
      [withTextureVertex3dShader, withTextureFragment3dShader],
      [],
      [],
      (err) => {
        throw err
      },
    )!

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    const texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord")
    const matrixLocation = gl.getUniformLocation(program, "u_matrix")
    const positionBuffer = gl.createBuffer()

    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    gl.enableVertexAttribArray(positionAttributeLocation)

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    setGeometry(gl)

    let size = 3
    const type = gl.FLOAT
    let normalize = false
    const stride = 0
    const offset = 0
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

    const textureCoordsBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordsBuffer)
    setTextureCoords(gl)

    gl.enableVertexAttribArray(texcoordAttributeLocation)

    size = 2
    normalize = true // convert from 0-255 to 0.0-1.0
    gl.vertexAttribPointer(texcoordAttributeLocation, size, type, normalize, stride, offset)

    const mipTexture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, mipTexture)

    const texture = gl.createTexture()

    gl.activeTexture(gl.TEXTURE0)

    gl.bindTexture(gl.TEXTURE_2D, texture)

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]))

    const image = new Image()
    image.src = "/images/mip-low-res-example.png"
    image.addEventListener("load", function () {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.generateMipmap(gl.TEXTURE_2D)
      drawScene()
    })

    const textures = [texture, mipTexture]
    const textureIndex = 0

    const fieldOfViewRadians = toRadians(60)

    drawScene()

    function drawScene() {
      webglUtils.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement, window.devicePixelRatio)

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

      clearCanvas(gl)

      gl.enable(gl.DEPTH_TEST)
      gl.enable(gl.CULL_FACE)
      gl.useProgram(program)
      gl.bindVertexArray(vao)

      const aspect = gl.canvas.width / gl.canvas.height
      const zNear = 1
      const zFar = 2000
      const projectionMatrix = linalg.perspective(fieldOfViewRadians, aspect, zNear, zFar)

      const cameraPosition = [0, 0, 2]
      const up = [0, 1, 0]
      const target = [0, 0, 0]

      const cameraMatrix = linalg.lookAt(cameraPosition, target, up)
      const viewMatrix = linalg.inverse3d(cameraMatrix)
      const viewProjectionMatrix = linalg.multiply3d(projectionMatrix, viewMatrix)

      const settings = [
        { x: -1, y: 1, zRot: 0, magFilter: gl.NEAREST, minFilter: gl.NEAREST },
        { x: 0, y: 1, zRot: 0, magFilter: gl.LINEAR, minFilter: gl.LINEAR },
        { x: 1, y: 1, zRot: 0, magFilter: gl.LINEAR, minFilter: gl.NEAREST_MIPMAP_NEAREST },
        { x: -1, y: -1, zRot: 1, magFilter: gl.LINEAR, minFilter: gl.LINEAR_MIPMAP_NEAREST },
        { x: 0, y: -1, zRot: 1, magFilter: gl.LINEAR, minFilter: gl.NEAREST_MIPMAP_LINEAR },
        { x: 1, y: -1, zRot: 1, magFilter: gl.LINEAR, minFilter: gl.LINEAR_MIPMAP_LINEAR },
      ]
      const xSpacing = 1.2
      const ySpacing = 0.7
      settings.forEach(function (s) {
        gl.bindTexture(gl.TEXTURE_2D, textures[textureIndex])
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, s.minFilter)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, s.magFilter)

        let matrix = linalg.translate3d(viewProjectionMatrix, s.x * xSpacing, s.y * ySpacing, -zDepth * 0.5)
        matrix = linalg.zRotate(matrix, s.zRot * Math.PI)
        matrix = linalg.scale3d(matrix, 1, 1, zDepth)

        gl.uniformMatrix4fv(matrixLocation, false, matrix)
        gl.drawArrays(gl.TRIANGLES, 0, 6)
      })
    }
  }

  function setGeometry(gl: WebGLRenderingContext) {
    // prettier-ignore
    const positions = new Float32Array([
      -0.5, 0.5, -0.5,
       0.5, 0.5, -0.5,
      -0.5, 0.5,  0.5,
      -0.5, 0.5,  0.5,
       0.5, 0.5, -0.5,
       0.5, 0.5,  0.5,
    ])

    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
  }

  function setTextureCoords(gl: WebGLRenderingContext) {
    gl.bufferData(
      gl.ARRAY_BUFFER,
      // prettier-ignore
      new Float32Array([
        0, 0,
        1, 0,
        0, zDepth,
        0, zDepth,
        1, 0,
        1, zDepth,
      ]),
      gl.STATIC_DRAW,
    )
  }

  main()
}

export function drawCubeWithTexture({ gl }: SceneSettings) {
  function main() {
    const program = webglUtils.createProgramFromSources(
      gl,
      [withTextureVertex3dShader, withTextureFragment3dShader],
      [],
      [],
      (err) => {
        throw err
      },
    )!

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    const textureCoordsAttributeLocation = gl.getAttribLocation(program, "a_texcoord")

    const matrixLocation = gl.getUniformLocation(program, "u_matrix")

    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    setGeometry(gl)

    gl.enableVertexAttribArray(positionAttributeLocation)

    let size = 3
    const type = gl.FLOAT
    let normalize = false
    const stride = 0
    const offset = 0
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

    const textureCoordsBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordsBuffer)
    setTextureCoords(gl)

    gl.enableVertexAttribArray(textureCoordsAttributeLocation)

    size = 2
    normalize = true // convert from 0-255 to 0.0-1.0
    gl.vertexAttribPointer(textureCoordsAttributeLocation, size, type, normalize, stride, offset)

    const texture = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]))
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)

    const image = new Image()
    image.src = "/images/wall.jpg"
    image.addEventListener("load", function () {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      gl.generateMipmap(gl.TEXTURE_2D)
    })

    const fieldOfViewRadians = toRadians(60)
    let modelXRotationRadians = toRadians(0)
    let modelYRotationRadians = toRadians(0)

    let then = 0

    requestAnimationFrame(drawScene)

    function drawScene(time: number) {
      // convert to seconds
      time *= 0.001
      const deltaTime = time - then
      then = time

      webglUtils.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement)

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

      modelYRotationRadians += -0.7 * deltaTime
      modelXRotationRadians += -0.4 * deltaTime

      gl.enable(gl.DEPTH_TEST)
      gl.enable(gl.CULL_FACE)
      gl.useProgram(program)
      gl.bindVertexArray(vao)

      const aspect = gl.canvas.width / gl.canvas.height
      const zNear = 1
      const zFar = 2000
      const projectionMatrix = linalg.perspective(fieldOfViewRadians, aspect, zNear, zFar)

      const cameraPosition = [0, 0, 2]
      const up = [0, 1, 0]
      const target = [0, 0, 0]

      const cameraMatrix = linalg.lookAt(cameraPosition, target, up)
      const viewMatrix = linalg.inverse3d(cameraMatrix)
      const viewProjectionMatrix = linalg.multiply3d(projectionMatrix, viewMatrix)

      let matrix = linalg.xRotate(viewProjectionMatrix, modelXRotationRadians)
      matrix = linalg.yRotate(matrix, modelYRotationRadians)

      gl.uniformMatrix4fv(matrixLocation, false, matrix)
      drawTriangles({ gl, offset: 0, count: 6 * 6 })

      requestAnimationFrame(drawScene)
    }
  }

  function setGeometry(gl: WebGL2RenderingContext) {
    // prettier-ignore
    const positions = new Float32Array(
      [
        -0.5, -0.5, -0.5,
        -0.5,  0.5, -0.5,
         0.5, -0.5, -0.5,
        -0.5,  0.5, -0.5,
         0.5,  0.5, -0.5,
         0.5, -0.5, -0.5,

        -0.5, -0.5, 0.5,
         0.5, -0.5, 0.5,
        -0.5,  0.5, 0.5,
        -0.5,  0.5, 0.5,
         0.5, -0.5, 0.5,
         0.5,  0.5, 0.5,

        -0.5, 0.5, -0.5,
        -0.5, 0.5,  0.5,
         0.5, 0.5, -0.5,
        -0.5, 0.5,  0.5,
         0.5, 0.5,  0.5,
         0.5, 0.5, -0.5,

        -0.5, -0.5, -0.5,
         0.5, -0.5, -0.5,
        -0.5, -0.5,  0.5,
        -0.5, -0.5,  0.5,
         0.5, -0.5, -0.5,
         0.5, -0.5,  0.5,

        -0.5, -0.5, -0.5,
        -0.5, -0.5,  0.5,
        -0.5,  0.5, -0.5,
        -0.5, -0.5,  0.5,
        -0.5,  0.5,  0.5,
        -0.5,  0.5, -0.5,

        0.5, -0.5, -0.5,
        0.5,  0.5, -0.5,
        0.5, -0.5,  0.5,
        0.5, -0.5,  0.5,
        0.5,  0.5, -0.5,
        0.5,  0.5,  0.5,
      ])
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
  }

  function setTextureCoords(gl: WebGL2RenderingContext) {
    gl.bufferData(
      gl.ARRAY_BUFFER,
      // prettier-ignore
      new Float32Array(
        [
          // select the top left image
          0   , 0  ,
          0   , 0.5,
          0.25, 0  ,
          0   , 0.5,
          0.25, 0.5,
          0.25, 0  ,
          // select the top middle image
          0.25, 0  ,
          0.5 , 0  ,
          0.25, 0.5,
          0.25, 0.5,
          0.5 , 0  ,
          0.5 , 0.5,
          // select to top right image
          0.5 , 0  ,
          0.5 , 0.5,
          0.75, 0  ,
          0.5 , 0.5,
          0.75, 0.5,
          0.75, 0  ,
          // select the bottom left image
          0   , 0.5,
          0.25, 0.5,
          0   , 1  ,
          0   , 1  ,
          0.25, 0.5,
          0.25, 1  ,
          // select the bottom middle image
          0.25, 0.5,
          0.25, 1  ,
          0.5 , 0.5,
          0.25, 1  ,
          0.5 , 1  ,
          0.5 , 0.5,
          // select the bottom right image
          0.5 , 0.5,
          0.75, 0.5,
          0.5 , 1  ,
          0.5 , 1  ,
          0.75, 0.5,
          0.75, 1  ,

        ]),
      gl.STATIC_DRAW,
    )
  }

  main()
}

/*
interface APosition {
  buffer: WebGLBuffer
}

type ATexcoord = APosition

interface Attribs {
  a_position: APosition
  a_texcoord: ATexcoord
}

interface BufferInfo {
  attribs: Attribs
  indices: WebGLBuffer
  numElements: number
}

interface Extents {
  min: number[]
  max: number[]
}

export function drawBowlingPin({ gl }: SceneSettings) {
  const svg = "m44,434c18,-33 19,-66 15,-111c-4,-45 -37,-104 -39,-132c-2,-28 11,-51 16,-81c5,-30 3,-63 -36,-63"

  function main() {
    const curvePoints = parseSVGPath(svg)

    twgl.setDefaults({ attribPrefix: "a_" })

    const data = {
      tolerance: 0.15,
      distance: 0.4,
      divisions: 16,
      startAngle: 0,
      endAngle: Math.PI * 2,
      capStart: true,
      capEnd: true,
      triangles: true,
    }

    function generateMesh(bufferInfo?: BufferInfo) {
      const tempPoints = getPointsOnBezierCurves(curvePoints, data.tolerance)
      const points = simplifyPoints(tempPoints, 0, tempPoints.length, data.distance)
      const arrays = lathePoints(points, data.startAngle, data.endAngle, data.divisions, data.capStart, data.capEnd)
      const extents = getExtents(arrays.position)
      if (!bufferInfo) {
        // calls gl.createBuffer, gl.bindBuffer, and gl.bufferData for each array
        bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays)
        // calls gl.createVertexArray, gl.bindVertexArray,
        // and then gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer for each attribute
        vao = twgl.createVAOFromBufferInfo(gl, programInfo, bufferInfo)
      } else {
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_position.buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrays.position), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_texcoord.buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrays.texcoord), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indices)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(arrays.indices), gl.STATIC_DRAW)
        bufferInfo.numElements = arrays.indices.length
      }
      return {
        bufferInfo: bufferInfo,
        extents: extents,
      }
    }

    const programInfo = twgl.createProgramInfo(gl, [withTexture3dVertexShader, withTexture3dFragmentShader])

    const texInfo = loadImageAndCreateTextureInfo("/images/uv-grid.png", render)

    let worldMatrix: Float32Array<ArrayBufferLike> | number[] = linalg.identity()
    let projectionMatrix
    let extents: Extents
    let bufferInfo: BufferInfo | undefined
    let vao: WebGLVertexArrayObject

    function update() {
      const info = generateMesh(bufferInfo)
      extents = info.extents
      bufferInfo = info.bufferInfo
      render()
    }
    update()

    function render() {
      twgl.resizeCanvasToDisplaySize(gl.canvas, window.devicePixelRatio)

      // Tell WebGL how to convert from clip space to pixels
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

      gl.enable(gl.DEPTH_TEST)

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      // Compute the projection matrix
      const fieldOfViewRadians = Math.PI * 0.25
      const aspect = gl.canvas.width / gl.canvas.height
      projectionMatrix = linalg.perspective(fieldOfViewRadians, aspect, 1, 2000)

      // Compute the camera's matrix using look at.
      const midY = lerp(extents.min[1], extents.max[1], 0.5)
      const sizeToFitOnScreen = (extents.max[1] - extents.min[1]) * 0.6
      const distance = sizeToFitOnScreen / Math.tan(fieldOfViewRadians * 0.5)
      const cameraPosition = [0, midY, distance]
      const target = [0, midY, 0]
      const up = [0, -1, 0] // we used 2d points as input which means orientation is flipped
      const cameraMatrix = linalg.lookAt(cameraPosition, target, up)

      // Make a view matrix from the camera matrix.
      const viewMatrix = linalg.inverse3d(cameraMatrix)

      const viewProjectionMatrix = linalg.multiply3d(projectionMatrix, viewMatrix)

      gl.useProgram(programInfo.program)

      // Setup all the needed attributes.
      gl.bindVertexArray(vao)

      // Set the uniforms
      // calls gl.uniformXXX, gl.activeTexture, gl.bindTexture
      twgl.setUniforms(programInfo, {
        u_matrix: linalg.multiply3d(viewProjectionMatrix, worldMatrix),
        u_texture: texInfo.texture,
      })

      // calls gl.drawArrays or gl.drawElements.
      twgl.drawBufferInfo(gl, bufferInfo, data.triangles ? gl.TRIANGLES : gl.LINES)
    }

    function getExtents(positions: number[]) {
      const min = positions.slice(0, 3)
      const max = positions.slice(0, 3)
      for (let i = 3; i < positions.length; i += 3) {
        min[0] = Math.min(positions[i], min[0])
        min[1] = Math.min(positions[i + 1], min[1])
        min[2] = Math.min(positions[i + 2], min[2])
        max[0] = Math.max(positions[i], max[0])
        max[1] = Math.max(positions[i + 1], max[1])
        max[2] = Math.max(positions[i + 2], max[2])
      }
      return {
        min: min,
        max: max,
      }
    }

    // get the points from an SVG path. assumes a continuous line
    function parseSVGPath(svg: string) {
      const points: number[][] = []
      let delta = false
      let keepNext = false
      let need = 0
      let value = ""
      let values: number[] = []
      let lastValues = [0, 0]
      let nextLastValues = [0, 0]

      function addValue() {
        if (value.length > 0) {
          values.push(parseFloat(value))
          if (values.length === 2) {
            if (delta) {
              values[0] += lastValues[0]
              values[1] += lastValues[1]
            }
            points.push(values)
            if (keepNext) {
              nextLastValues = values.slice()
            }
            --need
            if (!need) {
              lastValues = nextLastValues
            }
            values = []
          }
          value = ""
        }
      }

      svg.split("").forEach((c) => {
        if ((c >= "0" && c <= "9") || c === ".") {
          value += c
        } else if (c === "-") {
          addValue()
          value = "-"
        } else if (c === "m") {
          addValue()
          keepNext = true
          need = 1
          delta = true
        } else if (c === "c") {
          addValue()
          keepNext = true
          need = 3
          delta = true
        } else if (c === "M") {
          addValue()
          keepNext = true
          need = 1
          delta = false
        } else if (c === "C") {
          addValue()
          keepNext = true
          need = 3
          delta = false
        } else if (c === ",") {
          addValue()
        } else if (c === " ") {
          addValue()
        }
      })
      addValue()
      let min = points[0].slice()
      let max = points[0].slice()
      for (let i = 1; i < points.length; ++i) {
        min = v2.min(min, points[i])
        max = v2.max(max, points[i])
      }
      const range = v2.sub(max, min)
      const halfRange = v2.mult(range, 0.5)
      for (let i = 0; i < points.length; ++i) {
        const p = points[i]
        p[0] = p[0] - min[0]
        p[1] = p[1] - min[0] - halfRange[1]
      }
      return points
    }

    function flatness(points: number[][], offset: number) {
      const p1 = points[offset]
      const p2 = points[offset + 1]
      const p3 = points[offset + 2]
      const p4 = points[offset + 3]

      let ux = 3 * p2[0] - 2 * p1[0] - p4[0]
      ux *= ux
      let uy = 3 * p2[1] - 2 * p1[1] - p4[1]
      uy *= uy
      let vx = 3 * p3[0] - 2 * p4[0] - p1[0]
      vx *= vx
      let vy = 3 * p3[1] - 2 * p4[1] - p1[1]
      vy *= vy

      if (ux < vx) {
        ux = vx
      }

      if (uy < vy) {
        uy = vy
      }

      return ux + uy
    }

    function getPointsOnBezierCurveWithSplitting(
      points: number[][],
      offset: number,
      tolerance: number,
      newPoints: number[][],
    ) {
      const outPoints = newPoints || []
      if (flatness(points, offset) < tolerance) {
        // just add the end points of this curve
        outPoints.push(points[offset])
        outPoints.push(points[offset + 3])
      } else {
        // subdivide
        const t = 0.5
        const p1 = points[offset]
        const p2 = points[offset + 1]
        const p3 = points[offset + 2]
        const p4 = points[offset + 3]

        const q1 = v2.lerp(p1, p2, t)
        const q2 = v2.lerp(p2, p3, t)
        const q3 = v2.lerp(p3, p4, t)

        const r1 = v2.lerp(q1, q2, t)
        const r2 = v2.lerp(q2, q3, t)

        const red = v2.lerp(r1, r2, t)

        // do 1st half
        getPointsOnBezierCurveWithSplitting([p1, q1, r1, red], 0, tolerance, outPoints)
        // do 2nd half
        getPointsOnBezierCurveWithSplitting([red, r2, q3, p4], 0, tolerance, outPoints)
      }
      return outPoints
    }

    // gets points across all segments
    function getPointsOnBezierCurves(points: number[][], tolerance: number) {
      const newPoints: number[][] = []
      const numSegments = (points.length - 1) / 3
      for (let i = 0; i < numSegments; ++i) {
        const offset = i * 3
        getPointsOnBezierCurveWithSplitting(points, offset, tolerance, newPoints)
      }
      return newPoints
    }

    // Ramer Douglas Peucker algorithm
    function simplifyPoints(points: number[][], start: number, end: number, epsilon: number, newPoints?: number[][]) {
      const outPoints = newPoints || []

      // find the most distant point from the line formed by the endpoints
      const s = points[start]
      const e = points[end - 1]
      let maxDistSq = 0
      let maxNdx = 1
      for (let i = start + 1; i < end - 1; ++i) {
        const distSq = v2.distanceToSegmentSq(points[i], s, e)
        if (distSq > maxDistSq) {
          maxDistSq = distSq
          maxNdx = i
        }
      }

      // if that point is too far
      if (Math.sqrt(maxDistSq) > epsilon) {
        // split
        simplifyPoints(points, start, maxNdx + 1, epsilon, outPoints)
        simplifyPoints(points, maxNdx, end, epsilon, outPoints)
      } else {
        // add the 2 end points
        outPoints.push(s, e)
      }

      return outPoints
    }

    // rotates around Y axis.
    function lathePoints(
      points: number[][],
      startAngle: number, // angle to start at (ie 0)
      endAngle: number, // angle to end at (ie Math.PI * 2)
      numDivisions: number, // how many quads to make around
      capStart: boolean, // true to cap the top
      capEnd: boolean,
    ) {
      // true to cap the bottom
      const positions = []
      const texcoords = []
      const indices = []

      const vOffset = capStart ? 1 : 0
      const pointsPerColumn = points.length + vOffset + (capEnd ? 1 : 0)
      const quadsDown = pointsPerColumn - 1

      // generate v coordniates
      let vcoords = []

      // first compute the length of the points
      let length = 0
      for (let i = 0; i < points.length - 1; ++i) {
        vcoords.push(length)
        length += v2.distance(points[i], points[i + 1])
      }
      vcoords.push(length) // the last point

      // now divide each by the total length;
      vcoords = vcoords.map((v) => v / length)

      // generate points
      for (let division = 0; division <= numDivisions; division++) {
        const u = division / numDivisions
        const angle = lerp(startAngle, endAngle, u)
        const mat = linalg.yRotation(angle)
        if (capStart) {
          // add point on Y access at start
          positions.push(0, points[0][1], 0)
          texcoords.push(u, 0)
        }
        points.forEach((p, ndx) => {
          const tp = linalg.transformPoint(mat, [...p, 0])
          positions.push(tp[0], tp[1], tp[2])
          texcoords.push(u, vcoords[ndx])
        })
        if (capEnd) {
          // add point on Y access at end
          positions.push(0, points[points.length - 1][1], 0)
          texcoords.push(u, 1)
        }
      }

      // generate indices
      for (let division = 0; division < numDivisions; division++) {
        const column1Offset = division * pointsPerColumn
        const column2Offset = column1Offset + pointsPerColumn
        for (let quad = 0; quad < quadsDown; quad++) {
          indices.push(column1Offset + quad, column1Offset + quad + 1, column2Offset + quad)
          indices.push(column1Offset + quad + 1, column2Offset + quad + 1, column2Offset + quad)
        }
      }

      return {
        position: positions,
        texcoord: texcoords,
        indices: indices,
      }
    }

    gl.canvas.addEventListener("mousedown", (e) => {
      e.preventDefault()
      startRotateCamera(e as MouseEvent)
    })
    window.addEventListener("mouseup", stopRotateCamera)
    window.addEventListener("mousemove", rotateCamera)
    gl.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault()
      startRotateCamera((e as TouchEvent).touches[0])
    })
    window.addEventListener("touchend", () => {
      stopRotateCamera()
    })
    window.addEventListener("touchmove", (e) => {
      rotateCamera(e.touches[0])
    })

    let lastPos: number[]
    let moving = false
    function startRotateCamera(e: MouseEvent | Touch) {
      lastPos = getRelativeMousePosition(gl.canvas as HTMLCanvasElement, e)
      moving = true
    }

    function rotateCamera(e: MouseEvent | Touch) {
      if (moving) {
        const pos = getRelativeMousePosition(gl.canvas as HTMLCanvasElement, e)
        const size = [4 / gl.canvas.width, 4 / gl.canvas.height]
        const delta = v2.mult(v2.sub(lastPos, pos), size)

        // this is bad, but it works for a basic case
        worldMatrix = linalg.multiply3d(linalg.xRotation(delta[1] * 5), worldMatrix)
        worldMatrix = linalg.multiply3d(linalg.yRotation(delta[0] * 5), worldMatrix)

        lastPos = pos

        render()
      }
    }

    function stopRotateCamera() {
      moving = false
    }

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t
    }

    function getRelativeMousePosition(canvas: HTMLCanvasElement, e: MouseEvent | Touch) {
      const rect = canvas.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / (rect.right - rect.left)) * canvas.width
      const y = ((e.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height
      return [(x - canvas.width / 2) / window.devicePixelRatio, (y - canvas.height / 2) / window.devicePixelRatio]
    }

    // creates a texture info { width: w, height: h, texture: tex }
    // The texture will start with 1x1 pixels and be updated
    // when the image has loaded
    function loadImageAndCreateTextureInfo(url: string, callback: () => void) {
      const tex = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, tex)
      // Fill the texture with a 1x1 blue pixel.
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]))

      const textureInfo = {
        width: 1, // we don't know the size until it loads
        height: 1,
        texture: tex,
      }
      const img = new Image()
      img.addEventListener("load", function () {
        textureInfo.width = img.width
        textureInfo.height = img.height

        gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
        gl.generateMipmap(gl.TEXTURE_2D)

        if (callback) {
          callback()
        }
      })
      img.src = url

      return textureInfo
    }
  }

  const v2 = (function () {
    // adds 1 or more v2s
    function add(a: number[], ...args: number[][]) {
      const n = a.slice()
      ;[...args].forEach((p) => {
        n[0] += p[0]
        n[1] += p[1]
      })
      return n
    }

    function sub(a: number[], ...args: number[][]) {
      const n = a.slice()
      ;[...args].forEach((p) => {
        n[0] -= p[0]
        n[1] -= p[1]
      })
      return n
    }

    function mult(a: number[], s: number[] | number) {
      if (Array.isArray(s)) {
        const t = s
        s = a
        a = t
      }
      if (Array.isArray(s)) {
        return [a[0] * s[0], a[1] * s[1]]
      } else {
        return [a[0] * s, a[1] * s]
      }
    }

    function lerp(a: number[], b: number[], t: number) {
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
    }

    function min(a: number[], b: number[]) {
      return [Math.min(a[0], b[0]), Math.min(a[1], b[1])]
    }

    function max(a: number[], b: number[]) {
      return [Math.max(a[0], b[0]), Math.max(a[1], b[1])]
    }

    // compute the distance squared between a and b
    function distanceSq(a: number[], b: number[]) {
      const dx = a[0] - b[0]
      const dy = a[1] - b[1]
      return dx * dx + dy * dy
    }

    // compute the distance between a and b
    function distance(a: number[], b: number[]) {
      return Math.sqrt(distanceSq(a, b))
    }

    // compute the distance squared from p to the line segment
    // formed by v and w
    function distanceToSegmentSq(p: number[], v: number[], w: number[]) {
      const l2 = distanceSq(v, w)
      if (l2 === 0) {
        return distanceSq(p, v)
      }
      let t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2
      t = Math.max(0, Math.min(1, t))
      return distanceSq(p, lerp(v, w, t))
    }

    // compute the distance from p to the line segment
    // formed by v and w
    function distanceToSegment(p: number[], v: number[], w: number[]) {
      return Math.sqrt(distanceToSegmentSq(p, v, w))
    }

    return {
      add: add,
      sub: sub,
      max: max,
      min: min,
      mult: mult,
      lerp: lerp,
      distance: distance,
      distanceSq: distanceSq,
      distanceToSegment: distanceToSegment,
      distanceToSegmentSq: distanceToSegmentSq,
    }
  })()

  main()
}

export function drawCandleHolder({ gl }: SceneSettings) {
  const simpleVertexShader = `#version 300 es
in vec4 a_position;
in vec2 a_texcoord;
in vec3 a_normal;

uniform mat4 u_matrix;

out vec2 v_texcoord;
out vec3 v_normal;

void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;

  // Pass the texcoord to the fragment shader.
  v_texcoord = a_texcoord;
  v_normal = a_normal;
}
`

  const specularVertexShader = `#version 300 es
in vec4 a_position;
in vec3 a_normal;

uniform vec3 u_lightWorldPosition;
uniform vec3 u_viewWorldPosition;

uniform mat4 u_world;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

out vec3 v_normal;
out vec3 v_surfaceToLight;
out vec3 v_surfaceToView;

void main() {
  // Multiply the position by the matrix.
  gl_Position = u_worldViewProjection * a_position;

  // orient the normals and pass to the fragment shader
  v_normal = mat3(u_worldInverseTranspose) * a_normal;

  // compute the world position of the surfoace
  vec3 surfaceWorldPosition = (u_world * a_position).xyz;

  // compute the vector of the surface to the light
  // and pass it to the fragment shader
  v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;

  // compute the vector of the surface to the view/camera
  // and pass it to the fragment shader
  v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;
}
`

  const normalShader = `#version 300 es
precision highp float;

// Passed in from the vertex shader.
in vec2 v_texcoord;
in vec3 v_normal;

out vec4 outColor;

void main() {
  outColor = vec4(v_normal * .5 + .5, 1);
}
`

  const textureShader = `#version 300 es
precision highp float;

// Passed in from the vertex shader.
in vec2 v_texcoord;
in vec3 v_normal;

uniform sampler2D u_texture;

out vec4 outColor;

void main() {
  outColor = texture(u_texture, v_texcoord);
}
`

  const specularShader = `#version 300 es
#if GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision highp float;
#endif

// Passed in from the vertex shader.
in vec3 v_normal;
in vec3 v_surfaceToLight;
in vec3 v_surfaceToView;

uniform vec4 u_color;
uniform float u_shininess;

out vec4 outColor;

void main() {
  // because v_normal is a varying it's interpolated
  // so it will not be a unit vector. Normalizing it
  // will make it a unit vector again
  vec3 normal = normalize(v_normal);

  vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
  vec3 surfaceToViewDirection = normalize(v_surfaceToView);
  vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

  float light = dot(normal, surfaceToLightDirection);
  float specular = 0.0;
  if (light > 0.0) {
    specular = pow(dot(normal, halfVector), u_shininess);
  }

  outColor = u_color;

  // Lets multiply just the color portion (not the alpha)
  // by the light
  outColor.rgb *= light;

  // Just add in the specular
  outColor.rgb += specular;
}
`

  const svg =
    "M236,124L197,112L197,34C197,34 184.859,31.871 165,33C186.997,66.892 161.894,89.627 173,109C184.106,128.373 186.493,137.68 205,144C219.37,148.907 222,154 222,154L220,175L202,174L191,194L204,209L222,208C222,208 226.476,278.566 218,295C209.524,311.434 191.013,324.945 201,354C210.987,383.055 213,399 213,399L191,403L191,417L212,422C212,422 233.283,437.511 211,444C188.717,450.489 111,472 111,472L111,485L236,484L236,124Z"

  function main() {
    const curvePoints = parseSVGPath(svg, { xFlip: true })

    twgl.setDefaults({ attribPrefix: "a_" })

    const data = {
      tolerance: 0.15,
      distance: 0.4,
      divisions: 16,
      startAngle: 0,
      endAngle: Math.PI * 2,
      capStart: true,
      capEnd: true,
      triangles: true,
      maxAngle: degToRad(30),
      mode: 0,
    }

    function generateMesh(bufferInfo) {
      const tempPoints = getPointsOnBezierCurves(curvePoints, data.tolerance)
      const points = simplifyPoints(tempPoints, 0, tempPoints.length, data.distance)
      const tempArrays = lathePoints(points, data.startAngle, data.endAngle, data.divisions, data.capStart, data.capEnd)
      const arrays = generateNormals(tempArrays, data.maxAngle)
      const extents = getExtents(arrays.position)
      if (!bufferInfo) {
        // calls gl.createBuffer, gl.bindBuffer, and gl.bufferData for each array
        bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays)
        // calls gl.createVertexArray, gl.bindVertexArray,
        // and then gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer for each attribute
        vao = twgl.createVAOFromBufferInfo(gl, programInfos[0], bufferInfo)
      } else {
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_position.buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrays.position), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_texcoord.buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrays.texcoord), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_normal.buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrays.normal), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indices)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(arrays.indices), gl.STATIC_DRAW)
        bufferInfo.numElements = arrays.indices.length
      }
      return {
        bufferInfo: bufferInfo,
        extents: extents,
      }
    }

    // used to force the locations of attributes so they are
    // the same across programs
    const attributes = ["a_position", "a_texcoord", "a_normal"]
    // setup GLSL programs
    const programInfos = [
      // compiles shaders, links program and looks up locations
      twgl.createProgramInfo(gl, [simpleVertexShader, normalShader], attributes),
      twgl.createProgramInfo(gl, [specularVertexShader, specularShader], attributes),
      twgl.createProgramInfo(gl, [simpleVertexShader, textureShader], attributes),
    ]

    const texInfo = loadImageAndCreateTextureInfo("https://webgl2fundamentals.org/webgl/resources/uv-grid.png", render)

    let worldMatrix = m4.identity()
    let projectionMatrix
    let extents
    let bufferInfo
    let vao

    function update() {
      const info = generateMesh(bufferInfo)
      extents = info.extents
      bufferInfo = info.bufferInfo
      render()
    }
    update()

    function render() {
      twgl.resizeCanvasToDisplaySize(gl.canvas, window.devicePixelRatio)

      // Tell WebGL how to convert from clip space to pixels
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

      gl.enable(gl.DEPTH_TEST)

      // Clear the canvas AND the depth buffer.
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      // Compute the projection matrix
      const fieldOfViewRadians = Math.PI * 0.25
      const aspect = gl.canvas.width / gl.canvas.height
      projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 2000)

      // Compute the camera's matrix using look at.
      const midY = lerp(extents.min[1], extents.max[1], 0.5)
      const sizeToFitOnScreen = (extents.max[1] - extents.min[1]) * 0.6
      const distance = sizeToFitOnScreen / Math.tan(fieldOfViewRadians * 0.5)
      const cameraPosition = [0, midY, distance]
      const target = [0, midY, 0]
      const up = [0, -1, 0] // we used 2d points as input which means orientation is flipped
      const cameraMatrix = m4.lookAt(cameraPosition, target, up)

      // Make a view matrix from the camera matrix.
      const viewMatrix = m4.inverse(cameraMatrix)

      const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix)

      const programInfo = programInfos[data.mode]
      gl.useProgram(programInfo.program)

      // Setup all the needed attributes.
      gl.bindVertexArray(vao)

      const worldViewProjection = m4.multiply(viewProjectionMatrix, worldMatrix)

      // Set the uniforms
      // calls gl.uniformXXX, gl.activeTexture, gl.bindTexture
      twgl.setUniforms(programInfo, {
        u_matrix: worldViewProjection,
        u_worldViewProjection: worldViewProjection,
        u_world: worldMatrix,
        u_worldInverseTranspose: m4.transpose(m4.inverse(worldMatrix)),
        u_lightWorldPosition: [midY * 1.5, midY * 2, distance * 1.5],
        u_viewWorldPosition: cameraMatrix.slice(12, 15),
        u_color: [1, 0.8, 0.2, 1],
        u_shininess: 50,
        u_texture: texInfo.texture,
      })

      // calls gl.drawArrays or gl.drawElements.
      twgl.drawBufferInfo(gl, bufferInfo, data.triangles ? gl.TRIANGLES : gl.LINES)
    }

    function getExtents(positions) {
      const min = positions.slice(0, 3)
      const max = positions.slice(0, 3)
      for (let i = 3; i < positions.length; i += 3) {
        min[0] = Math.min(positions[i], min[0])
        min[1] = Math.min(positions[i + 1], min[1])
        min[2] = Math.min(positions[i + 2], min[2])
        max[0] = Math.max(positions[i], max[0])
        max[1] = Math.max(positions[i + 1], max[1])
        max[2] = Math.max(positions[i + 2], max[2])
      }
      return {
        min: min,
        max: max,
      }
    }

    // get the points from an SVG path. assumes a continous line
    function parseSVGPath(svg, opt) {
      const points = []
      let delta = false
      let keepNext = false
      let need = 0
      let value = ""
      let values = []
      let lastValues = [0, 0]
      let nextLastValues = [0, 0]
      let mode

      function addValue() {
        if (value.length > 0) {
          const v = parseFloat(value)
          values.push(v)
          if (values.length === 2) {
            if (delta) {
              values[0] += lastValues[0]
              values[1] += lastValues[1]
            }
            points.push(values)
            if (keepNext) {
              nextLastValues = values.slice()
            }
            --need
            if (!need) {
              if (mode === "l") {
                const m4 = points.pop()
                const m1 = points.pop()
                const m2 = v2.lerp(m1, m4, 0.25)
                const m3 = v2.lerp(m1, m4, 0.75)
                points.push(m1, m2, m3, m4)
              }
              lastValues = nextLastValues
            }
            values = []
          }
          value = ""
        }
      }

      svg.split("").forEach((c) => {
        if ((c >= "0" && c <= "9") || c === ".") {
          value += c
        } else if (c === "-") {
          addValue()
          value = "-"
        } else if (c === "m") {
          addValue()
          keepNext = true
          need = 1
          delta = true
          mode = "m"
        } else if (c === "c") {
          addValue()
          keepNext = true
          need = 3
          delta = true
          mode = "c"
        } else if (c === "l") {
          addValue()
          keepNext = true
          need = 1
          delta = false
          mode = "l"
        } else if (c === "M") {
          addValue()
          keepNext = true
          need = 1
          delta = false
          mode = "m"
        } else if (c === "C") {
          addValue()
          keepNext = true
          need = 3
          delta = false
          mode = "c"
        } else if (c === "L") {
          addValue()
          keepNext = true
          need = 1
          delta = false
          mode = "l"
        } else if (c === "Z") {
          // close the loop
        } else if (c === ",") {
          addValue()
        } else if (c === " ") {
          addValue()
        } else {
          throw "unsupported path option"
        }
      })
      addValue()
      let min = points[0].slice()
      let max = points[0].slice()
      for (let i = 1; i < points.length; ++i) {
        min = v2.min(min, points[i])
        max = v2.max(max, points[i])
      }
      let range = v2.sub(max, min)
      let halfRange = v2.mult(range, 0.5)
      for (let i = 0; i < points.length; ++i) {
        const p = points[i]
        if (opt.xFlip) {
          p[0] = max[0] - p[0]
        } else {
          p[0] = p[0] - min[0]
        }
        p[1] = p[1] - min[0] - halfRange[1]
      }
      return points
    }

    function flatness(points, offset) {
      const p1 = points[offset + 0]
      const p2 = points[offset + 1]
      const p3 = points[offset + 2]
      const p4 = points[offset + 3]

      let ux = 3 * p2[0] - 2 * p1[0] - p4[0]
      ux *= ux
      let uy = 3 * p2[1] - 2 * p1[1] - p4[1]
      uy *= uy
      let vx = 3 * p3[0] - 2 * p4[0] - p1[0]
      vx *= vx
      let vy = 3 * p3[1] - 2 * p4[1] - p1[1]
      vy *= vy

      if (ux < vx) {
        ux = vx
      }

      if (uy < vy) {
        uy = vy
      }

      return ux + uy
    }

    function getPointsOnBezierCurveWithSplitting(points, offset, tolerance, newPoints) {
      const outPoints = newPoints || []
      if (flatness(points, offset) < tolerance) {
        // just add the end points of this curve
        outPoints.push(points[offset + 0])
        outPoints.push(points[offset + 3])
      } else {
        // subdivide
        const t = 0.5
        const p1 = points[offset + 0]
        const p2 = points[offset + 1]
        const p3 = points[offset + 2]
        const p4 = points[offset + 3]

        const q1 = v2.lerp(p1, p2, t)
        const q2 = v2.lerp(p2, p3, t)
        const q3 = v2.lerp(p3, p4, t)

        const r1 = v2.lerp(q1, q2, t)
        const r2 = v2.lerp(q2, q3, t)

        const red = v2.lerp(r1, r2, t)

        // do 1st half
        getPointsOnBezierCurveWithSplitting([p1, q1, r1, red], 0, tolerance, outPoints)
        // do 2nd half
        getPointsOnBezierCurveWithSplitting([red, r2, q3, p4], 0, tolerance, outPoints)
      }
      return outPoints
    }

    // gets points across all segments
    function getPointsOnBezierCurves(points, tolerance) {
      const newPoints = []
      const numSegments = (points.length - 1) / 3
      for (let i = 0; i < numSegments; ++i) {
        const offset = i * 3
        getPointsOnBezierCurveWithSplitting(points, offset, tolerance, newPoints)
      }
      return newPoints
    }

    // Ramer Douglas Peucker algorithm
    function simplifyPoints(points, start, end, epsilon, newPoints) {
      const outPoints = newPoints || []

      // find the most distant point from the line formed by the endpoints
      const s = points[start]
      const e = points[end - 1]
      let maxDistSq = 0
      let maxNdx = 1
      for (let i = start + 1; i < end - 1; ++i) {
        const distSq = v2.distanceToSegmentSq(points[i], s, e)
        if (distSq > maxDistSq) {
          maxDistSq = distSq
          maxNdx = i
        }
      }

      // if that point is too far
      if (Math.sqrt(maxDistSq) > epsilon) {
        // split
        simplifyPoints(points, start, maxNdx + 1, epsilon, outPoints)
        simplifyPoints(points, maxNdx, end, epsilon, outPoints)
      } else {
        // add the 2 end points
        outPoints.push(s, e)
      }

      return outPoints
    }

    // rotates around Y axis.
    function lathePoints(
      points,
      startAngle, // angle to start at (ie 0)
      endAngle, // angle to end at (ie Math.PI * 2)
      numDivisions, // how many quads to make around
      capStart, // true to cap the top
      capEnd,
    ) {
      // true to cap the bottom
      const positions = []
      const texcoords = []
      const indices = []

      const vOffset = capStart ? 1 : 0
      const pointsPerColumn = points.length + vOffset + (capEnd ? 1 : 0)
      const quadsDown = pointsPerColumn - 1

      // generate v coordniates
      let vcoords = []

      // first compute the length of the points
      let length = 0
      for (let i = 0; i < points.length - 1; ++i) {
        vcoords.push(length)
        length += v2.distance(points[i], points[i + 1])
      }
      vcoords.push(length) // the last point

      // now divide each by the total length;
      vcoords = vcoords.map((v) => v / length)

      // generate points
      for (let division = 0; division <= numDivisions; ++division) {
        const u = division / numDivisions
        const angle = lerp(startAngle, endAngle, u) % (Math.PI * 2)
        const mat = m4.yRotation(angle)
        if (capStart) {
          // add point on Y access at start
          positions.push(0, points[0][1], 0)
          texcoords.push(u, 0)
        }
        points.forEach((p, ndx) => {
          const tp = m4.transformPoint(mat, [...p, 0])
          positions.push(tp[0], tp[1], tp[2])
          texcoords.push(u, vcoords[ndx])
        })
        if (capEnd) {
          // add point on Y access at end
          positions.push(0, points[points.length - 1][1], 0)
          texcoords.push(u, 1)
        }
      }

      // generate indices
      for (let division = 0; division < numDivisions; ++division) {
        const column1Offset = division * pointsPerColumn
        const column2Offset = column1Offset + pointsPerColumn
        for (let quad = 0; quad < quadsDown; ++quad) {
          indices.push(column1Offset + quad, column1Offset + quad + 1, column2Offset + quad)
          indices.push(column1Offset + quad + 1, column2Offset + quad + 1, column2Offset + quad)
        }
      }

      return {
        position: positions,
        texcoord: texcoords,
        indices: indices,
      }
    }

    function makeIndexedIndicesFn(arrays) {
      const indices = arrays.indices
      let ndx = 0
      const fn = function () {
        return indices[ndx++]
      }
      fn.reset = function () {
        ndx = 0
      }
      fn.numElements = indices.length
      return fn
    }

    function makeUnindexedIndicesFn(arrays) {
      let ndx = 0
      const fn = function () {
        return ndx++
      }
      fn.reset = function () {
        ndx = 0
      }
      fn.numElements = arrays.positions.length / 3
      return fn
    }

    function makeIndiceIterator(arrays) {
      return arrays.indices ? makeIndexedIndicesFn(arrays) : makeUnindexedIndicesFn(arrays)
    }

    function generateNormals(arrays, maxAngle) {
      const positions = arrays.position
      const texcoords = arrays.texcoord

      // first compute the normal of each face
      let getNextIndex = makeIndiceIterator(arrays)
      const numFaceVerts = getNextIndex.numElements
      const numVerts = arrays.position.length
      const numFaces = numFaceVerts / 3
      const faceNormals = []

      // Compute the normal for every face.
      // While doing that, create a new vertex for every face vertex
      for (let i = 0; i < numFaces; ++i) {
        const n1 = getNextIndex() * 3
        const n2 = getNextIndex() * 3
        const n3 = getNextIndex() * 3

        const v1 = positions.slice(n1, n1 + 3)
        const v2 = positions.slice(n2, n2 + 3)
        const v3 = positions.slice(n3, n3 + 3)

        faceNormals.push(m4.normalize(m4.cross(m4.subtractVectors(v1, v2), m4.subtractVectors(v3, v2))))
      }

      let tempVerts = {}
      let tempVertNdx = 0

      // this assumes vertex positions are an exact match

      function getVertIndex(x, y, z) {
        const vertId = x + "," + y + "," + z
        const ndx = tempVerts[vertId]
        if (ndx !== undefined) {
          return ndx
        }
        const newNdx = tempVertNdx++
        tempVerts[vertId] = newNdx
        return newNdx
      }

      const vertIndices = []
      for (let i = 0; i < numVerts; ++i) {
        const offset = i * 3
        const vert = positions.slice(offset, offset + 3)
        vertIndices.push(getVertIndex(vert))
      }

      // go through every vertex and record which faces it's on
      const vertFaces = []
      getNextIndex.reset()
      for (let i = 0; i < numFaces; ++i) {
        for (let j = 0; j < 3; ++j) {
          const ndx = getNextIndex()
          const sharedNdx = vertIndices[ndx]
          let faces = vertFaces[sharedNdx]
          if (!faces) {
            faces = []
            vertFaces[sharedNdx] = faces
          }
          faces.push(i)
        }
      }

      // now go through every face and compute the normals for each
      // vertex of the face. Only include faces that aren't more than
      // maxAngle different. Add the result to arrays of newPositions,
      // newTexcoords and newNormals, discarding any vertices that
      // are the same.
      tempVerts = {}
      tempVertNdx = 0
      const newPositions = []
      const newTexcoords = []
      const newNormals = []

      function getNewVertIndex(x, y, z, nx, ny, nz, u, v) {
        const vertId = x + "," + y + "," + z + "," + nx + "," + ny + "," + nz + "," + u + "," + v

        const ndx = tempVerts[vertId]
        if (ndx !== undefined) {
          return ndx
        }
        const newNdx = tempVertNdx++
        tempVerts[vertId] = newNdx
        newPositions.push(x, y, z)
        newNormals.push(nx, ny, nz)
        newTexcoords.push(u, v)
        return newNdx
      }

      const newVertIndices = []
      getNextIndex.reset()
      const maxAngleCos = Math.cos(maxAngle)
      // for each face
      for (let i = 0; i < numFaces; ++i) {
        // get the normal for this face
        const thisFaceNormal = faceNormals[i]
        // for each vertex on the face
        for (let j = 0; j < 3; ++j) {
          const ndx = getNextIndex()
          const sharedNdx = vertIndices[ndx]
          const faces = vertFaces[sharedNdx]
          const norm = [0, 0, 0]
          faces.forEach((faceNdx) => {
            // is this face facing the same way
            const otherFaceNormal = faceNormals[faceNdx]
            const dot = m4.dot(thisFaceNormal, otherFaceNormal)
            if (dot > maxAngleCos) {
              m4.addVectors(norm, otherFaceNormal, norm)
            }
          })
          m4.normalize(norm, norm)
          const poffset = ndx * 3
          const toffset = ndx * 2
          newVertIndices.push(
            getNewVertIndex(
              positions[poffset + 0],
              positions[poffset + 1],
              positions[poffset + 2],
              norm[0],
              norm[1],
              norm[2],
              texcoords[toffset + 0],
              texcoords[toffset + 1],
            ),
          )
        }
      }

      return {
        position: newPositions,
        texcoord: newTexcoords,
        normal: newNormals,
        indices: newVertIndices,
      }
    }

    gl.canvas.addEventListener("mousedown", (e) => {
      e.preventDefault()
      startRotateCamera(e)
    })
    window.addEventListener("mouseup", stopRotateCamera)
    window.addEventListener("mousemove", rotateCamera)
    gl.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault()
      startRotateCamera(e.touches[0])
    })
    window.addEventListener("touchend", (e) => {
      stopRotateCamera(e.touches[0])
    })
    window.addEventListener("touchmove", (e) => {
      rotateCamera(e.touches[0])
    })

    let lastPos
    let moving
    function startRotateCamera(e) {
      lastPos = getRelativeMousePosition(gl.canvas, e)
      moving = true
    }

    function rotateCamera(e) {
      if (moving) {
        const pos = getRelativeMousePosition(gl.canvas, e)
        const size = [4 / gl.canvas.width, 4 / gl.canvas.height]
        const delta = v2.mult(v2.sub(lastPos, pos), size)

        // this is bad but it works for a basic case so phffttt
        worldMatrix = m4.multiply(m4.xRotation(delta[1] * 5), worldMatrix)
        worldMatrix = m4.multiply(m4.yRotation(delta[0] * 5), worldMatrix)

        lastPos = pos

        render()
      }
    }

    function stopRotateCamera() {
      moving = false
    }

    function degToRad(deg) {
      return (deg * Math.PI) / 180
    }

    function lerp(a, b, t) {
      return a + (b - a) * t
    }

    function getRelativeMousePosition(canvas, e) {
      const rect = canvas.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / (rect.right - rect.left)) * canvas.width
      const y = ((e.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height
      return [(x - canvas.width / 2) / window.devicePixelRatio, (y - canvas.height / 2) / window.devicePixelRatio]
    }

    // creates a texture info { width: w, height: h, texture: tex }
    // The texture will start with 1x1 pixels and be updated
    // when the image has loaded
    function loadImageAndCreateTextureInfo(url, callback) {
      var tex = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, tex)
      // Fill the texture with a 1x1 blue pixel.
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]))

      var textureInfo = {
        width: 1, // we don't know the size until it loads
        height: 1,
        texture: tex,
      }
      var img = new Image()
      img.addEventListener("load", function () {
        textureInfo.width = img.width
        textureInfo.height = img.height

        gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
        gl.generateMipmap(gl.TEXTURE_2D)

        if (callback) {
          callback()
        }
      })
      img.src = url

      return textureInfo
    }
  }

  const v2 = (function () {
    // adds 1 or more v2s
    function add(a, ...args) {
      const n = a.slice()
      ;[...args].forEach((p) => {
        n[0] += p[0]
        n[1] += p[1]
      })
      return n
    }

    function sub(a, ...args) {
      const n = a.slice()
      ;[...args].forEach((p) => {
        n[0] -= p[0]
        n[1] -= p[1]
      })
      return n
    }

    function mult(a, s) {
      if (Array.isArray(s)) {
        let t = s
        s = a
        a = t
      }
      if (Array.isArray(s)) {
        return [a[0] * s[0], a[1] * s[1]]
      } else {
        return [a[0] * s, a[1] * s]
      }
    }

    function lerp(a, b, t) {
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
    }

    function min(a, b) {
      return [Math.min(a[0], b[0]), Math.min(a[1], b[1])]
    }

    function max(a, b) {
      return [Math.max(a[0], b[0]), Math.max(a[1], b[1])]
    }

    // compute the distance squared between a and b
    function distanceSq(a, b) {
      const dx = a[0] - b[0]
      const dy = a[1] - b[1]
      return dx * dx + dy * dy
    }

    // compute the distance between a and b
    function distance(a, b) {
      return Math.sqrt(distanceSq(a, b))
    }

    // compute the distance squared from p to the line segment
    // formed by v and w
    function distanceToSegmentSq(p, v, w) {
      const l2 = distanceSq(v, w)
      if (l2 === 0) {
        return distanceSq(p, v)
      }
      let t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2
      t = Math.max(0, Math.min(1, t))
      return distanceSq(p, lerp(v, w, t))
    }

    // compute the distance from p to the line segment
    // formed by v and w
    function distanceToSegment(p, v, w) {
      return Math.sqrt(distanceToSegmentSq(p, v, w))
    }

    return {
      add: add,
      sub: sub,
      max: max,
      min: min,
      mult: mult,
      lerp: lerp,
      distance: distance,
      distanceSq: distanceSq,
      distanceToSegment: distanceToSegment,
      distanceToSegmentSq: distanceToSegmentSq,
    }
  })()

  main()
}
*/
