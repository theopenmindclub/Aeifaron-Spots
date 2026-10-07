import React from 'react';
import { 
  X, 
  MapPin, 
  Camera, 
  Smartphone, 
  Monitor, 
  ExternalLink, 
  CheckCircle2, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StreetViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  spotName?: string;
}

export const StreetViewModal: React.FC<StreetViewModalProps> = ({ isOpen, onClose, spotName }) => {
  if (!isOpen) return null;

  const mapsSearchUrl = spotName 
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spotName)}`
    : 'https://www.google.com/maps';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-stone-900 dark:text-stone-100">
                  Δεν έχετε δική σας φωτογραφία;
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Πώς να βγάλετε Screenshot από το Google Maps Street View
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 shadow-xs cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="overflow-y-auto p-6 space-y-6 text-sm text-stone-700 dark:text-stone-300">
            
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed text-amber-950 dark:text-amber-200 font-medium">
                Αν δεν έχετε τραβήξει δική σας φωτογραφία από το σημείο (π.χ. μαγαζί, παραλία, διαδρομή), μπορείτε πανεύκολα να χρησιμοποιήσετε ένα στιγμιότυπο (screenshot) από το <strong>Google Maps Street View</strong>!
              </p>
            </div>

            {/* Step-by-step instructions */}
            <div className="space-y-4">
              
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                    Βρείτε την τοποθεσία στο Google Maps
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Ανοίξτε το Google Maps και αναζητήστε το όνομα του σημείου ή τη διεύθυνση.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                    Ενεργοποιήστε το Street View ή τις Φωτογραφίες
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Πατήστε το ανθρωπάκι του Street View (ή την προεπισκόπηση 360°) ώστε να δείτε την πρόσοψη του μαγαζιού ή τη θέα του σημείου καθαρά.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                    Βγάλτε Στιγμιότυπο Οθόνης (Screenshot)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
                      <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-stone-100 mb-1">
                        <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                        <span>Σε Κινητό (Android / iPhone)</span>
                      </div>
                      <p className="text-stone-600 dark:text-stone-300">
                        Πατήστε ταυτόχρονα το <strong>Κουμπί Ενεργοποίησης (Power)</strong> και το <strong>Κουμπί Μείωσης Έντασης (Volume Down)</strong>.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
                      <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-stone-100 mb-1">
                        <Monitor className="w-3.5 h-3.5 text-amber-600" />
                        <span>Σε Υπολογιστή (PC / Mac)</span>
                      </div>
                      <p className="text-stone-600 dark:text-stone-300">
                        Σε Windows: <strong>Win + Shift + S</strong>.<br />
                        Σε Mac: <strong>Cmd + Shift + 4</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                    Επιλέξτε ή επικολλήστε τη φωτογραφία
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Αποθηκεύστε την εικόνα ή χρησιμοποιήστε το link της για την κάλυψη της κάρτας σας!
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Modal Actions */}
          <div className="p-5 border-t border-stone-100 dark:border-slate-800 bg-stone-50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <a
              href={mapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 text-xs font-bold transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Άνοιγμα Google Maps τώρα</span>
            </a>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              Το κατάλαβα, ευχαριστώ!
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
