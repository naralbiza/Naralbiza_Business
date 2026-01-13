
import React from 'react';
import { CloseIcon } from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/**
 * A modal dialog component that overlays the page.
 * It's used for forms like 'New Lead'.
 * @param isOpen - Controls the visibility of the modal.
 * @param onClose - Function to call when the modal should be closed.
 * @param title - The title displayed in the modal header.
 * @param children - The content of the modal.
 */
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-auto flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-gray-200 shrink-0 bg-white">
          <h3 className="text-xl font-semibold text-brand-dark">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-brand-dark transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
