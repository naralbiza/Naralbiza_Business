
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
    <div className={`bg-white rounded-[32px] shadow-sm border-2 border-black/5 overflow-hidden transition-all hover:shadow-xl ${className}`}>
      {title && (
        <div className="px-8 py-6 border-b border-black/5">
          <h3 className={`text-sm font-black text-black uppercase tracking-widest ${titleClassName}`}>{title}</h3>
        </div>
      )}
      <div className="p-8">
        {children}
      </div>
    </div>
  );
};
