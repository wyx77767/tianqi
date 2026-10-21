import type { CurrentWeather } from '../types/weather'
import { formatCityTime } from '../lib/format'
import { ClockIcon, PinIcon, StarIcon } from './icons'
import { WeatherIcon } from './WeatherIcon'

interface CurrentWeatherCardProps {
  current: CurrentWeather
  isFavorite: boolean
  onToggleFavorite: () => void
}

export function CurrentWeatherCard({
  current,
  isFavorite,
  onToggleFavorite,
}: CurrentWeatherCardProps) {
  return (
    <section
      className="glass animate-rise relative overflow-hidden p-6 sm:p-8"
      aria-label="当前天气"
    >
      <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-white/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-8 h-52 w-52 rounded-full bg-sky-200/10 blur-3xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <PinIcon className="h-4 w-4 shrink-0" />
            <span className="truncate text-[15px] font-medium text-white">{current.city}</span>
            {current.country && (
              <span className="shrink-0 text-xs text-white/45">· {current.country}</span>
            )}
          </div>

          <div className="mt-2 flex items-start">
            <span className="text-[80px] font-extralight leading-[0.92] tracking-tight tabular-nums sm:text-[108px]">
              {current.temp}
            </span>
            <span className="mt-2.5 ml-1 text-xl font-light text-white/60 sm:mt-4 sm:text-2xl">
              °C
            </span>
          </div>

          <p className="mt-2 text-lg text-white/90 sm:text-xl">
            {current.description}
            <span className="ml-3 align-middle text-xs text-white/50 sm:text-sm">
              体感 {current.feelsLike}°
            </span>
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/45">
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon className="h-3.5 w-3.5 shrink-0" />
              当地时间 {formatCityTime(current.updatedAt, current.timezoneOffset)}
            </span>
            <span className="whitespace-nowrap rounded-md bg-white/8 px-1.5 py-0.5 text-[11px]">
              {current.isDay ? '白天' : '夜间'}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3">
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
              isFavorite
                ? 'border-amber-300/50 bg-amber-300/15 text-amber-200'
                : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/12 hover:text-white'
            }`}
          >
            <StarIcon filled={isFavorite} className="h-3.5 w-3.5" />
            {isFavorite ? '已收藏' : '收藏'}
          </button>

          <WeatherIcon
            kind={current.kind}
            isDay={current.isDay}
            className="animate-floaty h-24 w-24 drop-shadow-[0_10px_30px_rgba(255,255,255,0.15)] sm:h-40 sm:w-40"
          />
        </div>
      </div>
    </section>
  )
}
