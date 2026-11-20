import { api } from './api';

export const authApi = {
  login: (d) => api.post('/auth/login', d),
  register: (d) => api.post('/auth/register', d),
  me: () => api.get('/auth/me'),
  updateProfile: (d) => api.put('/auth/me', d),
};
export const projectsApi = {
  list: () => api.get('/projects'),
  get: (id) => api.get(`/projects/${id}`),
  create: (d) => api.post('/projects', d),
  update: (id, d) => api.put(`/projects/${id}`, d),
  remove: (id) => api.delete(`/projects/${id}`),
};
export const storiesApi = {
  list: (projectId) => api.get(`/projects/${projectId}/stories`),
  create: (projectId, d) => api.post(`/projects/${projectId}/stories`, d),
  update: (id, d) => api.put(`/stories/${id}`, d),
  remove: (id) => api.delete(`/stories/${id}`),
};
export const tasksApi = {
  all: () => api.get('/tasks'),
  byProject: (projectId) => api.get(`/projects/${projectId}/tasks`),
  byStory: (storyId) => api.get(`/stories/${storyId}/tasks`),
  create: (storyId, d) => api.post(`/stories/${storyId}/tasks`, d),
  update: (id, d) => api.put(`/tasks/${id}`, d),
  setStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  remove: (id) => api.delete(`/tasks/${id}`),
};
export const teamApi = {
  users: () => api.get('/users'),
  members: (projectId) => api.get(`/projects/${projectId}/members`),
  add: (projectId, userId) => api.post(`/projects/${projectId}/members`, { userId }),
  remove: (projectId, userId, unassignTasks = false) => api.delete(`/projects/${projectId}/members/${userId}`, { params: { unassignTasks } }),
};
export const notificationsApi = {
  list: () => api.get('/notifications'),
  unread: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};
export const dashboardApi = {
  summary: () => api.get('/dashboard/summary'),
  activity: () => api.get('/dashboard/activity'),
};
