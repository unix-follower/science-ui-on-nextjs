"use client"

import React, { Suspense, useCallback, useEffect, useRef, useState } from "react"
import cytoscape, { type ElementDefinition, NodeSingular } from "cytoscape"
import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"
import CytoscapeContext from "@/lib/hooks/chemistryHooks"
import ToolPanel from "./ToolPanel"
import i18n from "@/config/i18n"
import { useAppDispatch, useAppSelector } from "@/lib/hooks/hooks"
import { getTappedNodeId, setTappedNodeId } from "@/lib/features/chemistry/compoundGraphViewerSlice"

interface CompoundGraphViewerProps {
  compoundData: ElementDefinition[]
  translations: Record<string, string | Record<string, string>>
}

const ELEMENT_COLOR = "#0074D9"
const COMPOUND_COLOR = "#FF851B"

function getNodeColor(data: cytoscape.NodeDataDefinition) {
  if (data && data.label === "Compound") {
    return COMPOUND_COLOR
  }
  return ELEMENT_COLOR
}

const operations = [
  {
    value: "getElementById",
  },
]

export default function CompoundGraphViewer({ translations, compoundData }: CompoundGraphViewerProps) {
  const cyContainerRef = useRef<HTMLDivElement>(null)
  const [cyInstance, setCyInstance] = useState<cytoscape.Core | null>(null)
  const dispatch = useAppDispatch()
  const tappedNodeId = useAppSelector(getTappedNodeId)

  const [searchInGraphQuery, setSearchInGraphQuery] = useState("")

  const handleTapNode = useCallback(
    (event: cytoscape.EventObject) => {
      const node = event.target as cytoscape.SingularData as NodeSingular
      console.log("Node clicked:", node)
      if (tappedNodeId && tappedNodeId === node.id()) {
        node.style("background-color", getNodeColor(node.data()))
        dispatch(setTappedNodeId(null))
      } else {
        const prevTappedNode = cyInstance
          ?.nodes()
          .filter((ele) => ele.id() == tappedNodeId)
          .first()
        if (prevTappedNode) {
          prevTappedNode.style("background-color", getNodeColor(prevTappedNode.data()))
        }

        node.style("background-color", "black")
        dispatch(setTappedNodeId(node.id()))
      }
    },
    [dispatch, cyInstance, tappedNodeId],
  )

  useEffect(() => {
    const cy = cytoscape({
      container: cyContainerRef.current,
      elements: compoundData,
      layout: { name: "grid" },
      style: [
        {
          selector: "node[label='Element']",
          style: {
            "background-color": ELEMENT_COLOR,
            "text-wrap": "wrap",
            "font-size": "12px",
            color: "#FFFFFF",
          },
        },
        {
          selector: "node[label='Compound']",
          style: {
            "background-color": COMPOUND_COLOR,
            "text-wrap": "wrap",
            "font-size": "12px",
            color: "#FFFFFF",
          },
        },
        {
          selector: "edge",
          style: {
            "line-color": "#AAAAAA",
            "target-arrow-color": "#AAAAAA",
            "target-arrow-shape": "triangle",
            label: "data(label)",
            "font-size": "10px",
            "text-wrap": "wrap",
            "text-max-width": "80",
            color: "#000000",
          },
        },
      ],
    })

    cy.on("tap", "edge", (event) => {
      const edge = event.target
      console.log("Edge clicked:", edge.data())
    })

    cy.on("mouseover", "node", (event) => {
      const node = event.target
      console.log("Node:", node.data())
    })

    setCyInstance(cy)

    return () => cy.destroy()
  }, [compoundData])

  useEffect(() => {
    if (cyInstance) {
      cyInstance.on("tap", "node", handleTapNode)
    }
  }, [cyInstance, handleTapNode])

  useEffect(() => {
    i18n.addResourceBundle("en", "translation", translations, true, true)
  }, [translations])

  function handleSearchInGraphChange(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
    const { value } = event.target
    setSearchInGraphQuery(value)
    const elementById = cyInstance?.getElementById(value)
    if (elementById) {
      elementById.style("background-color", "yellow")
    }
  }

  return (
    <CytoscapeContext value={cyInstance}>
      <div className="mb-2 flex h-15 gap-2 pt-1">
        <Box
          component="form"
          sx={{ "& .MuiTextField-root": { m: 1, width: "100%" } }}
          className="flex-1/2 flex-grow-1"
          noValidate
          autoComplete="off"
        >
          <TextField
            id="cy-op-search"
            label="Search in the graph"
            type="search"
            value={searchInGraphQuery}
            onChange={handleSearchInGraphChange}
          />
        </Box>
        <Box
          component="form"
          sx={{ "& .MuiTextField-root": { m: 1, width: "100px" } }}
          className="w-90%"
          noValidate
          autoComplete="off"
        >
          <div>
            <TextField
              id="select-operation"
              select
              label="Operation"
              value={operations[0]}
              slotProps={{
                select: {
                  native: true,
                },
              }}
            >
              {operations.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value}
                </option>
              ))}
            </TextField>
          </div>
        </Box>
      </div>
      <div className="grid grid-cols-[10%_90%] grid-rows-1 gap-4">
        <Suspense fallback={<div>Loading Tool Panel...</div>}>
          <ToolPanel />
        </Suspense>
        <div ref={cyContainerRef} style={{ width: "100%", height: "500px" }} />
      </div>
    </CytoscapeContext>
  )
}
