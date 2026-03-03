import React from "react"

import Image from "next/image"
import { useStyleEngine } from "@/lib/hooks/styleEngineHooks"
import styles from "./gpuDetails.module.css"
import { useTranslations } from "next-intl"

interface GpuModelDetails {
  imageSrc?: string
  imageWidth?: number
  imageHeight?: number
  description: string | null
}

const details = new Map<string, GpuModelDetails>()
details.set("NVIDIA_GB207-300", {
  imageSrc: "https://static.userbenchmark.com/resources/static/gpu/Nvidia-RTX-5080.jpg",
  imageWidth: 128,
  imageHeight: 128,
  description:
    "NVIDIA's GB207 GPU uses the Blackwell 2.0 architecture and is made using a 5 nm production process at TSMC. With a die size of 149 mm² and a transistor count of 16,900 million it is a small chip. GB207 supports DirectX 12 Ultimate (Feature Level 12_2). For GPU compute applications, OpenCL version 3.0 and CUDA 12.0 can be used. Additionally, the DirectX 12 Ultimate capability guarantees support for hardware-raytracing, variable-rate shading and more, in upcoming video games. It features 2560 shading units, 80 texture mapping units and 32 ROPs. Also included are 80 tensor cores which help improve the speed of machine learning applications. The GPU also contains 20 raytracing acceleration cores.",
})

const twStyleMap = new Map()
twStyleMap.set(
  "tw-template1",
  "line-clamp-1 align-super leading-none font-bold tracking-wide break-keep whitespace-pre text-current lowercase italic line-through decoration-sky-500",
)
twStyleMap.set(
  "tw-template2",
  "truncate text-right align-bottom font-sans text-sm leading-none font-extralight tracking-normal break-all text-inherit decoration-pink-500 decoration-solid decoration-1",
)
twStyleMap.set(
  "tw-template3",
  "line-clamp-none list-decimal border-stone-500 align-text-bottom leading-3 capitalize font-stretch-condensed underline-offset-1 bg-gray-700/70",
)
twStyleMap.set("tw-template4", "line-clamp-1 bg-blue-700 text-red-200 ps-1 pe-3 pl-3 pt-5 pb-2 me-px -mt-1 -mb-2")
twStyleMap.set(
  "tw-template5",
  "border-teal-950/30 bg-pink-400/[85.2%] pr-1 px-4 py-16 m-2 mb-auto first:font-bold focus-visible:border-gray-200",
)
twStyleMap.set(
  "tw-template6",
  "-space-y-px -space-x-3 even:bg-gray-100 focus-within:border-blue-200 hover:first:font-bold hover:underline visited:text-gray-400 after:text-red-500 nth-last-of-type-[3n+1]:m-7 selection:text-lime-900 first-line:uppercase aria-disabled:bg-gray-300 nth-last-2:mx-6",
)
twStyleMap.set(
  "tw-template7",
  "only:p-4 selection:hover:bg-lime-500 group-odd:text-lg in-focus:bg-blue-400 peer-hover:bg-blue-400 *:border-amber-100 has-focus:border-blue-400 not-focus:bg-indigo-700",
)
twStyleMap.set(
  "tw-template8",
  "flex order-first items-center self-center grow justify-evenly gap-y-6 shrink-[3] place-content-center basis-min h-full min-h-min max-h-[85%] w-1/4",
)
twStyleMap.set(
  "tw-template9",
  "grid justify-self-center justify-between row-end-2 auto-cols-min grid-flow-row self-stretch h-auto w-1 max-w-[min(90vw,1200px)]",
)
twStyleMap.set("tw-template10", "inline-grid auto-rows-fr justify-self-end row-[1/span_2] max-w-4xl min-h-max")

interface GpuDetailsProps {
  id: string
  className?: string
}

export default function GpuDetails({ id, className }: GpuDetailsProps) {
  const t = useTranslations("computerScienceHardwarePage")
  const { styleEngine } = useStyleEngine()

  let style = className
  if (styleEngine === "css" && className) {
    style = styles[className]
  } else if (styleEngine === "tw" && twStyleMap.has(className)) {
    style = twStyleMap.get(className)
  }

  if (details.has(id)) {
    const modelDetails = details.get(id)!
    return (
      <div className={style} aria-disabled="true">
        <p aria-disabled="true">{modelDetails.description}</p>
        {modelDetails.imageSrc && (
          <Image
            src={modelDetails.imageSrc}
            width={modelDetails.imageWidth}
            height={modelDetails.imageHeight}
            alt={t("noImage")}
          />
        )}
      </div>
    )
  }

  return (
    <div className={style}>
      <p>{t("noData")}</p>
    </div>
  )
}
