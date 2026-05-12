import React, { useRef, useState } from 'react'
import { FaEdit, FaGithub, FaExternalLinkAlt, FaGripVertical, FaTrash } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import { usePortfolios } from '../contexts/PortfolioContext'
import type { PortfolioWithRelations } from '../types/portfolio'

const PortfolioManagementPage: React.FC = () => {
  const { items, loading, error, refresh, removeItem, reorderItems } = usePortfolios()

  const draggedId = useRef<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleDragStart = (id: string) => {
    draggedId.current = id
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (draggedId.current !== id) setDragOverId(id)
  }

  const handleDragLeave = () => {
    setDragOverId(null)
  }

  const handleDrop = async (targetId: string) => {
    setDragOverId(null)
    const sourceId = draggedId.current
    draggedId.current = null
    if (!sourceId || sourceId === targetId) return

    const sourceIndex = items.findIndex((p) => p.id === sourceId)
    const targetIndex = items.findIndex((p) => p.id === targetId)
    if (sourceIndex === -1 || targetIndex === -1) return

    const reordered = [...items]
    const [moved] = reordered.splice(sourceIndex, 1)
    reordered.splice(targetIndex, 0, moved)
    const orderedIds = reordered.map((p) => p.id)

    setSaving(true)
    try {
      await reorderItems(orderedIds)
    } finally {
      setSaving(false)
    }
  }

  const handleDragEnd = () => {
    draggedId.current = null
    setDragOverId(null)
  }

  const renderCard = (portfolio: PortfolioWithRelations) => {
    const isDragOver = dragOverId === portfolio.id

    return (
      <div
        key={portfolio.id}
        draggable
        onDragStart={() => handleDragStart(portfolio.id)}
        onDragOver={(e) => handleDragOver(e, portfolio.id)}
        onDragLeave={handleDragLeave}
        onDrop={() => handleDrop(portfolio.id)}
        onDragEnd={handleDragEnd}
        className={[
          'card w-full bg-base-200 shadow-xl border image-full transition-all duration-150 cursor-grab active:cursor-grabbing select-none',
          isDragOver
            ? 'border-primary scale-[1.02] opacity-80'
            : 'border-base-content/20',
        ].join(' ')}
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
          <div className="flex items-start gap-2">
            <span className="mt-1 text-base-content/40 shrink-0">
              <FaGripVertical />
            </span>
            <h3 className="card-title text-2xl font-bold text-white flex-1">
              {portfolio.title}
            </h3>
          </div>
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
              <span className="text-xs text-base-content/60">No tech stack selected.</span>
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
                draggable={false}
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
                draggable={false}
              >
                <FaGithub />
              </a>
            )}
            <Link
              to={`/portfolios/${portfolio.id}/edit`}
              className="btn btn-sm btn-info tooltip"
              data-tip="Edit"
              draggable={false}
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
                    err instanceof Error ? err.message : 'Failed to delete portfolio.'
                  window.alert(message)
                }
              }}
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-4xl font-bold text-white mb-8">Portfolio Management</h1>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-base-content/50">
            {saving ? 'Saving order...' : items.length > 1 ? 'Drag cards to reorder' : ''}
          </span>
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
            {items.map(renderCard)}
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
