'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type RefreshType = 'customer' | 'transaction' | 'dashboard' | 'all';

interface LastUpdate {
    customer?: number;
    transaction?: number;
    dashboard?: number;
}

interface DataRefreshContextType {
    refreshTrigger: number;
    lastUpdate: LastUpdate;
    triggerRefresh: (type?: RefreshType) => void;
}

const DataRefreshContext = createContext<DataRefreshContextType | undefined>(undefined);

export function DataRefreshProvider({ children }: { children: ReactNode }) {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [lastUpdate, setLastUpdate] = useState<LastUpdate>({});

    const triggerRefresh = useCallback((type: RefreshType = 'all') => {
        const now = Date.now();

        setRefreshTrigger(prev => prev + 1);

        if (type === 'all') {
            setLastUpdate({
                customer: now,
                transaction: now,
                dashboard: now,
            });
        } else {
            setLastUpdate(prev => ({
                ...prev,
                [type]: now,
            }));
        }
    }, []);

    return (
        <DataRefreshContext.Provider value={{ refreshTrigger, lastUpdate, triggerRefresh }}>
            {children}
        </DataRefreshContext.Provider>
    );
}

export function useDataRefresh() {
    const context = useContext(DataRefreshContext);
    if (context === undefined) {
        throw new Error('useDataRefresh must be used within a DataRefreshProvider');
    }
    return context;
}
