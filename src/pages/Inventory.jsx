import { useState, useMemo } from 'react'
import { useInventory } from '../hooks/useInventory'
import { ProductCard } from '../components/ProductCard'
import { ProductFormModal } from '../components/ProductFormModal'
import { FullScreenSpinner } from '../components/ui/Spinners'
import { Search, Plus, Filter } from 'lucide-react'

export function Inventory() {
  const { products, loading, error, addProduct, updateProduct, adjustStock } = useInventory()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category))
    return ['All', ...cats]
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, categoryFilter])

  if (loading) return <FullScreenSpinner />
  if (error) return <div className="text-red-500 text-center p-4">Error cargando inventario: {error}</div>

  const handleOpenCreate = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleSubmit = async (formData) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, formData)
    } else {
      await addProduct(formData)
    }
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventario</h1>
        <button 
          onClick={handleOpenCreate}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-colors active:scale-95"
        >
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium"
          />
        </div>
        <div className="relative sm:w-64 flex-shrink-0">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-10 pr-10 py-3 appearance-none bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium cursor-pointer"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'Todas las Categorías' : c}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-6">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id}
              product={product}
              onAdjustStock={adjustStock}
              onEdit={handleOpenEdit}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center min-h-[300px]">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
            <Search size={32} />
          </div>
          <p className="text-slate-900 font-bold text-lg mb-1">No se encontraron productos</p>
          <p className="text-slate-500 text-sm max-w-sm">Intenta ajustar los filtros de búsqueda o agrega un nuevo producto a tu inventario.</p>
        </div>
      )}

      <ProductFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingProduct}
      />
    </div>
  )
}
