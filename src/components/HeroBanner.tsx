import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORY_TRANSLATIONS, REGION_TRANSLATIONS } from '../i18n/translations';
import { SpotCategory, GreekRegion, SearchMacroGroup, PublicChatMessage, getGamificationBadge, getGamificationInfo } from '../types';
import { 
  Search, 
  MapPin, 
  Award, 
  CheckCircle, 
  X,
  MessageSquare,
  Send,
  Trophy,
  CornerDownRight,
  ChevronDown
} from 'lucide-react';

const DROPDOWN_CATEGORIES: SpotCategory[] = [
  'Εκδρομές',
  'Μηχανάδες',
  'Authentic Souvlaki',
  'Hidden Mountain Taverna',
  'Seafood & Psarotaverna',
  'Bougatsa & Pastry',
  'Gelato',
  'Artisan Coffee & Brunch',
  'Mezedopoleio',
  'Modern Greek',
  'Traditional Bakery',
  'Street Food Hit'
];

const MACRO_GROUPS: { id: SearchMacroGroup; labelEl: string; labelEn: string; icon: string }[] = [
  { id: 'ΠΡΩΙΝΑ/BRUNCH', labelEl: 'ΠΡΩΙΝΑ/BRUNCH', labelEn: 'BREAKFAST/BRUNCH', icon: '🥐' },
  { id: 'ΦΑΓΗΤΟ/FOOD', labelEl: 'ΦΑΓΗΤΟ/FOOD', labelEn: 'FOOD/DINING', icon: '🍽️' },
  { id: 'ΓΛΥΚΑ/DESERTS', labelEl: 'ΓΛΥΚΑ/DESERTS', labelEn: 'SWEETS/DESSERTS', icon: '🍨' },
  { id: 'ΦΟΥΡΝΟΙ/PIES', labelEl: 'ΦΟΥΡΝΟΙ/PIES', labelEn: 'BAKERIES/PIES', icon: '🥖' },
  { id: 'ΚΑΦΕΣ/COFFEE', labelEl: 'ΚΑΦΕΣ/COFFEE', labelEn: 'COFFEE', icon: '☕' }
];

const REGIONS: GreekRegion[] = [
  'Athens & Attica',
  'Thessaloniki & North',
  'Chania & West Crete',
  'Heraklion & East Crete',
  'Cyclades (Naxos/Santorini/Paros)',
  'Ionian Islands (Corfu/Lefkada)',
  'Peloponnese (Mani/Nafplio)',
  'Dodecanese (Rhodes/Kos)',
  'Epirus & Zagori'
];

