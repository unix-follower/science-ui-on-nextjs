import React from "react"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <div>Programming lang layout placeholder</div>
      {children}
    </>
  )
}
