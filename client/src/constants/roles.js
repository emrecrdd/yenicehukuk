export const ROLES = {
  ADMIN: 'admin',
  LAWYER: 'lawyer',
  INTERN: 'intern',
  SECRETARY: 'secretary',
};

export const ROLES_LIST = Object.values(ROLES);

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Yönetici',
  [ROLES.LAWYER]: 'Avukat',
  [ROLES.INTERN]: 'Stajyer',
  [ROLES.SECRETARY]: 'Sekreter',
};

export const ROLE_COLORS = {
  [ROLES.ADMIN]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  [ROLES.LAWYER]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [ROLES.INTERN]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  [ROLES.SECRETARY]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export const ROLE_ICONS = {
  [ROLES.ADMIN]: '👑',
  [ROLES.LAWYER]: '⚖️',
  [ROLES.INTERN]: '📚',
  [ROLES.SECRETARY]: '📋',
};

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    canViewAll: true,
    canEditAll: true,
    canDeleteAll: true,
    canManageUsers: true,
    canViewClients: true,
    canEditClients: true,
    canDeleteClients: true,
    canViewCases: true,
    canEditCases: true,
    canDeleteCases: true,
    canViewDocuments: true,
    canEditDocuments: true,
    canDeleteDocuments: true,
    canViewTasks: true,
    canEditTasks: true,
    canDeleteTasks: true,
    canViewFinance: true,
    canEditFinance: true,
    canDeleteFinance: true,
    canViewCalendar: true,
    canEditCalendar: true,
    canUseAI: true,
    canManageSettings: true,
  },

  [ROLES.LAWYER]: {
    canViewAll: false,
    canEditAll: false,
    canDeleteAll: false,
    canManageUsers: false,
    canViewClients: true,
    canEditClients: true,
    canDeleteClients: false,
    canViewCases: true,
    canEditCases: true,
    canDeleteCases: false,
    canViewDocuments: true,
    canEditDocuments: true,
    canDeleteDocuments: false,
    canViewTasks: true,
    canEditTasks: true,
    canDeleteTasks: false,
    canViewFinance: true,
    canEditFinance: true,
    canDeleteFinance: false,
    canViewCalendar: true,
    canEditCalendar: true,
    canUseAI: true,
    canManageSettings: false,
  },

  [ROLES.INTERN]: {
    canViewAll: false,
    canEditAll: false,
    canDeleteAll: false,
    canManageUsers: false,
    canViewClients: true,
    canEditClients: false,
    canDeleteClients: false,
    canViewCases: true,
    canEditCases: false,
    canDeleteCases: false,
    canViewDocuments: true,
    canEditDocuments: false,
    canDeleteDocuments: false,
    canViewTasks: true,
    canEditTasks: false,
    canDeleteTasks: false,
    canViewFinance: true,
    canEditFinance: false,
    canDeleteFinance: false,
    canViewCalendar: true,
    canEditCalendar: false,
    canUseAI: false,
    canManageSettings: false,
  },

  [ROLES.SECRETARY]: {
    canViewAll: false,
    canEditAll: false,
    canDeleteAll: false,
    canManageUsers: false,
    canViewClients: true,
    canEditClients: true,
    canDeleteClients: false,
    canViewCases: true,
    canEditCases: true,
    canDeleteCases: false,
    canViewDocuments: true,
    canEditDocuments: true,
    canDeleteDocuments: false,
    canViewTasks: true,
    canEditTasks: true,
    canDeleteTasks: false,
    canViewFinance: true,
    canEditFinance: true,
    canDeleteFinance: false,
    canViewCalendar: true,
    canEditCalendar: true,
    canUseAI: false,
    canManageSettings: false,
  },
};

// Helper function to check if user has permission
export const hasPermission = (userRole, permission) => {
  if (!userRole || !ROLE_PERMISSIONS[userRole]) return false;
  return ROLE_PERMISSIONS[userRole][permission] || false;
};

// Helper function to check if user has any of the given roles
export const hasAnyRole = (userRole, roles) => {
  if (!userRole) return false;
  return roles.includes(userRole);
};

// Helper function to check if user has all of the given roles
export const hasAllRoles = (userRole, roles) => {
  if (!userRole) return false;
  return roles.every(role => userRole === role);
};

// Role hierarchy (for comparison)
export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 4,
  [ROLES.LAWYER]: 3,
  [ROLES.SECRETARY]: 2,
  [ROLES.INTERN]: 1,
};

// Check if user role has higher or equal level than target role
export const hasRoleLevel = (userRole, targetRole) => {
  if (!userRole || !targetRole) return false;
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[targetRole] || 0);
};

export default {
  ROLES,
  ROLES_LIST,
  ROLE_LABELS,
  ROLE_COLORS,
  ROLE_ICONS,
  ROLE_OPTIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyRole,
  hasAllRoles,
  hasRoleLevel,
};