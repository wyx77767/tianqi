export type WeatherKind =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'rain'
  | 'thunder'
  | 'snow'
  | 'mist'

export type WeatherSource = 'openweathermap' | 'open-meteo'

export type WeatherErrorCode =
  | 'CITY_NOT_FOUND'
  | 'INVALID_KEY'
  | 'RATE_LIMITED'
  | 'NETWORK'
  | 'UNKNOWN'

export interface Coordinates {
  lat: number
  lon: number
}

/** 查询条件：城市名称，或经纬度 */
export type LocationQuery = string | Coordinates

export interface CurrentWeather {
  city: string
  country?: string
  /** 摄氏度 */
  temp: number
  feelsLike: number
  description: string
  kind: WeatherKind
  isDay: boolean
  /** 相对湿度 % */
  humidity: number
  /** 风速 km/h */
  windSpeed: number
  windDirection?: string
  /** 气压 hPa */
  pressure: number
  /** 能见度 km */
  visibility?: number
  /** 日出，城市当地时间 HH:mm */
  sunrise?: string
  /** 日落，城市当地时间 HH:mm */
  sunset?: string
  /** 城市所在时区偏移（秒），用于展示当地时间 */
  timezoneOffset: number
  /** 数据更新时间（Unix 秒） */
  updatedAt: number
}

export interface ForecastDay {
  /** 城市当地日期 YYYY-MM-DD */
  date: string
  tempMax: number
  tempMin: number
  kind: WeatherKind
  description: string
}

export interface WeatherData {
  current: CurrentWeather
  forecast: ForecastDay[]
  source: WeatherSource
}

export interface FavoriteCity {
  id: string
  name: string
  country?: string
  lat?: number
  lon?: number
}
