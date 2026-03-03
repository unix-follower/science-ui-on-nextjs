import * as webglUtils from "@/lib/utils/webglUtils"
import imgProcessingVertexShader from "./shaders/imageProcessingVert"
import imgProcessingFragmentShader from "./shaders/imageProcessingFrag"
import { clearCanvas } from "./webglEditorCommons"

function createAndSetupTexture(gl: WebGL2RenderingContext) {
  const texture = gl.createTexture()
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  return texture
}

function computeKernelWeight(kernels: number[]) {
  const weight = kernels.reduce((prev, curr) => prev + curr)
  return weight <= 0 ? 1 : weight
}

export function createConvolutionKernal() {
  // prettier-ignore
  return {
    normal: [
      0, 0, 0,
      0, 1, 0,
      0, 0, 0,
    ],
    gaussianBlur: [
      0.045, 0.122, 0.045,
      0.122, 0.332, 0.122,
      0.045, 0.122, 0.045,
    ],
    gaussianBlur2: [
      1, 2, 1,
      2, 4, 2,
      1, 2, 1,
    ],
    gaussianBlur3: [
      0, 1, 0,
      1, 1, 1,
      0, 1, 0,
    ],
    unsharpen: [
      -1, -1, -1,
      -1,  9, -1,
      -1, -1, -1,
    ],
    sharpness: [
      0, -1,  0,
      -1,  5, -1,
      0, -1,  0,
    ],
    sharpen: [
      -1, -1, -1,
      -1, 16, -1,
      -1, -1, -1,
    ],
    edgeDetect: [
      -0.125, -0.125, -0.125,
      -0.125,  1,     -0.125,
      -0.125, -0.125, -0.125,
    ],
    edgeDetect2: [
      -1, -1, -1,
      -1,  8, -1,
      -1, -1, -1,
    ],
    edgeDetect3: [
      -5, 0, 0,
      0, 0, 0,
      0, 0, 5,
    ],
    edgeDetect4: [
      -1, -1, -1,
      0,  0,  0,
      1,  1,  1,
    ],
    edgeDetect5: [
      -1, -1, -1,
      2,  2,  2,
      -1, -1, -1,
    ],
    edgeDetect6: [
      -5, -5, -5,
      -5, 39, -5,
      -5, -5, -5,
    ],
    sobelHorizontal: [
      1,  2,  1,
      0,  0,  0,
      -1, -2, -1,
    ],
    sobelVertical: [
      1,  0, -1,
      2,  0, -2,
      1,  0, -1,
    ],
    previtHorizontal: [
      1,  1,  1,
      0,  0,  0,
      -1, -1, -1,
    ],
    previtVertical: [
      1,  0, -1,
      1,  0, -1,
      1,  0, -1,
    ],
    boxBlur: [
      0.111, 0.111, 0.111,
      0.111, 0.111, 0.111,
      0.111, 0.111, 0.111,
    ],
    triangleBlur: [
      0.0625, 0.125, 0.0625,
      0.125,  0.25,  0.125,
      0.0625, 0.125, 0.0625,
    ],
    emboss: [
      -2, -1,  0,
      -1,  1,  1,
      0,  1,  2,
    ],
  }
}

export type ConvolutionKernal = ReturnType<typeof createConvolutionKernal>

function setRectangle(gl: WebGL2RenderingContext, x: number, y: number, width: number, height: number) {
  const x1 = x
  const x2 = x + width
  const y1 = y
  const y2 = y + height
  // prettier-ignore
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2
  ]), gl.STATIC_DRAW)
}

interface RenderImageParams {
  gl: WebGL2RenderingContext
  image: HTMLImageElement
  convolutionKernels: ReturnType<typeof createConvolutionKernal>
  convolutionKernel: string
  effects: string[]
}

