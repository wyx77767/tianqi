import type { FavoriteCity } from '../types/weather'

const STORAGE_KEY = 'weather-app:favorites'

function isValidFavorite(value: unknown): value is FavoriteCity {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Partial<FavoriteCity>
  return typeof item.id === 'string' && typeof item.name === 'string' && item.name.length > 0
}

export function loadFavorites(): FavoriteCity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isValidFavorite) : []
  } catch {
    return []
  }
}

export function saveFavorites(favorites: FavoriteCity[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  } catch {
    // 隐私模式等场景下写入失败时静默忽略，不影响查询
  }
}
