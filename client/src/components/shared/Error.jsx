import React from 'react';
import Button from '../ui/Button.jsx';

const Error = ({
  title = 'Bir Hata Oluştu',
  message = 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
  error = null,
  onRetry,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-lg font-medium text-red-600 dark:text-red-400">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
      {error && env.IS_DEV && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
          <p className="text-xs font-mono text-red-600 dark:text-red-400">
            {typeof error === 'string' ? error : error.message || JSON.stringify(error)}
          </p>
        </div>
      )}
      {onRetry && (
        <Button
          onClick={onRetry}
          className="mt-4"
          variant="primary"
        >
          Tekrar Dene
        </Button>
      )}
    </div>
  );
};

export default Error;