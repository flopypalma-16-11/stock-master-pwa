import { useNetworkStatus } from '../hooks/useNetworkStatus'
import { WifiOff, ServerCrash } from 'lucide-react'

export function NetworkBanner() {
  const { isOnline, supabaseError, isOk } = useNetworkStatus()

  if (isOk) return null

  return (
    <div className="bg-red-500 text-white px-4 py-3 flex items-center gap-3 justify-center z-50 sticky top-0 text-sm font-medium shadow-md">
      {!isOnline ? (
        <>
          <WifiOff size={18} />
          <span>Sin conexión a Internet. Las funciones están limitadas.</span>
        </>
      ) : supabaseError ? (
        <>
          <ServerCrash size={18} />
          <span>No se pudo conectar a la base de datos de manera confiable.</span>
        </>
      ) : null}
    </div>
  )
}
