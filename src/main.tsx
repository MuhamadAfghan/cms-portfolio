import React from 'react'
import ReactDOM from 'react-dom/client'
// Fonts (self-hosted, no CDN): Public Sans for body/UI, Barlow for display headings.
import '@fontsource-variable/public-sans'
import '@fontsource/barlow/600.css'
import '@fontsource/barlow/700.css'
import '@fontsource/barlow/800.css'
import App from './App'
import { ThemeModeProvider } from './theme/ThemeModeProvider'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeModeProvider>
      <App />
    </ThemeModeProvider>
  </React.StrictMode>,
)
