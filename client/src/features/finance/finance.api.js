import axios from '../../app/config/axios.js';

const financeApi = {
  getAll: (params) => {
    return axios.get('/finance', { params });
  },

  getOne: (id) => {
    return axios.get(`/finance/${id}`);
  },

  create: (data) => {
    return axios.post('/finance', data);
  },

  update: (id, data) => {
    return axios.put(`/finance/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/finance/${id}`);
  },

  getSummary: () => {
    return axios.get('/finance/summary');
  },

  getMonthlyRevenue: (year) => {
    return axios.get('/finance/monthly-revenue', { params: { year } });
  },

  getOutstanding: () => {
    return axios.get('/finance/outstanding');
  },

  getStatistics: () => {
    return axios.get('/finance/statistics');
  },

  getClientPayments: (clientId) => {
    return axios.get(`/finance/client/${clientId}`);
  },

  getClientSummary: (clientId) => {
    return axios.get(`/finance/client/${clientId}/summary`);
  },

  getCasePayments: (caseId) => {
    return axios.get(`/finance/case/${caseId}`);
  },
};

export default financeApi;