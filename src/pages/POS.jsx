import { useState, useMemo } from 'react'
import { useInventory } from '../hooks/useInventory'
import { useCash } from '../contexts/CashContext'
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, RotateCcw } from 'lucide-react'
import { FullScreenSpinner, Spinner } from '../components/ui/Spinners'
import clsx from 'clsx'

export function POS() {
  const { products, loading, error, adjustStock } = useInventory()
  const { addFunds } = useCash()
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState([])
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState(false)

  // ... (filtro y demás métodos de carrito)

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.current_stock > 0 && (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  }, [products, searchTerm])

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        if (existing.quantity >= product.current_stock) return prev // no puede añadir más del stock que hay
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateCartQuantity = (id, delta, maxStock) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta
        if (newQ > maxStock) return item
        if (newQ < 1) return item
        return { ...item, quantity: newQ }
      }
      return item
    }))
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const clearCart = () => setCart([])

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setCheckoutLoading(true)
    try {
      for (const item of cart) {
        await adjustStock(item.id, item.current_stock, -item.quantity)
      }
      addFunds(cartTotal) // <-- SE AÑADE A LA CAJA
      setCart([])
      setSuccessMsg(true)
      setTimeout(() => setSuccessMsg(false), 3000)
    } catch (err) {
      console.error(err)
      alert("Hubo un error al procesar el cobro: " + err.message)
    } finally {
      setCheckoutLoading(false)
    }
  }

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  if (loading) return <FullScreenSpinner />
  if (error) return <div className="p-8 text-red-500 text-center">Error: {error}</div>

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      {/* Sección Izquierda: Listado de Productos */}
      <div className="flex-1 flex flex-col min-h-0 bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 mb-3 ml-1">Caja (Punto de Venta)</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Escanear SKU o buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700 shadow-sm"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="text-left flex flex-col bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-blue-400 hover:shadow-md transition-all active:scale-95 group"
                >
                  <span className="font-semibold text-slate-900 leading-tight mb-1 group-hover:text-blue-700 transition-colors line-clamp-2 h-10">{product.name}</span>
                  <div className="flex justify-between items-end w-full mt-auto pt-2">
                    <span className="font-bold text-blue-700">${product.price.toFixed(2)}</span>
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Stock: {product.current_stock}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
               <Package size={48} className="mb-3 opacity-20" />
               <p>No se encontraron productos disponibles o con stock.</p>
             </div>
          )}
        </div>
      </div>

      {/* Sección Derecha: Ticket / Carrito */}
      <div className="w-full md:w-96 flex flex-col bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} />
            <h3 className="font-bold text-lg">Ticket Actual</h3>
          </div>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-slate-400 hover:text-white transition-colors" title="Vaciar carrito">
              <RotateCcw size={18} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 custom-scrollbar space-y-3">
          {successMsg && (
            <div className="bg-green-100 border border-green-200 text-green-700 p-3 rounded-xl text-center font-bold text-sm mb-4 animate-pulse">
              ¡Cobro realizado y stock actualizado!
            </div>
          )}

          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
              <ShoppingCart size={40} className="mb-2" />
              <p className="text-sm font-medium">El carrito está vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-800 text-sm leading-tight pr-4">{item.name}</span>
                  <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                     <button onClick={() => updateCartQuantity(item.id, -1, item.current_stock)} className="bg-white p-1 rounded-md shadow-sm text-slate-600 hover:text-blue-600 active:scale-90 transition-all">
                       <Minus size={14} />
                     </button>
                     <span className="font-bold text-sm w-8 text-center">{item.quantity}</span>
                     <button onClick={() => updateCartQuantity(item.id, 1, item.current_stock)} className="bg-white p-1 rounded-md shadow-sm text-slate-600 hover:text-blue-600 active:scale-90 transition-all disabled:opacity-30" disabled={item.quantity >= item.current_stock}>
                       <Plus size={14} />
                     </button>
                  </div>
                  <span className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-200">
           <div className="flex justify-between items-center mb-4 text-slate-600">
             <span className="font-semibold text-sm uppercase tracking-wider">Total a pagar:</span>
             <span className="font-extrabold text-3xl text-slate-900">${cartTotal.toFixed(2)}</span>
           </div>
           
           <button 
             onClick={handleCheckout}
             disabled={cart.length === 0 || checkoutLoading}
             className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
           >
             {checkoutLoading ? <Spinner className="text-white w-6 h-6 animate-spin" /> : <CreditCard size={24} />}
             Cobrar {cart.length > 0 && `(${cart.length} art.)`}
           </button>
        </div>
      </div>
    </div>
  )
}
