import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes'
import { TechStackProvider } from './contexts/TechStackContext'
import { PortfolioProvider } from './contexts/PortfolioContext'
import { ReviewProvider } from './contexts/ReviewContext'

function App() {
  return (
    <TechStackProvider>
      <PortfolioProvider>
        <ReviewProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ReviewProvider>
      </PortfolioProvider>
    </TechStackProvider>
  )
}

export default App
