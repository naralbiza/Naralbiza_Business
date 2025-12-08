
import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

/**
 * A reusable card component for displaying content in a structured block.
 * @param title - Optional title for the card header.
 * @param children - The content to be displayed inside the card.
 * @param className - Additional CSS classes for the card container.
 * @param titleClassName - Additional CSS classes for the card title.
 */
export const Card: React.FC<CardProps> = ({ title, children, className = '', titleClassName = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md border border-gray-200/80 overflow-hidden ${className}`}>
      {title && (
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h3 className={`text-lg font-semibold text-brand-dark ${titleClassName}`}>{title}</h3>
        </div>
      )}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};
