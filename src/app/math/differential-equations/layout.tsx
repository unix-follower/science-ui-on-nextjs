import React from "react"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <div>DifferentialEquations Layout placeholder</div>
      {children}
    </>
  )
}
