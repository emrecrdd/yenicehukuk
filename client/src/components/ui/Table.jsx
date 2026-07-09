const Table = ({ children, className = '', ...props }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

Table.Head = ({ children, className = '' }) => (
  <thead className={`bg-gray-50 dark:bg-gray-800 ${className}`}>
    {children}
  </thead>
);

Table.Body = ({ children, className = '' }) => (
  <tbody className={`bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>
    {children}
  </tbody>
);

Table.Row = ({ children, className = '', hover = true, ...props }) => (
  <tr
    className={`
      ${hover ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : ''}
      ${className}
    `}
    {...props}
  >
    {children}
  </tr>
);

Table.HeadCell = ({ children, className = '' }) => (
  <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

Table.Cell = ({ children, className = '' }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 ${className}`}>
    {children}
  </td>
);

export default Table;