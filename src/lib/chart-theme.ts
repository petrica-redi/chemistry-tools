/**
 * Light theme for Plotly and Chart.js — matches the app shell (white / slate / brand red).
 */
export const CHART_LIGHT = {
  plotBg: '#f8fafc',
  paperBg: '#ffffff',
  grid: 'rgba(15, 23, 42, 0.07)',
  gridMajor: 'rgba(15, 23, 42, 0.11)',
  axisLine: '#cbd5e1',
  tick: '#64748b',
  axisTitle: '#475569',
  title: '#0f172a',
  legendBg: 'rgba(255, 255, 255, 0.97)',
  legendText: '#475569',
  legendBorder: 'rgba(226, 232, 240, 0.9)',
  /** Chart.js tooltip */
  tooltipBg: '#ffffff',
  tooltipBorder: '#e2e8f0',
  tooltipTitle: '#64748b',
  tooltipBody: '#0f172a',
  /** Plotly 3D scene panes */
  sceneBg: '#f1f5f9',
  /** Annotation label chips (Chart.js plugin) */
  labelBg: 'rgba(255, 255, 255, 0.95)',
  labelBgDark: 'rgba(248, 250, 252, 0.98)',
} as const;
