import React from 'react';

const Loader = ({
  size = 'md',
  color = 'primary',
  fullScreen = false,
  text = 'Yükleniyor...',
  className = '',
}) => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  const colors = {
    primary: 'border-blue-600',
    secondary: 'border-gray-600',
    success: 'border-green-600',
    danger: 'border-red-600',
    warning: 'border-yellow-600',
    white: 'border-white',
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-4 border-t-transparent ${sizes[size]} ${colors[color]}`}
      />
      {text && <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Loader;