const API_URL = "http://localhost:3000/api";

export const api = {
  // Admin
  async login(password) {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    return response.json();
  },

  // Eggs
  async getEggs() {
    const response = await fetch(`${API_URL}/eggs`);
    return response.json();
  },

  async validateCode(code) {
    const response = await fetch(`${API_URL}/eggs/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    return response.json();
  },

  async addEgg(eggData) {
    const response = await fetch(`${API_URL}/eggs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eggData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    return response.json();
  },

  async deleteEgg(id) {
    const response = await fetch(`${API_URL}/eggs/${id}`, {
      method: "DELETE",
    });
    return response.json();
  },

  // Discoveries
  async getDiscoveries() {
    const response = await fetch(`${API_URL}/discoveries`);
    return response.json();
  },

  async getLeaderboard() {
    const response = await fetch(`${API_URL}/discoveries/leaderboard`);
    return response.json();
  },

  async addDiscovery(discoveryData) {
    const response = await fetch(`${API_URL}/discoveries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discoveryData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    return response.json();
  },
};
