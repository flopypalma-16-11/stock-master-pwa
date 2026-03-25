import { createContext, useContext, useState, useEffect } from 'react'

const CashContext = createContext({})

export function CashProvider({ children }) {
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('store_balance')
    return saved !== null ? parseFloat(saved) : 200.00
  })

  // Sincronizar con localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('store_balance', balance.toString())
  }, [balance])

  const addFunds = (amount) => {
    setBalance(prev => prev + amount)
  }

  const removeFunds = (amount) => {
    setBalance(prev => prev - amount)
  }

  const resetFunds = (initialAmount = 200) => {
    setBalance(initialAmount)
  }

  return (
    <CashContext.Provider value={{ balance, addFunds, removeFunds, resetFunds }}>
      {children}
    </CashContext.Provider>
  )
}

export function useCash() {
  return useContext(CashContext)
}
