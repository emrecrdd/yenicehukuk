import axios from '../../app/config/axios.js';

const userApi = {
  // ✅ Tüm kullanıcıları getir
  getAll: (params) => {
    return axios.get('/users', { params });
  },

  // ✅ Tek kullanıcı getir
  getOne: (id) => {
    return axios.get(`/users/${id}`);
  },

  // ✅ Sadece avukatları getir
  getLawyers: () => {
    return axios.get('/users', { params: { role: 'lawyer' } });
  },

  // ✅ Kullanıcı güncelle
  update: (id, data) => {
    return axios.put(`/users/${id}`, data);
  },

  // ✅ YENİ: Kullanıcı sil (Admin)
  delete: (id) => {
    return axios.delete(`/users/${id}`);
  },

  // ✅ YENİ: Kullanıcı aktif/pasif değiştir
  toggleActive: (id, is_active) => {
    return axios.patch(`/users/${id}/toggle-active`, { is_active });
  },

  // ✅ YENİ: Kullanıcı rol değiştir
  changeRole: (id, role) => {
    return axios.patch(`/users/${id}/role`, { role });
  },
};

export default userApi;