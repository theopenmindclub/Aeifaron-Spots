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
  ChevronDown,
  ThumbsUp,
  Pin,
  SlidersHorizontal
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
  const [communitySubTab, setCommunitySubTab] = useState<'discussion' | 'leaderboard' | 'members'>('discussion');
  const [feedCategoryFilter, setFeedCategoryFilter] = useState<'ALL' | '🆕 Νέα & Προτάσεις' | '💬 Ανταλλαγή' | '🏆 Leaderboard'>('ALL');
  const [likedPostIds, setLikedPostIds] = useState<Record<string, boolean>>({});
  const composerInputRef = React.useRef<HTMLInputElement>(null);

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

        {/* 4. Leaderboard Ranking & Ζωντανή Συζήτηση Μελών — Skool-Style Community Feed & Leaderboard UX */}
        <div className="rounded-3xl bg-[#F8F7F4] dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-lg overflow-hidden">
          
          {/* Top Title Banner */}
          <div className="px-5 pt-4 pb-2 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#6B2F2F] text-[#F4D6C6] flex items-center justify-center shadow-2xs shrink-0">
                <Trophy className="w-5 h-5 text-[#D88C72]" />
              </div>
              <div>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-stone-900 dark:text-white leading-tight">
                  Leaderboard Ranking &amp; Ζωντανή Συζήτηση Μελών
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                  Κάντε κλικ πάνω σε οποιοδήποτε μήνυμα για να απαντήσετε από κάτω • Έως 200 χαρακτήρες
                </p>
              </div>
            </div>
          </div>

          {/* Skool-Style Horizontal Navigation Tabs: Ζωντανή Συζήτηση | Leaderboard | Μέλη */}
          <div className="px-5 bg-white dark:bg-slate-900 border-b border-stone-200 dark:border-slate-800 flex items-center gap-6 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setCommunitySubTab('discussion')}
              className={`py-3 text-sm font-bold whitespace-nowrap border-b-[3px] transition-colors cursor-pointer ${
                communitySubTab === 'discussion'
                  ? 'border-stone-900 dark:border-[#F4D6C6] text-stone-900 dark:text-white'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              Ζωντανή Συζήτηση
            </button>
            <button
              type="button"
              onClick={() => setCommunitySubTab('leaderboard')}
              className={`py-3 text-sm font-bold whitespace-nowrap border-b-[3px] transition-colors cursor-pointer flex items-center gap-1.5 ${
                communitySubTab === 'leaderboard'
                  ? 'border-stone-900 dark:border-[#F4D6C6] text-stone-900 dark:text-white'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              <span>Leaderboard</span>
            </button>
            <button
              type="button"
              onClick={() => setCommunitySubTab('members')}
              className={`py-3 text-sm font-bold whitespace-nowrap border-b-[3px] transition-colors cursor-pointer ${
                communitySubTab === 'members'
                  ? 'border-stone-900 dark:border-[#F4D6C6] text-stone-900 dark:text-white'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              Μέλη ({rankedMembers.length})
            </button>
          </div>

          {/* Main Body Area */}
          <div className="p-4 sm:p-5 space-y-4">
            
            {/* "Write something" Pill Input Box at the top (Exactly like Skool screenshot) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-stone-200/90 dark:border-slate-700 shadow-xs p-3 sm:p-3.5 space-y-2.5">
              {replyingToMsg && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#6B2F2F] text-[#F4D6C6] text-xs font-bold">
                  <span className="flex items-center gap-1.5 truncate">
                    <CornerDownRight className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      Απάντηση στον/στην {replyingToMsg.firstName}: «{replyingToMsg.content}»
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

              <form onSubmit={handlePublicChatSubmit} className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.firstName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-stone-100 dark:ring-slate-700"
                  />
                </div>

                <input
                  ref={composerInputRef}
                  type="text"
                  maxLength={200}
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value.slice(0, 200))}
                  placeholder={
                    replyingToMsg
                      ? `Απάντηση στον/στην ${replyingToMsg.firstName} (έως 200 χαρακτήρες)...`
                      : 'Γράψτε κάτι στην παρέα... (έως 200 χαρακτήρες)'
                  }
                  className="flex-1 bg-transparent text-sm sm:text-base font-medium text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
                />

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono font-bold text-stone-400 hidden sm:inline">
                    {chatText.length}/200
                  </span>
                  <button
                    type="submit"
                    disabled={!chatText.trim() || isSendingChat}
                    className="px-4 py-2 rounded-xl bg-[#6B2F2F] hover:bg-[#A44A3F] disabled:opacity-40 text-[#F4D6C6] font-heading text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ανάρτηση</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Announcement Line & Filter Pills Row (Exactly like Skool screenshot) */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 py-0.5">
                <Trophy className="w-4 h-4 text-[#6B2F2F] dark:text-[#D88C72] shrink-0" />
                <span>
                  <strong className="font-extrabold text-stone-900 dark:text-white">Aeifaron Spots</strong> • Κάντε κλικ σε ανάρτηση για σχολιασμό (έως 3 επίπεδα)
                </span>
              </div>

              {/* Filter Pills: All | 🆕 Νέα & Προτάσεις | 💬 Ανταλλαγή | 🏆 Leaderboard */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => {
                      setFeedCategoryFilter('ALL');
                      setCommunitySubTab('discussion');
                    }}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
                      feedCategoryFilter === 'ALL' && communitySubTab === 'discussion'
                        ? 'bg-stone-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-slate-700 hover:bg-stone-100'
                    }`}
                  >
                    Όλα
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFeedCategoryFilter('🆕 Νέα & Προτάσεις');
                      setCommunitySubTab('discussion');
                    }}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      feedCategoryFilter === '🆕 Νέα & Προτάσεις' && communitySubTab === 'discussion'
                        ? 'bg-stone-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-slate-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>🆕 Νέα &amp; Προτάσεις</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFeedCategoryFilter('💬 Ανταλλαγή');
                      setCommunitySubTab('discussion');
                    }}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      feedCategoryFilter === '💬 Ανταλλαγή' && communitySubTab === 'discussion'
                        ? 'bg-stone-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-slate-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>💬 Ανταλλαγή</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFeedCategoryFilter('🏆 Leaderboard');
                      setCommunitySubTab('leaderboard');
                    }}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      communitySubTab === 'leaderboard'
                        ? 'bg-[#6B2F2F] text-[#F4D6C6] shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-slate-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>🏆 Leaderboard Ranking</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setCommunitySubTab(communitySubTab === 'leaderboard' ? 'discussion' : 'leaderboard')}
                  title="Εναλλαγή Προβολής Leaderboard / Συζήτησης"
                  className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 shrink-0 cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Layout: Compact Leaderboard Ranking + Skool-Style Threaded Feed Cards */}
            {communitySubTab === 'members' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {rankedMembers.map((member, idx) => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMemberProfile(member)}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 hover:border-[#6B2F2F] transition-all cursor-pointer flex items-center gap-3.5 shadow-2xs"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={member.avatarUrl}
                        alt={member.firstName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-[#D88C72]"
                      />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-slate-800">
                        {member.gamification.level}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading text-base font-bold text-stone-900 dark:text-white truncate">
                          {member.firstName} {member.lastName}
                        </span>
                        <span>{idx === 0 ? '👑' : member.gamification.icon}</span>
                      </div>
                      <p className="text-xs font-semibold text-[#6B2F2F] dark:text-[#F4D6C6] truncate">
                        {member.gamification.titleEl}
                      </p>
                      <p className="text-[11px] text-stone-400 font-bold">
                        Θέση #{idx + 1} • {member.xp} XP
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* Compact Leaderboard Ranking Card (Shown on Leaderboard tab on mobile, or side-by-side on desktop) */}
                <div
                  className={`${
                    communitySubTab === 'leaderboard' ? 'block lg:col-span-12 max-w-lg mx-auto w-full' : 'block lg:col-span-4'
                  }`}
                >
                  <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-[#6B2F2F] dark:border-[#D88C72] shadow-md overflow-hidden">
                    <div className="px-4 py-3 bg-[#6B2F2F] text-[#F4D6C6] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-[#D88C72]" />
                        <span className="font-heading text-base font-bold tracking-wide">
                          Leaderboard Ranking
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-[#F4D6C6]/80">
                        Κατάταξη Μελών
                      </span>
                    </div>

                    <div className="divide-y divide-stone-100 dark:divide-slate-800">
                      {rankedMembers.map((member, idx) => (
                        <div
                          key={member.id}
                          onClick={() => setSelectedMemberProfile(member)}
                          title={`${member.firstName} ${member.lastName} • ${member.gamification.titleEl}`}
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
                            <div className="relative shrink-0">
                              <img
                                src={member.avatarUrl}
                                alt={member.firstName}
                                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#D88C72]"
                              />
                              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center border border-white dark:border-slate-900">
                                {member.gamification.level}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <span className="font-heading text-base font-bold text-stone-900 dark:text-stone-100 truncate block leading-tight">
                                {member.firstName}
                              </span>
                              <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 truncate block">
                                {member.gamification.titleEl}
                              </span>
                            </div>
                          </div>

                          <span className="text-sm shrink-0">
                            {idx === 0 ? '👑' : member.gamification.icon}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Skool-Style Community Feed Post Cards with 3-Level Threaded Replies */}
                {communitySubTab === 'discussion' && (
                  <div className="lg:col-span-8 space-y-3.5 w-full">
                    {rootMessages
                      .filter((m) =>
                        feedCategoryFilter === 'ALL' || feedCategoryFilter === '🏆 Leaderboard'
                          ? true
                          : (m.categoryTag || '💬 Ανταλλαγή') === feedCategoryFilter
                      )
                      .map((rootMsg, postIdx) => {
                        const level1Replies = getRepliesFor(rootMsg.id);
                        const allCommentsCount =
                          level1Replies.length +
                          level1Replies.reduce((acc, r1) => acc + getRepliesFor(r1.id).length, 0);
                        const isSelectedForReply = replyingToMsg?.id === rootMsg.id;
                        const authorProfile =
                          rankedMembers.find((u) => u.id === rootMsg.userId) || rankedMembers[0];
                        const levelNumber = authorProfile?.gamification?.level || 1;
                        const isLiked = !!likedPostIds[rootMsg.id];
                        const displayLikes = (rootMsg.likesCount || 14) + (isLiked ? 1 : 0);
                        const thumbUrl =
                          rootMsg.thumbnailUrl ||
                          spots[postIdx % Math.max(1, spots.length)]?.coverImageUrl;

                        return (
                          <div
                            key={rootMsg.id}
                            className="rounded-2xl bg-white dark:bg-slate-800 border border-stone-200/90 dark:border-slate-700 shadow-xs overflow-hidden transition-all"
                          >
                            {/* Root Post Card (Skool Community Post Layout) */}
                            <div
                              onClick={() => {
                                setReplyingToMsg(isSelectedForReply ? null : rootMsg);
                                composerInputRef.current?.focus();
                              }}
                              title="Κάντε κλικ για να απαντήσετε σε αυτή την ανάρτηση"
                              className={`p-4 sm:p-5 cursor-pointer transition-colors ${
                                isSelectedForReply
                                  ? 'bg-[#FFF7F2] dark:bg-slate-800/90 ring-2 ring-inset ring-[#6B2F2F]'
                                  : 'hover:bg-stone-50/70 dark:hover:bg-slate-800/60'
                              }`}
                            >
                              {/* Top Author Row: Avatar with Blue Level Badge + Full Name + Icons + Pinned */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3">
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (authorProfile) setSelectedMemberProfile(authorProfile);
                                    }}
                                    className="relative shrink-0 cursor-pointer"
                                  >
                                    <img
                                      src={rootMsg.avatarUrl}
                                      alt={rootMsg.firstName}
                                      className="w-11 h-11 rounded-full object-cover ring-1 ring-stone-200 dark:ring-slate-600"
                                    />
                                    {/* Skool-style Blue Level Badge on bottom-right of Avatar */}
                                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-2xs">
                                      {levelNumber}
                                    </span>
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-heading text-base font-bold text-stone-900 dark:text-white leading-tight">
                                        {rootMsg.firstName} {rootMsg.lastName || authorProfile?.lastName || ''}
                                      </span>
                                      <span className="text-sm">🍀</span>
                                      <span className="text-sm">🔥</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-400 mt-0.5">
                                      <span>{rootMsg.createdAt}</span>
                                      <span>•</span>
                                      <span className="text-stone-500 dark:text-stone-300">
                                        {rootMsg.categoryTag || '💬 Ανταλλαγή'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {(rootMsg.pinned || postIdx < 2) && (
                                  <div className="flex items-center gap-1 text-xs font-bold text-stone-500 dark:text-stone-400 shrink-0">
                                    <Pin className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300 rotate-45" />
                                    <span>Καρφιτσωμένο</span>
                                  </div>
                                )}
                              </div>

                              {/* Middle Content Row: Blue Dot + Bold Title + Body Text on Left, Square Thumbnail on Right */}
                              <div className="mt-3.5 flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0 space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                                    <h4 className="font-heading text-base sm:text-lg font-extrabold text-stone-900 dark:text-white leading-snug line-clamp-1">
                                      {rootMsg.title || rootMsg.content}
                                    </h4>
                                  </div>
                                  <p className="text-sm sm:text-base text-stone-700 dark:text-stone-200 font-normal leading-relaxed break-words">
                                    {rootMsg.content}
                                  </p>
                                </div>

                                {thumbUrl && (
                                  <img
                                    src={thumbUrl}
                                    alt=""
                                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 border border-stone-200 dark:border-slate-700 shadow-2xs"
                                  />
                                )}
                              </div>

                              {/* Bottom Engagement Bar: ThumbsUp Count + Comment Count + "Νέο σχόλιο • Απάντηση" */}
                              <div className="mt-4 pt-2.5 border-t border-stone-100 dark:border-slate-700/60 flex items-center justify-between gap-4 text-xs font-bold text-stone-500 dark:text-stone-400">
                                <div className="flex items-center gap-5">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLikedPostIds((prev) => ({
                                        ...prev,
                                        [rootMsg.id]: !prev[rootMsg.id]
                                      }));
                                    }}
                                    className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                                      isLiked
                                        ? 'text-blue-600 dark:text-blue-400 font-extrabold'
                                        : 'hover:text-stone-800 dark:hover:text-white'
                                    }`}
                                  >
                                    <ThumbsUp className="w-4 h-4" />
                                    <span>{displayLikes}</span>
                                  </button>

                                  <div className="flex items-center gap-1.5 hover:text-stone-800 dark:hover:text-white">
                                    <MessageSquare className="w-4 h-4" />
                                    <span>{allCommentsCount}</span>
                                  </div>
                                </div>

                                <span className="text-blue-600 dark:text-blue-400 font-extrabold hover:underline flex items-center gap-1">
                                  <span>
                                    {allCommentsCount > 0
                                      ? 'Νέο σχόλιο • Κλικ για απάντηση'
                                      : 'Κλικ για πρώτο σχόλιο'}
                                  </span>
                                </span>
                              </div>
                            </div>

                            {/* Threaded Replies Inside Card: Level 1 (shifted slightly right below) & Level 2 (3rd level with distinct background color) */}
                            {level1Replies.length > 0 && (
                              <div className="px-4 pb-4 pt-2 bg-stone-50/70 dark:bg-slate-900/50 border-t border-stone-100 dark:border-slate-700/70 space-y-2">
                                {level1Replies.map((reply1) => {
                                  const level2Replies = getRepliesFor(reply1.id);
                                  const isReply1Selected = replyingToMsg?.id === reply1.id;

                                  return (
                                    <div key={reply1.id} className="space-y-1.5">
                                      {/* Level 1 Reply: Shifted slightly to the right underneath */}
                                      <div
                                        onClick={() => {
                                          setReplyingToMsg(isReply1Selected ? null : reply1);
                                          composerInputRef.current?.focus();
                                        }}
                                        title="Κλικ για απάντηση σε αυτό το σχόλιο (3ο επίπεδο)"
                                        className={`ml-4 sm:ml-6 p-3 rounded-2xl bg-[#FDF1E8] dark:bg-slate-800 border-l-4 border border-[#D88C72] dark:border-slate-700 border-l-[#A44A3F] transition-all cursor-pointer space-y-1 ${
                                          isReply1Selected ? 'ring-2 ring-[#6B2F2F]' : 'hover:border-[#6B2F2F]'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <div className="flex items-center gap-2">
                                            <img
                                              src={reply1.avatarUrl}
                                              alt={reply1.firstName}
                                              className="w-6 h-6 rounded-full object-cover ring-1 ring-[#A44A3F] shrink-0"
                                            />
                                            <span className="font-heading text-xs sm:text-sm font-bold text-[#6B2F2F] dark:text-[#F4D6C6]">
                                              {reply1.firstName}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                                              <CornerDownRight className="w-3 h-3" />
                                              <span>Απάντηση</span>
                                            </span>
                                            <span className="text-[10px] font-semibold text-stone-400">
                                              {reply1.createdAt}
                                            </span>
                                          </div>
                                        </div>

                                        <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 font-medium leading-relaxed break-words">
                                          {reply1.content}
                                        </p>
                                      </div>

                                      {/* Level 2 (3rd Level) Replies: Shifted further right + distinct background shade */}
                                      {level2Replies.map((reply2) => (
                                        <div
                                          key={reply2.id}
                                          onClick={() => {
                                            setReplyingToMsg(reply1);
                                            composerInputRef.current?.focus();
                                          }}
                                          className="ml-8 sm:ml-12 p-3 rounded-2xl bg-[#F4D6C6]/90 dark:bg-[#2d2222] border-l-4 border border-[#A44A3F]/60 border-l-[#6B2F2F] transition-all cursor-pointer space-y-1 shadow-2xs"
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
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
