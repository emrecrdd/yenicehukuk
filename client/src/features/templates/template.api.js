import axios from '../../app/config/axios.js';

export const templateApi = {
  // ✅ Tüm şablonları getir
  getAll: (params) => axios.get('/templates', { params }),

  // ✅ Tek şablon getir
  getOne: (id) => axios.get(`/templates/${id}`),

  // ✅ Kategorileri getir
  getCategories: () => axios.get('/templates/categories'),

  // ✅ Hukuk alanlarını getir
  getLawAreas: () => axios.get('/templates/law-areas'),

  // ✅ Yeni şablon oluştur
  create: (data) => axios.post('/templates', data),

  // ✅ Şablon güncelle
  update: (id, data) => axios.put(`/templates/${id}`, data),

  // ✅ Şablon sil
  delete: (id) => axios.delete(`/templates/${id}`),

  // ✅ Şablon indir
  download: (id) => axios.get(`/templates/${id}/download`),
};

export default templateApi;