import React, { Suspense, lazy } from 'react'
import type { Props as ApexChartProps } from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'
import type { SxProps, Theme } from '@mui/material/styles'

// Lazy-loaded: keeps the heavy ApexCharts bundle out of the initial load;
// it is fetched only when a chart actually mounts.
const ReactApexChart = lazy(() => import('react-apexcharts'))

/**
 * Thin ApexCharts wrapper with theme-aware defaults (font, tooltip theme,
 * transparent background). Use `useChart` to merge chart-specific options on
 * top of the base config.
 */

export const useChart = (options?: ApexOptions): ApexOptions => {
  const theme = useTheme()

  return {
    chart: {
      fontFamily: theme.typography.fontFamily,
      foreColor: theme.palette.text.disabled,
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false },
      ...options?.chart,
    },
    colors: options?.colors ?? [theme.palette.primary.main],
    states: {
      hover: { filter: { type: 'lighten' } },
      active: { filter: { type: 'darken' } },
      ...options?.states,
    },
    stroke: { width: 2, curve: 'smooth', lineCap: 'round', ...options?.stroke },
    grid: {
      strokeDashArray: 3,
      borderColor: theme.palette.divider,
      ...options?.grid,
    },
    tooltip: {
      theme: theme.palette.mode,
      fillSeriesColor: false,
      ...options?.tooltip,
    },
    dataLabels: { enabled: false, ...options?.dataLabels },
    legend: { show: false, ...options?.legend },
    ...options,
  }
}

interface ChartProps {
  type: ApexChartProps['type']
  series: ApexChartProps['series']
  options: ApexOptions
  width?: number | string
  height?: number | string
  sx?: SxProps<Theme>
}

const Chart: React.FC<ChartProps> = ({ type, series, options, width = '100%', height = '100%', sx }) => (
  <Box sx={sx}>
    <Suspense fallback={<Skeleton variant="rounded" width={width} height={height} />}>
      <ReactApexChart type={type} series={series} options={options} width={width} height={height} />
    </Suspense>
  </Box>
)

export default Chart
