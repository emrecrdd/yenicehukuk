import axios from '../../app/config/axios.js';

const taskApi = {
  // ============ CRUD ============
  getAll: (params) => {
    return axios.get('/tasks', { params });
  },

  getOne: (id) => {
    return axios.get(`/tasks/${id}`);
  },

  create: (data) => {
    return axios.post('/tasks', data);
  },

  update: (id, data) => {
    return axios.put(`/tasks/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/tasks/${id}`);
  },

  // ============ STATUS & ASSIGN ============
  updateStatus: (id, status) => {
    return axios.patch(`/tasks/${id}/status`, { status });
  },

  assignTask: (id, assigned_to) => {
    return axios.patch(`/tasks/${id}/assign`, { assigned_to });
  },

  // ============ MY TASKS ============
  getMyTasks: (params) => {
    return axios.get('/tasks/my', { params });
  },

  getMyOverdue: () => {
    return axios.get('/tasks/my/overdue');
  },

  getMyUpcoming: () => {
    return axios.get('/tasks/my/upcoming');
  },

  // ============ STATISTICS ============
  getStatistics: () => {
    return axios.get('/tasks/statistics');
  },

  // ============ PROGRESS ============
  updateProgress: (id, progress) => {
    return axios.patch(`/tasks/${id}/progress`, { progress });
  },

  // ============ TAGS ============
  updateTags: (id, tags) => {
    return axios.patch(`/tasks/${id}/tags`, { tags });
  },

  // ============ REMINDER ============
  updateReminder: (id, reminder_date) => {
    return axios.patch(`/tasks/${id}/reminder`, { reminder_date });
  },

  // ============ SUBTASKS ============
  addSubtask: (id, data) => {
    return axios.post(`/tasks/${id}/subtasks`, data);
  },

  deleteSubtask: (id, subtaskId) => {
    return axios.delete(`/tasks/${id}/subtasks/${subtaskId}`);
  },
};

export default taskApi;