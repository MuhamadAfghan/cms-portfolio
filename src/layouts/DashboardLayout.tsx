import React, { useState } from 'react'
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, type Theme } from '@mui/material/styles'
import DashboardIcon from '@mui/icons-material/Dashboard'
import WorkIcon from '@mui/icons-material/Work'
import StarIcon from '@mui/icons-material/Star'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clearAuth, getAuthUser } from '../lib/auth'
import { useThemeMode } from '../theme/ThemeModeProvider'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DRAWER_WIDTH = 280

const navSections = [
  {
    subheader: 'Overview',
    items: [{ path: '/dashboard', icon: DashboardIcon, label: 'Dashboard' }],
  },
  {
    subheader: 'Management',
    items: [
      { path: '/portfolios', icon: WorkIcon, label: 'Portfolios' },
      { path: '/tech-stacks', icon: AccountTreeIcon, label: 'Tech Stacks' },
      { path: '/reviews', icon: StarIcon, label: 'Reviews' },
    ],
  },
]

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const username = getAuthUser() || 'Admin'
  const { mode, toggleMode } = useThemeMode()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActivePath = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`)

  // Close the mobile drawer whenever the route changes.
  React.useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    setAnchorEl(null)
    clearAuth()
    navigate('/login')
  }

  const brand = (
    <Toolbar sx={{ px: 3, gap: 1.5 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'primary.contrastText',
          bgcolor: 'primary.main',
          fontWeight: 800,
        }}
      >
        C
      </Box>
      <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
        CMS Admin
      </Typography>
    </Toolbar>
  )

  const nav = (
    <Box sx={{ px: 2, flexGrow: 1, overflowY: 'auto' }}>
      {navSections.map((section) => (
        <List
          key={section.subheader}
          subheader={
            <ListSubheader
              disableSticky
              sx={{
                px: 1,
                bgcolor: 'transparent',
                typography: 'overline',
                color: 'text.disabled',
                fontSize: 11,
              }}
            >
              {section.subheader}
            </ListSubheader>
          }
        >
          {section.items.map((item) => {
            const Icon = item.icon
            const active = isActivePath(item.path)
            return (
              <ListItemButton
                key={item.path}
                component={Link}
                to={item.path}
                sx={{
                  borderRadius: 1.5,
                  mb: 0.5,
                  minHeight: 44,
                  color: active ? 'primary.main' : 'text.secondary',
                  ...(active && {
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                    '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.16) },
                  }),
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { sx: { fontWeight: active ? 700 : 500, fontSize: 14 } } }}
                />
              </ListItemButton>
            )
          })}
        </List>
      ))}
    </Box>
  )

  const accountCard = (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
          borderRadius: 2,
          bgcolor: 'background.neutral',
        }}
      >
        <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
          {username.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {username}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            Administrator
          </Typography>
        </Box>
      </Box>
    </Box>
  )

  const drawerContent = (
    <>
      {brand}
      {nav}
      <Divider sx={{ borderStyle: 'dashed' }} />
      {accountCard}
    </>
  )

  const drawerPaperSx = {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    bgcolor: 'background.paper',
    borderRight: (t: Theme) => `1px dashed ${t.palette.divider}`,
    display: 'flex',
    flexDirection: 'column',
  } as const

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Permanent drawer — desktop/tablet (md and up) */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': drawerPaperSx,
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Temporary drawer — mobile (below md), toggled by the hamburger */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': drawerPaperSx,
        }}
      >
        {drawerContent}
      </Drawer>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            color: 'text.primary',
            bgcolor: (t) => alpha(t.palette.background.default, 0.8),
            backdropFilter: 'blur(6px)',
            borderBottom: (t) => `1px dashed ${t.palette.divider}`,
          }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <Tooltip title="Open menu">
              <IconButton
                onClick={() => setMobileOpen(true)}
                edge="start"
                aria-label="Open navigation menu"
                sx={{ display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
            <Box sx={{ flexGrow: 1 }} />
            <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              <IconButton
                onClick={toggleMode}
                color="inherit"
                aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Account">
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                aria-label="Open account menu"
                sx={{ p: 0.5 }}
              >
                <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 15 }}>
                  {username.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{ paper: { sx: { minWidth: 200, mt: 1 } } }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" noWrap>
                  {username}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  Administrator
                </Typography>
              </Box>
              <Divider sx={{ borderStyle: 'dashed' }} />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main', mt: 0.5 }}>
                <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flexGrow: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default DashboardLayout
