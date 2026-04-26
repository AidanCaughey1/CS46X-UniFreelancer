import React, { useEffect } from 'react';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

function AlertModal({ isOpen, onClose, title = "Alert", message, type = "error", onConfirm }) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-dark/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md transform overflow-hidden rounded-[32px] bg-white p-8 text-center shadow-xl transition-all">
        <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${type === 'success' ? 'bg-success/10' : type === 'confirm' ? 'bg-accent/10' : 'bg-error/10'}`}>
          {type === 'success' ? (
            <FiCheckCircle className="h-8 w-8 text-success" />
          ) : type === 'confirm' ? (
            <FiAlertCircle className="h-8 w-8 text-accent" />
          ) : (
            <FiAlertCircle className="h-8 w-8 text-error" />
          )}
        </div>
        
        <h3 className="mb-2 text-2xl font-bold text-dark">{title}</h3>
        <p className="mb-8 text-sm leading-relaxed text-dark-secondary whitespace-pre-wrap">{message}</p>
        
        {type === 'confirm' ? (
          <div className="flex gap-4">
            <button
              type="button"
              className="inline-flex w-full items-center justify-center rounded-full bg-light-tertiary px-6 py-3.5 text-sm font-bold text-dark shadow-sm transition hover:-translate-y-0.5 hover:bg-border"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex w-full items-center justify-center rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-accent-tertiary hover:shadow-md"
              onClick={onConfirm}
            >
              Confirm
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="inline-flex w-full items-center justify-center rounded-full bg-dark px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-dark-secondary hover:shadow-md"
            onClick={onClose}
          >
            Got it
          </button>
        )}
      </div>
    </div>
  );
}

export default AlertModal;
