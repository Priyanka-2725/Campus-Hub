import axios from "axios";

const TOKEN_KEY = "campus_hub_token";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const authApi = {
  login: (payload) => api.post("/auth/login", payload),
  register: (payload) => api.post("/auth/register", payload),
  me: () => api.get("/users/me"),
};

export const dashboardApi = {
  stats: () => api.get("/dashboard/stats"),
  publicStats: () => api.get("/dashboard/public-stats"),
};

export const activityApi = {
  recent: () => api.get("/activities/recent"),
};

export const listingApi = {
  getAll: () => api.get("/listings"),
  getById: (id) => api.get(`/listings/${id}`),
  getRecommended: () => api.get("/listings/recommended"),
  create: (payload) => api.post("/listings", payload),
  update: (id, payload) => api.put(`/listings/${id}`, payload),
  remove: (id) => api.delete(`/listings/${id}`),
  expressInterest: (id) => api.post(`/listings/${id}/interest`),
  confirmSale: (id) => api.post(`/listings/${id}/confirm-sale`),
};

export const notificationApi = {
  getAll: () => api.get("/notifications"),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
};

export const messageApi = {
  inbox: () => api.get("/messages/inbox"),
  conversation: (userId) => api.get(`/messages/conversation/${userId}`),
  send: (payload) => api.post("/messages", payload),
};

export const eventApi = {
  getAll: () => api.get("/events"),
  create: (payload) => api.post("/events", payload),
  join: (eventId) => api.post(`/events/${eventId}/join`),
};

export const collaborationApi = {
  getAll: () => api.get("/collab"),
  create: (payload) => api.post("/collab", payload),
  remove: (id) => api.delete(`/collab/${id}`),
};

export const userApi = {
  myListings: () => api.get("/users/me/listings"),
  myEvents: () => api.get("/users/me/events"),
  myPosts: () => api.get("/users/me/posts"),
  myResponses: () => api.get("/users/me/responses"),
  myInterests: () => api.get("/users/me/interests"),
};

export { TOKEN_KEY };
export default api;
