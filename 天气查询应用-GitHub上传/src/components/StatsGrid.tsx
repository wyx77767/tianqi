import type { ReactNode } from 'react'
import type { CurrentWeather } from '../types/weather'
import { DropletIcon, EyeIcon, GaugeIcon, SunriseIcon, SunsetIcon, WindIcon } from './icons'

interface StatsGridProps {
  current: CurrentWeather
}

interface StatProps {
  icon: ReactNode
  label: string
  value: string
  unit?: string
  hint?: string
}

function Stat({ icon, label, value, unit, hint }: StatProps) {
  return (
    <div className="glass-soft flex flex-col gap-1.5 p-4">
      <div className="flex items-center gap-1.5 text-white/40">
        {icon}
        <span className="text-[11px] tracking-wide">{label}</span>
      </div>
      <p className="flex items-baseline gap-1">
        <span className="text-xl font-medium tabular-nums text-white/95">{value}</span>
        {unit && <span className="text-[11px] text-white/45">{unit}</span>}
      </p>
      {hint && <span className="text-[11px] text-white/35">{hint}</span>}
    </div>
  )
}

export function StatsGrid({ current }: StatsGridProps) {
  return (
    <div
      className="animate-rise grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6"
      style={{ animationDelay: '60ms' }}
    >
      <Stat
        icon={<DropletIcon className="h-3.5 w-3.5" />}
        label="湿度"
        value={`${current.humidity}`}
        unit="%"
      />
      <Stat
        icon={<WindIcon className="h-3.5 w-3.5" />}
        label="风速"
        value={`${current.windSpeed}`}
        unit="km/h"
        hint={current.windDirection}
      />
      <Stat
        icon={<GaugeIcon className="h-3.5 w-3.5" />}
        label="气压"
        value={`${current.pressure}`}
        unit="hPa"
      />
      <Stat
        icon={<EyeIcon className="h-3.5 w-3.5" />}
        label="能见度"
        value={current.visibility === undefined ? '--' : `${current.visibility}`}
        unit={current.visibility === undefined ? undefined : 'km'}
      />
      <Stat
        icon={<SunriseIcon className="h-3.5 w-3.5" />}
        label="日出"
        value={current.sunrise ?? '--'}
      />
      <Stat
        icon={<SunsetIcon className="h-3.5 w-3.5" />}
        label="日落"
        value={current.sunset ?? '--'}
      />
    </div>
  )
}
