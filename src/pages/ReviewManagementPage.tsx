import React from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { mockReviews } from '../data/mockReviews'
import { FaEdit, FaTrash, FaStar as FaStarSolid } from 'react-icons/fa' // Import FaStarSolid for filled stars

const ReviewManagementPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-4xl font-bold text-white mb-8">Review Management</h1>

        <div className="flex justify-end mb-4">
          <button className="btn btn-primary">Add New Review</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockReviews.map((review, index) => (
            <div key={index} className="card w-full bg-base-200 shadow-xl border border-base-content/20">
              <div className="card-body">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="card-title text-xl font-semibold text-white">
                    {review.name || 'Anonymous'}
                  </h3>
                  <div className="flex items-center">
                    <span className="text-xl font-bold text-yellow-400 mr-1">{review.rating}</span>
                    <FaStarSolid className="text-yellow-400" />
                  </div>
                </div>
                <p className="text-sm text-gray-300">
                  {review.role} {review.company ? `at ${review.company.name}` : ''}
                </p>
                <p className="text-base-content mt-3 line-clamp-4">{review.review}</p>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-sm btn-info tooltip" data-tip="Edit">
                    <FaEdit />
                  </button>
                  <button className="btn btn-sm btn-error tooltip" data-tip="Delete">
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ReviewManagementPage
