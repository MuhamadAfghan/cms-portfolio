import React from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { FaEdit, FaTrash } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useTechStacks } from '../contexts/TechStackContext'

const TechStackManagementPage: React.FC = () => {
  const { items, loading, error, refresh, removeItem } = useTechStacks()

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-4xl font-bold text-white mb-8">Tech Stack Management</h1>

        <div className="flex justify-end mb-4">
          <Link to="/tech-stacks/new" className="btn btn-primary">
            Add New Tech Stack
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
            <button type="button" className="btn btn-xs btn-error ml-3" onClick={refresh}>
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-sm text-base-content/60">Loading tech stacks...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((techStack) => (
              <div key={techStack.id} className="card bg-base-200 shadow-xl border border-base-content/20">
                <div className="card-body p-4 text-center">
                  {techStack.type === 'image' && techStack.source && (
                    <img
                      src={techStack.source}
                      alt={techStack.name}
                      className="mx-auto mb-3 h-12 w-12 object-contain"
                    />
                  )}
                  {techStack.type === 'svg' && techStack.source && (
                    <div
                      className="mx-auto mb-3 h-12 w-12 text-primary"
                      dangerouslySetInnerHTML={{ __html: techStack.source }}
                    />
                  )}
                  <h3 className="card-title text-xl font-semibold text-white justify-center">
                    {techStack.name}
                  </h3>
                  <div className="card-actions justify-center mt-2">
                    <Link
                      to={`/tech-stacks/${techStack.id}/edit`}
                      className="btn btn-sm btn-info tooltip"
                      data-tip="Edit"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      className="btn btn-sm btn-error tooltip"
                      data-tip="Delete"
                      onClick={async () => {
                        const confirmed = window.confirm(
                          `Delete ${techStack.name}? This action cannot be undone.`,
                        )
                        if (!confirmed) return
                        try {
                          await removeItem(techStack)
                        } catch (err) {
                          const message =
                            err instanceof Error
                              ? err.message
                              : 'Failed to delete tech stack.'
                          window.alert(message)
                        }
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!items.length && (
              <div className="text-sm text-base-content/60">
                No tech stacks yet. Create one to get started.
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default TechStackManagementPage
