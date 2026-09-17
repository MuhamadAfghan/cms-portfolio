import DOMPurify from 'dompurify'

/**
 * Sanitize user-provided SVG markup before rendering it with
 * dangerouslySetInnerHTML. Strips <script>, event handlers (onload, onclick…)
 * and other active content while keeping valid SVG drawing elements.
 */
export const sanitizeSvg = (svg: string): string =>
  DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
  })
