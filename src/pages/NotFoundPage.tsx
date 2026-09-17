import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import SearchOffIcon from '@mui/icons-material/SearchOff'
import { Link } from 'react-router-dom'

const NotFoundPage: React.FC = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: 2,
      p: 3,
      bgcolor: 'background.default',
    }}
  >
    <Box
      sx={{
        width: 88,
        height: 88,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        color: 'text.disabled',
        bgcolor: 'background.neutral',
      }}
    >
      <SearchOffIcon sx={{ fontSize: 44 }} />
    </Box>
    <Typography variant="h3" sx={{ fontWeight: 700 }}>
      404
    </Typography>
    <Typography variant="h6" sx={{ fontWeight: 600 }}>
      Page not found
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
      The page you are looking for doesn&apos;t exist or may have been moved.
    </Typography>
    <Button variant="contained" startIcon={<HomeIcon />} component={Link} to="/dashboard" sx={{ mt: 1 }}>
      Back to Dashboard
    </Button>
  </Box>
)

export default NotFoundPage
