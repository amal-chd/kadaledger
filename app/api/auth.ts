const API_URL = 'http://localhost:4000';

export const authApi = {
    login: async (phone: string) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone }),
        });
        if (!res.ok) throw new Error('Failed to send OTP');
        return res.json();
    },

    verify: async (phone: string, code: string) => {
        const res = await fetch(`${API_URL}/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, code }),
        });
        if (!res.ok) throw new Error('Invalid OTP');
        return res.json();
    }
};
