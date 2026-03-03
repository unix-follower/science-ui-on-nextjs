/**
 * Loads a shader.
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {string} shaderSource The shader source.
 * @param {number} shaderType The type of shader.
 * @param {ErrorCallback} optErrorCallback callback for errors.
 * @return {WebGLShader} The created shader.
 */
function loadShader(
  gl: WebGLRenderingContext,
  shaderSource: string,
  shaderType: number,
  optErrorCallback?: ErrorCallback,
) {
  const shader = gl.createShader(shaderType)!

  gl.shaderSource(shader, shaderSource)

  // Compile the shader
  gl.compileShader(shader)

  // Check the compile status
  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (!compiled) {
    const lastError = gl.getShaderInfoLog(shader)
    if (optErrorCallback) {
      optErrorCallback(new DOMException(lastError || undefined))
    }
    gl.deleteShader(shader)
    return null
  }

  return shader
}

/**
 * Creates a program, attaches shaders, binds attrib locations, links the
 * program and calls useProgram.
 * @param {WebGLShader[]} shaders The shaders to attach
 * @param {string[]} [optAttribs] An array of attribs names. Locations will be assigned by index if not passed in
 * @param {number[]} [optLocations] The locations for the. A parallel array to optAttribs letting you assign locations.
 * @param {ErrorCallback} optErrorCallback callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 */
function createProgram(
  gl: WebGL2RenderingContext,
  shaders: WebGLShader[],
  optAttribs?: string[],
  optLocations?: number[],
  optErrorCallback?: ErrorCallback,
) {
  const program = gl.createProgram()
  shaders.forEach(function (shader) {
    gl.attachShader(program, shader)
  })
  if (optAttribs) {
    optAttribs.forEach(function (attrib, ndx) {
      gl.bindAttribLocation(program, optLocations ? optLocations[ndx] : ndx, attrib)
    })
  }
  gl.linkProgram(program)

  const linked = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (!linked) {
    const lastError = gl.getProgramInfoLog(program)
    if (optErrorCallback) {
      optErrorCallback(new DOMException(lastError || undefined))
    }

    gl.deleteProgram(program)
    return null
  }
  return program
}

const defaultShaderType: ("VERTEX_SHADER" | "FRAGMENT_SHADER")[] = ["VERTEX_SHADER", "FRAGMENT_SHADER"]

/**
 * Creates a program from 2 sources.
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext
 *        to use.
 * @param {string[]} shaderSources Array of sources for the
 *        shaders. The first is assumed to be the vertex shader,
 *        the second the fragment shader.
 * @param {string[]} [optAttribs] An array of attribs names. Locations will be assigned by index if not passed in
 * @param {number[]} [optLocations] The locations for the. A parallel array to optAttribs letting you assign locations.
 * @param {ErrorCallback} optErrorCallback callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @return {WebGLProgram} The created program.
 */
export function createProgramFromSources(
  gl: WebGL2RenderingContext,
  shaderSources: string[],
  optAttribs?: string[],
  optLocations?: number[],
  optErrorCallback?: ErrorCallback,
) {
  const shaders: WebGLShader[] = []
  for (let i = 0; i < shaderSources.length; i++) {
    const shader = loadShader(gl, shaderSources[i], gl[defaultShaderType[i]], optErrorCallback)
    if (shader) {
      shaders.push(shader)
    }
  }
  return createProgram(gl, shaders, optAttribs, optLocations, optErrorCallback)
}

/**
 * Resize a canvas to match the size its displayed.
 * @param {HTMLCanvasElement} canvas The canvas to resize.
 * @param {number} [multiplier] amount to multiply by.
 *    Pass in window.devicePixelRatio for native pixels.
 * @return {boolean} true if the canvas was resized.
 */
export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement, multiplier?: number): boolean {
  multiplier = multiplier || 1
  const width = (canvas.clientWidth * multiplier) | 0
  const height = (canvas.clientHeight * multiplier) | 0
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
    return true
  }
  return false
}
