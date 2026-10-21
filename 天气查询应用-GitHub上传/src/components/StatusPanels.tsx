import { AlertIcon, RefreshIcon } from './icons'
import { WeatherIcon } from './WeatherIcon'

export function LoadingState() {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <div className="glass p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="w-full space-y-4">
            <div className="skeleton h-4 w-32 rounded-full" />
            <div className="skeleton h-20 w-40 rounded-2xl" />
            <div className="skeleton h-4 w-24 rounded-full" />
            <div className="skeleton h-3 w-48 rounded-full" />
          </div>
          <div className="skeleton hidden h-28 w-28 shrink-0 rounded-full sm:block" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="skeleton h-[92px] rounded-[1.25rem]" />
        ))}
      </div>

      <div className="glass p-5 sm:p-6">
        <div className="skeleton mb-4 h-4 w-20 rounded-full" />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="skeleton h-[164px] rounded-2xl" />
          ))}
        </div>
      </div>

      <p className="pt-1 text-center text-xs text-white/40">正在获取天气数据…</p>
    </div>
  )
}

interface ErrorStateProps {
  title: string
  detail: string
  onRetry?: () => void
}

export function ErrorState({ title, detail, onRetry }: ErrorStateProps) {
  return (
    <div className="glass animate-rise p-10 text-center sm:p-14" role="alert">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-300/15 text-amber-200">
        <AlertIcon className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-medium text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/55">{detail}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/85 transition-colors hover:bg-white/15"
        >
          <RefreshIcon className="h-4 w-4" />
          重新查询
        </button>
      )}
    </div>
  )
}

interface EmptyStateProps {
  suggestions: string[]
  onSelect: (city: string) => void
}

export function EmptyState({ suggestions, onSelect }: EmptyStateProps) {
  return (
    <div className="glass animate-rise p-10 text-center sm:p-14">
      <WeatherIcon
        kind="partly-cloudy"
        className="animate-floaty mx-auto h-24 w-24 sm:h-28 sm:w-28"
      />
      <h2 className="mt-5 text-xl font-medium text-white">想看哪里的天气？</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/50">
        输入城市名称即可查询实时天气和未来五天预报，也可以点击“定位”自动获取当前位置。
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {suggestions.map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => onSelect(city)}
            className="rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-sm text-white/75 transition-colors hover:border-white/30 hover:bg-white/15 hover:text-white"
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  )
}
