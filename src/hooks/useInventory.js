import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

export function useInventory() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProducts = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setProducts([])
      return
    }

    fetchProducts()

    // Setup Realtime Subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProducts((prev) => [...prev, payload.new].sort((a, b) => a.name.localeCompare(b.name)))
          } else if (payload.eventType === 'UPDATE') {
            setProducts((prev) =>
              prev.map((item) => (item.id === payload.new.id ? payload.new : item))
            )
          } else if (payload.eventType === 'DELETE') {
            setProducts((prev) => prev.filter((item) => item.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchProducts])

  const addProduct = async (productData) => {
    const { data, error: insertError } = await supabase
      .from('products')
      .insert([{ ...productData, user_id: user.id }])
      .select()
      .single()
    if (insertError) throw insertError
    return data
  }

  const updateProduct = async (id, updates) => {
    const { data, error: updateError } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    if (updateError) throw updateError
    return data
  }

  const deleteProduct = async (id) => {
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (deleteError) throw deleteError
  }

  const adjustStock = async (id, currentStock, difference) => {
    const newStock = currentStock + difference
    if (newStock < 0) {
      throw new Error('El stock no puede ser negativo.')
    }
    return await updateProduct(id, { current_stock: newStock })
  }

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    refresh: fetchProducts,
  }
}
