'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface CustomerViewContextType {
    selectedCustomerId: string | null;
    openCustomer: (id: string) => void;
    closeCustomer: () => void;
}

const CustomerViewContext = createContext<CustomerViewContextType | undefined>(undefined);

export function CustomerViewProvider({ children }: { children: ReactNode }) {
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

    const openCustomer = (id: string) => setSelectedCustomerId(id);
    const closeCustomer = () => setSelectedCustomerId(null);

    return (
        <CustomerViewContext.Provider value={{ selectedCustomerId, openCustomer, closeCustomer }}>
            {children}
        </CustomerViewContext.Provider>
    );
}

export function useCustomerView() {
    const context = useContext(CustomerViewContext);
    if (!context) {
        throw new Error('useCustomerView must be used within a CustomerViewProvider');
    }
    return context;
}
