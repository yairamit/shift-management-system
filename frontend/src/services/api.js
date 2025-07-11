const API_BASE = import.meta.env.VITE_API_URL
console.log('tring:', API_BASE);
export const api = {
  // Auth
  login: async (phone) => {

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    })
  
    return response.json()
  },

  // Users
  getUsers: async () => {
    const response = await fetch(`${API_BASE}/users`)
    return response.json()
  },

  // Health check
  healthCheck: async () => {
    const response = await fetch(`${API_BASE}/health`)
    return response.json()
  }
}
