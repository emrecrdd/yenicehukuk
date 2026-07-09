import axios from '../../app/config/axios.js';

const eventApi = {
  // Tüm etkinlikleri getir
  getAll: (params) => {
    return axios.get('/events', { params });
  },

  // Tek etkinlik getir
  getOne: (id) => {
    return axios.get(`/events/${id}`);
  },

  // Etkinlik oluştur
  create: (data) => {
    return axios.post('/events', data);
  },

  // Etkinlik güncelle
  update: (id, data) => {
    return axios.put(`/events/${id}`, data);
  },

  // Etkinlik sil
  delete: (id) => {
    return axios.delete(`/events/${id}`);
  },

  // Benim etkinliklerim (atanan)
  getMyEvents: () => {
    return axios.get('/events/my');
  },

getCalendarEvents: (params) => {
  return axios.get('/events/calendar', { params });
},
  // Davaya ait etkinlikler
  getByCase: (caseId) => {
    return axios.get(`/events/case/${caseId}`);
  },
};

export default eventApi;