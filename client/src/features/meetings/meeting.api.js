import axios from '../../app/config/axios.js';

const meetingApi = {
  getAll: (params) => {
    return axios.get('/meetings', { params });
  },

  getOne: (id) => {
    return axios.get(`/meetings/${id}`);
  },

  create: (data) => {
    return axios.post('/meetings', data);
  },

  update: (id, data) => {
    return axios.put(`/meetings/${id}`, data);
  },

  delete: (id) => {
    return axios.delete(`/meetings/${id}`);
  },

  updateStatus: (id, status) => {
    return axios.patch(`/meetings/${id}/status`, { status });
  },

  getMyMeetings: () => {
    return axios.get('/meetings/my');
  },

  getUpcoming: () => {
    return axios.get('/meetings/upcoming');
  },

  getByCase: (caseId) => {
    return axios.get(`/meetings/case/${caseId}`);
  },

  getByClient: (clientId) => {
    return axios.get(`/meetings/client/${clientId}`);
  },
};

export default meetingApi;