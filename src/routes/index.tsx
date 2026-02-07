import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import DashboardPage from '../pages/DashboardPage'
import PortfolioManagementPage from '../pages/PortfolioManagementPage'
import AddPortfolioPage from '../pages/AddPortfolioPage'
import EditPortfolioPage from '../pages/EditPortfolioPage'
import ReviewManagementPage from '../pages/ReviewManagementPage'
import AddTechStackPage from '../pages/AddTechStackPage'
import TechStackManagementPage from '../pages/TechStackManagementPage' // Import the new page
import EditTechStackPage from '../pages/EditTechStackPage'
import ProtectedRoute from '../components/ProtectedRoute'

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/portfolios" element={<PortfolioManagementPage />} />
        <Route path="/portfolios/new" element={<AddPortfolioPage />} />
        <Route path="/portfolios/:id/edit" element={<EditPortfolioPage />} />
        <Route path="/reviews" element={<ReviewManagementPage />} />
        <Route path="/tech-stacks/new" element={<AddTechStackPage />} />
        <Route path="/tech-stacks/:id/edit" element={<EditTechStackPage />} />
        <Route path="/tech-stacks" element={<TechStackManagementPage />} /> {/* New route for tech stacks */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} /> {/* Default route */}
      </Route>
    </Routes>
  )
}

export default AppRoutes
