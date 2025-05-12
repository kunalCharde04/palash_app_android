"use client"

import React, { createContext, useContext, type ReactNode } from "react"
import { colors } from "./coloring"
import { typography } from "./typography"
import { spacing } from "./spacing"
import { borderRadius } from "./border-radius"

type ThemeContextType = {
  colors: typeof colors
  typography: typeof typography
  spacing: typeof spacing
  borderRadius: typeof borderRadius
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {


  const value = {
    colors,
    typography,
    spacing,
    borderRadius,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

