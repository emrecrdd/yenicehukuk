import axios from '../../app/config/axios.js';

const documentApi = {
  getAll: (params) => {
    console.log('🔍 [documentApi.getAll] çağrıldı. Parametreler:', params);
    return axios.get('/documents', { params });
  },

  getOne: (id) => {
    console.log('📄 getOne çağrıldı. ID:', id);
    return axios.get(`/documents/${id}`);
  },

  upload: (data) => {
    return axios.post('/documents/upload', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadMultiple: (data) => {
    return axios.post('/documents/upload-multiple', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  update: (id, data) => {
    return axios.put(`/documents/${id}`, data);
  },

  delete: (id) => {
    console.log('🗑️ [API] delete çağrıldı. ID:', id);
    return axios.delete(`/documents/${id}`);
  },

  download: (id) => {
    return axios.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
  },

  getVersions: (id) => {
    return axios.get(`/documents/${id}/versions`);
  },

  getCategories: () => {
    return axios.get('/documents/categories');
  },

  getStatistics: () => {
    return axios.get('/documents/statistics');
  },
};

export default documentApi;