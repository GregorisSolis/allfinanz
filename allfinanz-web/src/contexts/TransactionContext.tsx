import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface TransactionTotals {
  fixedTotal: number;
  relativeTotal: number;
  selectedFixedTotal: number;
  selectedRelativeTotal: number;
}

interface TransactionContextType {
  totals: TransactionTotals;
  updateFixedTotal: (total: number) => void;
  updateRelativeTotal: (total: number) => void;
  updateSelectedFixedTotal: (total: number) => void;
  updateSelectedRelativeTotal: (total: number) => void;
  clearTotals: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

interface TransactionProviderProps {
  children: ReactNode;
}

export function TransactionProvider({ children }: TransactionProviderProps) {
  const [totals, setTotals] = useState<TransactionTotals>({
    fixedTotal: 0,
    relativeTotal: 0,
    selectedFixedTotal: 0,
    selectedRelativeTotal: 0
  });

  const updateFixedTotal = useCallback((total: number) => {
    setTotals(prev => ({ ...prev, fixedTotal: total }));
  }, []);

  const updateRelativeTotal = useCallback((total: number) => {
    setTotals(prev => ({ ...prev, relativeTotal: total }));
  }, []);

  const updateSelectedFixedTotal = useCallback((total: number) => {
    setTotals(prev => ({ ...prev, selectedFixedTotal: total }));
  }, []);

  const updateSelectedRelativeTotal = useCallback((total: number) => {
    setTotals(prev => ({ ...prev, selectedRelativeTotal: total }));
  }, []);

  const clearTotals = useCallback(() => {
    setTotals({
      fixedTotal: 0,
      relativeTotal: 0,
      selectedFixedTotal: 0,
      selectedRelativeTotal: 0
    });
  }, []);

  const value: TransactionContextType = {
    totals,
    updateFixedTotal,
    updateRelativeTotal,
    updateSelectedFixedTotal,
    updateSelectedRelativeTotal,
    clearTotals
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransaction() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransaction deve ser usado dentro de um TransactionProvider');
  }
  return context;
} 