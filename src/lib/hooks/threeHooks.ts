import { createContext, useContext } from "react"
import * as THREE from "three"

const ThreeSceneCtx = createContext<THREE.Scene | null>(null)
export default ThreeSceneCtx

export const useThreeSceneCtx = () => {
  const ctx = useContext(ThreeSceneCtx)
  if (!ctx) {
    console.debug("[useThreeSceneCtx] ctx is null")
  }
  return ctx
}
