import React from 'react'
import { FaEdit, FaTrash, FaExternalLinkAlt, FaGithub } from 'react-icons/fa' // Import icons from react-icons
import { Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout' // Import the new layout
import { usePortfolios } from '../contexts/PortfolioContext'

const PortfolioManagementPage: React.FC = () => {
  const { items, loading, error, refresh, removeItem } = usePortfolios()

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-4xl font-bold text-white mb-8">Portfolio Management</h1>

        <div className="flex justify-end mb-4">
          <Link to="/portfolios/new" className="btn btn-primary">
            Add New Portfolio
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
          <div className="text-sm text-base-content/60">Loading portfolios...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((portfolio) => (
              <div
                key={portfolio.id}
                className="card w-full bg-base-200 shadow-xl border border-base-content/20 image-full"
              >
                {portfolio.images[0]?.url ? (
                  <figure>
                    <img
                      src={portfolio.images[0].url}
                      alt={portfolio.title}
                      className="w-full h-48 object-cover"
                    />
                  </figure>
                ) : (
                  <figure className="bg-base-300/40" />
                )}
                <div className="card-body p-6">
                  <h3 className="card-title text-2xl font-bold text-white">
                    {portfolio.title}
                  </h3>
                  <p className="text-sm text-gray-300 line-clamp-3">
                    {portfolio.summary || 'No summary provided.'}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {portfolio.techStacks.map((stack) => (
                      <span
                        key={stack.id}
                        className="badge badge-outline badge-sm text-gray-400"
                      >
                        {stack.type === 'image' && stack.source ? (
                          <img
                            src={stack.source}
                            alt={stack.name}
                            className="mr-1 h-3 w-3 object-contain"
                          />
                        ) : stack.type === 'svg' && stack.source ? (
                          <span
                            className="mr-1 inline-flex h-3 w-3"
                            dangerouslySetInnerHTML={{ __html: stack.source }}
                          />
                        ) : null}
                        {stack.name}
                      </span>
                    ))}
                    {!portfolio.techStacks.length && (
                      <span className="text-xs text-base-content/60">
                        No tech stack selected.
                      </span>
                    )}
                  </div>
                  <div className="card-actions justify-end mt-4">
                    {portfolio.link_demo && (
                      <a
                        href={portfolio.link_demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-ghost tooltip"
                        data-tip="Demo"
                      >
                        <FaExternalLinkAlt />
                      </a>
                    )}
                    {portfolio.link_github && (
                      <a
                        href={portfolio.link_github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-ghost tooltip"
                        data-tip="GitHub"
                      >
                        <FaGithub />
                      </a>
                    )}
                    <Link
                      to={`/portfolios/${portfolio.id}/edit`}
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
                          `Delete ${portfolio.title}? This action cannot be undone.`,
                        )
                        if (!confirmed) return
                        try {
                          await removeItem(portfolio)
                        } catch (err) {
                          const message =
                            err instanceof Error
                              ? err.message
                              : 'Failed to delete portfolio.'
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
                No portfolios yet. Create one to get started.
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default PortfolioManagementPage
