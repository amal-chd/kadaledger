'use client';

import { useState, useEffect } from 'react';
import { Cloud, Download, Upload, Loader2, CheckCircle2, AlertCircle, Trash2, Unplug } from 'lucide-react';
import toast from 'react-hot-toast';

const CLIENT_ID = '530019096016-vd82gqsnk5qog03okt9o9go0bsup1pse.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

declare global {
    interface Window {
        google: any;
        gapi: any;
    }
}

// Helper to escape CSV fields
const escapeCsv = (str: string | number | null | undefined): string => {
    if (str === null || str === undefined) return '';
    const stringValue = String(str);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
};

// Helper: Convert flattened CSV to JSON structure expected by API
const csvToJson = (csvText: string): any => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

    const customersMap = new Map<string, any>();
    const transactions: any[] = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV parsing (handling quoted values)
        const row: string[] = [];
        let inQuotes = false;
        let currentValue = '';

        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                row.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        row.push(currentValue);

        // Clean up quotes
        const cleanRow = row.map(val => val.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

        if (cleanRow.length < 6) continue;

        const date = cleanRow[0];
        const customerName = cleanRow[1];
        const customerPhone = cleanRow[2];
        const type = cleanRow[3];
        const amount = cleanRow[4];
        const description = cleanRow[5];

        // Generate a temporary ID for the customer based on phone
        // The API will use phone number to match/upsert
        const tempCustomerId = `temp_${customerPhone.replace(/\D/g, '')}`;

        if (!customersMap.has(tempCustomerId)) {
            customersMap.set(tempCustomerId, {
                id: tempCustomerId,
                name: customerName,
                phoneNumber: customerPhone,
                balance: 0 // Balance will be recalculated by backend or isn't needed for import structure if transactions exist
            });
        }

        transactions.push({
            id: `tx_${i}`, // Temporary ID
            date: date,
            amount: parseFloat(amount),
            type: type,
            description: description,
            customerId: tempCustomerId
        });
    }

    return {
        customers: Array.from(customersMap.values()),
        transactions: transactions
    };
};

