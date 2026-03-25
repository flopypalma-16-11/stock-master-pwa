import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'

export function ProductFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    supplier: '',
    price: 0,
    current_stock: 0,
    min_stock: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData({
        name: '',
        sku: '',
        category: '',
        supplier: '',
        price: 0,
        current_stock: 0,
        min_stock: 0
      })
    }
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // Convertir a número estrictamente antes de enviar
    const dataToSubmit = {
      ...formData,
      price: formData.price ? Number(String(formData.price).replace(',', '.')) : 0,
      current_stock: formData.current_stock ? parseInt(formData.current_stock) : 0,
      min_stock: formData.min_stock ? parseInt(formData.min_stock) : 0,
    }

    try {
      await onSubmit(dataToSubmit)
      onClose()
    } catch (err) {
      setError(err.message || 'Error guardando el producto.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900">
            {initialData ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm border border-red-100 font-medium">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">SKU</label>
                <input required type="text" name="sku" value={formData.sku} onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm uppercase" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Precio ($)</label>
                <input required type="text" inputMode="decimal" name="price" value={formData.price} onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Stock Actual</label>
                <input required type="number" min="0" name="current_stock" value={formData.current_stock} onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-bold text-blue-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Stock Mínimo</label>
                <input required type="number" min="0" name="min_stock" value={formData.min_stock} onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Categoría</label>
                <input required type="text" name="category" value={formData.category} onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm capitalize" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Proveedor</label>
                <input type="text" name="supplier" value={formData.supplier} onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm" />
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 mt-auto">
          <button type="button" onClick={onClose} disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50">
            Cancelar
          </button>
          <button type="submit" form="product-form" disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Guardar Producto'}
          </button>
        </div>
      </div>
    </div>
  )
}
