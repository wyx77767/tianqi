import { useCallback, useEffect, useRef, useState } from 'react'
import { CurrentWeatherCard } from './components/CurrentWeatherCard'
import { FavoritesBar } from './components/FavoritesBar'
import { ForecastCard } from './components/ForecastCard'
import { SearchBar } from './components/SearchBar'
import { StatsGrid } from './components/StatsGrid'
import { EmptyState, ErrorState, LoadingState } from './components/StatusPanels'
import { BrandIcon } from './components/icons'
import { WeatherApiError, getWeather } from './lib/api'
import { loadFavorites, saveFavorites } from './lib/storage'
import type { FavoriteCity, LocationQuery, WeatherData, WeatherKind } from './types/weather'

const POPULAR_CITIES = ['北京', '上海', '广州', '深圳', '成都', '杭州']

const SOURCE_LABEL: Record<WeatherData['source'], string> = {
  openweathermap: 'OpenWeatherMap',
  'open-meteo': 'Open-Meteo 备用源',
}

interface ErrorInfo {
  title: string
  detail: string
  from: 'search' | 'location'
}

function backgroundFor(kind?: WeatherKind, isDay = true): string {
  if (!kind) return 'bg-weather-default'
  switch (kind) {
    case 'clear':
      return isDay ? 'bg-weather-clear-day' : 'bg-weather-clear-night'
    case 'partly-cloudy':
      return isDay ? 'bg-weather-partly-cloudy-day' : 'bg-weather-partly-cloudy-night'
    case 'cloudy':
      return 'bg-weather-cloudy'
    case 'rain':
      return 'bg-weather-rain'
    case 'thunder':
      return 'bg-weather-thunder'
    case 'snow':
      return 'bg-weather-snow'
    case 'mist':
      return 'bg-weather-mist'
  }
}

function favoriteKey(city: string, country?: string): string {
  return `${city.trim().toLowerCase()}|${country ?? ''}`
}

function describeError(error: unknown): { title: string; detail: string } {
  if (error instanceof WeatherApiError) {
    switch (error.code) {
      case 'CITY_NOT_FOUND':
        return {
          title: '找不到这个城市',
          detail: '请检查城市名称是否拼写正确，例如“杭州”或“Hangzhou”。',
        }
      case 'INVALID_KEY':
        return {
          title: '天气服务暂时不可用',
          detail: 'OpenWeatherMap 的 API Key 无效或尚未激活，请检查 .env.local 中的配置。',
        }
      case 'RATE_LIMITED':
        return {
          title: '查询太频繁了',
          detail: '免费额度有调用频率限制，请稍等片刻再试。',
        }
      case 'NETWORK':
        return {
          title: '网络连接失败',
          detail: '请检查网络连接后重试。',
        }
      default:
        return { title: '查询失败', detail: error.message || '请稍后再试。' }
    }
  }
  return { title: '查询失败', detail: '发生未知错误，请稍后再试。' }
}

function locationErrorMessage(code: number): { title: string; detail: string } {
  if (code === 1) {
    return {
      title: '定位权限被拒绝',
      detail: '请在浏览器地址栏的权限设置中允许定位，或直接输入城市名称查询。',
    }
  }
  if (code === 2) {
    return {
      title: '无法获取当前位置',
      detail: '定位服务暂不可用，请稍后重试，或手动搜索城市。',
    }
  }
  return {
    title: '定位超时',
    detail: '获取位置花费的时间过长，请重试或手动搜索城市。',
  }
}

