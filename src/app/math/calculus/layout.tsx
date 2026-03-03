import React from "react"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <div>Calculus Layout placeholder</div>
      {children}
    </>
  )
}
