import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

export const formatDate = (date, format = 'DD MMMM YYYY') => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

export const formatDateTime = (date, format = 'DD MMMM YYYY HH:mm') => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

export const formatRelativeTime = (date) => {
  if (!date) return '-';
  const now = dayjs();
  const diff = now.diff(date, 'minute');

  if (diff < 1) return 'Az önce';
  if (diff < 60) return `${diff} dakika önce`;
  if (diff < 1440) return `${Math.floor(diff / 60)} saat önce`;
  if (diff < 4320) return `${Math.floor(diff / 1440)} gün önce`;
  return formatDate(date);
};

export const isToday = (date) => {
  if (!date) return false;
  return dayjs(date).isSame(dayjs(), 'day');
};

export const isTomorrow = (date) => {
  if (!date) return false;
  return dayjs(date).isSame(dayjs().add(1, 'day'), 'day');
};

export const isOverdue = (date) => {
  if (!date) return false;
  return dayjs(date).isBefore(dayjs(), 'day');
};