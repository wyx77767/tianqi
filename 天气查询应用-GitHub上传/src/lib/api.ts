import type {
  Coordinates,
  CurrentWeather,
  ForecastDay,
  LocationQuery,
  WeatherData,
  WeatherErrorCode,
  WeatherKind,
  WeatherSource,
} from '../types/weather'

/* -------------------------------------------------------------------------- */
/* 基础配置                                                                    */
/* -------------------------------------------------------------------------- */

const OWM_BASE = 'https://api.openweathermap.org/data/2.5'
const OWM_GEO = 'https://api.openweathermap.org/geo/1.0'
const OM_BASE = 'https://api.open-meteo.com/v1'
const OM_GEO = 'https://geocoding-api.open-meteo.com/v1'
const REVERSE_GEO = 'https://api.bigdatacloud.net/data/reverse-geocode-client'

/** Key 只从环境变量读取，绝不硬编码（见 .env.local / .env.example） */
const API_KEY = (import.meta.env.VITE_OPENWEATHER_API_KEY ?? '').trim()

/** 没有 Key，或 Key 被判定为无效后，直接走无需 Key 的备用数据源 */
let openWeatherMapDisabled = API_KEY.length === 0

export class WeatherApiError extends Error {
  readonly code: WeatherErrorCode

  constructor(code: WeatherErrorCode, message: string) {
    super(message)
    this.name = 'WeatherApiError'
    this.code = code
  }
}

/* -------------------------------------------------------------------------- */
/* 通用请求工具                                                                */
/* -------------------------------------------------------------------------- */

async function fetchJson<T>(url: string): Promise<T> {
  let response: Response
  try {
    response = await fetch(url)
  } catch {
    throw new WeatherApiError('NETWORK', '网络连接失败，请检查网络后重试')
  }

  if (!response.ok) {
    if (response.status === 404) throw new WeatherApiError('CITY_NOT_FOUND', '找不到该城市')
    if (response.status === 401) throw new WeatherApiError('INVALID_KEY', 'API Key 无效或尚未激活')
    if (response.status === 429) throw new WeatherApiError('RATE_LIMITED', '请求过于频繁')
    throw new WeatherApiError('UNKNOWN', `请求失败（HTTP ${response.status}）`)
  }

  try {
    return (await response.json()) as T
  } catch {
    throw new WeatherApiError('UNKNOWN', '服务器返回的数据无法解析')
  }
}

function buildUrl(
  base: string,
  path: string,
  params: Record<string, string | number | undefined>,
): string {
  const url = new URL(base + path)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
  }
  return url.toString()
}

function isCoords(location: LocationQuery): location is Coordinates {
  return typeof location !== 'string'
}

function windDirectionLabel(degrees?: number): string | undefined {
  if (degrees === undefined || Number.isNaN(degrees)) return undefined
  const directions = ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风']
  return directions[Math.round(((degrees % 360) + 360) % 360 / 45) % 8]
}

function countryName(code?: string): string | undefined {
  if (!code) return undefined
  try {
    return new Intl.DisplayNames(['zh-CN'], { type: 'region' }).of(code) ?? code
  } catch {
    return code
  }
}

/* -------------------------------------------------------------------------- */
/* 天气现象映射                                                                */
/* -------------------------------------------------------------------------- */

function kindFromOwmId(id: number): WeatherKind {
  if (id >= 200 && id < 300) return 'thunder'
  if (id >= 300 && id < 600) return 'rain'
  if (id >= 600 && id < 700) return 'snow'
  if (id >= 700 && id < 800) return 'mist'
  if (id === 800) return 'clear'
  if (id === 801 || id === 802) return 'partly-cloudy'
  return 'cloudy'
}

/** WMO 天气代码 → 中文描述 + 图标类型 */
function weatherFromWmo(code: number): { kind: WeatherKind; description: string } {
  const table: Record<number, [WeatherKind, string]> = {
    0: ['clear', '晴'],
    1: ['clear', '大部晴朗'],
    2: ['partly-cloudy', '多云'],
    3: ['cloudy', '阴'],
    45: ['mist', '有雾'],
    48: ['mist', '雾凇'],
    51: ['rain', '小毛毛雨'],
    53: ['rain', '毛毛雨'],
    55: ['rain', '强毛毛雨'],
    56: ['rain', '冻毛毛雨'],
    57: ['rain', '强冻毛毛雨'],
    61: ['rain', '小雨'],
    63: ['rain', '中雨'],
    65: ['rain', '大雨'],
    66: ['rain', '冻雨'],
    67: ['rain', '强冻雨'],
    71: ['snow', '小雪'],
    73: ['snow', '中雪'],
    75: ['snow', '大雪'],
    77: ['snow', '雪粒'],
    80: ['rain', '阵雨'],
    81: ['rain', '强阵雨'],
    82: ['rain', '暴雨'],
    85: ['snow', '阵雪'],
    86: ['snow', '强阵雪'],
    95: ['thunder', '雷阵雨'],
    96: ['thunder', '雷阵雨伴冰雹'],
    99: ['thunder', '强雷阵雨伴冰雹'],
  }
  const entry = table[code]
  return entry ? { kind: entry[0], description: entry[1] } : { kind: 'cloudy', description: '多云' }
}

