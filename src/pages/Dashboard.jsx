import { useState } from 'react'
import { useInventory } from '../hooks/useInventory'
import { useCash } from '../contexts/CashContext'
import { Package, AlertTriangle, DollarSign, Database, Wallet } from 'lucide-react'
import { FullScreenSpinner, Spinner } from '../components/ui/Spinners'
import { Link } from 'react-router-dom'

export function Dashboard() {
  const { products, loading, error, addProduct } = useInventory()
  const { balance } = useCash()
  const [generating, setGenerating] = useState(false)

  if (loading) return <FullScreenSpinner />
  if (error) return <div className="text-red-500 text-center p-4">Error cargando dashboard: {error}</div>

  const totalProducts = products.length
  const criticalProducts = products.filter(p => p.current_stock < p.min_stock)
  const totalValue = products.reduce((acc, p) => acc + (p.price * p.current_stock), 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard General</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="bg-slate-900 p-5 sm:p-6 rounded-2xl shadow-sm flex items-center gap-4 transition-shadow hover:shadow-md">
          <div className="p-3 sm:p-4 bg-slate-800 text-emerald-400 rounded-xl">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wide">Caja Diaria</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">${balance.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-shadow hover:shadow-md">
          <div className="p-3 sm:p-4 bg-blue-50 text-blue-600 rounded-xl">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wide">Productos</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalProducts}</p>
          </div>
        </div>

        <Link to="/restock" className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-all hover:shadow-md hover:border-red-200 group">
          <div className="p-3 sm:p-4 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-100 transition-colors">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wide group-hover:text-red-600 transition-colors">Stock Crítico</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{criticalProducts.length}</p>
          </div>
        </Link>

        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-shadow hover:shadow-md">
          <div className="p-3 sm:p-4 bg-green-50 text-green-600 rounded-xl">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wide">Mercancía</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">${totalValue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6">
         <div className="flex justify-between items-center mb-6">
           <h2 className="text-lg font-bold text-slate-900">Atención Requerida</h2>
         </div>
         {criticalProducts.length > 0 ? (
           <ul className="space-y-3">
             {criticalProducts.slice(0, 5).map(p => (
               <li key={p.id} className="flex justify-between items-center p-4 bg-red-50/50 hover:bg-red-50 transition-colors rounded-xl border border-red-100">
                 <div className="flex items-center gap-4 text-red-700 w-full sm:w-auto overflow-hidden">
                    <AlertTriangle size={20} className="flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="font-bold block truncate">{p.name}</span>
                      <span className="text-xs text-red-600/80 font-medium">SKU: {p.sku} • {p.supplier}</span>
                    </div>
                 </div>
                 <div className="text-right pl-4">
                   <div className="text-[10px] sm:text-xs text-red-600/80 font-bold uppercase tracking-wide mb-1">Stock</div>
                   <div className="font-extrabold text-xl text-red-700 bg-white px-3 py-1 rounded-lg border border-red-100 shadow-sm leading-none">
                     {p.current_stock}
                   </div>
                 </div>
               </li>
             ))}
           </ul>
         ) : (
           <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
             <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
               <Package size={24} />
             </div>
             <p className="text-slate-900 font-semibold mb-1">
               {totalProducts === 0 ? "Tu inventario está vacío" : "Todo bajo control"}
             </p>
             <p className="text-slate-500 text-sm">
               {totalProducts === 0 ? "Aún no hay productos registrados." : "El inventario está en niveles óptimos."}
             </p>
           </div>
         )}
         
         <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center">
           <p className="text-slate-500 text-sm mb-4 max-w-sm mx-auto text-center font-medium">
             ¿Quieres rellenar la bdd con productos de ejemplo para probar la app más rápido?
           </p>
           <button 
             onClick={async () => {
               setGenerating(true)
               const samples = [
                 { name: 'Pan de Molde Blanco', sku: 'PAN-001', category: 'Panadería', supplier: 'Bimbo', price: 2.50, current_stock: 12, min_stock: 5 },
                 { name: 'Leche Entera 1L', sku: 'LAC-001', category: 'Lácteos', supplier: 'Puleva', price: 1.20, current_stock: 24, min_stock: 10 },
                 { name: 'Huevos Docena Clase L', sku: 'HUE-001', category: 'Frescos', supplier: 'Granja San Juan', price: 2.30, current_stock: 15, min_stock: 5 },
                 { name: 'Coca-Cola Lata 33cl', sku: 'REF-001', category: 'Bebidas', supplier: 'Coca-Cola', price: 0.85, current_stock: 48, min_stock: 24 },
                 { name: 'Cerveza Mahou 5 Estrellas', sku: 'ALC-001', category: 'Bebidas', supplier: 'Mahou', price: 1.10, current_stock: 36, min_stock: 12 },
                 { name: 'Patatas Fritas Clásicas', sku: 'SNA-001', category: 'Snacks', supplier: 'Lays', price: 1.50, current_stock: 20, min_stock: 8 },
                 { name: 'Atún Claro en Aceite', sku: 'CON-001', category: 'Conservas', supplier: 'Calvo', price: 3.20, current_stock: 10, min_stock: 4 },
                 { name: 'Tomate Frito Receta', sku: 'CON-002', category: 'Conservas', supplier: 'Orlando', price: 1.60, current_stock: 14, min_stock: 5 },
                 { name: 'Arroz Redondo 1kg', sku: 'DES-001', category: 'Despensa', supplier: 'SOS', price: 1.45, current_stock: 30, min_stock: 10 },
                 { name: 'Papel Higiénico 12R', sku: 'LIM-001', category: 'Limpieza', supplier: 'Scottex', price: 4.80, current_stock: 8, min_stock: 3 }
               ]
               try {
                 for (const p of samples) await addProduct(p)
               } catch(err) {
                 console.error(err)
               } finally {
                 setGenerating(false)
               }
             }}
             disabled={generating}
             className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 active:scale-95"
           >
             {generating ? <Spinner className="h-4 w-4 text-white animate-spin" /> : <Database size={16} />}
             Generar Productos de Prueba
           </button>
         </div>
      </div>
    </div>
  )
}
