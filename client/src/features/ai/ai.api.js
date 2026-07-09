import axios from '../../app/config/axios.js';

const aiApi = {
  // Document analysis
  analyzeDocument: (data) => {
    return axios.post('/ai/analyze-document', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Case summary
  summarizeCase: (caseId) => {
    return axios.get(`/ai/summarize-case/${caseId}`);
  },

  // Legal advice
  getLegalAdvice: (data) => {
    return axios.post('/ai/legal-advice', data);
  },

  // Extract entities
  extractEntities: (text) => {
    return axios.post('/ai/extract-entities', { text });
  },

  // Generate draft
  generateDraft: (data) => {
    return axios.post('/ai/generate-draft', data);
  },

  // Classify document
  classifyDocument: (data) => {
    return axios.post('/ai/classify-document', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Case recommendations
  getCaseRecommendations: (caseId) => {
    return axios.get(`/ai/case-recommendations/${caseId}`);
  },

  // Sentiment analysis
  analyzeSentiment: (text) => {
    return axios.post('/ai/analyze-sentiment', { text });
  },
};

export default aiApi;  // ← BURASI ÖNEMLİ!