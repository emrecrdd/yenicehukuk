export const CASE_STATUS = {
  PREPARATION: 'preparation',
  ACTIVE: 'active',
  HEARING: 'hearing',
  APPEAL: 'appeal',
  CASSATION: 'cassation',
  CONCLUDED: 'concluded',
  ARCHIVED: 'archived',
};

export const CASE_STATUS_LABELS = {
  [CASE_STATUS.PREPARATION]: 'Hazırlık',
  [CASE_STATUS.ACTIVE]: 'Devam Ediyor',
  [CASE_STATUS.HEARING]: 'Duruşmada',
  [CASE_STATUS.APPEAL]: 'İstinaf',
  [CASE_STATUS.CASSATION]: 'Temyiz',
  [CASE_STATUS.CONCLUDED]: 'Sonuçlandı',
  [CASE_STATUS.ARCHIVED]: 'Arşivlendi',
};

export const CASE_STATUS_COLORS = {
  [CASE_STATUS.PREPARATION]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  [CASE_STATUS.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  [CASE_STATUS.HEARING]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [CASE_STATUS.APPEAL]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  [CASE_STATUS.CASSATION]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  [CASE_STATUS.CONCLUDED]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  [CASE_STATUS.ARCHIVED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export const CASE_STATUS_ICONS = {
  [CASE_STATUS.PREPARATION]: '📝',
  [CASE_STATUS.ACTIVE]: '⚖️',
  [CASE_STATUS.HEARING]: '🏛️',
  [CASE_STATUS.APPEAL]: '⬆️',
  [CASE_STATUS.CASSATION]: '⬆️⬆️',
  [CASE_STATUS.CONCLUDED]: '✅',
  [CASE_STATUS.ARCHIVED]: '📦',
};

export const CASE_STATUS_ORDER = [
  CASE_STATUS.PREPARATION,
  CASE_STATUS.ACTIVE,
  CASE_STATUS.HEARING,
  CASE_STATUS.APPEAL,
  CASE_STATUS.CASSATION,
  CASE_STATUS.CONCLUDED,
  CASE_STATUS.ARCHIVED,
];

export const CASE_STATUS_OPTIONS = Object.entries(CASE_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default {
  CASE_STATUS,
  CASE_STATUS_LABELS,
  CASE_STATUS_COLORS,
  CASE_STATUS_ICONS,
  CASE_STATUS_ORDER,
  CASE_STATUS_OPTIONS,
};