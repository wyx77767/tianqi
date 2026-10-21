import { useId } from 'react'
import type { WeatherKind } from '../types/weather'

interface WeatherIconProps {
  kind: WeatherKind
  isDay?: boolean
  className?: string
}

const CLOUD_PATH =
  'M18 46h28a8.5 8.5 0 0 0 1.6-16.8 12.5 12.5 0 0 0-23.9-1.8A9 9 0 0 0 18 46Z'

/** 以 (32,32) 为中心缩放，再整体平移 */
function scaled(scale: number, dx = 0, dy = 0): string {
  const shift = 32 * (1 - scale)
  return `translate(${shift + dx} ${shift + dy}) scale(${scale})`
}

export function WeatherIcon({ kind, isDay = true, className }: WeatherIconProps) {
  const uid = useId().replace(/[:]/g, '')
  const maskId = `moon-${uid}`
  const sunGradientId = `sun-warm-${uid}`
  const glowGradientId = `sun-glow-${uid}`

  const sun = (
    <g className="wi-rays">
      <circle cx="32" cy="32" r="11" fill="#fbbf24" />
      <circle cx="32" cy="32" r="11" fill={`url(#${sunGradientId})`} />
      <g stroke="#fcd34d" strokeWidth="3" strokeLinecap="round">
        <path d="M32 12v5M32 47v5M12 32h5M47 32h5M17.9 17.9l3.5 3.5M42.6 42.6l3.5 3.5M46.1 17.9l-3.5 3.5M21.4 42.6l-3.5 3.5" />
      </g>
    </g>
  )

  const moon = (
    <g>
      <mask id={maskId}>
        <rect width="64" height="64" fill="black" />
        <circle cx="32" cy="32" r="17" fill="white" />
        <circle cx="42" cy="23" r="16" fill="black" />
      </mask>
      <circle cx="32" cy="32" r="17" fill="#e2e8f0" mask={`url(#${maskId})`} />
      <circle cx="50" cy="15" r="1.5" fill="#e2e8f0" opacity="0.8" />
      <circle cx="55" cy="27" r="1" fill="#e2e8f0" opacity="0.6" />
      <circle cx="14" cy="52" r="1.2" fill="#e2e8f0" opacity="0.5" />
    </g>
  )

  const sky = isDay ? sun : moon

  const cloud = (
    <path className="wi-cloud" d={CLOUD_PATH} fill="#f1f5f9" fillOpacity="0.95" />
  )

  const drops = (
    <g stroke="#7dd3fc" strokeWidth="2.6" strokeLinecap="round">
      <path className="wi-drop" d="M22 46v5" style={{ animationDelay: '0s' }} />
      <path className="wi-drop" d="M30 47v5" style={{ animationDelay: '0.35s' }} />
      <path className="wi-drop" d="M38 46v5" style={{ animationDelay: '0.7s' }} />
      <path className="wi-drop" d="M46 47v5" style={{ animationDelay: '1.05s' }} />
    </g>
  )

  const snowflakes = (
    <g stroke="#e0f2fe" strokeWidth="1.8" strokeLinecap="round">
      <g className="wi-snow" style={{ animationDelay: '0s' }}>
        <path d="M23 47v5M20.8 48.2l4.4 2.6M25.2 48.2l-4.4 2.6" />
      </g>
      <g className="wi-snow" style={{ animationDelay: '1s' }}>
        <path d="M32 47v5M29.8 48.2l4.4 2.6M34.2 48.2l-4.4 2.6" />
      </g>
      <g className="wi-snow" style={{ animationDelay: '2s' }}>
        <path d="M41 47v5M38.8 48.2l4.4 2.6M43.2 48.2l-4.4 2.6" />
      </g>
    </g>
  )

  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={kind}>
      <defs>
        <linearGradient id={sunGradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <radialGradient id={glowGradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
        </radialGradient>
      </defs>

      {kind === 'clear' && (
        <g>
          <circle cx="32" cy="32" r="30" fill={`url(#${glowGradientId})`} />
          {sky}
        </g>
      )}

      {kind === 'partly-cloudy' && (
        <g>
          <g transform={scaled(0.72, -6, -7)}>{sky}</g>
          <g transform={scaled(0.9, 6, 9)}>{cloud}</g>
        </g>
      )}

      {kind === 'cloudy' && (
        <g>
          <path
            className="wi-cloud"
            d={CLOUD_PATH}
            fill="#cbd5e1"
            fillOpacity="0.55"
            transform={scaled(0.82, 6, -8)}
          />
          {cloud}
        </g>
      )}

      {(kind === 'rain' || kind === 'thunder' || kind === 'snow') && (
        <g transform="translate(0,-7)">{cloud}</g>
      )}

      {kind === 'rain' && drops}

      {kind === 'thunder' && (
        <g>
          <path
            className="wi-flash"
            d="M34 36 24 49h7l-3 9 12-14h-7l4-8Z"
            fill="#fde047"
          />
        </g>
      )}

      {kind === 'snow' && snowflakes}

      {kind === 'mist' && (
        <g>
          <g transform={scaled(0.92, 0, -6)}>{cloud}</g>
          <g stroke="#e2e8f0" strokeWidth="2.6" strokeLinecap="round" opacity="0.85">
            <path d="M15 47h34" />
            <path d="M20 53h24" />
            <path d="M26 59h12" />
          </g>
        </g>
      )}
    </svg>
  )
}
