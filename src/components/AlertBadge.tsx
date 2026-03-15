"use client"

/**
 * AlertBadge — small red pill showing unread alert count.
 * Reads from localStorage and re-renders on 'fdl-alerts-updated' events
 * dispatched by GlobalAlertPoller.
 */

import { useEffect, useState } from 'react'
import { loadEvents, countUnread } from '../lib/alerts'

export default function AlertBadge() {
  const [count, setCount] = useState(0)

  const refresh = () => setCount(countUnread(loadEvents()))

  useEffect(() => {
    refresh()
    window.addEventListener('fdl-alerts-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('fdl-alerts-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  if (count === 0) return null

  return (
    <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full leading-none">
      {count > 9 ? '9+' : count}
    </span>
  )
}