export const HeroBanner: React.FC = () => {
  const { 
    language, 
    t, 
    searchQuery, 
    setSearchQuery, 
    selectedMacroGroup,
    setSelectedMacroGroup,
    selectedCategory, 
    setSelectedCategory,
    selectedRegion,
    setSelectedRegion,
    secretGemsOnly,
    setSecretGemsOnly,
    spots,
    setSelectedSpot,
    currentUser,
    allUsers,
    reviews,
    publicChat,
    sendPublicChatMessage,
    setSelectedMemberProfile
  } = useApp();

  const [chatText, setChatText] = useState('');
  const [replyingToMsg, setReplyingToMsg] = useState<PublicChatMessage | null>(null);
  const [isSendingChat, setIsSendingChat] = useState(false);

  const activeFiltersCount = 
    (selectedCategory !== 'ALL' ? 1 : 0) + 
    (selectedMacroGroup !== 'ALL' ? 1 : 0) +
    (selectedRegion !== 'ALL' ? 1 : 0) + 
    (searchQuery.trim() !== '' ? 1 : 0) +
    (secretGemsOnly ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCategory('ALL');
    setSelectedMacroGroup('ALL');
    setSelectedRegion('ALL');
    setSearchQuery('');
    setSecretGemsOnly(false);
  };

  // Compute Leaderboard Ranking for the top of the Live Discussion section (matching ΜΕΛΗ & LEADERBOARD)
  const rankedMembers = allUsers
    .map((user) => {
      const userSpots = spots.filter((s) => s.authorId === user.id);
      const spotsCount = Math.max(user.spotsSubmittedCount || 0, userSpots.length);
      const badge = getGamificationBadge(spotsCount);
      const gamification = getGamificationInfo(spotsCount, user.reviewsCount || 0);
      const starsReceived = userSpots.reduce((acc, s) => acc + s.rating, 0);
      const votesReceived = userSpots.reduce((acc, s) => acc + (s.helpfulVotes || 0), 0);
      const commentsReceived = reviews.filter((r) => userSpots.some((s) => s.id === r.spotId)).length;
      const xp =
        spotsCount * 100 +
        Math.round(starsReceived * 10) +
        votesReceived * 15 +
        commentsReceived * 20 +
        (user.reviewsCount || 0) * 20;
      return { ...user, spotsCount, badge, gamification, xp };
    })
    .sort((a, b) => b.xp - a.xp);

  // Organize threaded messages: Root messages (depth 0), their direct replies (depth 1), and 3rd-level nested replies (depth 2)
  const rootMessages = publicChat.messages.filter((m) => !m.parentId || m.depth === 0);
  const getRepliesFor = (parentId: string) => publicChat.messages.filter((m) => m.parentId === parentId);

  const handlePublicChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim() || isSendingChat) return;
    setIsSendingChat(true);
    const res = await sendPublicChatMessage(chatText.trim(), replyingToMsg ? replyingToMsg.id : null);
    setIsSendingChat(false);
    if (res.success) {
      setChatText('');
      setReplyingToMsg(null);
    }
  };

  return (
    <div className="relative border-b-2 border-[#6B8E7B] bg-gradient-to-b from-[#B7C9B1] via-[#F1E9D2] to-[#F1E9D2] dark:from-[#243B35] dark:via-[#1b2d28] dark:to-[#243B35] pt-8 pb-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#243B35] border border-[#6B8E7B] text-[#F1E9D2] text-xs font-bold uppercase tracking-wider shadow-xs">
            <Award className="w-3.5 h-3.5 text-[#F4D6C6]" />
            <span>{language === 'el' ? 'ΠΡΟΤΑΣΕΙΣ ΓΙΑ FOOD SPOTS' : 'FOOD SPOTS RECOMMENDATIONS'}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6B8E7B] border border-[#243B35]/30 text-[#F1E9D2] text-xs font-bold shadow-xs">
            <CheckCircle className="w-3.5 h-3.5 text-[#F4D6C6]" />
            <span>{language === 'el' ? 'ΤΕΚΜΗΡΙΩΜΕΝΕΣ ΕΜΠΕΙΡΙΕΣ' : 'DOCUMENTED EXPERIENCES'}</span>
          </div>
        </div>

        {/* Hero Title and Subtitle */}
        <div className="max-w-3xl">
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#243B35] dark:text-[#F1E9D2] leading-[1.15]">
            {language === 'el' ? 'Τα Καλύτερα Food Spots' : 'The Best Food Spots'}
            <span className="block text-2xl sm:text-3xl lg:text-4xl text-[#6B2F2F] dark:text-[#F4D6C6] mt-1">
              {language === 'el' ? '& παραλίες' : '& beaches'}
            </span>
          </h1>
          <p className="mt-2.5 text-base sm:text-lg text-[#243B35]/90 dark:text-[#B7C9B1] leading-relaxed font-medium">
            {language === 'el'
              ? 'Από τους Αειφαριώτες στην Αειφαρειώτικη οικογένεια, να έχετε τις καλύτερες αμεσότερα επιλογές όπου κι αν βρεθείτε στην Ελλάδα!'
              : 'From Aeifaron members to the Aeifaron family, so you have the best immediate choices wherever you find yourselves in Greece!'}
          </p>
        </div>

        {/* 1. Search by Name, Food, Region + Search Categories (ΠΡΩΙΝΑ/BRUNCH, ΦΑΓΗΤΟ/FOOD, ΓΛΥΚΑ/DESERTS, ΦΟΥΡΝΟΙ/PIES, ΚΑΦΕΣ/COFFEE) */}
        <div className="space-y-3">
          <div className="relative max-w-4xl bg-[#243B35] rounded-2xl shadow-lg border-2 border-[#6B8E7B] p-2 sm:p-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              
              {/* Search Input (Όνομα & Φαγητό) */}
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3.5 w-5 h-5 text-[#B7C9B1]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    language === 'el'
                      ? 'Αναζήτηση με όνομα, φαγητό ή περιοχή...'
                      : 'Search by name, food or region...'
                  }
                  className="w-full pl-11 pr-4 py-3 bg-transparent text-[#F1E9D2] placeholder-[#B7C9B1]/80 text-base font-medium focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 text-[#B7C9B1] hover:text-[#F1E9D2]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Region Select (Περιοχή) */}
              <div className="sm:border-l border-[#6B8E7B] sm:pl-3 flex items-center">
                <div className="relative w-full sm:w-64">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4D6C6] pointer-events-none" />
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value as GreekRegion | 'ALL')}
                    className="w-full pl-9 pr-8 py-2.5 bg-[#6B8E7B] text-[#F1E9D2] text-sm font-bold rounded-xl border border-[#B7C9B1]/50 focus:outline-none focus:ring-2 focus:ring-[#F4D6C6] cursor-pointer appearance-none"
                  >
                    <option value="ALL">{t.filterAllRegions}</option>
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {language === 'el' ? REGION_TRANSLATIONS[r].el : REGION_TRANSLATIONS[r].en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Search Macro-Categories Bar inside the Search Box */}
            <div className="mt-2.5 pt-2.5 border-t border-[#6B8E7B]/50 flex flex-wrap items-center gap-1.5">
              {MACRO_GROUPS.map((grp) => {
                const active = selectedMacroGroup === grp.id;
                return (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => setSelectedMacroGroup(active ? 'ALL' : grp.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                      active
                        ? 'bg-[#F4D6C6] text-[#6B2F2F] border-[#D88C72] shadow-sm scale-[1.02]'
                        : 'bg-[#1b2d28] text-[#F1E9D2] border-[#6B8E7B] hover:bg-[#6B8E7B]'
                    }`}
                  >
                    <span>{grp.icon}</span>
                    <span>{language === 'el' ? grp.labelEl : grp.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Category Selection: Όλες οι Επιλογές, Παραλίες, and Drop-down Menu for the 12 Food & Experience Categories */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedMacroGroup('ALL');
              }}
              className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedCategory === 'ALL' && selectedMacroGroup === 'ALL'
                  ? 'bg-[#243B35] text-[#F1E9D2] border-2 border-[#6B8E7B] shadow-md'
                  : 'bg-[#F1E9D2] text-[#243B35] border border-[#6B8E7B] hover:bg-[#B7C9B1]'
              }`}
            >
              🌟 {language === 'el' ? 'Όλες οι Επιλογές' : 'All Choices'}
            </button>

            {/* Παραλίες Button */}
            <button
              onClick={() => setSelectedCategory(selectedCategory === 'Παραλίες' ? 'ALL' : 'Παραλίες')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                selectedCategory === 'Παραλίες'
                  ? 'bg-[#FF6B54] text-white border-[#14B8A6] ring-2 ring-[#14B8A6] shadow-md'
                  : 'bg-[#14B8A6] text-white border-[#FF6B54] hover:bg-[#FF6B54]'
              }`}
            >
              <span>{CATEGORY_TRANSLATIONS['Παραλίες'].icon}</span>
              <span>{language === 'el' ? CATEGORY_TRANSLATIONS['Παραλίες'].el : CATEGORY_TRANSLATIONS['Παραλίες'].en}</span>
            </button>

            {/* Τοποθεσίες Button */}
            <button
              onClick={() => setSelectedCategory(selectedCategory === 'Τοποθεσίες' ? 'ALL' : 'Τοποθεσίες')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                selectedCategory === 'Τοποθεσίες'
                  ? 'bg-[#243B35] text-[#CDFF9B] border-[#CDFF9B] ring-2 ring-[#6B8E7B] shadow-md'
                  : 'bg-[#6B8E7B] text-[#F1E9D2] border-[#243B35] hover:bg-[#243B35]'
              }`}
            >
              <span>{CATEGORY_TRANSLATIONS['Τοποθεσίες'].icon}</span>
              <span>{language === 'el' ? CATEGORY_TRANSLATIONS['Τοποθεσίες'].el : CATEGORY_TRANSLATIONS['Τοποθεσίες'].en}</span>
            </button>

            {/* Drop-down Menu for the 12 Categories */}
            <div className="relative min-w-[250px] sm:min-w-[300px]">
              <select
                value={DROPDOWN_CATEGORIES.includes(selectedCategory as SpotCategory) ? selectedCategory : 'ALL'}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCategory(val === 'ALL' ? 'ALL' : (val as SpotCategory));
                }}
                aria-label={language === 'el' ? 'Επιλογή Κατηγορίας Food Spot & Εμπειρίας' : 'Select Food Spot & Experience Category'}
                className={`w-full pl-3.5 pr-9 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border appearance-none focus:outline-none focus:ring-2 focus:ring-[#A44A3F] ${
                  DROPDOWN_CATEGORIES.includes(selectedCategory as SpotCategory)
                    ? 'bg-[#6B2F2F] text-[#F4D6C6] border-[#D88C72] ring-2 ring-[#A44A3F] shadow-md'
                    : 'bg-[#A44A3F] text-[#F4D6C6] border-[#D88C72]/70 hover:bg-[#6B2F2F] shadow-sm'
                }`}
              >
                <option value="ALL" className="bg-[#6B2F2F] text-[#F4D6C6] font-bold">
                  🍽️ {language === 'el' ? 'Επιλέξτε Κατηγορία Food Spot / Εμπειρίας...' : 'Select Food Spot / Experience Category...'}
                </option>
                {DROPDOWN_CATEGORIES.map((cat) => {
                  const config = CATEGORY_TRANSLATIONS[cat] || { el: cat, en: cat, icon: '📍' };
                  return (
                    <option key={cat} value={cat} className="bg-[#6B2F2F] text-[#F4D6C6] font-bold">
                      {config.icon} {language === 'el' ? config.el : config.en}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-4 h-4 text-[#F4D6C6] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Directly below the Drop-down Menu: Hit Spots βρέθηκαν & 💎 Μόνο Κρυφά Διαμάντια 💎 */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs font-bold text-[#243B35] dark:text-[#F1E9D2]">
            <div className="flex items-center gap-3">
              <span className="font-extrabold">
                {spots.length} {t.spotsFound}
              </span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-[#6B2F2F] dark:text-[#F4D6C6] hover:underline flex items-center gap-1 cursor-pointer font-extrabold"
                >
                  <X className="w-3.5 h-3.5" />
                  {t.clearFilters} ({activeFiltersCount})
                </button>
              )}
            </div>

            {/* Secret Gems Toggle */}
            <button
              onClick={() => setSecretGemsOnly(!secretGemsOnly)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                secretGemsOnly
                  ? 'bg-[#6B2F2F] text-[#F4D6C6] border-[#D88C72]'
                  : 'bg-[#243B35] text-[#F1E9D2] border-[#6B8E7B] hover:bg-[#6B8E7B]'
              }`}
            >
              <span>💎</span>
              <span>{t.secretGemsOnly}</span>
            </button>
          </div>
        </div>

        {/* 3. Spots Carousel */}
        <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin">
          {spots.map((spot) => {
            const displayTitle = language === 'el' && spot.titleEl ? spot.titleEl : spot.title;
            const catConfig = CATEGORY_TRANSLATIONS[spot.category] || { icon: '📍', el: spot.category };
            const isBeach = spot.category === 'Παραλίες';
            const isLocation = spot.category === 'Τοποθεσίες';
            
            return (
              <div
                key={spot.id}
                onClick={() => setSelectedSpot(spot)}
                title={`Άνοιγμα καρτέλας: ${displayTitle}`}
                className={`relative w-36 sm:w-44 aspect-square shrink-0 rounded-[10px] overflow-hidden cursor-pointer shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-200 border-2 group ${
                  isBeach
                    ? 'border-[#FF6B54] bg-[#14B8A6]'
                    : isLocation
                    ? 'border-[#6B8E7B] bg-[#243B35]'
                    : 'border-[#6B2F2F] bg-[#6B2F2F]'
                }`}
              >
                <img
                  src={spot.coverImageUrl}
                  alt={displayTitle}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent flex flex-col justify-between p-2.5 text-white">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                        isBeach
                          ? 'bg-[#14B8A6] text-white'
                          : isLocation
                          ? 'bg-[#243B35] text-[#CDFF9B]'
                          : 'bg-[#6B2F2F] text-[#F4D6C6]'
                      }`}
                    >
                      {catConfig.icon} {isBeach ? 'Παραλία' : isLocation ? 'Τοποθεσία' : 'food spot'}
                    </span>
                    <span
                      className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-black text-[10px] ${
                        isBeach
                          ? 'bg-[#FF6B54] text-white'
                          : isLocation
                          ? 'bg-[#6B8E7B] text-[#F1E9D2]'
                          : 'bg-[#A44A3F] text-[#F4D6C6]'
                      }`}
                    >
                      ★ {spot.rating.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-heading text-xs sm:text-sm font-bold leading-tight line-clamp-2 drop-shadow-sm">
                      {displayTitle}
                    </h4>
                    <p className={`text-[10px] font-bold truncate mt-0.5 ${isBeach ? 'text-[#FF6B54]' : isLocation ? 'text-[#CDFF9B]' : 'text-[#F4D6C6]'}`}>
                      {spot.author.firstName} • {spot.priceLevel}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Leaderboard Ranking & Ζωντανή Συζήτηση Μελών (Exact Leaderboard Ranking as in ΜΕΛΗ & LEADERBOARD + Clean Threaded UX Interface up to 3 levels, 200 char limit) */}
        <div className="rounded-3xl bg-[#F4D6C6] dark:bg-[#1b2d28] border-2 border-[#6B2F2F] dark:border-[#6B8E7B] shadow-lg overflow-hidden">
          
          {/* Header: Leaderboard Ranking & Ζωντανή Συζήτηση Μελών */}
          <div className="px-5 py-4 bg-[#6B2F2F] text-[#F4D6C6] border-b border-[#D88C72]/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-[#D88C72] shrink-0" />
                <div>
                  <h3 className="font-heading text-lg sm:text-xl font-bold leading-tight">
                    {language === 'el'
                      ? 'Leaderboard Ranking & Ζωντανή Συζήτηση Μελών'
                      : 'Leaderboard Ranking & Live Member Discussion'}
                  </h3>
                  <p className="text-[11px] text-[#F4D6C6]/85 font-medium">
                    {language === 'el'
                      ? 'Κάντε κλικ πάνω σε οποιοδήποτε μήνυμα για να απαντήσετε από κάτω • Έως 200 χαρακτήρες'
                      : 'Click on any message to reply underneath • Up to 200 characters'}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A44A3F] text-[#F4D6C6] text-[11px] font-bold border border-[#D88C72]/60 self-start sm:self-auto">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{language === 'el' ? 'Ζωντανή Συζήτηση' : 'Live Discussion'}</span>
              </span>
            </div>
          </div>

          {/* Main UX Interface Grid: Leaderboard Ranking (exact same compact design as ΜΕΛΗ & LEADERBOARD) + Live Threaded Discussion */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#D88C72] dark:divide-slate-800 bg-[#FFF7F2] dark:bg-slate-900/95">
            
            {/* Left / Top Column: Compact Mobile-Friendly Leaderboard Ranking (identical to ΜΕΛΗ & LEADERBOARD) */}
            <div className="lg:col-span-4 p-4 sm:p-5 bg-[#FDF1E8]/70 dark:bg-slate-900/60 flex flex-col justify-between">
              <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-[#6B2F2F] dark:border-[#D88C72] shadow-md overflow-hidden">
                <div className="px-4 py-3 bg-[#6B2F2F] text-[#F4D6C6] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#D88C72]" />
                    <span className="font-heading text-base font-bold tracking-wide">
                      Leaderboard Ranking
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#F4D6C6]/80">
                    {language === 'el' ? 'Κατάταξη Μελών' : 'Member Ranking'}
                  </span>
                </div>

                {/* Simple, Mobile-Fitting Rows: Ranking (#1, #2...) + Avatar Photo + First Name + Crown/Badge Icon (Same as ΜΕΛΗ & LEADERBOARD) */}
                <div className="divide-y divide-stone-100 dark:divide-slate-800">
                  {rankedMembers.map((member, idx) => (
                    <div
                      key={member.id}
                      onClick={() => setSelectedMemberProfile(member)}
                      title={`${member.firstName} ${member.lastName}`}
                      className="px-4 py-2.5 flex items-center justify-between hover:bg-[#F4D6C6]/35 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-xl font-heading font-black text-xs flex items-center justify-center shrink-0 ${
                            idx === 0
                              ? 'bg-[#6B2F2F] text-[#F4D6C6] shadow-2xs'
                              : idx === 1
                              ? 'bg-[#A44A3F] text-[#F4D6C6]'
                              : idx === 2
                              ? 'bg-[#D88C72] text-[#6B2F2F]'
                              : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-300'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <img
                          src={member.avatarUrl}
                          alt={member.firstName}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-[#D88C72] shrink-0"
                        />
                        <span className="font-heading text-base font-bold text-stone-900 dark:text-stone-100 truncate">
                          {member.firstName}
                        </span>
                      </div>

                      <span className="text-sm shrink-0">
                        {idx === 0 ? '👑' : member.gamification.icon}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right / Bottom Column: Live Member Threaded Discussion Stream + Post Input */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              {/* Threaded Messages Stream: Level 0 (Root), Level 1 (Slightly shifted right below), Level 2 (3rd level with distinct background color) */}
              <div className="p-4 sm:p-5 max-h-96 overflow-y-auto space-y-3 bg-[#FFF7F2] dark:bg-slate-900/90">
                {rootMessages.map((rootMsg) => {
                  const level1Replies = getRepliesFor(rootMsg.id);
                  const isSelectedForReply = replyingToMsg?.id === rootMsg.id;

                  return (
                    <div key={rootMsg.id} className="space-y-1.5">
                      {/* Level 0: Root Post */}
                      <div
                        onClick={() => setReplyingToMsg(isSelectedForReply ? null : rootMsg)}
                        title={language === 'el' ? 'Κλικ για απάντηση σε αυτό το σχόλιο' : 'Click to reply to this comment'}
                        className={`p-3.5 rounded-2xl bg-white dark:bg-slate-800 border transition-all cursor-pointer shadow-2xs space-y-1.5 ${
                          isSelectedForReply
                            ? 'border-[#6B2F2F] ring-2 ring-[#A44A3F]/40'
                            : 'border-[#D88C72]/70 dark:border-slate-700 hover:border-[#A44A3F]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={rootMsg.avatarUrl}
                              alt={rootMsg.firstName}
                              className="w-6 h-6 rounded-full object-cover ring-1 ring-[#A44A3F] shrink-0"
                            />
                            <span className="font-heading text-xs sm:text-sm font-bold text-[#6B2F2F] dark:text-[#F4D6C6]">
                              {rootMsg.firstName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#A44A3F] dark:text-[#D88C72] flex items-center gap-0.5">
                              <CornerDownRight className="w-3 h-3" />
                              <span>{language === 'el' ? 'Απάντηση' : 'Reply'}</span>
                            </span>
                            <span className="text-[10px] font-semibold text-[#A44A3F] dark:text-stone-400">
                              {rootMsg.createdAt}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 font-medium leading-relaxed break-words">
                          {rootMsg.content}
                        </p>
                      </div>

                      {/* Level 1 Replies: Shifted slightly to the right underneath */}
                      {level1Replies.map((reply1) => {
                        const level2Replies = getRepliesFor(reply1.id);
                        const isReply1Selected = replyingToMsg?.id === reply1.id;

                        return (
                          <div key={reply1.id} className="space-y-1.5">
                            <div
                              onClick={() => setReplyingToMsg(isReply1Selected ? null : reply1)}
                              title={language === 'el' ? 'Κλικ για απάντηση σε αυτό το σχόλιο' : 'Click to reply to this comment'}
                              className={`ml-5 sm:ml-7 p-2.5 rounded-2xl bg-[#FDF1E8] dark:bg-slate-800/80 border-l-4 border border-[#D88C72] dark:border-slate-700 border-l-[#A44A3F] transition-all cursor-pointer space-y-1 ${
                                isReply1Selected ? 'ring-2 ring-[#6B2F2F]' : 'hover:border-[#6B2F2F]'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={reply1.avatarUrl}
                                    alt={reply1.firstName}
                                    className="w-5 h-5 rounded-full object-cover ring-1 ring-[#A44A3F] shrink-0"
                                  />
                                  <span className="font-heading text-xs font-bold text-[#6B2F2F] dark:text-[#F4D6C6]">
                                    {reply1.firstName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-[#A44A3F] flex items-center gap-0.5">
                                    <CornerDownRight className="w-3 h-3" />
                                    <span>{language === 'el' ? 'Απάντηση' : 'Reply'}</span>
                                  </span>
                                  <span className="text-[10px] font-semibold text-[#A44A3F] dark:text-stone-400">
                                    {reply1.createdAt}
                                  </span>
                                </div>
                              </div>

                              <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 font-medium leading-relaxed break-words">
                                {reply1.content}
                              </p>
                            </div>

                            {/* Level 2 (3rd Level) Replies: Slightly different background shade to show 3rd level depth */}
                            {level2Replies.map((reply2) => (
                              <div
                                key={reply2.id}
                                onClick={() => setReplyingToMsg(reply1)}
                                className="ml-9 sm:ml-12 p-2.5 rounded-2xl bg-[#F4D6C6]/85 dark:bg-[#2d2222] border-l-4 border border-[#A44A3F]/60 border-l-[#6B2F2F] transition-all cursor-pointer space-y-1 shadow-2xs"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={reply2.avatarUrl}
                                      alt={reply2.firstName}
                                      className="w-5 h-5 rounded-full object-cover ring-1 ring-[#6B2F2F] shrink-0"
                                    />
                                    <span className="font-heading text-xs font-bold text-[#6B2F2F] dark:text-[#F4D6C6]">
                                      {reply2.firstName}
                                    </span>
                                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#6B2F2F]/15 text-[#6B2F2F] dark:text-[#F4D6C6]">
                                      3ο επίπεδο
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-semibold text-[#6B2F2F] dark:text-stone-400">
                                    {reply2.createdAt}
                                  </span>
                                </div>

                                <p className="text-xs sm:text-sm text-[#6B2F2F] dark:text-[#F4D6C6] font-medium leading-relaxed break-words">
                                  {reply2.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Open Input Bar for All Members Simultaneously (200 char limit + reply target banner) */}
              <div className="p-3.5 bg-[#F4D6C6] dark:bg-[#243B35] border-t border-[#D88C72] dark:border-[#6B8E7B] space-y-2">
                {replyingToMsg && (
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#6B2F2F] text-[#F4D6C6] text-xs font-bold">
                    <span className="flex items-center gap-1.5 truncate">
                      <CornerDownRight className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {language === 'el'
                          ? `Απάντηση στον/στην ${replyingToMsg.firstName}: «${replyingToMsg.content}»`
                          : `Replying to ${replyingToMsg.firstName}: "${replyingToMsg.content}"`}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setReplyingToMsg(null)}
                      className="p-1 hover:bg-[#A44A3F] rounded-lg cursor-pointer shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <form onSubmit={handlePublicChatSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex items-center gap-2 flex-1 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-[#A44A3F]">
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.firstName}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-[#6B2F2F] shrink-0"
                    />
                    <span className="font-heading text-xs font-bold text-[#6B2F2F] dark:text-[#F4D6C6] shrink-0">
                      {currentUser.firstName}:
                    </span>
                    <input
                      type="text"
                      maxLength={200}
                      value={chatText}
                      onChange={(e) => setChatText(e.target.value.slice(0, 200))}
                      placeholder={
                        replyingToMsg
                          ? language === 'el'
                            ? `Γράψτε την απάντησή σας στον/στην ${replyingToMsg.firstName} (έως 200 χαρακτήρες)...`
                            : `Write your reply to ${replyingToMsg.firstName} (up to 200 chars)...`
                          : language === 'el'
                          ? 'Γράψτε μήνυμα στη ζωντανή συζήτηση (έως 200 χαρακτήρες)...'
                          : 'Write a message in the live discussion (up to 200 chars)...'
                      }
                      className="w-full bg-transparent text-xs sm:text-sm font-medium text-stone-900 dark:text-white focus:outline-none"
                    />
                    <span className="text-[11px] font-mono font-bold text-[#A44A3F] shrink-0">
                      {chatText.length}/200
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={!chatText.trim() || isSendingChat}
                    className="px-4 py-2.5 rounded-xl bg-[#6B2F2F] hover:bg-[#A44A3F] disabled:opacity-50 text-[#F4D6C6] font-heading text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'el' ? 'Ανάρτηση' : 'Post'}</span>
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
