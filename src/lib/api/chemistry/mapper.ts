import { ChemistryGraphResponse } from "@/lib/api/chemistry/compoundModels"
import { ElementDefinition } from "cytoscape"

export function mapGraphResponse(graphResponse: ChemistryGraphResponse) {
  const elements: ElementDefinition[] = graphResponse.nodes.map((node) => ({
    group: "nodes",
    data: {
      id: node.id,
      label: node.label,
      position: { x: 100, y: 100 },
      renderedPosition: { x: 200, y: 200 },
      selected: false,
      selectable: true,
      locked: false,
      grabbable: true,
      pannable: false,
      ...node.properties,
    },
  }))
  const edges: ElementDefinition[] = graphResponse.edges.map((edge) => ({
    group: "edges",
    data: {
      id: edge.id,
      label: edge.label,
      source: edge.source,
      target: edge.target,
      ...edge.properties,
    },
  }))
  elements.push(...edges)
  return elements
}
