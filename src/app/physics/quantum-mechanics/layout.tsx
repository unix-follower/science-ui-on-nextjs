import React from "react"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <div>Quantum-mechanics Layout placeholder</div>
      {children}
    </>
  )
}
