import React from "react"
import * as d3 from "d3"
import Button from "@mui/material/Button"
import { type D3SelectSVGGElement, mapAxisDomain } from "@/lib/utils/d3Utils"
import { useAppSelector } from "@/lib/hooks/hooks"
import { D3LINE_PLOT, D3LINE_PLOT_X_AXIS } from "@/lib/features/finance/constants"
import { getXAxisDomain } from "@/lib/features/finance/d3Slice"

interface D3ToolPanelProps {
  selectedChart: SVGSVGElement | null
}

export default function D3ToolPanel({ selectedChart }: D3ToolPanelProps) {
  const xAxisDomain = useAppSelector((state) => getXAxisDomain(state, D3LINE_PLOT))

  function handleAxisTopClick() {
    if (selectedChart) {
      const chartWidth = selectedChart.width.baseVal.value
      const domain = xAxisDomain.map(mapAxisDomain)
      const xScale = d3.scaleTime().domain(domain).range([50, chartWidth])

      const xAxis = d3.select(selectedChart.getElementById(D3LINE_PLOT_X_AXIS)) as unknown as D3SelectSVGGElement
      xAxis.call(d3.axisTop(xScale))
    }
  }

  return (
    <div>
      <div>
        <span>Axis</span>
        <div>
          <Button variant="outlined" onClick={handleAxisTopClick}>
            Top
          </Button>
        </div>
      </div>
    </div>
  )
}
