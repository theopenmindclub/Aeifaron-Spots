import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ImageLightbox: React.FC = () => {
  const { lightboxUrl, setLightboxUrl } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxUrl(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setLightboxUrl]);

  if (!lightboxUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setLightboxUrl(null)}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 cursor-zoom-out"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLightboxUrl(null);
          }}
          className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          aria-label="Close lightbox"
        >
          <X className="w-6 h-6" />
        </button>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl bg-black"
        >
          <img
            src={lightboxUrl}
            alt="Hit Spot High Resolution"
            className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
