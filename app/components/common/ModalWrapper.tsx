import { useEffect } from 'react';

interface ModalWrapperProps {
  children: React.ReactNode;
  onClose: () => void;
}

export default function ModalWrapper({ children, onClose }: ModalWrapperProps) {
  useEffect(() => {
    // Lock scroll
    document.body.style.overflow = 'hidden';
    
    // Cleanup
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-40"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-25" />
      {children}
    </div>
  );
} 