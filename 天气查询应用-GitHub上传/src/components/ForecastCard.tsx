import type { ForecastDay } from '../types/weather'
import { cityToday, dayLabel, formatMonthDay } from '../lib/format'
import { WeatherIcon } from './WeatherIcon'

interface ForecastCardProps {
  forecast: ForecastDay[]
  updatedAt: number
  timezoneOffset: number
}

export function ForecastCard({ forecast, updatedAt, timezoneOffset }: ForecastCardProps) {
  if (forecast.length === 0) return null

  const today = cityToday(updatedAt, timezoneOffset)
  const overallMin = Math.min(...forecast.map((day) => day.tempMin))
  const overallMax = Math.max(...forecast.map((day) => day.tempMax))
  const range = Math.max(overallMax - overallMin, 1)

  return (
    <section
      className="glass animate-rise p-5 sm:p-6"
      style={{ animationDelay: '120ms' }}
      aria-label="未来五天预报"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium tracking-wide text-white/75">未来 5 天</h2>
        <span className="text-[11px] text-white/35">
          {formatMonthDay(forecast[0].date)} — {formatMonthDay(forecast[forecast.length - 1].date)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {forecast.map((day, index) => {
          const isToday = day.date === today
          const left = ((day.tempMin - overallMin) / range) * 100
          const width = Math.max(((day.tempMax - day.tempMin) / range) * 100, 10)

          return (
            <div
              key={day.date}
              className={`rounded-2xl border p-3.5 transition-colors ${
                index === forecast.length - 1 && forecast.length % 2 === 1
                  ? 'col-span-2 sm:col-span-1'
                  : ''
              } ${
                isToday
                  ? 'border-white/25 bg-white/12'
                  : 'border-white/10 bg-white/5 hover:bg-white/8'
              }`}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium text-white/85">
                  {dayLabel(day.date, today)}
                </span>
                <span className="text-[10px] text-white/35">{formatMonthDay(day.date)}</span>
              </div>

              <WeatherIcon kind={day.kind} className="mx-auto my-2 h-14 w-14" />

              <p className="truncate text-center text-[11px] text-white/55">{day.description}</p>

              <div className="mt-2 flex items-baseline justify-between text-sm">
                <span className="text-white/45">{day.tempMin}°</span>
                <span className="font-medium text-white/95">{day.tempMax}°</span>
              </div>

              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-300/70 to-amber-200/90"
                  style={{ marginLeft: `${left}%`, width: `${width}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
