const AdminCard = ({ children, className = '', onClick, ...rest }) => {
  return (
    <div
      className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm overflow-hidden ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  );
};

export default AdminCard;
