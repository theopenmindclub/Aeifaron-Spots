import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { HitSpot } from '../types';
import { CATEGORY_TRANSLATIONS, REGION_TRANSLATIONS } from '../i18n/translations';
import { 
  X, 
  Search, 
  Sparkles, 
  MapPin, 
  ExternalLink, 
  Star, 
  Loader2, 
  Compass,
  Navigation,
  BookmarkPlus,
  Tag,
  Globe
} from 'lucide-react';
import { motion } from 'motion/react';

interface AiMatchedSpot extends HitSpot {
  matchType?: 'exact' | 'close' | 'general';
  aiMatchReason?: string;
}

interface LiveDiscoveryData {
  summaryText: string;
  mapsPlaces: { title: string; uri: string; snippet?: string }[];
  webLinks: { title: string; uri: string; snippet?: string }[];
}

const DEFAULT_USER_KEYWORDS = [
  'λουκάνικο χωριάτικο',
  'παγωτό με πρόβειο γάλα',
  'σουβλάκι αλάδωτο',
  'προζυμένιο ψωμί ξυλόφουρνου',
  'φρέσκο ψάρι στα κάρβουνα',
  'χειροποίητη μπουγάτσα'
];

// Normalize Greek strings (remove accents/diacritics for accurate stem/fuzzy matching)
function normalizeGreek(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const SYNONYM_CLUSTERS: string[][] = [
  ['λουκανικο', 'χωριατικο', 'κρεας', 'χοιρινο', 'καλαμακι', 'σουβλακι', 'μπιφτεκακι', 'καρβουνα', 'ταβερνα', 'κατσικακι', 'τσιγαριαστο', 'σχαρα', 'μοσχαρισια'],
  ['παγωτο', 'προβειο', 'γαλα', 'κατσικισιο', 'gelato', 'καϊμακι', 'σαλεπι', 'φιστικι', 'κρεμα', 'γλυκο'],
  ['ψαρι', 'θαλασσινα', 'φαγκρι', 'μπαρμπουνι', 'αχινος', 'κακαβια', 'ψαροταβερνα', 'θαλασσα'],
  ['μπουγατσα', 'φυλλο', 'πιτα', 'τυρι', 'κιμα', 'ξυλοφουρνος', 'προζυμι', 'ψωμι', 'φουρνος'],
  ['παραλια', 'θαλασσα', 'αμμος', 'κεδροδασος', 'ελαφονησι', 'κρητη', 'νησι']
];

export const AiSearchModal: React.FC = () => {
  const { 
    isAiSearchModalOpen, 
    setIsAiSearchModalOpen, 
    spots, 
    setSelectedSpot, 
    language,
    showToast
  } = useApp();

  const [query, setQuery] = useState('');
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [userKeywords, setUserKeywords] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aeifaron_user_keywords');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_USER_KEYWORDS;
  });

  const [results, setResults] = useState<AiMatchedSpot[]>([]);
  const [liveDiscovery, setLiveDiscovery] = useState<LiveDiscoveryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync user keywords from backend on mount
  useEffect(() => {
    fetch('/api/user-keywords')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setUserKeywords((prev) => {
            const merged = [...prev];
            for (const kw of data) {
              if (!merged.some((m) => m.toLowerCase() === kw.toLowerCase())) {
                merged.push(kw);
              }
            }
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  const saveKeyword = async (rawKw: string) => {
    const clean = rawKw.trim();
    if (!clean) return;

    if (userKeywords.some((k) => k.toLowerCase() === clean.toLowerCase())) {
      setQuery(clean);
      showToast(
        language === 'el'
          ? `Η λέξη-κλειδί «${clean}» είναι ήδη καταχωρημένη!`
          : `Keyword "${clean}" is already saved!`,
        'info'
      );
      return;
    }

    const updated = [clean, ...userKeywords];
    setUserKeywords(updated);
    try {
      localStorage.setItem('aeifaron_user_keywords', JSON.stringify(updated));
    } catch {}

    setQuery(clean);
    setNewKeywordInput('');

    try {
      await fetch('/api/user-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: clean })
      });
    } catch {}

    showToast(
      language === 'el'
        ? `Καταχωρήθηκε η λέξη-κλειδί: «${clean}»!`
        : `Saved keyword: "${clean}"!`,
      'success'
    );
  };

  const removeKeyword = async (kwToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = userKeywords.filter((k) => k !== kwToRemove);
    setUserKeywords(updated);
    try {
      localStorage.setItem('aeifaron_user_keywords', JSON.stringify(updated));
    } catch {}
    try {
      await fetch('/api/user-keywords', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: kwToRemove })
      });
    } catch {}
  };

  // Instant local ranking & debounced AI search returning exact and closely related spots in order
  useEffect(() => {
    if (!isAiSearchModalOpen) return;

    const qRaw = query.trim();
    const qNorm = normalizeGreek(qRaw);

    const computeOrderedResults = (): AiMatchedSpot[] => {
      const words = qNorm.split(/\s+/).filter((w) => w.length >= 2);

      // Find closely related culinary terms
      const relatedTerms = new Set<string>();
      for (const w of words) {
        const stem = w.length > 4 ? w.slice(0, -1) : w;
        for (const grp of SYNONYM_CLUSTERS) {
          if (grp.some((term) => term.includes(stem) || stem.includes(term))) {
            grp.forEach((t) => relatedTerms.add(t));
          }
        }
      }

      const scored = spots.map((spot) => {
        const hayRaw = `${spot.title} ${spot.titleEl || ''} ${spot.category} ${spot.region} ${spot.address} ${spot.whyIsItSpecial} ${spot.whyIsItSpecialEl || ''} ${(spot.signatureDishes || []).join(' ')} ${(spot.signatureDishesEl || []).join(' ')} ${(spot.tags || []).join(' ')}`;
        const hayNorm = normalizeGreek(hayRaw);

        const exactPhraseMatch = qNorm.length > 0 && hayNorm.includes(qNorm);
        let matchedWordsCount = 0;
        let stemMatchesCount = 0;
        let relatedMatchesCount = 0;

        for (const w of words) {
          const stem = w.length > 4 ? w.slice(0, -2) : w;
          if (hayNorm.includes(w)) {
            matchedWordsCount += 1;
          } else if (stem.length >= 3 && hayNorm.includes(stem)) {
            stemMatchesCount += 1;
          }
        }

        for (const rel of relatedTerms) {
          if (hayNorm.includes(rel)) {
            relatedMatchesCount += 1;
          }
        }

        let score = spot.rating * 5;
        let matchType: 'exact' | 'close' | 'general' = 'general';
        let aiMatchReason = `Κορυφαίο Spot στον χάρτη βάσει αξιολόγησης ★ ${spot.rating.toFixed(2)}`;

        if (!qNorm) {
          score += spot.rating * 10;
        } else if (exactPhraseMatch || (words.length > 0 && matchedWordsCount === words.length)) {
          score += 500 + matchedWordsCount * 80;
          matchType = 'exact';
          aiMatchReason = `Περιλαμβάνει ακριβώς τον όρο «${qRaw}» • ★ ${spot.rating.toFixed(2)}`;
        } else if (matchedWordsCount > 0 || stemMatchesCount > 0) {
          score += 250 + matchedWordsCount * 70 + stemMatchesCount * 45 + relatedMatchesCount * 15;
          matchType = 'exact';
          aiMatchReason = `Περιλαμβάνει τον όρο «${qRaw}» • ★ ${spot.rating.toFixed(2)}`;
        } else if (relatedMatchesCount > 0) {
          score += 100 + relatedMatchesCount * 25;
          matchType = 'close';
          aiMatchReason = `Πολύ κοντά στον όρο «${qRaw}» (παρεμφερή πιάτα/γεύσεις) • ★ ${spot.rating.toFixed(2)}`;
        }

        return {
          ...spot,
          _score: score,
          matchType,
          aiMatchReason
        };
      });

      scored.sort((a, b) => b._score - a._score || b.rating - a.rating);

      if (qNorm) {
        const exactOrClose = scored.filter((item) => item.matchType === 'exact' || item.matchType === 'close');
        if (exactOrClose.length > 0) {
          return exactOrClose;
        }
      }
      return scored.slice(0, 5);
    };

    setResults(computeOrderedResults());

    if (!qNorm) {
      setLiveDiscovery(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/ai/search-spots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: qRaw })
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.results) && data.results.length > 0) {
            setResults(data.results);
          }
          if (data.liveDiscovery) {
            setLiveDiscovery(data.liveDiscovery);
          }
        }
      } catch (e) {
        // Keep instant ordered results fallback
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isAiSearchModalOpen, spots]);

  if (!isAiSearchModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-3xl bg-[#FFFDF9] dark:bg-[#1b2d28] rounded-3xl shadow-2xl border-2 border-[#6B8E7B] my-auto overflow-hidden flex flex-col max-h-[92vh]"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#243B35] text-[#F1E9D2] border-b border-[#6B8E7B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6B8E7B] text-[#CDFF9B] flex items-center justify-center shadow-sm">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#F1E9D2]">
                {language === 'el'
                  ? 'Εξερεύνηση για Spots (Αναζήτηση & Λέξεις-Κλειδιά)'
                  : 'Explore for Spots (Search & User Keywords)'}
              </h2>
              <p className="text-xs text-[#B7C9B1] font-medium">
                {language === 'el'
                  ? 'Γράψτε λέξεις-κλειδιά για ζωντανή αναζήτηση στο διαδίκτυο, στο Google Maps και στην κοινότητα για νέες γαστρονομικές εμπειρίες!'
                  : 'Enter keywords for live search across the web, Google Maps, and the community for new culinary experiences!'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAiSearchModalOpen(false)}
            className="p-2 rounded-xl bg-[#6B8E7B]/40 hover:bg-[#6B8E7B] text-[#F1E9D2] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Box & User-Registered Keywords Manager */}
        <div className="p-5 sm:p-6 bg-[#F1E9D2] dark:bg-[#243B35] border-b border-[#6B8E7B]/50 space-y-4">
          
          {/* Main Live Search Input */}
          <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl border-2 border-[#243B35] dark:border-[#6B8E7B] shadow-md">
            <Search className="w-5 h-5 text-[#243B35] dark:text-[#CDFF9B] ml-4 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                language === 'el'
                  ? 'Γράψτε λέξη-κλειδί για ζωντανή αναζήτηση σε Web & Google Maps (π.χ. λουκάνικο χωριάτικο)...'
                  : 'Enter keyword for live Web & Google Maps search (e.g. village sausage, sheep milk gelato)...'
              }
              className="w-full px-3.5 py-3.5 bg-transparent text-stone-900 dark:text-white placeholder-stone-400 text-sm sm:text-base font-semibold focus:outline-none"
              autoFocus
            />
            {isLoading && (
              <Loader2 className="w-5 h-5 text-[#6B2F2F] animate-spin mr-2 shrink-0" />
            )}
            {query.trim() && (
              <button
                type="button"
                onClick={() => saveKeyword(query)}
                title={language === 'el' ? 'Καταχώρηση αυτής της λέξης-κλειδιού στις αποθηκευμένες σας' : 'Save this keyword'}
                className="px-3 py-1.5 mr-1.5 rounded-xl bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6] text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'el' ? 'Καταχώρηση όρου' : 'Save term'}</span>
              </button>
            )}
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-2 mr-2 text-stone-400 hover:text-stone-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Direct Quick Launch Buttons for Google Maps & Google Web Search when keyword is typed */}
          {query.trim() && (
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query.trim() + ' Ελλάδα')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#243B35] hover:bg-[#6B8E7B] text-[#CDFF9B] text-xs font-extrabold shadow-xs transition-all"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Ζωντανή Αναζήτηση «{query.trim()}» απευθείας στο Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(query.trim() + ' καλύτερα spots φαγητό Ελλάδα')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6] text-xs font-extrabold shadow-xs transition-all"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Ζωντανή Αναζήτηση «{query.trim()}» στο Διαδίκτυο (Google Web)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* User-Registered Keywords Box ("Καταχωρημένες λέξεις-κλειδιά από τον ίδιο τον χρήστη") */}
          <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#1b2d28] border border-[#6B8E7B] space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#243B35] dark:text-[#CDFF9B]">
                <Tag className="w-3.5 h-3.5 text-[#6B2F2F] dark:text-[#CDFF9B]" />
                <span>
                  {language === 'el'
                    ? 'Καταχωρημένες Λέξεις-Κλειδιά Χρήστη (Κλικ για ζωντανή αναζήτηση σε Web & Maps):'
                    : 'Your Saved Keywords (Click for live search on Web & Maps):'}
                </span>
              </div>

              {/* Add new custom keyword form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newKeywordInput.trim()) return;
                  saveKeyword(newKeywordInput);
                }}
                className="flex items-center gap-1.5"
              >
                <input
                  type="text"
                  value={newKeywordInput}
                  onChange={(e) => setNewKeywordInput(e.target.value)}
                  placeholder={
                    language === 'el'
                      ? '+ Νέα λέξη-κλειδί (π.χ. λουκάνικο χωριάτικο)...'
                      : '+ Add keyword...'
                  }
                  className="px-3 py-1.5 rounded-xl bg-[#F1E9D2]/70 dark:bg-slate-900 border border-[#6B8E7B] text-xs font-semibold text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B2F2F] w-full sm:w-60"
                />
                <button
                  type="submit"
                  disabled={!newKeywordInput.trim()}
                  className="px-3 py-1.5 rounded-xl bg-[#6B2F2F] hover:bg-[#A44A3F] disabled:opacity-50 text-[#F4D6C6] text-xs font-extrabold cursor-pointer shrink-0"
                >
                  {language === 'el' ? '+ Καταχώρηση' : '+ Save'}
                </button>
              </form>
            </div>

            {/* Saved Keywords Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {userKeywords.map((kw) => {
                const isActive = query.trim().toLowerCase() === kw.toLowerCase();
                return (
                  <div
                    key={kw}
                    onClick={() => setQuery(isActive ? '' : kw)}
                    className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-[#6B2F2F] text-[#F4D6C6] border-[#D88C72] ring-2 ring-[#A44A3F] shadow-sm scale-[1.02]'
                        : 'bg-[#F4D6C6] dark:bg-slate-800 text-[#6B2F2F] dark:text-[#F4D6C6] border-[#D88C72] hover:bg-[#6B2F2F] hover:text-[#F4D6C6]'
                    }`}
                  >
                    <span>«{kw}»</span>
                    <button
                      type="button"
                      onClick={(e) => removeKeyword(kw, e)}
                      title={language === 'el' ? 'Διαγραφή λέξης-κλειδιού' : 'Remove keyword'}
                      className="opacity-60 hover:opacity-100 p-0.5 rounded-full hover:bg-black/20"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ordered Results List + Live Web & Google Maps Grounding Discovery */}
        <div className="overflow-y-auto p-6 space-y-6">
          
          {/* LIVE INTERNET & GOOGLE MAPS DISCOVERY SECTION (Shown when a keyword is active) */}
          {query.trim() && (
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#243B35] to-[#1b2d28] text-[#F1E9D2] border-2 border-[#6B8E7B] shadow-lg space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#6B8E7B]/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#6B8E7B] text-[#CDFF9B]">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg sm:text-xl font-bold text-[#CDFF9B]">
                      Ζωντανή Αναζήτηση στο Διαδίκτυο &amp; Google Maps για «{query.trim()}»
                    </h3>
                    <p className="text-xs text-[#B7C9B1] font-medium">
                      Ανακαλύψτε νέες γαστρονομικές εμπειρίες από το Google Maps και τον Παγκόσμιο Ιστό
                    </p>
                  </div>
                </div>
                {isLoading && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6B8E7B]/40 text-[#CDFF9B] text-xs font-bold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Ζωντανή αναζήτηση...</span>
                  </span>
                )}
              </div>

              {liveDiscovery ? (
                <div className="space-y-4">
                  {/* AI Grounded Summary */}
                  {liveDiscovery.summaryText && (
                    <div className="p-3.5 rounded-2xl bg-white/10 border border-[#6B8E7B]/60 text-xs sm:text-sm text-[#F1E9D2] leading-relaxed whitespace-pre-line font-medium">
                      {liveDiscovery.summaryText}
                    </div>
                  )}

                  {/* Google Maps Grounding Places */}
                  {liveDiscovery.mapsPlaces && liveDiscovery.mapsPlaces.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-extrabold uppercase tracking-wider text-[#CDFF9B] flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>Σημεία &amp; Καταστήματα από το Google Maps:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {liveDiscovery.mapsPlaces.map((place, pIdx) => (
                          <a
                            key={pIdx}
                            href={place.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-2xl bg-white/95 dark:bg-slate-900 text-stone-900 dark:text-white border border-[#6B8E7B] hover:border-[#CDFF9B] transition-all flex items-start justify-between gap-2 shadow-xs group"
                          >
                            <div className="min-w-0 space-y-0.5">
                              <div className="font-heading text-sm font-bold text-[#243B35] dark:text-[#CDFF9B] group-hover:underline flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-[#A44A3F] shrink-0" />
                                <span className="truncate">{place.title}</span>
                              </div>
                              {place.snippet && (
                                <p className="text-[11px] text-stone-600 dark:text-stone-300 line-clamp-2 font-medium">
                                  {place.snippet}
                                </p>
                              )}
                            </div>
                            <ExternalLink className="w-4 h-4 text-[#6B2F2F] dark:text-[#CDFF9B] shrink-0 mt-0.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Google Web Search Grounding Links */}
                  {liveDiscovery.webLinks && liveDiscovery.webLinks.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-extrabold uppercase tracking-wider text-[#F4D6C6] flex items-center gap-1.5">
                        <Globe className="w-4 h-4" />
                        <span>Πηγές &amp; Γαστρονομικοί Οδηγοί από το Διαδίκτυο:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {liveDiscovery.webLinks.map((web, wIdx) => (
                          <a
                            key={wIdx}
                            href={web.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-2xl bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6] border border-[#D88C72]/60 transition-all flex items-center justify-between gap-2 shadow-xs"
                          >
                            <div className="min-w-0">
                              <div className="font-heading text-xs sm:text-sm font-bold truncate">
                                {web.title}
                              </div>
                              {web.snippet && (
                                <p className="text-[10px] text-[#F4D6C6]/80 truncate">
                                  {web.snippet}
                                </p>
                              )}
                            </div>
                            <ExternalLink className="w-4 h-4 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-[#B7C9B1] font-medium">
                  Αναζήτηση νέων γαστρονομικών εμπειριών στο Google Maps και στο διαδίκτυο για «{query.trim()}»...
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#6B2F2F] dark:text-[#F4D6C6]">
                <Sparkles className="w-4 h-4" />
                <span>
                  {query.trim()
                    ? language === 'el'
                      ? `Καταχωρημένα Spots Κοινότητας για «${query}» (${results.length} στη σειρά)`
                      : `Community Spots for "${query}" (${results.length} in order)`
                    : language === 'el'
                    ? 'Κορυφαία Spots στους Χάρτες (Κλικ σε λέξη-κλειδί για ζωντανή αναζήτηση)'
                    : 'Top Spots on Maps (Click a keyword for live search)'}
                </span>
              </div>
              <span className="text-xs font-bold text-stone-500 dark:text-[#B7C9B1]">
                {language === 'el'
                  ? 'Ακριβής όρος & πολύ κοντινές επιλογές στη σειρά ★'
                  : 'Exact match & closely related spots in order ★'}
              </span>
            </div>

          <div className="space-y-3.5">
            {results.map((spot, index) => {
              const displayTitle = language === 'el' && spot.titleEl ? spot.titleEl : spot.title;
              const catConfig = CATEGORY_TRANSLATIONS[spot.category] || { icon: '📍', el: spot.category, en: spot.category };
              const regConfig = REGION_TRANSLATIONS[spot.region] || { el: spot.region, en: spot.region };
              const isBeach = spot.category === 'Παραλίες';
              const isExact = spot.matchType === 'exact';
              const isClose = spot.matchType === 'close';

              return (
                <div
                  key={spot.id}
                  className="p-4 rounded-2xl bg-[#FFF7F2] dark:bg-slate-900 border-2 border-[#D88C72] dark:border-slate-700 hover:border-[#6B2F2F] dark:hover:border-[#F4D6C6] shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Rank Number */}
                    <div
                      className={`w-10 h-10 rounded-xl font-heading font-bold text-lg flex items-center justify-center shrink-0 shadow-xs ${
                        isBeach
                          ? 'bg-[#14B8A6] text-white border border-[#FF6B54]'
                          : 'bg-[#6B2F2F] text-[#F4D6C6]'
                      }`}
                    >
                      #{index + 1}
                    </div>

                    <img
                      src={spot.coverImageUrl}
                      alt={displayTitle}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#D88C72] dark:border-slate-700"
                    />

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={spot.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-heading text-lg sm:text-xl font-bold text-[#6B2F2F] dark:text-white hover:text-[#A44A3F] dark:hover:text-[#F4D6C6] hover:underline flex items-center gap-1.5"
                          title="Άνοιγμα ανεξάρτητα στους Χάρτες Google Maps"
                        >
                          <span>{displayTitle}</span>
                          <ExternalLink className="w-4 h-4 text-[#A44A3F] shrink-0" />
                        </a>

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#A44A3F] text-[#F4D6C6] text-xs font-black">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{spot.rating.toFixed(2)}</span>
                        </span>

                        {query.trim() && (isExact || isClose) && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                              isExact
                                ? 'bg-[#243B35] text-[#CDFF9B]'
                                : 'bg-[#D88C72]/50 text-[#6B2F2F] dark:text-[#F4D6C6]'
                            }`}
                          >
                            {isExact
                              ? language === 'el'
                                ? '✓ Περιλαμβάνει τον όρο'
                                : '✓ Includes term'
                              : language === 'el'
                              ? '≈ Πολύ κοντά στον όρο'
                              : '≈ Closely related'}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B2F2F]/80 dark:text-stone-400 font-semibold">
                        <span>{catConfig.icon} {language === 'el' ? catConfig.el : catConfig.en}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#A44A3F]" />
                          {spot.address} ({language === 'el' ? regConfig.el : regConfig.en})
                        </span>
                      </div>

                      {spot.aiMatchReason && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F4D6C6] dark:bg-slate-800 text-[#6B2F2F] dark:text-[#F4D6C6] text-xs font-bold border border-[#D88C72] dark:border-slate-700">
                          <Sparkles className="w-3.5 h-3.5 text-[#A44A3F] shrink-0" />
                          <span>{spot.aiMatchReason}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Direct Google Maps Clickable CTA + Card Details button */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 shrink-0">
                    <a
                      href={spot.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6] text-xs font-extrabold shadow-sm transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{language === 'el' ? 'Άνοιγμα Google Maps' : 'Open Google Maps'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => {
                        setIsAiSearchModalOpen(false);
                        setSelectedSpot(spot);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#F4D6C6] dark:bg-slate-800 hover:bg-[#D88C72] text-[#6B2F2F] dark:text-stone-300 text-xs font-bold cursor-pointer"
                    >
                      {language === 'el' ? 'Προβολή Καρτέλας' : 'View Card'}
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
