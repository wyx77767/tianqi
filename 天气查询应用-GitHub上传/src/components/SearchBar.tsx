import type { FormEvent } from 'react'
import { CloseIcon, LocateIcon, SearchIcon } from './icons'
import { Spinner } from './Spinner'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onLocate: () => void
  locating: boolean
  loading: boolean
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  onLocate,
  locating,
  loading,
}: SearchBarProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass flex flex-col gap-2 p-2 sm:flex-row sm:items-center"
    >
      <label className="flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl px-3 transition-colors focus-within:bg-white/5">
        <SearchIcon className="h-5 w-5 shrink-0 text-white/45" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="输入城市名称，如 北京、Shanghai"
          aria-label="城市名称"
          autoComplete="off"
          spellCheck={false}
          className="h-11 w-full min-w-0 bg-transparent text-[15px] text-white placeholder:text-white/35 focus:outline-none"
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="清空输入"
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </label>

      <div className="flex items-center gap-2 px-1 pb-1 sm:px-0 sm:pb-0">
        <button
          type="submit"
          disabled={value.trim().length === 0 || loading}
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-medium text-slate-900 transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
        >
          {loading && <Spinner className="h-3.5 w-3.5" />}
          查询
        </button>
        <button
          type="button"
          onClick={onLocate}
          disabled={locating || loading}
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm text-white/85 transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
        >
          {locating ? <Spinner className="h-3.5 w-3.5" /> : <LocateIcon className="h-4 w-4" />}
          定位
        </button>
      </div>
    </form>
  )
}
