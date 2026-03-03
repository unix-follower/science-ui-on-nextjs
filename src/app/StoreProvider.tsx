"use client"

import type { AppStore } from "@/lib/store"
import { setupStore } from "@/lib/store"
import { setupListeners } from "@reduxjs/toolkit/query"
import type { ReactNode } from "react"
import { useEffect, useRef } from "react"
import { Provider } from "react-redux"

interface StoreProviderProps {
  readonly children: ReactNode
}

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const storeRef = useRef<AppStore | null>(null)

  if (!storeRef.current) {
    storeRef.current = setupStore()
  }

  useEffect(() => {
    if (storeRef.current != null) {
      return setupListeners(storeRef.current.dispatch)
    }
  }, [])

  return <Provider store={storeRef.current}>{children}</Provider>
}
