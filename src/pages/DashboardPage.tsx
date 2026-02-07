import React from 'react'
import { mockPortfolios } from '../data/mockPortfolios' // Import mock data to get length for dashboard stats
import DashboardLayout from '../layouts/DashboardLayout' // Import the new layout

const DashboardPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="card bg-base-200 shadow-xl border border-base-content/20">
            <div className="card-body">
              <h3 className="card-title text-xl font-semibold">Total Portfolios</h3>
              <p className="text-4xl font-bold text-blue-400">{mockPortfolios.length}</p>
            </div>
          </div>
          <div className="card bg-base-200 shadow-xl border border-base-content/20">
            <div className="card-body">
              <h3 className="card-title text-xl font-semibold">Total Reviews</h3>
              <p className="text-4xl font-bold text-green-400">8</p> {/* Placeholder */}
            </div>
          </div>
          <div className="card bg-base-200 shadow-xl border border-base-content/20">
            <div className="card-body">
              <h3 className="card-title text-xl font-semibold">New Messages</h3>
              <p className="text-4xl font-bold text-yellow-400">3</p> {/* Placeholder */}
            </div>
          </div>
        </div>


      </div>
    </DashboardLayout>
  )
}

export default DashboardPage
