import { Loader2 } from 'lucide-react'

export function Spinner({ className = "h-6 w-6 text-blue-600 animate-spin" }) {
  return <Loader2 className={className} />
}

export function FullScreenSpinner() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <Spinner className="h-10 w-10 text-blue-600 animate-spin mb-4" />
      <p className="text-slate-500 font-medium">Cargando inventario...</p>
    </div>
  )
}
