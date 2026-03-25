import { Plus, Minus, AlertTriangle, Edit } from 'lucide-react'
import clsx from 'clsx'

export function ProductCard({ product, onAdjustStock, onEdit }) {
  const isCritical = product.current_stock < product.min_stock
  const isOutOfStock = product.current_stock === 0

  return (
    <div className={clsx(
      "bg-white rounded-xl shadow-sm border p-4 flex flex-col gap-3 transition-colors",
      isCritical ? "border-red-200" : "border-slate-200"
    )}>
      <div className="flex justify-between items-start">
        <div className="truncate pr-2">
          <h3 className="font-semibold text-slate-900 truncate">{product.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5 truncate">SKU: {product.sku}</p>
        </div>
        <button 
          onClick={() => onEdit(product)}
          className="text-slate-400 hover:text-blue-600 p-1 flex-shrink-0"
        >
          <Edit size={16} />
        </button>
      </div>

      <div className="flex justify-between items-end mt-2">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-500 mb-1 leading-none">Stock Actual</span>
          <div className="flex items-center gap-2">
            <span className={clsx(
              "text-2xl font-bold leading-none",
              isOutOfStock ? "text-red-600" : isCritical ? "text-amber-500" : "text-green-600"
            )}>
              {product.current_stock}
            </span>
            {isCritical && (
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-bold">
                <AlertTriangle size={12} strokeWidth={2.5} />
                Crítico
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border border-slate-100 flex-shrink-0">
          <button
            disabled={isOutOfStock}
            onClick={() => onAdjustStock(product.id, product.current_stock, -1)}
            className="p-2 rounded-md bg-white shadow-sm border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:bg-slate-100 transition-all active:scale-95"
          >
            <Minus size={16} />
          </button>
          <button
            onClick={() => onAdjustStock(product.id, product.current_stock, 1)}
            className="p-2 rounded-md bg-white shadow-sm border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
        <div>Precio: <span className="font-medium text-slate-700">${product.price}</span></div>
        <div>Mínimo: <span className="font-medium text-slate-700">{product.min_stock}</span></div>
        <div className="col-span-2 truncate">Cat: <span className="font-medium text-slate-700">{product.category}</span></div>
      </div>
    </div>
  )
}
