import React from 'react';
import Button from '../ui/Button.jsx';

const Empty = ({
  title = 'Veri bulunamadı',
  description = 'Henüz kayıt eklenmemiş',
  icon = '📭',
  action,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default Empty;