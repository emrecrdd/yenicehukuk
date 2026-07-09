import axios from '../../app/config/axios.js';

const casePartyApi = {
  // ✅ Bir davaya ait tarafları getir
  getByCase: (caseId) => {
    return axios.get(`/case-parties/case/${caseId}`);
  },

  // ✅ Taraf oluştur
  create: (caseId, data) => {
    return axios.post(`/case-parties/case/${caseId}`, data);
  },

  // ✅ Tek bir taraf getir
  getOne: (id) => {
    return axios.get(`/case-parties/${id}`);
  },

  // ✅ Taraf güncelle
  update: (id, data) => {
    return axios.put(`/case-parties/${id}`, data);
  },

  // ✅ Taraf sil
  delete: (id) => {
    return axios.delete(`/case-parties/${id}`);
  },
};

export default casePartyApi;