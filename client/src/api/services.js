import api from './axios';

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  toggleStatus: (id) => api.patch(`/users/${id}/status`),
};

export const badgesAPI = {
  getAll: (params) => api.get('/badges', { params }),
  getMyBadge: () => api.get('/badges/me'),
  create: (data) => api.post('/badges', data),
  update: (id, data) => api.put(`/badges/${id}`, data),
  block: (id) => api.patch(`/badges/${id}/block`),
  unblock: (id) => api.patch(`/badges/${id}/unblock`),
  renew: (id, data) => api.patch(`/badges/${id}/renew`, data),
};

export const buildingsAPI = {
  getAll: (params) => api.get('/buildings', { params }),
  create: (data) => api.post('/buildings', data),
  update: (id, data) => api.put(`/buildings/${id}`, data),
  delete: (id) => api.delete(`/buildings/${id}`),
};

export const doorsAPI = {
  getAll: (params) => api.get('/doors', { params }),
  create: (data) => api.post('/doors', data),
  update: (id, data) => api.put(`/doors/${id}`, data),
  delete: (id) => api.delete(`/doors/${id}`),
};

export const permissionsAPI = {
  getAll: (params) => api.get('/permissions', { params }),
  create: (data) => api.post('/permissions', data),
  update: (id, data) => api.put(`/permissions/${id}`, data),
  delete: (id) => api.delete(`/permissions/${id}`),
};

export const accessAPI = {
  simulate: (data) => api.post('/access/simulate', data),
};

export const logsAPI = {
  getAll: (params) => api.get('/logs', { params }),
  getMyLogs: (params) => api.get('/logs/me', { params }),
  export: (params) => api.get('/logs/export', { params, responseType: 'blob' }),
};

export const incidentsAPI = {
  getAll: (params) => api.get('/incidents', { params }),
  create: (data) => api.post('/incidents', data),
  update: (id, data) => api.put(`/incidents/${id}`, data),
  delete: (id) => api.delete(`/incidents/${id}`),
};

export const dashboardAPI = {
  admin: () => api.get('/dashboard/admin'),
  security: () => api.get('/dashboard/security'),
  user: () => api.get('/dashboard/user'),
};
