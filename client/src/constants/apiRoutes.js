export const API_ROUTES = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Clients
  CLIENTS: {
    BASE: '/clients',
    GET_ALL: '/clients',
    GET_ONE: (id) => `/clients/${id}`,
    CREATE: '/clients',
    UPDATE: (id) => `/clients/${id}`,
    DELETE: (id) => `/clients/${id}`,
    STATISTICS: '/clients/statistics',
    CASE_HISTORY: (id) => `/clients/${id}/cases`,
    PAYMENTS: (id) => `/clients/${id}/payments`,
    NOTES: (id) => `/clients/${id}/notes`,
  },

  // Cases
  CASES: {
    BASE: '/cases',
    GET_ALL: '/cases',
    GET_ONE: (id) => `/cases/${id}`,
    CREATE: '/cases',
    UPDATE: (id) => `/cases/${id}`,
    DELETE: (id) => `/cases/${id}`,
    STATISTICS: '/cases/statistics',
    UPDATE_STATUS: (id) => `/cases/${id}/status`,
    ADD_PARTY: (id) => `/cases/${id}/parties`,
    REMOVE_PARTY: (id, partyId) => `/cases/${id}/parties/${partyId}`,
    GET_PARTIES: (id) => `/cases/${id}/parties`,
    GET_DOCUMENTS: (id) => `/cases/${id}/documents`,
    GET_TASKS: (id) => `/cases/${id}/tasks`,
    GET_EVENTS: (id) => `/cases/${id}/events`,
    GET_PAYMENTS: (id) => `/cases/${id}/payments`,
    GET_NOTES: (id) => `/cases/${id}/notes`,
  },

  // Documents
  DOCUMENTS: {
    BASE: '/documents',
    GET_ALL: '/documents',
    GET_ONE: (id) => `/documents/${id}`,
    UPLOAD: '/documents/upload',
    UPDATE: (id) => `/documents/${id}`,
    DELETE: (id) => `/documents/${id}`,
    DOWNLOAD: (id) => `/documents/${id}/download`,
    PREVIEW: (id) => `/documents/${id}/preview`,
    VERSIONS: (id) => `/documents/${id}/versions`,
    CATEGORIES: '/documents/categories',
    STATISTICS: '/documents/statistics',
  },

  // Tasks
  TASKS: {
    BASE: '/tasks',
    GET_ALL: '/tasks',
    GET_ONE: (id) => `/tasks/${id}`,
    CREATE: '/tasks',
    UPDATE: (id) => `/tasks/${id}`,
    DELETE: (id) => `/tasks/${id}`,
    UPDATE_STATUS: (id) => `/tasks/${id}/status`,
    ASSIGN: (id) => `/tasks/${id}/assign`,
    MY_TASKS: '/tasks/my',
    MY_OVERDUE: '/tasks/my/overdue',
    MY_UPCOMING: '/tasks/my/upcoming',
    STATISTICS: '/tasks/statistics',
  },

  // Finance
  FINANCE: {
    BASE: '/finance',
    GET_ALL: '/finance',
    GET_ONE: (id) => `/finance/${id}`,
    CREATE: '/finance',
    UPDATE: (id) => `/finance/${id}`,
    DELETE: (id) => `/finance/${id}`,
    SUMMARY: '/finance/summary',
    MONTHLY_REVENUE: '/finance/monthly-revenue',
    OUTSTANDING: '/finance/outstanding',
    STATISTICS: '/finance/statistics',
    CLIENT_PAYMENTS: (id) => `/finance/client/${id}`,
    CLIENT_SUMMARY: (id) => `/finance/client/${id}/summary`,
    CASE_PAYMENTS: (id) => `/finance/case/${id}`,
  },

  // Search
  SEARCH: {
    BASE: '/search',
    SEARCH: '/search',
    ALL: '/search/all',
    CLIENTS: '/search/clients',
    CASES: '/search/cases',
    DOCUMENTS: '/search/documents',
    TASKS: '/search/tasks',
    SUGGESTIONS: '/search/suggestions',
  },

  // AI
  AI: {
    BASE: '/ai',
    ANALYZE_DOCUMENT: '/ai/analyze-document',
    SUMMARIZE_CASE: (id) => `/ai/summarize-case/${id}`,
    LEGAL_ADVICE: '/ai/legal-advice',
    EXTRACT_ENTITIES: '/ai/extract-entities',
    GENERATE_DRAFT: '/ai/generate-draft',
    CLASSIFY_DOCUMENT: '/ai/classify-document',
    RECOMMENDATIONS: (id) => `/ai/case-recommendations/${id}`,
    SENTIMENT: '/ai/analyze-sentiment',
  },
};