/* -------------------------------------------------------------------------- */
/* OpenWeatherMap                                                              */
/* -------------------------------------------------------------------------- */

interface OwmWeatherItem {
  id: number
  description: string
  icon: string
}

interface OwmCurrentResponse {
  name: string
  dt: number
  timezone: number
  visibility?: number
  weather: OwmWeatherItem[]
  main: { temp: number; feels_like: number; humidity: number; pressure: number }
  wind: { speed: number; deg?: number }
  sys?: { country?: string; sunrise?: number; sunset?: number }
}

interface OwmForecastResponse {
  city: { name: string; timezone: number }
  list: Array<{
    dt: number
    main: { temp_min: number; temp_max: number }
    weather: OwmWeatherItem[]
  }>
}

interface OwmGeoItem {
  name: string
  local_names?: Record<string, string>
  lat: number
  lon: number
  country?: string
}

interface OwmPlace {
  lat: number
  lon: number
  name: string
  country?: string
}

const owmPlaceCache = new Map<string, Promise<OwmPlace>>()

function cachePromise<T>(
  cache: Map<string, Promise<T>>,
  key: string,
  loader: () => Promise<T>,
): Promise<T> {
  const cached = cache.get(key)
  if (cached) return cached
  const promise = loader().catch((error: unknown) => {
    cache.delete(key)
    throw error
  })
  cache.set(key, promise)
  return promise
}

function owmDisplayName(item: OwmGeoItem): string {
  return item.local_names?.zh ?? item.name
}

/**
 * OpenWeatherMap 的天气接口不识别中文城市名，先用官方 Geocoding API
 * 把城市名解析成经纬度，同时拿到中文城市名。
 */
function resolveOwmPlace(location: LocationQuery): Promise<OwmPlace> {
  if (isCoords(location)) {
    const { lat, lon } = location
    return cachePromise(owmPlaceCache, `coords:${lat.toFixed(3)},${lon.toFixed(3)}`, async () => {
      const items = await fetchJson<OwmGeoItem[]>(
        buildUrl(OWM_GEO, '/reverse', { lat, lon, limit: 1, appid: API_KEY }),
      )
      const item = items[0]
      return {
        lat,
        lon,
        name: item ? owmDisplayName(item) : '当前位置',
        country: countryName(item?.country),
      }
    })
  }

  const query = location.trim()
  return cachePromise(owmPlaceCache, `city:${query.toLowerCase()}`, async () => {
    const items = await fetchJson<OwmGeoItem[]>(
      buildUrl(OWM_GEO, '/direct', { q: query, limit: 1, appid: API_KEY }),
    )
    const item = items[0]
    if (!item) throw new WeatherApiError('CITY_NOT_FOUND', '找不到该城市')
    return {
      lat: item.lat,
      lon: item.lon,
      name: owmDisplayName(item),
      country: countryName(item.country),
    }
  })
}

