import axios from '../../app/config/axios.js';

const taskApi = {
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

  updateStatus: (id, status) => {
    return axios.patch(`/tasks/${id}/status`, { status });
  },

  assignTask: (id, assigned_to) => {
    return axios.patch(`/tasks/${id}/assign`, { assigned_to });
  },

  getMyTasks: (params) => {
    return axios.get('/tasks/my', { params });
  },

  getMyOverdue: () => {
    return axios.get('/tasks/my/overdue');
  },

  getMyUpcoming: () => {
    return axios.get('/tasks/my/upcoming');
  },

  getStatistics: () => {
    return axios.get('/tasks/statistics');
  },
};

export default taskApi;