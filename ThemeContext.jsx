import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({})

const FONTS = {
  'Space Grotesk': "'Space Grotesk', sans-serif",
  'Syne': "'Syne', sans-serif",
  'DM Mono': "'DM Mono', monospace",
  'Playfair Display': "'Playfair Display', serif",
  'Outfit': "'Outfit', sans-serif",
  'IBM Plex Mono': "'IBM Plex Mono', monospace",
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('pl-theme') || 'dark')
  const [font, setFont] = useState(() => localStorage.getItem('pl-font') || 'Syne')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('pl-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.style.setProperty('--font-body', FONTS[font] || FONTS['Syne'])
    localStorage.setItem('pl-font', font)
    // Load Google Font
    const link = document.createElement('link')
    link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }, [font])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, font, setFont, availableFonts: Object.keys(FONTS) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
