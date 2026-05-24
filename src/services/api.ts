// Sentinel API Client Service
// Prepared for Backend Integration

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = {
  async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('sentinel_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },

  // Auth
  authenticate: async (telegramInitData: string) => {
    // return apiClient.fetchWithAuth('/auth/telegram', { method: 'POST', body: JSON.stringify({ initData: telegramInitData }) });
    console.log('Mock Auth with:', telegramInitData);
    return { token: 'mock-jwt-token', user: { id: 1, nickname: 'Anonymous #1234' } };
  },

  // Reports
  getReports: async (lat: number, lng: number, type: 'nearby' | 'trending' = 'nearby') => {
    // return apiClient.fetchWithAuth(`/reports?lat=${lat}&lng=${lng}&type=${type}`);
    console.log(`Mock fetching ${type} reports for`, lat, lng);
    return []; // Handled by mock data currently
  },

  createReport: async (data: { category: string, description: string, lat: number, lng: number }) => {
    // return apiClient.fetchWithAuth('/reports', { method: 'POST', body: JSON.stringify(data) });
    console.log('Mock creating report:', data);
    return { success: true };
  },

  // Routing
  getSafeRoute: async (startLat: number, startLng: number, endLat: number, endLng: number) => {
    // return apiClient.fetchWithAuth(`/routing/safe?startLat=${startLat}&startLng=${startLng}&endLat=${endLat}&endLng=${endLng}`);
    console.log('Mock routing from', startLat, startLng, 'to', endLat, endLng);
    return { safeRoute: [], hazardsAvoided: 2 };
  }
};