export function renderImage({ gl, image, convolutionKernels, convolutionKernel, effects }: RenderImageParams) {
  if (!gl) {
    return
  }

  const program = webglUtils.createProgramFromSources(gl, [imgProcessingVertexShader, imgProcessingFragmentShader])!

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position")
  const texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord")

  const resolutionLocation = gl.getUniformLocation(program, "u_resolution")
  const imageLocation = gl.getUniformLocation(program, "u_image")
  const kernelLocation = gl.getUniformLocation(program, "u_kernel[0]")
  const kernelWeightLocation = gl.getUniformLocation(program, "u_kernelWeight")
  const flipYLocation = gl.getUniformLocation(program, "u_flipY")

  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)

  const positionBuffer = gl.createBuffer()
  gl.enableVertexAttribArray(positionAttributeLocation)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  const size = 2
  const type = gl.FLOAT
  const normalize = false
  const stride = 0
  const offset = 0
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

  const textureCoordinatesBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordinatesBuffer)
  // prettier-ignore
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.0,  0.0,
    1.0,  0.0,
    0.0,  1.0,
    0.0,  1.0,
    1.0,  0.0,
    1.0,  1.0,
  ]), gl.STATIC_DRAW)

  gl.enableVertexAttribArray(texCoordAttributeLocation)
  gl.vertexAttribPointer(texCoordAttributeLocation, size, type, normalize, stride, offset)

  const originalImageTexture = createAndSetupTexture(gl)
  // Upload the image into the texture.
  const mipLevel = 0
  const internalFormat = gl.RGBA
  const srcFormat = gl.RGBA
  const srcType = gl.UNSIGNED_BYTE
  gl.texImage2D(gl.TEXTURE_2D, mipLevel, internalFormat, srcFormat, srcType, image)

  const textures: WebGLTexture[] = []
  const framebuffers: WebGLFramebuffer[] = []
  for (let i = 0; i < 2; i++) {
    const texture = createAndSetupTexture(gl)
    textures.push(texture)

    const border = 0
    const data = null // no data = create a blank texture
    gl.texImage2D(gl.TEXTURE_2D, mipLevel, internalFormat, image.width, image.height, border, srcFormat, srcType, data)

    const fbo = gl.createFramebuffer()
    framebuffers.push(fbo)
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)

    const attachmentPoint = gl.COLOR_ATTACHMENT0
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, mipLevel)
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  setRectangle(gl, 0, 0, image.width, image.height)

  function drawWithKernel(name: string, kernels: { [key: string]: number[] }) {
    gl.uniform1fv(kernelLocation, kernels[name])
    gl.uniform1f(kernelWeightLocation, computeKernelWeight(kernels[name]))

    const primitiveType = gl.TRIANGLES
    const offset = 0
    const count = 6
    gl.drawArrays(primitiveType, offset, count)
  }

  function drawEffects() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement)

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    clearCanvas(gl)
    gl.useProgram(program)

    gl.bindVertexArray(vao)

    // start with the original image on unit 0
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, originalImageTexture)
    gl.uniform1i(imageLocation, 0)

    // don't y flip images while drawing to the textures
    gl.uniform1f(flipYLocation, 1)

    let count = 0
    for (const effect of effects) {
      const index = count % 2
      setFramebuffer(framebuffers[index], image.width, image.height)
      drawWithKernel(effect, convolutionKernels)

      // for the next draw, use the texture we just rendered to
      gl.bindTexture(gl.TEXTURE_2D, textures[index])

      // increment count so we use the other texture next time
      count++
    }

    gl.uniform1f(flipYLocation, -1) // need to y flip for canvas
    setFramebuffer(null, gl.canvas.width, gl.canvas.height)

    clearCanvas(gl)
    drawWithKernel(convolutionKernel, convolutionKernels)
  }

  function setFramebuffer(fbo: WebGLFramebuffer | null, width: number, height: number) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.uniform2f(resolutionLocation, width, height)
    gl.viewport(0, 0, width, height)
  }

  drawEffects()
}
