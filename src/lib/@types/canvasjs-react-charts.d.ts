declare module "@canvasjs/react-charts" {
  type ChartType =
    | "area"
    | "bar"
    | "bubble"
    | "column"
    | "doughnut"
    | "line"
    | "pie"
    | "spline"
    | "splineArea"
    | "scatter"
    | "stackedArea"
    | "stackedArea100"
    | "stackedBar"
    | "stackedBar100"
    | "stackedColumn"
    | "stackedColumn100"
    | "stepLine"
    | "stepArea"
    | "rangeBar"
    | "rangeColumn"
    | "rangeArea"
    | "rangeSplineArea"
    | "candlestick"
    | "ohlc"
    | "error"
    | "boxAndWhisker"
    | "pyramid"
    | "funnel"
    | "waterfall"

  interface DataPoint {
    x: Date | number
    y: number | string
  }

  interface ChartOptions {
    animationEnabled?: boolean
    title?: {
      text: string
    }
    axisX?: {
      title?: string
      valueFormatString?: string
    }
    axisY?: {
      title?: string
      prefix?: string
      suffix?: string
    }
    data: Array<{
      type: InstanceType<ChartType>
      name?: string
      showInLegend?: boolean
      markerType?: string // "circle", "square", etc.
      markerSize?: number
      dataPoints: DataPoint[]
    }>
  }

  export const CanvasJSChart: React.ComponentType<{ options: ChartOptions }>
  // eslint-disable-next-line import/no-anonymous-default-export
  export default {
    CanvasJSChart,
  }
}
