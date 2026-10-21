import type { FavoriteCity } from '../types/weather'
import { CloseIcon, StarIcon } from './icons'

interface FavoritesBarProps {
  favorites: FavoriteCity[]
  activeName?: string
  onSelect: (favorite: FavoriteCity) => void
  onRemove: (id: string) => void
}

export function FavoritesBar({ favorites, activeName, onSelect, onRemove }: FavoritesBarProps) {
  if (favorites.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="pl-1 text-xs tracking-wide text-white/40">收藏城市</span>
      {favorites.map((favorite) => {
        const active = activeName === favorite.name
        return (
          <span
            key={favorite.id}
            className={`group inline-flex items-center gap-1 rounded-full border py-1 pl-3 pr-1 text-sm transition-colors ${
              active
                ? 'border-white/35 bg-white/20 text-white'
                : 'border-white/12 bg-white/6 text-white/75 hover:bg-white/12'
            }`}
          >
            <button
              type="button"
              onClick={() => onSelect(favorite)}
              className="inline-flex items-center gap-1.5"
            >
              <StarIcon filled className="h-3 w-3 text-amber-300" />
              {favorite.name}
            </button>
            <button
              type="button"
              onClick={() => onRemove(favorite.id)}
              aria-label={`删除收藏 ${favorite.name}`}
              className="grid h-6 w-6 place-items-center rounded-full text-white/35 transition-colors hover:bg-white/15 hover:text-white"
            >
              <CloseIcon className="h-3 w-3" />
            </button>
          </span>
        )
      })}
    </div>
  )
}
