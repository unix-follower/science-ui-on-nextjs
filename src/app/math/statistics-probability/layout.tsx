import React from "react"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <div>StatisticsProbability Layout placeholder</div>
      {children}
    </>
  )
}
