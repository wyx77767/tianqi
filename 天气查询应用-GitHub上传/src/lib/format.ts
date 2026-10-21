/** 用城市时区偏移，把 Unix 时间格式化成“10月21日 周二 23:05” */
export function formatCityTime(updatedAt: number, timezoneOffset: number): string {
  const shifted = new Date((updatedAt + timezoneOffset) * 1000)
  const month = shifted.getUTCMonth() + 1
  const day = shifted.getUTCDate()
  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][shifted.getUTCDay()]
  const hours = String(shifted.getUTCHours()).padStart(2, '0')
  const minutes = String(shifted.getUTCMinutes()).padStart(2, '0')

  return `${month}月${day}日 ${weekday} ${hours}:${minutes}`
}

/** 城市当地的“今天”，格式 YYYY-MM-DD */
export function cityToday(updatedAt: number, timezoneOffset: number): string {
  return new Date((updatedAt + timezoneOffset) * 1000).toISOString().slice(0, 10)
}

/** 今天 / 明天 / 后天 / 周X */
export function dayLabel(date: string, today: string): string {
  const current = new Date(`${today}T00:00:00Z`)
  const target = new Date(`${date}T00:00:00Z`)
  const diff = Math.round((target.getTime() - current.getTime()) / 86_400_000)

  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  if (diff === 2) return '后天'

  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][target.getUTCDay()]
}

export function formatMonthDay(date: string): string {
  const target = new Date(`${date}T00:00:00Z`)
  return `${target.getUTCMonth() + 1}/${target.getUTCDate()}`
}
