import React, { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import SearchOffIcon from '@mui/icons-material/SearchOff'
import { Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import PageHeader from '../components/PageHeader'
import EmptyContent from '../components/EmptyContent'
import CardGridSkeleton from '../components/CardGridSkeleton'
import { useTechStacks } from '../contexts/TechStackContext'
import { useConfirm, useNotify } from '../components/feedback'
import { sanitizeSvg } from '../lib/sanitize'

const TechStackManagementPage: React.FC = () => {
  const { items, loading, error, refresh, removeItem } = useTechStacks()
  const { confirm, confirmDialog } = useConfirm()
  const { notifyError, snackbar } = useNotify()

  const [search, setSearch] = useState('')
  const query = search.trim().toLowerCase()
  const filteredItems = query
    ? items.filter((item) => item.name.toLowerCase().includes(query))
    : items

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: 'Delete tech stack',
      message: `Delete ${name}? This action cannot be undone.`,
      confirmText: 'Delete',
      destructive: true,
    })
    if (!ok) return
    const target = items.find((item) => item.id === id)
    if (!target) return
    try {
      await removeItem(target)
    } catch (err) {
      notifyError(err instanceof Error ? err.message : 'Failed to delete tech stack.')
    }
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <PageHeader
          title="Tech Stacks"
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Tech Stacks' }]}
          action={
            <Button variant="contained" startIcon={<AddIcon />} component={Link} to="/tech-stacks/new">
              New Tech Stack
            </Button>
          }
        />

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={refresh}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <CardGridSkeleton count={8} height={140} size={{ xs: 6, sm: 4, md: 3, lg: 2 }} />
        ) : !items.length ? (
          <EmptyContent
            icon={AccountTreeIcon}
            title="No tech stacks yet"
            description="Add your first stack icon to start tagging your portfolio projects."
            action={
              <Button variant="soft" color="primary" startIcon={<AddIcon />} component={Link} to="/tech-stacks/new">
                New Tech Stack
              </Button>
            }
          />
        ) : (
          <>
            <TextField
              size="small"
              placeholder="Search tech stacks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 3, width: '100%', maxWidth: 360 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position="end">
                      <IconButton size="small" aria-label="Clear search" onClick={() => setSearch('')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined,
                },
              }}
            />

            {!filteredItems.length ? (
              <EmptyContent
                icon={SearchOffIcon}
                title="No matching tech stacks"
                description="Try a different search term."
                action={
                  <Button variant="soft" color="primary" onClick={() => setSearch('')}>
                    Clear search
                  </Button>
                }
              />
            ) : (
              <Grid container spacing={3}>
                {filteredItems.map((techStack) => (
                  <Grid key={techStack.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform .2s, box-shadow .2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: (t) => t.customShadows.z16 },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', position: 'relative' }}>
                    <Box
                      className="ts-actions"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        gap: 0.5,
                        // Always visible on touch devices; on devices that support
                        // hover, fade in on hover to keep the card clean.
                        opacity: { xs: 1, md: 0 },
                        transition: 'opacity .2s',
                        '@media (hover: none)': { opacity: 1 },
                        '.MuiCard-root:hover &': { opacity: 1 },
                        '.MuiCard-root:focus-within &': { opacity: 1 },
                      }}
                    >
                      <Tooltip title="Edit">
                        <IconButton
                          color="info"
                          size="small"
                          aria-label={`Edit ${techStack.name}`}
                          component={Link}
                          to={`/tech-stacks/${techStack.id}/edit`}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          size="small"
                          aria-label={`Delete ${techStack.name}`}
                          onClick={() => handleDelete(techStack.id, techStack.name)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Box
                      sx={{
                        mx: 'auto',
                        mb: 1.5,
                        width: 64,
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        bgcolor: 'background.neutral',
                      }}
                    >
                      {techStack.type === 'image' && techStack.source ? (
                        <Box
                          component="img"
                          src={techStack.source}
                          alt={techStack.name}
                          sx={{ height: 36, width: 36, objectFit: 'contain' }}
                        />
                      ) : techStack.type === 'svg' && techStack.source ? (
                        <Box
                          sx={{ height: 36, width: 36, color: 'primary.main' }}
                          dangerouslySetInnerHTML={{ __html: sanitizeSvg(techStack.source) }}
                        />
                      ) : (
                        <AccountTreeIcon sx={{ color: 'text.disabled' }} />
                      )}
                    </Box>
                    <Typography variant="subtitle2" noWrap>
                      {techStack.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Box>
      {confirmDialog}
      {snackbar}
    </DashboardLayout>
  )
}

export default TechStackManagementPage
