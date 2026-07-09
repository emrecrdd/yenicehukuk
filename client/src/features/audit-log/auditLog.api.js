import axios from '../../app/config/axios.js';

const auditLogApi = {
  // ✅ Logları getir (filtreli)
  getAll: (params = {}) => {
    return axios.get('/audit-logs', { params });
  },

  // ✅ Tek bir log detayı
  getOne: (id) => {
    return axios.get(`/audit-logs/${id}`);
  },

  // ✅ Log filtreleri için seçenekler
  getFilters: () => {
    return axios.get('/audit-logs/filters');
  },
};

export default auditLogApi;