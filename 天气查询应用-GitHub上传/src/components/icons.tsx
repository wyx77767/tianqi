import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.4 16.4 4.1 4.1" />
    </Svg>
  )
}

export function LocateIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      <circle cx="12" cy="12" r="7.5" />
    </Svg>
  )
}

export function StarIcon({ filled, ...props }: IconProps & { filled?: boolean }) {
  return (
    <Svg fill={filled ? 'currentColor' : 'none'} {...props}>
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.9-5.4 2.9 1-6L3.2 9.4l6.1-.9Z" />
    </Svg>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Svg>
  )
}

export function PinIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </Svg>
  )
}

export function DropletIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.5c3 3.6 5.5 6.6 5.5 9.5a5.5 5.5 0 0 1-11 0c0-2.9 2.5-5.9 5.5-9.5Z" />
    </Svg>
  )
}

export function WindIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 8h10a3 3 0 1 0-3-3" />
      <path d="M3 12h14a3 3 0 1 1-3 3" />
      <path d="M3 16h7" />
    </Svg>
  )
}

export function GaugeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4.5 17a8.5 8.5 0 1 1 15 0" />
      <path d="m12 13 3.5-3.5" />
      <circle cx="12" cy="13" r="1.4" />
    </Svg>
  )
}

export function EyeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </Svg>
  )
}

export function SunriseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3v5M8 12a4 4 0 0 1 8 0" />
      <path d="M3 17h18M6 21h12M4.2 8.2l1.6 1.6M19.8 8.2l-1.6 1.6" />
      <path d="m9 6 3-3 3 3" />
    </Svg>
  )
}

export function SunsetIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 8v5M8 12a4 4 0 0 1 8 0" />
      <path d="M3 17h18M6 21h12M4.2 8.2l1.6 1.6M19.8 8.2l-1.6 1.6" />
      <path d="m9 5 3 3 3-3" />
    </Svg>
  )
}

export function AlertIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.8 21 19a1.4 1.4 0 0 1-1.2 2.1H4.2A1.4 1.4 0 0 1 3 19Z" />
      <path d="M12 9.5v5" />
      <circle cx="12" cy="17.4" r="0.6" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function RefreshIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20 11a8 8 0 1 0-2.3 6" />
      <path d="M20 5v6h-6" />
    </Svg>
  )
}

export function ClockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </Svg>
  )
}

export function BrandIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="9" r="4" />
      <path d="M9 1.8v1.6M9 14.6v1.6M1.8 9h1.6M14.6 9h1.6M3.9 3.9l1.1 1.1M13 13l1.1 1.1M14.1 3.9 13 5M5 13l-1.1 1.1" />
      <path d="M9.5 21h8.2a3.6 3.6 0 0 0 .5-7.2 5.2 5.2 0 0 0-10-.5A3.8 3.8 0 0 0 9.5 21Z" />
    </Svg>
  )
}
