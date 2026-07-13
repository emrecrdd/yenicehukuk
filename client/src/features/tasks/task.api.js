// 📁 client/src/features/tasks/task.api.js
import axios from '../../app/config/axios.js';

const taskApi = {
  // ============ CRUD ============
  getAll: (params) => axios.get('/tasks', { params }),
  getOne: (id) => axios.get(`/tasks/${id}`),
  create: (data) => axios.post('/tasks', data),
  update: (id, data) => axios.put(`/tasks/${id}`, data),
  delete: (id) => axios.delete(`/tasks/${id}`),

  // ============ ATAMA ============
  assign: (id, assignedTo) => axios.patch(`/tasks/${id}/assign`, { assigned_to: assignedTo }),
  reassign: (id, assignedTo) => axios.patch(`/tasks/${id}/reassign`, { assigned_to: assignedTo }),

  // ============ KABUL / RED ============
  accept: (id) => axios.patch(`/tasks/${id}/accept`),
  reject: (id, reason) => axios.patch(`/tasks/${id}/reject`, { reason }),

  // ============ İLERLEME ============
  complete: (id) => axios.patch(`/tasks/${id}/complete`),
  updateProgress: (id, progress) => axios.patch(`/tasks/${id}/progress`, { progress }),

  // ============ İSTATİSTİK ============
  getStatistics: () => axios.get('/tasks/statistics'),
};

export default taskApi;