import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [supabaseError, setSupabaseError] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Simple ping to check if Supabase is reachable
    const checkSupabase = async () => {
      if (!navigator.onLine) return
      try {
        // A simple query to check connection
        const { error } = await supabase.from('products').select('id', { count: 'exact', head: true }).limit(1)
        if (error && (error.message.includes('Failed to fetch') || error.code === 'PGRST300')) {
           // PGRST300 might happen, but usually Failed to fetch means network issue to supabase
           if (error.message.includes('Failed to fetch')) {
             setSupabaseError(true)
           } else {
             setSupabaseError(false)
           }
        } else {
          setSupabaseError(false)
        }
      } catch (err) {
        setSupabaseError(true)
      }
    }

    const interval = setInterval(checkSupabase, 15000)
    checkSupabase()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  return { isOnline, supabaseError, isOk: isOnline && !supabaseError }
}
