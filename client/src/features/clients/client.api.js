import axios from '../../app/config/axios.js';

const clientApi = {
  getAll: (params) => {
    return axios.get('/clients', { params });
  },

  getOne: (id) => {
    return axios.get(`/clients/${id}`);
  },

  create: (data) => {
    return axios.post('/clients', data);
  },

  update: (id, data) => {
    return axios.put(`/clients/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/clients/${id}`);
  },

  getStatistics: () => {
    return axios.get('/clients/statistics');
  },

  getCaseHistory: (id) => {
    return axios.get(`/clients/${id}/cases`);
  },

  getPayments: (id) => {
    return axios.get(`/clients/${id}/payments`);
  },

  getNotes: (id) => {
    return axios.get(`/clients/${id}/notes`);
  },
};

export default clientApi;