// Helper: Convert API JSON to flattened CSV
const jsonToCsv = (data: any): string => {
    const header = 'Date,CustomerName,CustomerPhone,Type,Amount,Description';
    const rows = [];

    // Create quick lookup for customers
    const customerLookup = new Map<string, any>();
    if (data.customers && Array.isArray(data.customers)) {
        data.customers.forEach((c: any) => customerLookup.set(c.id, c));
    }

    if (data.transactions && Array.isArray(data.transactions)) {
        // Sort transactions by date (newest first)
        const sortedTx = [...data.transactions].sort((a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        for (const tx of sortedTx) {
            const customer = customerLookup.get(tx.customerId);
            const customerName = customer ? customer.name : 'Unknown';
            const customerPhone = customer ? customer.phoneNumber : '';

            rows.push([
                escapeCsv(tx.date),
                escapeCsv(customerName),
                escapeCsv(customerPhone),
                escapeCsv(tx.type),
                escapeCsv(tx.amount),
                escapeCsv(tx.description || '')
            ].join(','));
        }
    }

    return [header, ...rows].join('\n');
};

export default function DriveBackup() {
    const [gapiLoaded, setGapiLoaded] = useState(false);
    const [gisLoaded, setGisLoaded] = useState(false);
    const [tokenClient, setTokenClient] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lastBackup, setLastBackup] = useState<string | null>(null);

    // Initialize Google Scripts
    useEffect(() => {
        const loadGapi = async () => {
            if (typeof window === 'undefined') return;
            // Load gapi script
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                window.gapi.load('client', async () => {
                    await window.gapi.client.init({});
                    // Load Drive API discovery doc
                    await window.gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest');
                    setGapiLoaded(true);
                });
            };
            document.body.appendChild(script);

            // Load GIS script
            const gisScript = document.createElement('script');
            gisScript.src = 'https://accounts.google.com/gsi/client';
            gisScript.onload = () => {
                setGisLoaded(true);
            };
            document.body.appendChild(gisScript);
        };

        loadGapi();
    }, []);

    // Initialize Token Client
    useEffect(() => {
        if (gisLoaded) {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: (tokenResponse: any) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        // CRITICAL: Set the token for the GAPI client
                        window.gapi.client.setToken(tokenResponse);
                        setIsAuthenticated(true);
                        toast.success('Connected to Google Drive');
                    }
                },
            });
            setTokenClient(client);
        }
    }, [gisLoaded]);

    const handleAuth = () => {
        if (tokenClient) {
            tokenClient.requestAccessToken();
        }
    };

    const handleDisconnect = () => {
        if (!isAuthenticated) return;

        const tokenCallback = (response: any) => {
            setIsAuthenticated(false);
            setLastBackup(null);
            toast.success('Disconnected from Google Drive');
        };

        try {
            // Try explicit revocation if we have a token
            const token = window.gapi?.client?.getToken()?.access_token;
            if (token && window.google?.accounts?.oauth2) {
                window.google.accounts.oauth2.revoke(token, tokenCallback);
            } else {
                // Fallback if no token present but state says authenticated
                tokenCallback(null);
            }
        } catch (e) {
            console.error(e);
            tokenCallback(null);
        }
    };

    const fetchLocalData = async () => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not logged in');

        const res = await fetch('/api/vendor/export-data', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch local data');

        return await res.json();
    };

    const handleBackup = async () => {
        if (!isAuthenticated) return handleAuth();
        setLoading(true);
        const toastId = toast.loading('Exporting to CSV...');

        try {
            const data = await fetchLocalData();

            // Convert to CSV
            const csvContent = jsonToCsv(data);

            const file = new Blob([csvContent], { type: 'text/csv' });

            const fileName = `KadaLedger_Backup_${new Date().toISOString().split('T')[0]}.csv`;
            const metadata = {
                name: fileName,
                mimeType: 'text/csv',
            };

            const accessToken = window.gapi.client.getToken().access_token;
            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', file);

            const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
                body: form,
            });

            if (!res.ok) throw new Error('Upload failed');

            const result = await res.json();
            setLastBackup(new Date().toLocaleString());
            toast.success('Export Successful! CSV saved to Drive.', { id: toastId });
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Backup failed', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async () => {
        if (!isAuthenticated) return handleAuth();
        setLoading(true);
        const toastId = toast.loading('Searching for backup CSVs...');

        try {
            // List files - Look for CSVs
            const response = await window.gapi.client.drive.files.list({
                q: "name contains 'KadaLedger' and mimeType = 'text/csv' and trashed = false",
                fields: 'files(id, name, createdTime)',
                orderBy: 'createdTime desc',
                pageSize: 10,
            });

            const files = response.result.files;

            if (files && files.length > 0) {
                const latestFile = files[0];
                toast.loading(`Restoring from ${latestFile.name}...`, { id: toastId });

                const fileRes = await window.gapi.client.drive.files.get({
                    fileId: latestFile.id,
                    alt: 'media',
                });

                const csvData = fileRes.body; // gapi returns body string for media text download

                // Convert CSV back to JSON structure
                const backupData = csvToJson(csvData);

                const token = localStorage.getItem('token');
                if (!token) throw new Error("Not logged in");

                // Send to backend for restoration
                const importRes = await fetch('/api/vendor/import-data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(backupData)
                });

                if (!importRes.ok) {
                    const errData = await importRes.json();
                    throw new Error(errData.error || "Import failed on server");
                }

                toast.success('Import Successful! Database synced.', { id: toastId });
                setTimeout(() => window.location.reload(), 2000);
            } else {
                toast.error('No backup CSV files found in Drive', { id: toastId });
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Restore failed', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all hover:border-blue-200 dark:hover:border-primary/20">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-primary/20 flex items-center justify-center text-blue-600 dark:text-primary">
                        <Cloud size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Google Drive Sync</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Sync data as CSV to Google Drive.</p>
                    </div>
                </div>
                {isAuthenticated && (
                    <button
                        onClick={handleDisconnect}
                        title="Disconnect from Google Drive"
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <Unplug size={20} />
                    </button>
                )}
            </div>

            {!gapiLoaded || !gisLoaded ? (
                <div className="flex items-center gap-2 text-slate-500 py-4">
                    <Loader2 size={16} className="animate-spin" /> Initializing Google services...
                </div>
            ) : (
                <div className="space-y-4">
                    {!isAuthenticated ? (
                        <button
                            onClick={handleAuth}
                            className="w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 dark:shadow-white/20"
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                            Connect Google Account
                        </button>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={handleBackup}
                                disabled={loading}
                                className="py-4 px-6 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold transition-all flex flex-col items-center gap-2 group disabled:opacity-50 shadow-lg shadow-accent/20"
                            >
                                <Upload size={24} className="group-hover:-translate-y-1 transition-transform" />
                                <span>Export CSV</span>
                            </button>

                            <button
                                onClick={handleRestore}
                                disabled={loading}
                                className="py-4 px-6 rounded-xl bg-white border border-slate-200 dark:bg-white/5 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white font-bold transition-all flex flex-col items-center gap-2 group disabled:opacity-50"
                            >
                                <Download size={24} className="group-hover:translate-y-1 transition-transform" />
                                <span>Import CSV</span>
                            </button>
                        </div>
                    )}

                    {isAuthenticated && (
                        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mt-4 px-2 bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-100 dark:border-white/5">
                            <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                                <CheckCircle2 size={12} /> Account Connected
                            </span>
                            {lastBackup && <span>Last Sync: {lastBackup}</span>}
                            {!lastBackup && <span>Ready to sync</span>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
