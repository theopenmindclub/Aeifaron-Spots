import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BADGE_TRANSLATIONS } from '../i18n/translations';
import { getGamificationBadge } from '../types';
import { 
  Compass, 
  MapPin, 
  Users, 
  Menu, 
  X,
  BookOpen
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    language, 
    t, 
    currentUser, 
    spots,
    activeView, 
    setActiveView, 
    setIsCreateModalOpen,
    setIsAuthModalOpen,
    setIsAiSearchModalOpen,
    setSelectedMemberProfile
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userApprovedSpotsCount = Math.max(
    currentUser.spotsSubmittedCount || 0,
    spots.filter((s) => s.authorId === currentUser.id).length
  );
  const earnedBadge = getGamificationBadge(userApprovedSpotsCount);
  const badgeConfig = BADGE_TRANSLATIONS[earnedBadge] || BADGE_TRANSLATIONS['ΕΝΕΡΓΟΠΟΙΗΘΗΚΑ ΠΑΙΔΙΑ'];

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-[#6B8E7B] bg-[#243B35] text-[#F1E9D2] shadow-lg transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          
          {/* Logo: Uploaded Pin Image + "AEIFARON SPOTS" + "Ψαγμένες Προτάσεις" */}
          <div 
            onClick={() => setActiveView('explore')}
            className="flex items-center gap-3 cursor-pointer group min-w-0 shrink-0"
          >
            <img
              src="/aeifaron-pin-logo.svg"
              alt="Aeifaron Pin Logo"
              className="w-11 h-12 sm:w-12 sm:h-13 rounded-xl object-contain bg-[#F1E9D2] p-0.5 shadow-md border border-[#B7C9B1] shrink-0 group-hover:scale-105 transition-transform"
            />

            <div className="min-w-0">
              <div className="flex items-center">
                <span className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[#F1E9D2] leading-none truncate">
                  AEIFARON SPOTS
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[#B7C9B1] mt-0.5 truncate">
                {language === 'el' ? 'Ψαγμένες Προτάσεις' : 'Curated Recommendations'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation (Same ordered items) */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={() => setActiveView('onboarding')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeView === 'onboarding'
                  ? 'bg-[#6B8E7B] text-[#F1E9D2] shadow-sm border border-[#B7C9B1]/50'
                  : 'text-[#B7C9B1] hover:bg-[#6B8E7B]/30 hover:text-[#F1E9D2]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{language === 'el' ? 'Onboarding / Οδηγός' : 'Onboarding Guide'}</span>
            </button>

            <button
              onClick={() => setActiveView('community')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeView === 'community'
                  ? 'bg-[#6B8E7B] text-[#F1E9D2] shadow-sm border border-[#B7C9B1]/50'
                  : 'text-[#B7C9B1] hover:bg-[#6B8E7B]/30 hover:text-[#F1E9D2]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{language === 'el' ? 'Κοινότητα/Μέλη' : 'Community/Members'}</span>
            </button>

            <button
              onClick={() => setActiveView('map')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeView === 'map'
                  ? 'bg-[#6B8E7B] text-[#F1E9D2] shadow-sm border border-[#B7C9B1]/50'
                  : 'text-[#B7C9B1] hover:bg-[#6B8E7B]/30 hover:text-[#F1E9D2]'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>{language === 'el' ? 'Χάρτης των Spots' : 'Map of Spots'}</span>
            </button>

            <button
              onClick={() => {
                setActiveView('explore');
                setIsAiSearchModalOpen(true);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeView === 'explore'
                  ? 'bg-[#6B8E7B] text-[#F1E9D2] shadow-sm border border-[#B7C9B1]/50'
                  : 'text-[#B7C9B1] hover:bg-[#6B8E7B]/30 hover:text-[#F1E9D2]'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{language === 'el' ? 'Εξερεύνηση για Spots' : 'Explore for Spots'}</span>
            </button>
          </nav>

          {/* Right Action Controls (Desktop) */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            
            {/* "+" Add Spot Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6] border border-[#D88C72]/60 text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              title={t.navAddSpot}
            >
              <span className="font-heading text-lg font-black leading-none">+</span>
              <span>Food Spot</span>
            </button>

            {/* User Profile Pill */}
            <button
              onClick={() => {
                setSelectedMemberProfile(null);
                setIsAuthModalOpen(true);
              }}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-[#1b2d28] hover:bg-[#6B8E7B]/40 border border-[#6B8E7B] transition-all cursor-pointer group text-left"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.firstName}
                className="w-9 h-9 rounded-lg object-cover ring-2 ring-[#B7C9B1]"
              />
              <div className="hidden xl:block">
                <div className="font-heading text-sm font-bold text-[#F1E9D2] leading-tight">
                  {currentUser.firstName} {currentUser.lastName[0]}.
                </div>
                <div className="text-[11px] font-bold text-[#CDFF9B]">
                  {language === 'el' ? badgeConfig.el : badgeConfig.en}
                </div>
              </div>
            </button>
          </div>

          {/* Mobile & Tablet Action Bar: "+" Button as is & Properly Positioned Hamburger Menu */}
          <div className="flex items-center gap-2.5 lg:hidden shrink-0 ml-auto">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              aria-label="Add Food Spot"
              className="w-11 h-11 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-heading text-2xl font-bold flex items-center justify-center shadow-md cursor-pointer shrink-0"
            >
              +
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open navigation menu"
              className="w-11 h-11 rounded-xl bg-[#6B8E7B] hover:bg-[#B7C9B1] text-[#F1E9D2] hover:text-[#243B35] border border-[#B7C9B1] flex items-center justify-center shadow-md transition-colors cursor-pointer shrink-0"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Hamburger Menu Dropdown (Ordered: 1. Onboarding/Οδηγός, 2. Κοινότητα/Μέλη, 3. Χάρτης των Spots, 4. Εξερεύνηση για Spots) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#6B8E7B] bg-[#243B35] text-[#F1E9D2] px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => { setActiveView('onboarding'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold cursor-pointer ${
                activeView === 'onboarding' ? 'bg-[#6B8E7B] text-[#F1E9D2]' : 'text-[#B7C9B1] hover:bg-[#6B8E7B]/30'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>{language === 'el' ? 'Onboarding / Οδηγός' : 'Onboarding Guide'}</span>
            </button>

            <button
              onClick={() => { setActiveView('community'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold cursor-pointer ${
                activeView === 'community' ? 'bg-[#6B8E7B] text-[#F1E9D2]' : 'text-[#B7C9B1] hover:bg-[#6B8E7B]/30'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>{language === 'el' ? 'Κοινότητα/Μέλη' : 'Community/Members'}</span>
            </button>

            <button
              onClick={() => { setActiveView('map'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold cursor-pointer ${
                activeView === 'map' ? 'bg-[#6B8E7B] text-[#F1E9D2]' : 'text-[#B7C9B1] hover:bg-[#6B8E7B]/30'
              }`}
            >
              <MapPin className="w-5 h-5" />
              <span>{language === 'el' ? 'Χάρτης των Spots' : 'Map of Spots'}</span>
            </button>

            <button
              onClick={() => {
                setActiveView('explore');
                setMobileMenuOpen(false);
                setIsAiSearchModalOpen(true);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold cursor-pointer ${
                activeView === 'explore' ? 'bg-[#6B8E7B] text-[#F1E9D2]' : 'text-[#B7C9B1] hover:bg-[#6B8E7B]/30'
              }`}
            >
              <Compass className="w-5 h-5" />
              <span>{language === 'el' ? 'Εξερεύνηση για Spots' : 'Explore for Spots'}</span>
            </button>
          </div>

          <div className="pt-3 border-t border-[#6B8E7B]">
            <button
              onClick={() => {
                setSelectedMemberProfile(null);
                setIsAuthModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-[#CDFF9B] bg-[#1b2d28] px-4 py-3 rounded-xl border border-[#6B8E7B] hover:bg-[#6B8E7B]/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img src={currentUser.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover ring-1 ring-[#CDFF9B] shrink-0" />
                <span className="truncate">{currentUser.firstName} ({language === 'el' ? badgeConfig.el : badgeConfig.en})</span>
              </div>
              <span className="text-[11px] font-extrabold text-[#F1E9D2] bg-[#6B8E7B] px-2.5 py-1 rounded-lg shrink-0">
                Προφίλ
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
