function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function formatDateTime(date: Date): string {
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export function getCurrentDateTime(): string {
  return formatDateTime(new Date())
}

export function formatDateKey(date: Date): string {
  return formatDateTime(date).slice(0, 10)
}
