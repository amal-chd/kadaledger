const API_URL = '/api/auth';

export const authApi = {
    login: async (credentials: { phoneNumber: string; password?: string }) => {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Login failed');
        }

        return data;
    },

    register: async (credentials: { businessName: string; phoneNumber: string; password?: string }) => {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        return data;
    },

    // Verify method removed as we are switching to password auth
    // forcing OTP verification for password reset (future) would be a separate flow
};
