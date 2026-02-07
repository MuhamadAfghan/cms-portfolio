import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes'
import { TechStackProvider } from './contexts/TechStackContext'
import { PortfolioProvider } from './contexts/PortfolioContext'

function App() {
  return (
    <TechStackProvider>
      <PortfolioProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </PortfolioProvider>
    </TechStackProvider>
  )
}

export default App
