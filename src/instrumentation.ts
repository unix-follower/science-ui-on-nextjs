import { registerOTel, OTLPHttpJsonTraceExporter } from "@vercel/otel"

export function register() {
  registerOTel({
    serviceName: "science-ui-on-nextjs",
    traceExporter: new OTLPHttpJsonTraceExporter({
      url: "http://192.168.105.8:4318/v1/traces",
    }),
  })
}