export default function App() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<ErrorInfo | null>(null)
  const [favorites, setFavorites] = useState<FavoriteCity[]>(loadFavorites)
  const [activeTarget, setActiveTarget] = useState<LocationQuery | null>(null)

  const requestId = useRef(0)

  useEffect(() => {
    saveFavorites(favorites)
  }, [favorites])

  const load = useCallback(async (target: LocationQuery) => {
    const currentRequest = ++requestId.current

    setActiveTarget(target)
    setLoading(true)
    setError(null)

    try {
      const data = await getWeather(target)
      if (currentRequest === requestId.current) setResult(data)
    } catch (caught) {
      if (currentRequest === requestId.current) {
        setResult(null)
        setError({ ...describeError(caught), from: 'search' })
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false)
    }
  }, [])

  function handleSearch() {
    const city = query.trim()
    if (!city || loading) return
    void load(city)
  }

  function handleSuggestion(city: string) {
    setQuery(city)
    void load(city)
  }

  function handleLocate() {
    if (!('geolocation' in navigator)) {
      setError({
        title: '当前设备不支持定位',
        detail: '请在支持定位的浏览器中打开，或手动输入城市名称查询。',
        from: 'location',
      })
      return
    }

    setLocating(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false)
        void load({ lat: position.coords.latitude, lon: position.coords.longitude })
      },
      (geoError) => {
        setLocating(false)
        setError({ ...locationErrorMessage(geoError.code), from: 'location' })
      },
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 300_000 },
    )
  }

  function handleRetry() {
    if (!error) return
    if (error.from === 'location') {
      handleLocate()
      return
    }
    if (activeTarget) void load(activeTarget)
  }

  function makeFavorite(data: WeatherData, target: LocationQuery | null): FavoriteCity {
    const coords = target && typeof target !== 'string' ? target : undefined
    return {
      id: favoriteKey(data.current.city, data.current.country),
      name: data.current.city,
      country: data.current.country,
      lat: coords?.lat,
      lon: coords?.lon,
    }
  }

  function handleToggleFavorite() {
    if (!result) return
    const key = favoriteKey(result.current.city, result.current.country)
    setFavorites((previous) =>
      previous.some((item) => item.id === key)
        ? previous.filter((item) => item.id !== key)
        : [...previous, makeFavorite(result, activeTarget)],
    )
  }

  function handleSelectFavorite(favorite: FavoriteCity) {
    setQuery(favorite.name)
    void load(
      favorite.lat !== undefined && favorite.lon !== undefined
        ? { lat: favorite.lat, lon: favorite.lon }
        : favorite.name,
    )
  }

  function handleRemoveFavorite(id: string) {
    setFavorites((previous) => previous.filter((item) => item.id !== id))
  }

  const skyClass = backgroundFor(result?.current.kind, result?.current.isDay)
  const isFavorite = result
    ? favorites.some((item) => item.id === favoriteKey(result.current.city, result.current.country))
    : false

  return (
    <div className={`min-h-screen ${skyClass} transition-[background] duration-700`}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-48 -left-32 h-[26rem] w-[26rem] rounded-full bg-sky-200/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-300/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-3 px-4 py-7 sm:px-6 sm:py-10">
        <header className="mb-1 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/20 bg-white/12 text-white shadow-lg shadow-black/10">
              <BrandIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-[17px] font-semibold tracking-wide text-white">云图天气</h1>
              <p className="text-[11px] tracking-wide text-white/45">实时天气 · 未来五天预报</p>
            </div>
          </div>

          {result ? (
            <span
              title={
                result.source === 'open-meteo'
                  ? 'OpenWeatherMap 暂不可用，已自动切换到免 Key 的备用数据源'
                  : '数据来自 OpenWeatherMap'
              }
              className="shrink-0 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[11px] text-white/55"
            >
              {SOURCE_LABEL[result.source]}
            </span>
          ) : (
            <span className="shrink-0 text-[11px] text-white/40">
              {new Intl.DateTimeFormat('zh-CN', {
                month: 'long',
                day: 'numeric',
                weekday: 'short',
              }).format(new Date())}
            </span>
          )}
        </header>

        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={handleSearch}
          onLocate={handleLocate}
          locating={locating}
          loading={loading}
        />

        <FavoritesBar
          favorites={favorites}
          activeName={result?.current.city}
          onSelect={handleSelectFavorite}
          onRemove={handleRemoveFavorite}
        />

        <main className="flex-1 pt-1">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState title={error.title} detail={error.detail} onRetry={handleRetry} />
          ) : result ? (
            <div className="space-y-3">
              <CurrentWeatherCard
                current={result.current}
                isFavorite={isFavorite}
                onToggleFavorite={handleToggleFavorite}
              />
              <StatsGrid current={result.current} />
              <ForecastCard
                forecast={result.forecast}
                updatedAt={result.current.updatedAt}
                timezoneOffset={result.current.timezoneOffset}
              />
            </div>
          ) : (
            <EmptyState suggestions={POPULAR_CITIES} onSelect={handleSuggestion} />
          )}
        </main>

        <footer className="pt-4 text-center text-[11px] leading-5 text-white/30">
          <p>数据来源 OpenWeatherMap · 备用数据源 Open-Meteo</p>
          <p>API Key 通过 .env.local 环境变量注入，不写入源码</p>
        </footer>
      </div>
    </div>
  )
}
