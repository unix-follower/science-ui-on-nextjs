import React from "react"
import Navbar from "@/app/_components/Navbar"
import Footer from "@/app/_components/common/Footer"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Navbar />
      {children}
      <Footer className="h-[100px]" />
    </>
  )
}
