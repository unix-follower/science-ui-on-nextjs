import { createContext, useContext } from "react"
import { type Core } from "cytoscape"

const CytoscapeContext = createContext<Core | null>(null)
export default CytoscapeContext

export const useCytoscape = () => {
  const cy = useContext(CytoscapeContext)
  if (!cy) {
    console.debug("[useCytoscape] core is null")
  }
  return cy
}
