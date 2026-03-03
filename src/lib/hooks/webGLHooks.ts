import { createContext, useContext } from "react"

const WebGLRenderingCtx = createContext<WebGL2RenderingContext | null>(null)
export default WebGLRenderingCtx

export const useWebGLRenderingCtx = () => {
  const ctx = useContext(WebGLRenderingCtx)
  if (!ctx) {
    console.debug("[useWebGLRenderingCtx] ctx is null")
  }
  return ctx
}
