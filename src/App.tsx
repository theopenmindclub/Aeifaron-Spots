import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { SpotCard } from './components/SpotCard';
import { MapView } from './components/MapView';
import { CommunityView } from './components/CommunityView';
import { OnboardingView } from './components/OnboardingView';
import { SpotDetailModal } from './components/SpotDetailModal';
import { CreateSpotModal } from './components/CreateSpotModal';
import { AuthModal } from './components/AuthModal';
import { DirectChatModal } from './components/DirectChatModal';
import { AiSearchModal } from './components/AiSearchModal';
import { ImageLightbox } from './components/ImageLightbox';
import { Toast } from './components/Toast';
import { 
  ShieldCheck, 
  Award, 
  Compass,
  X,
  Sparkles,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MainContent: React.FC = () => {
  const { 
    activeView, 
    spots, 
    language, 
    t, 
    searchQuery, 
    selectedMacroGroup,
    selectedCategory, 
    selectedRegion, 
    sortBy, 
    secretGemsOnly,
    setIsCreateModalOpen 
  } = useApp();

  const [isAboutUsOpen, setIsAboutUsOpen] = React.useState(false);

  // Filter & Sort Spots
  const filteredSpots = spots.filter((spot) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = spot.title.toLowerCase().includes(q) || (spot.titleEl && spot.titleEl.toLowerCase().includes(q));
      const matchSpecial = spot.whyIsItSpecial.toLowerCase().includes(q) || (spot.whyIsItSpecialEl && spot.whyIsItSpecialEl.toLowerCase().includes(q));
      const matchAddress = spot.address.toLowerCase().includes(q);
      const matchRegion = spot.region.toLowerCase().includes(q);
      const matchDishes = spot.signatureDishes.some(d => d.toLowerCase().includes(q)) || 
        (spot.signatureDishesEl && spot.signatureDishesEl.some(d => d.toLowerCase().includes(q)));
      
      if (!matchTitle && !matchSpecial && !matchAddress && !matchRegion && !matchDishes) return false;
    }

    if (selectedMacroGroup !== 'ALL') {
      const hasTag = spot.tags?.includes(selectedMacroGroup);
      if (!hasTag) {
        if (selectedMacroGroup === 'ΠΡΩΙΝΑ/BRUNCH') {
          if (!['Artisan Coffee & Brunch', 'Bougatsa & Pastry', 'Traditional Bakery'].includes(spot.category)) {
            return false;
          }
        } else if (selectedMacroGroup === 'ΦΑΓΗΤΟ/FOOD') {
          if (!['Authentic Souvlaki', 'Hidden Mountain Taverna', 'Seafood & Psarotaverna', 'Mezedopoleio', 'Modern Greek', 'Street Food Hit'].includes(spot.category)) {
            return false;
          }
        } else if (selectedMacroGroup === 'ΓΛΥΚΑ/DESERTS') {
          if (!['Gelato', 'Bougatsa & Pastry'].includes(spot.category)) {
            return false;
          }
        } else if (selectedMacroGroup === 'ΦΟΥΡΝΟΙ/PIES') {
          if (!['Traditional Bakery', 'Bougatsa & Pastry'].includes(spot.category)) {
            return false;
          }
        } else if (selectedMacroGroup === 'ΚΑΦΕΣ/COFFEE') {
          if (!['Artisan Coffee & Brunch'].includes(spot.category)) {
            return false;
          }
        }
      }
    }

    if (selectedCategory !== 'ALL' && spot.category !== selectedCategory) {
      return false;
    }

    if (selectedRegion !== 'ALL' && spot.region !== selectedRegion) {
      return false;
    }

    if (secretGemsOnly && spot.rating < 4.85) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'highest-rated') {
      return b.rating - a.rating;
    }
    if (sortBy === 'reviews') {
      return b.reviewsCount - a.reviewsCount;
    }
    if (sortBy === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F1E9D2] dark:bg-[#243B35] text-[#243B35] dark:text-[#F1E9D2] font-sans selection:bg-[#5E0000] selection:text-[#CDFF9B] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-[#F1E9D2] via-[#B7C9B1]/45 to-[#F1E9D2] dark:from-[#243B35] dark:via-[#1b2d28] dark:to-[#243B35]">
        <AnimatePresence mode="wait">
          {activeView === 'explore' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <HeroBanner />

              {/* Spots Grid Section housed in the [#243B35 #6B8E7B #B7C9B1 #F1E9D2] background area */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {filteredSpots.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredSpots.map((spot) => (
                      <SpotCard key={spot.id} spot={spot} />
                    ))}
                  </div>
                ) : (
                  <div className="py-16 px-6 rounded-3xl bg-[#B7C9B1]/60 dark:bg-[#1b2d28] border-2 border-[#6B8E7B] text-center max-w-md mx-auto space-y-4 shadow-md">
                    <div className="w-16 h-16 rounded-3xl bg-[#243B35] text-[#CDFF9B] mx-auto flex items-center justify-center">
                      <Compass className="w-8 h-8" />
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-[#243B35] dark:text-[#F1E9D2]">
                      {t.noSpotsFound}
                    </h3>
                    <p className="text-sm text-[#243B35]/80 dark:text-[#B7C9B1] leading-relaxed font-medium">
                      {language === 'el'
                        ? 'Δεν βρέθηκαν σημεία με αυτά τα κριτήρια αναζήτησης. Δοκιμάστε να καθαρίσετε τα φίλτρα ή προσθέστε το δικό σας Food Spot!'
                        : 'No spots match your criteria. Try loosening your filters or contribute this missing culinary gem!'}
                    </p>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-[#302B4D] text-[#E8E4F3] text-xs font-extrabold shadow-md cursor-pointer hover:bg-[#625B8C] transition-colors"
                    >
                      {language === 'el' ? '+ Προσθήκη Νέου Food Spot' : '+ Add New Food Spot'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeView === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MapView />
            </motion.div>
          )}

          {activeView === 'community' && (
            <motion.div
              key="community"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CommunityView />
            </motion.div>
          )}

          {activeView === 'onboarding' && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <OnboardingView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Modals & Lightbox */}
      <SpotDetailModal />
      <CreateSpotModal />
      <AuthModal />
      <DirectChatModal />
      <AiSearchModal />
      <ImageLightbox />
      <Toast />

      {/* Application Footer using [#243B35 #6B8E7B #B7C9B1 #F1E9D2] palette */}
      <footer className="border-t-2 border-[#6B8E7B] bg-[#243B35] text-[#F1E9D2] py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/aeifaron-pin-logo.svg"
                alt="Aeifaron Pin Logo"
                className="w-11 h-12 rounded-xl object-contain bg-[#F1E9D2] p-0.5 shadow-md border border-[#B7C9B1]"
              />
              <div>
                <span className="font-heading text-xl font-bold text-[#F1E9D2]">
                  AEIFARON SPOTS
                </span>
                <p className="text-xs font-semibold text-[#B7C9B1]">
                  {language === 'el' ? 'Ψαγμένες Προτάσεις' : 'Curated Recommendations'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-[#B7C9B1]">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6B8E7B]/30 border border-[#6B8E7B] text-[#F1E9D2]">
                <ShieldCheck className="w-4 h-4 text-[#CDFF9B]" />
                <span>{language === 'el' ? 'Βασισμένο σε αληθινές εμπειρίες' : 'Based on real experiences'}</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6B8E7B]/30 border border-[#6B8E7B] text-[#F1E9D2]">
                <Award className="w-4 h-4 text-[#CDFF9B]" />
                <span>{language === 'el' ? 'Επιβεβαιωμένες Εμπειρίες' : 'Verified Experiences'}</span>
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-[#6B8E7B]/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#B7C9B1]">
            <div className="flex flex-wrap items-center gap-2 font-semibold">
              <span>© 2006-2026 Aeifaron Spots •</span>
              <button
                type="button"
                onClick={() => setIsAboutUsOpen(true)}
                className="font-heading text-sm font-extrabold text-[#CDFF9B] hover:text-[#F1E9D2] underline underline-offset-4 cursor-pointer transition-colors"
              >
                {language === 'el' ? 'Για εμάς' : 'About Us'}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* "Για εμάς" Story Modal — Mobile-Responsive with Scrollable Body & Sticky Header/Footer */}
      <AnimatePresence>
        {isAboutUsOpen && (
          <div
            onClick={() => setIsAboutUsOpen(false)}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl max-h-[88vh] flex flex-col rounded-2xl sm:rounded-3xl bg-[#F1E9D2] dark:bg-[#243B35] border-2 border-[#6B8E7B] shadow-2xl overflow-hidden text-[#243B35] dark:text-[#F1E9D2] my-auto"
            >
              {/* Modal Header */}
              <div className="shrink-0 flex items-center justify-between gap-2.5 px-4 sm:px-6 py-3.5 sm:py-5 bg-[#243B35] text-[#F1E9D2] border-b-2 border-[#6B8E7B]">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <img
                    src="/aeifaron-pin-logo.svg"
                    alt="Aeifaron Pin Logo"
                    className="w-9 h-10 sm:w-10 sm:h-11 rounded-xl object-contain bg-[#F1E9D2] p-0.5 border border-[#B7C9B1] shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-heading text-base sm:text-2xl font-bold text-[#F1E9D2] leading-snug">
                      {language === 'el' ? 'Για εμάς • Πώς γεννήθηκε το Aeifaron Spots' : 'About Us • How Aeifaron Spots Was Born'}
                    </h3>
                    <p className="text-[11px] sm:text-xs font-semibold text-[#B7C9B1] mt-0.5">
                      © 2006-2026 Aeifaron Spots
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAboutUsOpen(false)}
                  aria-label="Close modal"
                  className="p-2 rounded-xl bg-[#6B8E7B] hover:bg-[#B7C9B1] text-[#F1E9D2] hover:text-[#243B35] transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Modal Body */}
              <div className="overflow-y-auto p-4 sm:p-8 space-y-4 sm:space-y-5 flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6B2F2F] text-[#F4D6C6] text-[11px] sm:text-xs font-extrabold">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>{language === 'el' ? 'Η Ιστορία της Παρέας μας' : 'Our Community Story'}</span>
                </div>

                <div className="space-y-3.5 sm:space-y-4 text-sm sm:text-lg leading-relaxed font-medium text-[#243B35] dark:text-[#F1E9D2]">
                  <p>
                    Η ιδέα αυτής της εφαρμογής γεννήθηκε αυθόρμητα από μια ζεστή συζήτηση σε ένα <strong>κοινό πρωινό μελών του Αείφαρον</strong>.
                  </p>
                  <p>
                    Καθώς απολαμβάναμε την παρέα μας, αναφέρθηκε πού έφαγε ένα μέλος <strong>το καλύτερο παγωτό</strong>! Δεν άργησε η συζήτηση να γεμίσει με ενθουσιασμό, χαμόγελα και με ερωτήσεις τύπου:
                  </p>
                  <blockquote className="p-3.5 sm:p-4 rounded-2xl bg-[#6B2F2F] text-[#F4D6C6] font-heading text-lg sm:text-2xl font-bold text-center shadow-md border border-[#D88C72]">
                    «Πού είναι αυτό που είπες;» 🍨
                  </blockquote>
                  <p>
                    Κάθε μέλος άρχισε να μοιράζεται τα δικά του αγαπημένα, δοκιμασμένα στέκια — και κάπως έτσι γεννήθηκε το <strong>Aeifaron Spots</strong>, για να έχουμε όλοι στην Αειφαριώτικη οικογένεια τις καλύτερες επιλογές όπου κι αν βρεθούμε!
                  </p>
                </div>

                <div className="pt-3.5 sm:pt-4 border-t border-[#6B8E7B]/40 flex flex-wrap items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#6B2F2F] dark:text-[#F4D6C6]">
                    <Heart className="w-4 h-4 fill-current shrink-0" />
                    <span>Αειφαριώτικη Οικογένεια • 2006-2026</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAboutUsOpen(false)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#243B35] dark:bg-[#6B8E7B] hover:bg-[#6B8E7B] text-[#F1E9D2] font-heading text-sm font-bold cursor-pointer transition-colors text-center"
                  >
                    Κλείσιμο
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
