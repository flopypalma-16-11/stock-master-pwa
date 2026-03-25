import { useState } from 'react'
import { useInventory } from '../hooks/useInventory'
import { useCash } from '../contexts/CashContext'
import { FileDown, AlertTriangle, Package } from 'lucide-react'
import { FullScreenSpinner, Spinner } from '../components/ui/Spinners'

export function Restock() {
  const { products, loading, error, adjustStock } = useInventory()
  const { removeFunds } = useCash()
  const [buyingId, setBuyingId] = useState(null)

  if (loading) return <FullScreenSpinner />
  if (error) return <div className="text-red-500 text-center p-4">Error cargando inventario: {error}</div>

  const criticalProducts = products.filter(p => p.current_stock < p.min_stock)
  
  const handleBuy = async (product) => {
    const missing = product.min_stock - product.current_stock
    const costStr = window.prompt(`¿Cuánto te ha costado comprar ${missing} unidades de ${product.name} al proveedor?`)
    if (costStr === null) return // canceled
    const cost = parseFloat(costStr.replace(',', '.'))
    if (isNaN(cost) || cost < 0) return alert('Por favor, ingresa un coste numérico válido.')
    
    setBuyingId(product.id)
    try {
      await adjustStock(product.id, product.current_stock, missing)
      removeFunds(cost)
    } catch(e) {
      alert('Error comprando stock: ' + e.message)
    } finally {
      setBuyingId(null)
    }
  }
  
  const handleExport = () => {
    const headers = ['SKU', 'Nombre', 'Categoria', 'Proveedor', 'Stock Actual', 'Stock Minimo', 'Faltante']
    const rows = criticalProducts.map(p => [
      p.sku,
      `"${p.name}"`,
      `"${p.category}"`,
      `"${p.supplier || ''}"`,
      p.current_stock,
      p.min_stock,
      p.min_stock - p.current_stock
    ])
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(r => r.join(','))].join("\n")
      
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `pedidos_reposicion_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Lista de Reposición
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Productos con stock por debajo del límite mínimo.
          </p>
        </div>
        <button 
          onClick={handleExport}
          disabled={criticalProducts.length === 0}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-colors active:scale-95 disabled:opacity-50 disabled:active:scale-100"
        >
          <FileDown size={20} />
          Exportar CSV
        </button>
      </div>

      {criticalProducts.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="p-4 pl-6">Producto</th>
                  <th className="p-4 hidden md:table-cell">Categoría</th>
                  <th className="p-4 hidden sm:table-cell">Proveedor</th>
                  <th className="p-4 text-center">Faltante</th>
                  <th className="p-4 text-right pr-6">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {criticalProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg shrink-0">
                          <AlertTriangle size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{p.name}</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">SKU: {p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm text-slate-600 font-medium">
                      {p.category}
                    </td>
                    <td className="p-4 hidden sm:table-cell text-sm text-slate-600 font-medium">
                      {p.supplier || <span className="text-slate-400 italic">No asignado</span>}
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex flex-col items-center justify-center bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 min-w-[80px]">
                        <span className="text-xs font-bold text-red-700/70 uppercase tracking-widest leading-none mb-1">Pedir</span>
                        <span className="text-lg font-extrabold text-red-700 leading-none">+{p.min_stock - p.current_stock}</span>
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right flex flex-col items-end justify-center min-h-full">
                      <button 
                        onClick={() => handleBuy(p)}
                        disabled={buyingId === p.id}
                        className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 min-w-[110px] flex justify-center"
                      >
                        {buyingId === p.id ? <Spinner className="w-4 h-4 text-emerald-700 animate-spin" /> : 'Comprar Ya'}
                      </button>
                      <div className="text-[10px] text-slate-400 font-medium mt-1 uppercase w-full text-center">
                        Stock: {p.current_stock}/{p.min_stock}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center min-h-[300px]">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
            <Package size={32} />
          </div>
          <p className="text-slate-900 font-bold text-lg mb-1">No hay pedidos pendientes</p>
          <p className="text-slate-500 text-sm max-w-sm">No hay ningún producto que haya bajado de su stock mínimo de seguridad.</p>
        </div>
      )}
    </div>
  )
}
