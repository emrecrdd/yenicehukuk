export const PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const PRIORITY_LABELS = {
  [PRIORITIES.LOW]: 'Düşük',
  [PRIORITIES.NORMAL]: 'Normal',
  [PRIORITIES.HIGH]: 'Yüksek',
  [PRIORITIES.CRITICAL]: 'Kritik',
};

export const PRIORITY_COLORS = {
  [PRIORITIES.LOW]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  [PRIORITIES.NORMAL]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [PRIORITIES.HIGH]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  [PRIORITIES.CRITICAL]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export const PRIORITY_ICONS = {
  [PRIORITIES.LOW]: '🟢',
  [PRIORITIES.NORMAL]: '🔵',
  [PRIORITIES.HIGH]: '🟠',
  [PRIORITIES.CRITICAL]: '🔴',
};

export const PRIORITY_ORDER = [
  PRIORITIES.CRITICAL,
  PRIORITIES.HIGH,
  PRIORITIES.NORMAL,
  PRIORITIES.LOW,
];

export const PRIORITY_OPTIONS = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const PRIORITY_BADGE_VARIANTS = {
  [PRIORITIES.LOW]: 'default',
  [PRIORITIES.NORMAL]: 'info',
  [PRIORITIES.HIGH]: 'warning',
  [PRIORITIES.CRITICAL]: 'danger',
};

export default {
  PRIORITIES,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  PRIORITY_ICONS,
  PRIORITY_ORDER,
  PRIORITY_OPTIONS,
  PRIORITY_BADGE_VARIANTS,
};