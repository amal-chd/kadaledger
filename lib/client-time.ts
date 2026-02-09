export function getDeviceTimeHeaders(): Record<string, string> {
    if (typeof window === 'undefined') {
        return {};
    }

    const headers: Record<string, string> = {
        'X-Timezone-Offset': String(-new Date().getTimezoneOffset()),
    };

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone) {
        headers['X-Timezone'] = timeZone;
    }

    return headers;
}

export function getLocalDateInputValue(date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
