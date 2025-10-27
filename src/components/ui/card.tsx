import React from "react";

interface CardProps {
  title?: string;
  value?: string | number;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, value, icon, className = "", children }) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow-md p-5 flex flex-col gap-3 border border-gray-100 hover:shadow-lg transition-shadow duration-200 ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-gray-700 text-sm font-medium">{title}</h3>
          {icon && <div className="text-gray-500">{icon}</div>}
        </div>
      )}

      {value !== undefined && (
        <p className="text-3xl font-semibold text-gray-800">{value}</p>
      )}

      {children && <div className="text-sm text-gray-600">{children}</div>}
    </div>
  );
};

export default Card;
