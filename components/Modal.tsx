import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  headerColorClass?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  headerColorClass = "bg-blue-800" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4 transition-all duration-300">
      <div className="bg-white w-full md:rounded-xl md:max-w-md overflow-hidden rounded-t-2xl shadow-2xl animate-[slideInBottom_0.3s_ease-out] md:animate-[zoomIn_0.2s_ease-out] flex flex-col max-h-[90vh]">
        <div className={`${headerColorClass} text-white p-4 flex justify-between items-center shrink-0 shadow-md`}>
          <h3 className="font-bold text-lg flex items-center gap-2">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 bg-gray-50 flex-grow overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};