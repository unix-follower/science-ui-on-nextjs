import React, { createContext, useContext, useState } from "react"

export type StyleEngine = "css" | "tw"

interface StyleEngineContextProps {
  styleEngine: StyleEngine
  setStyleEngine: (engine: StyleEngine) => void
}

const StyleEngineContext = createContext<StyleEngineContextProps | undefined>(undefined)

export const StyleEngineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [styleEngine, setStyleEngine] = useState<StyleEngine>("css")

  return <StyleEngineContext value={{ styleEngine, setStyleEngine }}>{children}</StyleEngineContext>
}

export const useStyleEngine = (): StyleEngineContextProps => {
  const context = useContext(StyleEngineContext)
  if (!context) {
    throw new Error("useStyleEngine must be used within a StyleEngineProvider")
  }
  return context
}
