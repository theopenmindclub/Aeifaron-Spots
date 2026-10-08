import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BADGE_TRANSLATIONS } from '../i18n/translations';
import { getGamificationBadge, AppNotification } from '../types';
import { 
  Compass, 
  MapPin, 
  Users, 
  Menu, 
  X,
  BookOpen,
  Bell,
  Heart,
  MessageSquare,
  Sparkles,
  CheckCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp
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
    setSelectedMemberProfile,
    setSelectedSpot,
    favoriteSpotIds,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'comments' | 'favorites'>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === 'comments') {
      return n.type === 'comment_on_shared_spot' || n.type === 'reply_on_comment';
    }
    if (notifFilter === 'favorites') {
      return n.type === 'favorite_spot_updated' || favoriteSpotIds.includes(n.spotId);
    }
    return true;
  });

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    const targetSpot = spots.find((s) => s.id === notif.spotId);
    if (targetSpot) {
      setSelectedSpot(targetSpot);
    }
    setNotifOpen(false);
    setMobileMenuOpen(false);
  };

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

            {/* Hamburger Menu Button (Desktop) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open menu"
              className="relative w-11 h-11 rounded-xl bg-[#6B8E7B] hover:bg-[#B7C9B1] text-[#F1E9D2] hover:text-[#243B35] border border-[#B7C9B1] flex items-center justify-center shadow-md transition-colors cursor-pointer shrink-0"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              {unreadNotificationsCount > 0 && !mobileMenuOpen && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-4.5 px-1 rounded-full bg-[#FF6B54] text-white text-[10px] font-black flex items-center justify-center shadow-md ring-2 ring-[#243B35]">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile & Tablet Action Bar: "+" Button & Hamburger Menu (No Bell in Navigation Bar) */}
          <div className="flex items-center gap-2 lg:hidden shrink-0 ml-auto">
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
              className="relative w-11 h-11 rounded-xl bg-[#6B8E7B] hover:bg-[#B7C9B1] text-[#F1E9D2] hover:text-[#243B35] border border-[#B7C9B1] flex items-center justify-center shadow-md transition-colors cursor-pointer shrink-0"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              {unreadNotificationsCount > 0 && !mobileMenuOpen && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-4.5 px-1 rounded-full bg-[#FF6B54] text-white text-[10px] font-black flex items-center justify-center shadow-md ring-2 ring-[#243B35]">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Hamburger Menu Dropdown (Contains Navigation Links, Κέντρο Ειδοποιήσεων 🔔, and Member Profile) */}
      {mobileMenuOpen && (
        <div className="border-t border-[#6B8E7B] bg-[#243B35] text-[#F1E9D2] px-4 pt-3 pb-6 space-y-3 shadow-2xl">
          <div className="max-w-7xl mx-auto space-y-3">
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

              {/* Κέντρο Ειδοποιήσεων (καμπανάκι 🔔) inside Hamburger Menu */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setNotifOpen((prev) => !prev)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all cursor-pointer border ${
                    notifOpen
                      ? 'bg-[#1b2d28] text-[#CDFF9B] border-[#CDFF9B]'
                      : 'bg-[#1b2d28]/80 text-[#F1E9D2] border-[#6B8E7B] hover:bg-[#6B8E7B]/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <Bell className="w-5 h-5 text-[#CDFF9B]" />
                    </div>
                    <span>🔔 {language === 'el' ? 'Κέντρο Ειδοποιήσεων' : 'Notification Center'}</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#FF6B54] text-white text-xs font-black shadow-sm">
                        {unreadNotificationsCount} {language === 'el' ? 'νέες' : 'new'}
                      </span>
                    )}
                  </div>
                  {notifOpen ? <ChevronUp className="w-5 h-5 text-[#CDFF9B]" /> : <ChevronDown className="w-5 h-5 text-[#B7C9B1]" />}
                </button>

                {/* Expanded Notification Center Panel inside Hamburger Menu */}
                {notifOpen && (
                  <div className="mt-2 rounded-2xl bg-[#1b2d28] text-[#F1E9D2] border-2 border-[#6B8E7B] shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 bg-[#243B35] border-b border-[#6B8E7B] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#CDFF9B]" />
                        <span className="text-xs font-bold text-[#B7C9B1]">
                          {language === 'el'
                            ? `Αγαπημένα Spots (${favoriteSpotIds.length}) & Σχόλια Μελών`
                            : `Favorite Spots (${favoriteSpotIds.length}) & Member Comments`}
                        </span>
                      </div>

                      {unreadNotificationsCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllNotificationsAsRead}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#6B8E7B]/40 hover:bg-[#6B8E7B] text-[#CDFF9B] hover:text-[#F1E9D2] text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>{language === 'el' ? 'Όλα αναγνωσμένα' : 'Mark all read'}</span>
                        </button>
                      )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="px-3 py-2 bg-[#20342E] border-b border-[#6B8E7B]/50 flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setNotifFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          notifFilter === 'all'
                            ? 'bg-[#6B8E7B] text-[#F1E9D2]'
                            : 'text-[#B7C9B1] hover:bg-[#6B8E7B]/25'
                        }`}
                      >
                        {language === 'el' ? 'Όλες' : 'All'} ({notifications.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotifFilter('comments')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          notifFilter === 'comments'
                            ? 'bg-[#6B8E7B] text-[#F1E9D2]'
                            : 'text-[#B7C9B1] hover:bg-[#6B8E7B]/25'
                        }`}
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>{language === 'el' ? 'Σχόλια στα Spots μου' : 'Comments on my Spots'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotifFilter('favorites')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          notifFilter === 'favorites'
                            ? 'bg-[#6B8E7B] text-[#F1E9D2]'
                            : 'text-[#B7C9B1] hover:bg-[#6B8E7B]/25'
                        }`}
                      >
                        <Heart className="w-3 h-3 text-[#FF6B54] fill-[#FF6B54]" />
                        <span>{language === 'el' ? 'Αγαπημένα' : 'Favorites'}</span>
                      </button>
                    </div>

                    {/* Notification Items */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-[#6B8E7B]/30">
                      {filteredNotifications.length === 0 ? (
                        <div className="p-6 text-center space-y-1.5">
                          <Bell className="w-7 h-7 text-[#B7C9B1]/50 mx-auto" />
                          <p className="text-xs font-bold text-[#F1E9D2]">
                            {language === 'el' ? 'Δεν υπάρχουν ειδοποιήσεις σε αυτή την κατηγορία.' : 'No notifications in this category.'}
                          </p>
                          <p className="text-[11px] text-[#B7C9B1]">
                            {language === 'el'
                              ? 'Πατήστε την καρδιά ❤️ σε όποιο Spot αγαπάτε για να ενημερώνεστε όταν ανανεώνεται!'
                              : 'Tap the heart ❤️ on any Spot to get notified when it is updated!'}
                          </p>
                        </div>
                      ) : (
                        filteredNotifications.map((notif) => {
                          const isComment = notif.type === 'comment_on_shared_spot' || notif.type === 'reply_on_comment';
                          return (
                            <div
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                                !notif.read
                                  ? 'bg-[#28443C] hover:bg-[#315249]'
                                  : 'bg-[#1b2d28] hover:bg-[#243B35] opacity-85'
                              }`}
                            >
                              <div className="relative shrink-0">
                                <img
                                  src={notif.actorAvatar}
                                  alt={notif.actorName}
                                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-[#B7C9B1]"
                                />
                                <span
                                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-sm ${
                                    isComment ? 'bg-[#A44A3F] text-white' : 'bg-[#087F5B] text-white'
                                  }`}
                                >
                                  {isComment ? <MessageSquare className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                                </span>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider mb-1 ${
                                      isComment
                                        ? 'bg-[#6B2F2F] text-[#F4D6C6] border border-[#D88C72]/50'
                                        : 'bg-[#087F5B] text-white'
                                    }`}
                                  >
                                    {isComment
                                      ? language === 'el'
                                        ? '💬 Σχόλιο σε Spot σας'
                                        : '💬 Comment on your Spot'
                                      : language === 'el'
                                      ? '❤️ Ενημέρωση Αγαπημένου Spot'
                                      : '❤️ Favorite Spot Updated'}
                                  </span>
                                  <span className="text-[10px] text-[#B7C9B1] shrink-0 font-semibold">
                                    {notif.createdAt}
                                  </span>
                                </div>

                                <p className="text-xs font-bold text-[#F1E9D2] leading-snug">
                                  {language === 'el' ? notif.messageEl : notif.messageEn}
                                </p>

                                {notif.snippet && (
                                  <p className="mt-1 text-[11px] text-[#CDFF9B] bg-[#15231F] px-2.5 py-1.5 rounded-lg border border-[#6B8E7B]/40 line-clamp-2 italic">
                                    "{notif.snippet}"
                                  </p>
                                )}

                                <div className="mt-1.5 flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-[#B7C9B1] flex items-center gap-1">
                                    <ExternalLink className="w-3 h-3" />
                                    <span>{language === 'el' ? 'Άνοιγμα Καρτέλας Spot' : 'Open Spot Card'}</span>
                                  </span>
                                  {!notif.read && (
                                    <span className="w-2 h-2 rounded-full bg-[#FF6B54]" title="Unread" />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
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
        </div>
      )}
    </header>
  );
};