/** Unix 秒 → 城市当地时间 HH:mm（配合城市时区偏移） */
function hourMinuteFromUnix(unix?: number, offsetSeconds = 0): string | undefined {
  if (unix === undefined) return undefined
  const date = new Date((unix + offsetSeconds) * 1000)
  return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`
}

/** 按城市当地时间拆出日期和小时 */
function localDateAndHour(unixSeconds: number, offsetSeconds: number) {
  const date = new Date((unixSeconds + offsetSeconds) * 1000)
  return { date: date.toISOString().slice(0, 10), hour: date.getUTCHours() }
}

async function owmCurrentWeather(location: LocationQuery): Promise<CurrentWeather> {
  const place = await resolveOwmPlace(location)
  const data = await fetchJson<OwmCurrentResponse>(
    buildUrl(OWM_BASE, '/weather', {
      lat: place.lat,
      lon: place.lon,
      appid: API_KEY,
      units: 'metric',
      lang: 'zh_cn',
    }),
  )

  const item = data.weather[0]
  const offset = data.timezone ?? 0

  return {
    city: place.name || data.name || '未知城市',
    country: place.country ?? countryName(data.sys?.country),
    temp: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    description: item?.description ?? '未知',
    kind: kindFromOwmId(item?.id ?? 800),
    isDay: item?.icon ? item.icon.endsWith('d') : true,
    humidity: Math.round(data.main.humidity),
    windSpeed: Math.round(data.wind.speed * 3.6), // m/s → km/h
    windDirection: windDirectionLabel(data.wind.deg),
    pressure: Math.round(data.main.pressure),
    visibility: data.visibility === undefined ? undefined : Math.round(data.visibility / 100) / 10,
    sunrise: hourMinuteFromUnix(data.sys?.sunrise, offset),
    sunset: hourMinuteFromUnix(data.sys?.sunset, offset),
    timezoneOffset: offset,
    updatedAt: data.dt ?? Math.floor(Date.now() / 1000),
  }
}

async function owmForecast(location: LocationQuery): Promise<ForecastDay[]> {
  const place = await resolveOwmPlace(location)
  const data = await fetchJson<OwmForecastResponse>(
    buildUrl(OWM_BASE, '/forecast', {
      lat: place.lat,
      lon: place.lon,
      appid: API_KEY,
      units: 'metric',
      lang: 'zh_cn',
    }),
  )

  const offset = data.city?.timezone ?? 0
  const days = new Map<
    string,
    { min: number; max: number; kind: WeatherKind; description: string; bestHourScore: number }
  >()

  for (const entry of data.list) {
    const { date, hour } = localDateAndHour(entry.dt, offset)
    const item = entry.weather[0]
    const kind = kindFromOwmId(item?.id ?? 800)
    const description = item?.description ?? ''
    const hourScore = Math.abs(hour - 13) // 取最接近正午的一条作为当天代表

    const existing = days.get(date)
    if (!existing) {
      days.set(date, {
        min: entry.main.temp_min,
        max: entry.main.temp_max,
        kind,
        description,
        bestHourScore: hourScore,
      })
      continue
    }

    existing.min = Math.min(existing.min, entry.main.temp_min)
    existing.max = Math.max(existing.max, entry.main.temp_max)
    if (hourScore < existing.bestHourScore) {
      existing.kind = kind
      existing.description = description
      existing.bestHourScore = hourScore
    }
  }

  return [...days.entries()].slice(0, 5).map(([date, day]) => ({
    date,
    tempMin: Math.round(day.min),
    tempMax: Math.round(day.max),
    kind: day.kind,
    description: day.description,
  }))
}

/* -------------------------------------------------------------------------- */
/* Open-Meteo（免 Key 备用数据源）                                              */
/* -------------------------------------------------------------------------- */

interface OmGeoResult {
  name: string
  latitude: number
  longitude: number
  country?: string
  admin1?: string
}

interface OmGeoResponse {
  results?: OmGeoResult[]
}

interface ResolvedPlace {
  lat: number
  lon: number
  city: string
  country?: string
}

interface OmForecastResponse {
  utc_offset_seconds: number
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    apparent_temperature: number
    is_day: number
    weather_code: number
    wind_speed_10m: number
    wind_direction_10m: number
    surface_pressure: number
  }
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    sunrise: string[]
    sunset: string[]
  }
}

/** 同一城市的正/反向地理编码结果缓存，避免同时请求两次 */
const placeCache = new Map<string, Promise<ResolvedPlace>>()

async function reverseGeocode(lat: number, lon: number): Promise<ResolvedPlace> {
  try {
    const data = await fetchJson<{
      city?: string
      locality?: string
      countryName?: string
    }>(
      buildUrl(REVERSE_GEO, '', {
        latitude: lat,
        longitude: lon,
        localityLanguage: 'zh',
      }),
    )
    return {
      lat,
      lon,
      city: data.city || data.locality || '当前位置',
      country: data.countryName,
    }
  } catch {
    // 反向地理编码失败不影响天气查询
    return { lat, lon, city: '当前位置' }
  }
}

async function resolvePlace(location: LocationQuery): Promise<ResolvedPlace> {
  if (isCoords(location)) {
    const key = `coords:${location.lat.toFixed(3)},${location.lon.toFixed(3)}`
    return cachePromise(placeCache, key, () => reverseGeocode(location.lat, location.lon))
  }

  const query = location.trim()
  const key = `city:${query.toLowerCase()}`
  return cachePromise(placeCache, key, async () => {
    const data = await fetchJson<OmGeoResponse>(
      buildUrl(OM_GEO, '/search', { name: query, count: 1, language: 'zh', format: 'json' }),
    )
    const result = data.results?.[0]
    if (!result) throw new WeatherApiError('CITY_NOT_FOUND', '找不到该城市，请检查城市名称')
    return {
      lat: result.latitude,
      lon: result.longitude,
      city: result.name,
      country: result.country,
    }
  })
}

function omForecastUrl(place: ResolvedPlace): string {
  return buildUrl(OM_BASE, '/forecast', {
    latitude: place.lat,
    longitude: place.lon,
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset',
    timezone: 'auto',
    forecast_days: 6,
    wind_speed_unit: 'kmh',
  })
}

async function omCurrentWeather(location: LocationQuery): Promise<CurrentWeather> {
  const place = await resolvePlace(location)
  const data = await fetchJson<OmForecastResponse>(omForecastUrl(place))
  const current = data.current
  const weather = weatherFromWmo(current.weather_code)
  const sunrise = data.daily.sunrise?.[0]
  const sunset = data.daily.sunset?.[0]

  return {
    city: place.city,
    country: place.country,
    temp: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    description: weather.description,
    kind: weather.kind,
    isDay: current.is_day === 1,
    humidity: Math.round(current.relative_humidity_2m),
    windSpeed: Math.round(current.wind_speed_10m),
    windDirection: windDirectionLabel(current.wind_direction_10m),
    pressure: Math.round(current.surface_pressure),
    sunrise: sunrise ? sunrise.slice(11, 16) : undefined,
    sunset: sunset ? sunset.slice(11, 16) : undefined,
    timezoneOffset: data.utc_offset_seconds,
    updatedAt: Math.floor(Date.now() / 1000),
  }
}

async function omForecast(location: LocationQuery): Promise<ForecastDay[]> {
  const place = await resolvePlace(location)
  const data = await fetchJson<OmForecastResponse>(omForecastUrl(place))

  return data.daily.time.slice(0, 5).map((date, index) => {
    const weather = weatherFromWmo(data.daily.weather_code[index] ?? 0)
    return {
      date,
      tempMin: Math.round(data.daily.temperature_2m_min[index]),
      tempMax: Math.round(data.daily.temperature_2m_max[index]),
      kind: weather.kind,
      description: weather.description,
    }
  })
}

/* -------------------------------------------------------------------------- */
/* 数据源选择 + 对外 API                                                       */
/* -------------------------------------------------------------------------- */

interface WeatherProvider {
  id: WeatherSource
  current: (location: LocationQuery) => Promise<CurrentWeather>
  forecast: (location: LocationQuery) => Promise<ForecastDay[]>
}

const openWeatherMapProvider: WeatherProvider = {
  id: 'openweathermap',
  current: owmCurrentWeather,
  forecast: owmForecast,
}

const openMeteoProvider: WeatherProvider = {
  id: 'open-meteo',
  current: omCurrentWeather,
  forecast: omForecast,
}

/** Key 失效、城市名 OWM 无法识别、网络异常时都可以交给备用源 */
function canFallback(error: unknown): boolean {
  return (
    error instanceof WeatherApiError &&
    (error.code === 'INVALID_KEY' ||
      error.code === 'CITY_NOT_FOUND' ||
      error.code === 'NETWORK')
  )
}

async function runWithFallback<T>(
  task: (provider: WeatherProvider) => Promise<T>,
): Promise<{ value: T; source: WeatherSource }> {
  if (!openWeatherMapDisabled) {
    try {
      return { value: await task(openWeatherMapProvider), source: openWeatherMapProvider.id }
    } catch (error) {
      if (!canFallback(error)) throw error
      // Key 明确无效时，本次会话不再尝试 OpenWeatherMap
      if (error instanceof WeatherApiError && error.code === 'INVALID_KEY') {
        openWeatherMapDisabled = true
      }
    }
  }

  return { value: await task(openMeteoProvider), source: openMeteoProvider.id }
}

/** 获取当前天气（支持城市名称或经纬度） */
export async function getCurrentWeather(location: LocationQuery): Promise<CurrentWeather> {
  return (await runWithFallback((provider) => provider.current(location))).value
}

/** 获取未来五天天气预报（支持城市名称或经纬度） */
export async function getForecast(location: LocationQuery): Promise<ForecastDay[]> {
  return (await runWithFallback((provider) => provider.forecast(location))).value
}

/** 一次拿到当前天气 + 预报，并告知实际使用的数据源 */
export async function getWeather(location: LocationQuery): Promise<WeatherData> {
  const { value, source } = await runWithFallback(async (provider) => {
    const [current, forecast] = await Promise.all([
      provider.current(location),
      provider.forecast(location),
    ])
    return { current, forecast }
  })

  return { ...value, source }
}
