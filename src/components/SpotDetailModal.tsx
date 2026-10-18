import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORY_TRANSLATIONS, REGION_TRANSLATIONS, BADGE_TRANSLATIONS } from '../i18n/translations';
import { getGamificationBadge, getGamificationInfo, HitSpot } from '../types';
import { StreetViewModal } from './StreetViewModal';
import { 
  X, 
  Star, 
  MapPin, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  Utensils, 
  Send, 
  MessageSquare, 
  Clock, 
  ShieldAlert, 
  CornerDownRight, 
  Lightbulb, 
  Image as ImageIcon,
  Check,
  Camera,
  Heart,
  Youtube,
  Award,
  Plus,
  Edit3
} from 'lucide-react';
import { motion } from 'motion/react';

function extractYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const regExp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
  const match = trimmed.match(regExp);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}

// Generates 3 balanced rows of authentic preview tags with '#' prefix for any food spot
function getSpotPreviewTags(spot: HitSpot): string[][] {
  const titleLow = (spot.title + ' ' + (spot.titleEl || '')).toLowerCase();
  
  if (spot.id === 'spot-2' || titleLow.includes('kostas') || titleLow.includes('κώστας')) {
    return [
      ['#χειροποίητο σουβλάκι', '#αλάδωτη πίτα', '#καλαμάκι χοιρινό'],
      ['#μυστική κόκκινη σάλτσα', '#φρέσκος μαϊντανός', '#πρόβειο γιαούρτι'],
      ['#παραδοσιακή συνταγή 1950', '#ψημένο στην πλάκα', '#ιστορικό spot']
    ];
  }
  if (spot.id === 'spot-3' || titleLow.includes('dounias') || titleLow.includes('ντουνιάς')) {
    return [
      ['#παραδοσιακά μυζηθροπιτάκια', '#σφακιανή πίτα', '#τσικαλάτο κατσικάκι'],
      ['#ξυλόφουρνος', '#προζυμένιο ψωμί', '#βιολογική φάρμα'],
      ['#κρητική γαστρονομία', '#στάκα', '#χανιώτικο μπουρέκι']
    ];
  }
  if (spot.id === 'spot-1' || titleLow.includes('epik') || titleLow.includes('gelato')) {
    return [
      ['#χειροποίητο gelato', '#φιστίκι αιγίνης ΠΟΠ', '#πρόβειο γάλα'],
      ['#αυθεντικό καϊμάκι', '#σαλέπι', '#bitter σοκολάτα'],
      ['#ελαιόλαδο καλαμάτας', '#φρέσκα υλικά', '#artisan γεύσεις']
    ];
  }
  if (spot.id === 'spot-4' || titleLow.includes('thalassino') || titleLow.includes('θαλασσινό')) {
    return [
      ['#φρέσκο ψάρι', '#θαλασσινά αιγαίου', '#ταμπακαριά'],
      ['#κακαβιά', '#χταπόδι ξυδάτο', '#ταρτάρ τόνου'],
      ['#ψαροταβέρνα στο κύμα', '#ρομαντικό ηλιοβασίλεμα', '#χανιά']
    ];
  }
  if (spot.id === 'spot-5' || titleLow.includes('koukos') || titleLow.includes('κούκος')) {
    return [
      ['#μπουγάτσα με κρέμα', '#χειροποίητο φύλλο', '#μπουγάτσα με κιμά'],
      ['#παραδοσιακή συνταγή 1922', '#τραγανό φύλλο', '#ζεστή κανέλα'],
      ['#θεσσαλονικιώτικη παράδοση', '#πρωινό hit', '#αυθεντική γεύση']
    ];
  }
  if (spot.id === 'spot-6' || titleLow.includes('matina') || titleLow.includes('ματίνα')) {
    return [
      ['#πατάτες νάξου', '#ντόπια γραβιέρα', '#κολοκυθοκεφτέδες'],
      ['#βιολογικό περιβόλι', '#αρνάκι λεμονάτο', '#ξυλόφουρνος'],
      ['#κυκλαδίτικη κουζίνα', '#κορώνος', '#αυθεντικό χωριό']
    ];
  }

  // Dynamic tags extraction for all other spots
  const rawTags: string[] = [];
  const dishes = (spot.signatureDishesEl && spot.signatureDishesEl.length > 0)
    ? spot.signatureDishesEl
    : spot.signatureDishes;

  dishes.forEach((d) => {
    const clean = d.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').trim().toLowerCase();
    if (clean) rawTags.push(`#${clean}`);
  });

  if (spot.tags && spot.tags.length > 0) {
    spot.tags.forEach((t) => {
      const clean = t.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').trim().toLowerCase();
      if (clean) rawTags.push(`#${clean}`);
    });
  }

  if (rawTags.length < 6) {
    if (spot.category === 'Authentic Souvlaki') {
      rawTags.push('#χειροποίητο σουβλάκι', '#αλάδωτη πίτα', '#καρβουνιστή γεύση', '#παραδοσιακό');
    } else if (spot.category === 'Gelato') {
      rawTags.push('#χειροποίητο gelato', '#φρέσκα υλικά', '#παραδοσιακή γεύση', '#artisan');
    } else if (spot.category === 'Seafood & Psarotaverna') {
      rawTags.push('#φρέσκο ψάρι', '#θαλασσινοί μεζέδες', '#αιγαίο', '#αυθεντική ψαροταβέρνα');
    } else if (spot.category === 'Hidden Mountain Taverna') {
      rawTags.push('#παραδοσιακά μυζηθροπιτάκια', '#σφακιανή πίτα', '#τσικαλάτο', '#ξυλόφουρνος');
    } else if (spot.category === 'Bougatsa & Pastry') {
      rawTags.push('#χειροποίητο φύλλο', '#μπουγάτσα', '#τραγανή σφολιάτα', '#ζεστή κρέμα');
    } else {
      rawTags.push('#αυθεντική γεύση', '#τοπική γαστρονομία', '#μυστική συνταγή', '#παραδοσιακό spot');
    }
  }

  const unique = Array.from(new Set(rawTags));
  const perRow = Math.max(2, Math.ceil(unique.length / 3));
  return [
    unique.slice(0, perRow),
    unique.slice(perRow, perRow * 2),
    unique.slice(perRow * 2, perRow * 3)
  ];
}

export const SpotDetailModal: React.FC = () => {
  const { 
    selectedSpot, 
    setSelectedSpot, 
    reviews, 
    language, 
    t, 
    currentUser, 
    allUsers,
    spots,
    addReview, 
    addReply, 
    updateHitSpot,
    favoriteSpotIds,
    toggleFavoriteSpot,
    setLightboxUrl,
    showToast 
  } = useApp();

  // Review Form state
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewContent, setReviewContent] = useState('');
  const [signatureOrdered, setSignatureOrdered] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moderationError, setModerationError] = useState<{ message: string; messageEl: string } | null>(null);

  // Reply state
  const [activeReplyReviewId, setActiveReplyReviewId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Share copied state
  const [isCopied, setIsCopied] = useState(false);

  // Street view guide modal state
  const [isStreetViewOpen, setIsStreetViewOpen] = useState(false);

  // User interactive Like and Visited (Quality confirmation) state
  const [likedSpotIds, setLikedSpotIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hitspots_user_likes');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['spot-2'];
  });

  const [visitedSpotIds, setVisitedSpotIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hitspots_user_visited');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['spot-2', 'spot-3'];
  });

  // Add YouTube Video / Update Spot state
  const [isAddingYoutube, setIsAddingYoutube] = useState(false);
  const [newYoutubeUrl, setNewYoutubeUrl] = useState('');
  const [isEditingSpotInfo, setIsEditingSpotInfo] = useState(false);
  const [editedInsiderTip, setEditedInsiderTip] = useState('');
  const [isSavingSpotUpdate, setIsSavingSpotUpdate] = useState(false);

  if (!selectedSpot) return null;

  const isFavorite = favoriteSpotIds.includes(selectedSpot.id);
  const isLiked = likedSpotIds.includes(selectedSpot.id);
  const isVisited = visitedSpotIds.includes(selectedSpot.id);

  const handleToggleLike = () => {
    const updated = isLiked
      ? likedSpotIds.filter((id) => id !== selectedSpot.id)
      : [...likedSpotIds, selectedSpot.id];
    setLikedSpotIds(updated);
    try {
      localStorage.setItem('hitspots_user_likes', JSON.stringify(updated));
    } catch {}
    showToast(
      isLiked ? 'Αφαιρέθηκε το Like' : '👍 Σας ευχαριστούμε για το Like στο Spot!',
      'success'
    );
  };

  const handleToggleVisited = () => {
    const updated = isVisited
      ? visitedSpotIds.filter((id) => id !== selectedSpot.id)
      : [...visitedSpotIds, selectedSpot.id];
    setVisitedSpotIds(updated);
    try {
      localStorage.setItem('hitspots_user_visited', JSON.stringify(updated));
    } catch {}
    showToast(
      isVisited
        ? 'Αφαιρέθηκε η επιβεβαίωση επίσκεψης'
        : '👑 Επιβεβαιώσατε την επίσκεψη και την ποιότητα της σύστασης!',
      'success'
    );
  };

  const isBeach = selectedSpot.category === 'Παραλίες';
  const isLocation = selectedSpot.category === 'Τοποθεσίες';
  const spotReviews = reviews.filter((r) => r.spotId === selectedSpot.id);
  const categoryConfig = CATEGORY_TRANSLATIONS[selectedSpot.category] || { el: selectedSpot.category, en: selectedSpot.category, icon: '🍽️' };
  const regionConfig = REGION_TRANSLATIONS[selectedSpot.region] || { el: selectedSpot.region, en: selectedSpot.region };
  const authorGamification = getGamificationInfo(selectedSpot.author?.spotsSubmittedCount || 1, selectedSpot.author?.reviewsCount || 0);
  const authorBadgeName = authorGamification.badge;
  const authorRank = allUsers && spots
    ? [...allUsers]
        .map((u) => {
          const userSpots = spots.filter((s) => s.authorId === u.id);
          const spotsCount = Math.max(u.spotsSubmittedCount || 0, userSpots.length);
          const starsReceived = userSpots.reduce((acc, s) => acc + s.rating, 0);
          const xp = spotsCount * 100 + Math.round(starsReceived * 10) + (u.reviewsCount || 0) * 20;
          return { id: u.id, xp };
        })
        .sort((a, b) => b.xp - a.xp)
        .findIndex((u) => u.id === selectedSpot.authorId) + 1
    : 1;

  const displayTitle = language === 'el' && selectedSpot.titleEl ? selectedSpot.titleEl : selectedSpot.title;
  const displaySecretSauce = language === 'el' && selectedSpot.whyIsItSpecialEl ? selectedSpot.whyIsItSpecialEl : selectedSpot.whyIsItSpecial;
  const displaySignature = (language === 'el' && selectedSpot.signatureDishesEl && selectedSpot.signatureDishesEl.length > 0) 
    ? selectedSpot.signatureDishesEl 
    : selectedSpot.signatureDishes;
  const tagRows = getSpotPreviewTags(selectedSpot);
  const spotLikes = (selectedSpot.helpfulVotes || (selectedSpot.reviewsCount * 2 + 14)) + (isLiked ? 1 : 0);
  const visitedCount = (selectedSpot.verifiedSpot ? 18 : 7) + (isVisited ? 1 : 0);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewContent.trim()) return;

    setIsSubmitting(true);
    setModerationError(null);

    const res = await addReview(selectedSpot.id, reviewContent.trim(), rating, signatureOrdered.trim());
    setIsSubmitting(false);

    if (res.success) {
      setReviewContent('');
      setSignatureOrdered('');
    } else if (res.moderation && !res.moderation.approved) {
      setModerationError({
        message: res.moderation.reason,
        messageEl: res.moderation.reasonEl
      });
    }
  };

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyContent.trim()) return;
    setIsSubmittingReply(true);

    const res = await addReply(reviewId, replyContent.trim());
    setIsSubmittingReply(false);

    if (res.success) {
      setReplyContent('');
      setActiveReplyReviewId(null);
    }
  };

  const handleViberShare = () => {
    const shareUrl = `${window.location.origin}/?spot=${selectedSpot.id}`;
    const shareText = `Δείτε αυτό το Spot στο Aeifaron Spots: "${displayTitle}" (${selectedSpot.address})! ${shareUrl}`;
    window.location.href = `viber://forward?text=${encodeURIComponent(shareText)}`;
    showToast('Άνοιγμα Viber για κοινοποίηση...', 'info');
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/?spot=${selectedSpot.id}`;
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
    showToast('Το link της καρτέλας αντιγράφηκε επιτυχώς!', 'success');
  };

  const handleAddYoutubeVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newYoutubeUrl.trim();
    if (!clean) return;
    if (!extractYouTubeEmbedUrl(clean) && !clean.includes('youtube.com') && !clean.includes('youtu.be')) {
      showToast('Παρακαλώ εισάγετε έγκυρο σύνδεσμο YouTube (π.χ. https://www.youtube.com/watch?v=...)', 'error');
      return;
    }
    setIsSavingSpotUpdate(true);
    const existingVideos = Array.isArray(selectedSpot.youtubeVideoUrls) ? selectedSpot.youtubeVideoUrls : [];
    const updatedVideos = [...existingVideos, clean];
    const res = await updateHitSpot(selectedSpot.id, {
      youtubeVideoUrls: updatedVideos,
      updateSummary: `Προστέθηκε νέο YouTube Video από το μέρος «${displayTitle}»`
    });
    setIsSavingSpotUpdate(false);
    if (res.success) {
      setNewYoutubeUrl('');
      setIsAddingYoutube(false);
    }
  };

  const handleSaveInsiderUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedInsiderTip.trim()) return;
    setIsSavingSpotUpdate(true);
    const res = await updateHitSpot(selectedSpot.id, {
      insiderTips: editedInsiderTip.trim(),
      updateSummary: `Νέα ενημέρωση Insider Tip: «${editedInsiderTip.trim().slice(0, 90)}»`
    });
    setIsSavingSpotUpdate(false);
    if (res.success) {
      setIsEditingSpotInfo(false);
    }
  };

  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${selectedSpot.coordinates.lng - 0.008}%2C${selectedSpot.coordinates.lat - 0.005}%2C${selectedSpot.coordinates.lng + 0.008}%2C${selectedSpot.coordinates.lat + 0.005}&layer=mapnik&marker=${selectedSpot.coordinates.lat}%2C${selectedSpot.coordinates.lng}`;
  const youtubeVideos = Array.isArray(selectedSpot.youtubeVideoUrls)
    ? selectedSpot.youtubeVideoUrls.filter((u) => typeof u === 'string' && u.trim().length > 0)
    : [];

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6 transition-all">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.25 }}
          className={`relative w-full max-w-4xl rounded-3xl shadow-2xl border-2 my-auto overflow-hidden flex flex-col max-h-[92vh] ${
            isBeach
              ? 'bg-[#FFFDF9] dark:bg-[#0F172A] border-[#14B8A6]'
              : isLocation
              ? 'bg-[#DCBDA7] dark:bg-[#5B3E36] border-[#6B715A]'
              : 'bg-[#F4D6C6] dark:bg-[#6B2F2F] border-[#A44A3F]'
          }`}
        >
          
          {/* Fixed Modal Header: ONLY profile photo, full name + leaderboard level, and Red 'X' close button */}
          <div
            className={`sticky top-0 z-20 px-4 sm:px-6 py-3.5 backdrop-blur-md border-b flex items-center justify-between gap-3 shadow-xs ${
              isBeach
                ? 'bg-[#14B8A6] text-white border-[#FF6B54]'
                : isLocation
                ? 'bg-[#5B3E36] text-[#DCBDA7] border-[#6B715A]'
                : 'bg-[#5B2E28] text-[#F4D6C6] border-[#A44A3F]'
            }`}
          >
            {/* Left: Avatar + Full Name + Leaderboard Level Title */}
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={selectedSpot.author.avatarUrl}
                alt={selectedSpot.author.firstName}
                className="w-12 h-12 sm:w-13 sm:h-13 rounded-full object-cover ring-2 ring-[#D88C72] shrink-0 shadow-md"
              />
              <div className="min-w-0">
                <div className="font-heading text-base sm:text-lg md:text-xl font-black text-[#F1E9D2] leading-tight truncate">
                  {selectedSpot.author.firstName} {selectedSpot.author.lastName}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs sm:text-sm font-extrabold text-[#F4D6C6] flex items-center gap-1.5 truncate">
                    <span className="text-sm">{authorGamification.icon || '🏅'}</span>
                    <span>{authorGamification.titleEl}</span>
                  </span>
                  <span className="text-[10px] sm:text-xs font-black text-[#F4D6C6]/90 bg-black/25 px-2 py-0.5 rounded-md border border-white/10 shrink-0">
                    Rank #{authorRank > 0 ? authorRank : 1}
                  </span>
                </div>
              </div>
            </div>

            {/* Far Right: Thick Bold Bright Red 'X' Button to close the modal */}
            <button
              onClick={() => setSelectedSpot(null)}
              title="Κλείσιμο καρτέλας"
              aria-label="Κλείσιμο καρτέλας"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#DC2626] hover:bg-[#B91C1C] active:scale-95 text-white flex items-center justify-center shadow-xl border-2 border-red-300 font-black cursor-pointer shrink-0 transition-transform"
            >
              <X className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3.5]" />
            </button>
          </div>

          {/* Scrollable Content (rolls down) */}
          <div className="overflow-y-auto px-4 sm:px-6 py-5 space-y-5">
            
            {/* Action row: Red Heart (Favorites), Thumbs Up Like (Brand colors), Crown (Visited & Quality confirmed), Viber share */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* 1. Heart: Red "Αποθήκευση στα αγαπημένα" */}
              <button
                onClick={() => toggleFavoriteSpot(selectedSpot.id)}
                title={isFavorite ? 'Αφαίρεση από τα Αγαπημένα' : 'Αποθήκευση στα αγαπημένα'}
                className={`h-10 sm:h-11 px-3 sm:px-3.5 rounded-2xl flex items-center gap-1.5 font-heading font-black text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md ${
                  isFavorite
                    ? 'bg-[#DC2626] text-white ring-2 ring-white/60'
                    : 'bg-[#EF4444] hover:bg-[#DC2626] text-white'
                }`}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'fill-current' : 'fill-white'}`} />
                <span>Αγαπημένα</span>
              </button>

              {/* 2. 👍 Like indicator in card's brand colors */}
              <button
                onClick={handleToggleLike}
                title="Δείκτης Like - Πατήστε για Like!"
                className={`h-10 sm:h-11 px-3 sm:px-3.5 rounded-2xl flex items-center gap-1.5 font-heading font-black text-xs sm:text-sm border transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md ${
                  isBeach
                    ? 'bg-[#14B8A6] hover:bg-[#0d9488] text-white border-teal-300/40'
                    : isLocation
                    ? 'bg-[#6B715A] hover:bg-[#5B3E36] text-[#DCBDA7] border-[#B5A58C]/50'
                    : 'bg-[#A44A3F] hover:bg-[#853C35] text-[#F4D6C6] border-[#D88C72]/60'
                }`}
              >
                <span className="text-sm sm:text-base">👍</span>
                <span>{spotLikes}</span>
                <span className="text-[11px] opacity-90">Like</span>
              </button>

              {/* 3. Crown 👑: Indicates user visited and confirms quality of recommendation */}
              <button
                onClick={handleToggleVisited}
                title="Η κορώνα υποδηλώνει ότι ο χρήστης πήγε εκεί και επιβεβαιώνει την ποιότητα της σύστασης (Πατήστε για επιβεβαίωση)"
                className={`h-10 sm:h-11 px-3 sm:px-3.5 rounded-2xl flex items-center gap-1.5 font-heading font-black text-xs sm:text-sm border transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md ${
                  isVisited
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950 ring-2 ring-amber-300 font-black'
                    : isBeach
                    ? 'bg-[#087F5B] hover:bg-[#066045] text-amber-200 border-amber-300/40'
                    : isLocation
                    ? 'bg-[#5B3E36] hover:bg-[#6B715A] text-amber-300 border-amber-300/40'
                    : 'bg-[#6B2F2F] hover:bg-[#853C35] text-amber-300 border-amber-300/40'
                }`}
              >
                <span className="text-sm sm:text-base">👑</span>
                <span>{visitedCount}</span>
                <span className="text-[11px] opacity-90">Επιβεβαίωση</span>
              </button>

              {/* 4. Viber Share */}
              <button
                onClick={handleViberShare}
                title="Αποστολή στο Viber"
                className="h-10 sm:h-11 px-3 sm:px-3.5 rounded-2xl bg-[#7360F2] hover:bg-[#5f4de0] text-white flex items-center gap-1.5 font-heading font-black text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Viber</span>
              </button>
            </div>

            {/* Title Row: Bold, but ENTIRE title fully visible (no truncation) */}
            <div className={`p-4 sm:p-5 rounded-2xl border-2 shadow-sm ${
              isBeach
                ? 'bg-[#14B8A6]/10 border-[#14B8A6]'
                : isLocation
                ? 'bg-[#5B3E36]/15 border-[#6B715A]'
                : 'bg-[#5B2E28]/15 dark:bg-[#5B2E28]/40 border-[#A44A3F]'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-black text-[#5B2E28] dark:text-[#F1E9D2] leading-snug break-words">
                  {displayTitle}
                </h2>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1 rounded-xl bg-[#6B2F2F] text-xs sm:text-sm font-bold text-[#F4D6C6] border border-[#D88C72]/40 flex items-center gap-1.5 shadow-2xs">
                    <span>{categoryConfig.icon}</span>
                    <span>{categoryConfig.el}</span>
                  </span>
                  {selectedSpot.verifiedSpot && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#087F5B] text-white text-xs font-black shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Main Photo Gallery */}
            <div className="space-y-3">
              <div 
                onClick={() => setLightboxUrl(selectedSpot.coverImageUrl)}
                className="relative w-full rounded-2xl overflow-hidden bg-black/15 cursor-zoom-in shadow-md group border-2 border-[#A44A3F]"
              >
                <img
                  src={selectedSpot.coverImageUrl}
                  alt={displayTitle}
                  className="w-full max-h-[460px] object-cover group-hover:scale-[1.01] transition-transform duration-300"
                />

                {/* Discreet "Προβολή Φωτογραφιών" pill */}
                <div className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-xl bg-[#6B2F2F]/90 hover:bg-[#6B2F2F] backdrop-blur-md text-[#F4D6C6] text-xs font-extrabold flex items-center gap-1.5 shadow-md border border-[#D88C72]/60 transition-colors">
                  <ImageIcon className="w-4 h-4 text-[#CDFF9B]" />
                  <span>Προβολή Φωτογραφιών</span>
                </div>
              </div>

              {/* Gallery Thumbnails */}
              {selectedSpot.galleryUrls && selectedSpot.galleryUrls.length > 1 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {selectedSpot.galleryUrls.map((url, i) => (
                    <div
                      key={i}
                      onClick={() => setLightboxUrl(url)}
                      className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[#D88C72]/30 cursor-zoom-in hover:opacity-90 transition-opacity border border-[#A44A3F] shadow-xs"
                    >
                      <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Beside / Below photo: "Google Maps Link" and "Street View Screenshot" */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {/* Google Maps Link */}
                <a
                  href={selectedSpot.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#087F5B] hover:bg-[#066045] text-white font-heading font-black text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] cursor-pointer border border-[#CDFF9B]/30"
                >
                  <MapPin className="w-4 h-4 text-[#CDFF9B]" />
                  <span>Google Maps Link</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                {/* Street View Screenshot Option */}
                <button
                  onClick={() => setIsStreetViewOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#6B2F2F] hover:bg-[#853C35] text-[#F4D6C6] font-heading font-black text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] cursor-pointer border border-[#D88C72]/40"
                >
                  <Camera className="w-4 h-4 text-[#F4D6C6]" />
                  <span>Street View Screenshot</span>
                </button>
              </div>
            </div>

            {/* TAGS SECTION: 3 Rows of Tags starting with # (giving a preview of the spot) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF7F2] dark:bg-[#A44A3F]/25 border-2 border-[#A44A3F] shadow-sm space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-base">🏷️</span>
                <h4 className="font-heading text-xs sm:text-sm font-black uppercase tracking-wider text-[#6B2F2F] dark:text-[#F4D6C6]">
                  Tags Πρόγευσης Spot (Highlights & Γεύσεις)
                </h4>
              </div>

              {/* 3 Rows of Tags */}
              <div className="space-y-2">
                {tagRows.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {row.map((tag, tagIdx) => (
                      <span
                        key={tagIdx}
                        className="px-2.5 sm:px-3 py-1 rounded-xl text-xs sm:text-[13px] font-bold bg-[#6B2F2F]/10 dark:bg-[#F4D6C6]/15 text-[#6B2F2F] dark:text-[#F4D6C6] border border-[#A44A3F]/30 hover:border-[#A44A3F] transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Category & Quick Metrics Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFF7F2] dark:bg-[#A44A3F]/40 border border-[#D88C72]">
              
              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center gap-1.5 px-3 h-12 rounded-xl bg-[#6B2F2F] text-[#F4D6C6] border border-[#D88C72]/50 font-black text-xl shadow-md">
                  <Award className="w-5 h-5 text-amber-300 shrink-0" />
                  <span>★ {selectedSpot.rating.toFixed(1)}</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#6B2F2F] dark:text-[#F4D6C6]">
                    {selectedSpot.reviewsCount} {t.memberReviews}
                  </div>
                  <div className="text-xs text-[#A44A3F] dark:text-[#F4D6C6]/80 font-semibold">
                    {categoryConfig.icon} {categoryConfig.el}
                  </div>
                </div>
              </div>

              {/* Price Per Person Category */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D88C72]/40 border border-[#A44A3F] text-[#6B2F2F] dark:text-[#F4D6C6] font-bold text-sm">
                <span>💶 Τιμή ανά άτομο:</span>
                <span className="text-base font-black">
                  {selectedSpot.priceLevel}
                </span>
              </div>

              {/* Region */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#6B2F2F] dark:text-[#F4D6C6]">
                <MapPin className="w-4 h-4 text-[#A44A3F] dark:text-[#D88C72]" />
                <span>{regionConfig.el}</span>
              </div>

            </div>

            {/* THE SECRET SAUCE (Why It's a Hit Spot) */}
            <div className="p-6 rounded-3xl bg-[#FFF7F2] dark:bg-[#A44A3F]/30 border-2 border-[#A44A3F] shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-[#6B2F2F] text-[#F4D6C6]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-xl sm:text-2xl font-black text-[#6B2F2F] dark:text-[#F4D6C6] tracking-tight">
                  {t.theSecretSauce}
                </h3>
              </div>
              <p className="text-xs font-bold text-[#A44A3F] dark:text-[#D88C72] mb-4">
                {t.theSecretSauceSubtitle}
              </p>
              <div className="text-base sm:text-lg text-[#6B2F2F] dark:text-[#F4D6C6] font-medium leading-relaxed italic border-l-4 border-[#A44A3F] pl-4 py-1">
                "{displaySecretSauce}"
              </div>
            </div>

            {/* Signature Dishes */}
            {displaySignature && displaySignature.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-heading text-lg font-bold text-[#6B2F2F] dark:text-[#F4D6C6] flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-[#A44A3F] dark:text-[#D88C72]" />
                  <span>{t.signatureDishes}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {displaySignature.map((dish, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-[#FFF7F2] dark:bg-[#A44A3F]/40 border border-[#D88C72] shadow-xs"
                    >
                      <span className="w-6 h-6 rounded-lg bg-[#6B2F2F] text-[#F4D6C6] flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-[#6B2F2F] dark:text-[#F4D6C6] text-sm">
                        {dish}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insider Tips & Quick Update Trigger */}
            <div
              className={`p-4 rounded-2xl border flex flex-col gap-3 ${
                isBeach
                  ? 'bg-teal-50/70 dark:bg-slate-800 border-[#14B8A6]/40'
                  : isLocation
                  ? 'bg-[#B5A58C]/45 dark:bg-[#6B715A]/40 border-[#6B715A]'
                  : 'bg-[#FFF7F2] dark:bg-[#A44A3F]/30 border-[#D88C72]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Lightbulb
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      isBeach ? 'text-[#FF6B54]' : isLocation ? 'text-[#087F5B]' : 'text-[#A44A3F]'
                    }`}
                  />
                  <div>
                    <span
                      className={`text-xs font-extrabold uppercase tracking-wider ${
                        isBeach
                          ? 'text-[#14B8A6]'
                          : isLocation
                          ? 'text-[#5B3E36] dark:text-[#DCBDA7]'
                          : 'text-[#6B2F2F] dark:text-[#F4D6C6]'
                      }`}
                    >
                      {t.insiderTip}
                    </span>
                    <p
                      className={`text-sm font-medium mt-0.5 leading-relaxed ${
                        isBeach
                          ? 'text-stone-700 dark:text-stone-200'
                          : isLocation
                          ? 'text-[#5B3E36] dark:text-[#DCBDA7]'
                          : 'text-[#6B2F2F] dark:text-[#F4D6C6]'
                      }`}
                    >
                      {selectedSpot.insiderTips || 'Προσθέστε μια χρήσιμη συμβουλή ή ενημέρωση για τα μέλη!'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditedInsiderTip(selectedSpot.insiderTips || '');
                    setIsEditingSpotInfo((prev) => !prev);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold shrink-0 cursor-pointer transition-colors ${
                    isBeach
                      ? 'bg-[#14B8A6] hover:bg-[#0d9488] text-white'
                      : isLocation
                      ? 'bg-[#087F5B] hover:bg-[#6B715A] text-white'
                      : 'bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6]'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Ενημέρωση Spot</span>
                </button>
              </div>

              {isEditingSpotInfo && (
                <form onSubmit={handleSaveInsiderUpdate} className="pt-2 border-t border-black/10 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={editedInsiderTip}
                    onChange={(e) => setEditedInsiderTip(e.target.value)}
                    placeholder="Ενημερώστε συμβουλές, ωράριο ή νέα πιάτα (θα ειδοποιηθούν όσοι το έχουν στα Αγαπημένα)..."
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 text-stone-900 dark:text-stone-100 text-xs font-medium"
                  />
                  <button
                    type="submit"
                    disabled={isSavingSpotUpdate}
                    className="px-4 py-2 rounded-xl bg-[#087F5B] hover:bg-[#066045] text-white text-xs font-bold cursor-pointer shrink-0"
                  >
                    {isSavingSpotUpdate ? 'Αποθήκευση...' : 'Αποθήκευση & Ειδοποίηση'}
                  </button>
                </form>
              )}
            </div>

            {/* Location & Embedded Map Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4
                  className={`font-heading text-lg font-bold flex items-center gap-2 ${
                    isBeach
                      ? 'text-stone-900 dark:text-stone-100'
                      : isLocation
                      ? 'text-[#5B3E36] dark:text-[#DCBDA7]'
                      : 'text-[#6B2F2F] dark:text-[#F4D6C6]'
                  }`}
                >
                  <MapPin
                    className={`w-5 h-5 ${
                      isBeach ? 'text-[#14B8A6]' : isLocation ? 'text-[#087F5B]' : 'text-[#A44A3F]'
                    }`}
                  />
                  <span>{t.interactiveMap}</span>
                </h4>
                <a
                  href={selectedSpot.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                    isBeach
                      ? 'bg-[#14B8A6] hover:bg-[#0d9488] text-white'
                      : isLocation
                      ? 'bg-[#087F5B] hover:bg-[#6B715A] text-white'
                      : 'bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6]'
                  }`}
                >
                  <span>{t.openGoogleMaps}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p
                className={`text-sm font-bold ${
                  isBeach
                    ? 'text-stone-700 dark:text-stone-300'
                    : isLocation
                    ? 'text-[#5B3E36] dark:text-[#DCBDA7]'
                    : 'text-[#6B2F2F] dark:text-[#F4D6C6]'
                }`}
              >
                {selectedSpot.address}
              </p>

              <div
                className={`w-full h-56 rounded-2xl overflow-hidden border-2 shadow-inner bg-stone-100 ${
                  isBeach ? 'border-[#14B8A6]' : isLocation ? 'border-[#6B715A]' : 'border-[#A44A3F]'
                }`}
              >
                <iframe
                  title="Location Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={mapEmbedUrl}
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* YOUTUBE VIDEOS SECTION (Right after Interactive Map & Location for all Food Spots, Beaches, and Locations) */}
            <div
              className={`p-5 rounded-3xl border-2 space-y-4 ${
                isBeach
                  ? 'bg-teal-50/60 dark:bg-slate-800/80 border-[#14B8A6]'
                  : isLocation
                  ? 'bg-[#B5A58C]/45 dark:bg-[#6B715A]/40 border-[#6B715A]'
                  : 'bg-[#FFF7F2] dark:bg-[#A44A3F]/30 border-[#A44A3F]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FF0000] text-white flex items-center justify-center shadow-sm shrink-0">
                    <Youtube className="w-5 h-5" />
                  </div>
                  <div>
                    <h4
                      className={`font-heading text-lg font-bold leading-tight ${
                        isBeach
                          ? 'text-stone-900 dark:text-stone-100'
                          : isLocation
                          ? 'text-[#5B3E36] dark:text-[#DCBDA7]'
                          : 'text-[#6B2F2F] dark:text-[#F4D6C6]'
                      }`}
                    >
                      YouTube Videos από το Μέρος
                    </h4>
                    <p
                      className={`text-xs font-medium ${
                        isBeach
                          ? 'text-stone-600 dark:text-stone-300'
                          : isLocation
                          ? 'text-[#5B3E36]/85 dark:text-[#B5A58C]'
                          : 'text-[#A44A3F] dark:text-[#D88C72]'
                      }`}
                    >
                      Βίντεο παρουσίασης, δοκιμής ή ξενάγησης από το «{displayTitle}»
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(displayTitle + ' ' + selectedSpot.address.split(',')[0])}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF0000] hover:bg-[#cc0000] text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <Youtube className="w-3.5 h-3.5" />
                    <span>Αναζήτηση στο YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsAddingYoutube((prev) => !prev)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      isBeach
                        ? 'bg-[#14B8A6] hover:bg-[#0d9488] text-white'
                        : isLocation
                        ? 'bg-[#087F5B] hover:bg-[#6B715A] text-white'
                        : 'bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6]'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Προσθήκη Video</span>
                  </button>
                </div>
              </div>

              {isAddingYoutube && (
                <form onSubmit={handleAddYoutubeVideo} className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    type="url"
                    value={newYoutubeUrl}
                    onChange={(e) => setNewYoutubeUrl(e.target.value)}
                    placeholder="Επικολλήστε σύνδεσμο YouTube (π.χ. https://www.youtube.com/watch?v=...)"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 text-stone-900 dark:text-stone-100 text-xs font-medium"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSavingSpotUpdate}
                    className="px-4 py-2.5 rounded-xl bg-[#FF0000] hover:bg-[#cc0000] text-white text-xs font-bold cursor-pointer shrink-0"
                  >
                    {isSavingSpotUpdate ? 'Προσθήκη...' : 'Ενσωμάτωση Video'}
                  </button>
                </form>
              )}

              {youtubeVideos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {youtubeVideos.map((videoUrl, idx) => {
                    const embedUrl = extractYouTubeEmbedUrl(videoUrl);
                    return (
                      <div
                        key={idx}
                        className={`rounded-2xl overflow-hidden border shadow-sm bg-black/95 flex flex-col ${
                          isBeach ? 'border-[#14B8A6]' : isLocation ? 'border-[#6B715A]' : 'border-[#A44A3F]'
                        }`}
                      >
                        {embedUrl ? (
                          <div className="relative aspect-video w-full">
                            <iframe
                              src={embedUrl}
                              title={`${displayTitle} YouTube Video ${idx + 1}`}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : null}
                        <div className="px-3.5 py-2.5 bg-stone-900 text-stone-100 flex items-center justify-between gap-2 text-xs">
                          <span className="font-bold truncate flex items-center gap-1.5">
                            <Youtube className="w-4 h-4 text-[#FF0000] shrink-0" />
                            <span>YouTube Video #{idx + 1} • {displayTitle}</span>
                          </span>
                          <a
                            href={videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-300 hover:underline font-bold flex items-center gap-1 shrink-0"
                          >
                            <span>Άνοιγμα</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-white/60 dark:bg-black/20 border border-dashed border-stone-400/60 text-center">
                  <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Δεν έχει προστεθεί ακόμα ενσωματωμένο YouTube βίντεο για αυτό το μέρος. Πατήστε <strong>«Προσθήκη Video»</strong> αν έχετε κάποιο σχετικό link ή <strong>«Αναζήτηση στο YouTube»</strong>!
                  </p>
                </div>
              )}
            </div>

            {/* COMMUNITY REVIEWS & AI MODERATED DISCUSSION */}
            <div className="pt-6 border-t border-[#D88C72] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading text-xl font-bold text-[#6B2F2F] dark:text-[#F4D6C6] flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#A44A3F]" />
                    <span>{t.memberReviews} ({spotReviews.length})</span>
                  </h4>
                  <p className="text-xs text-[#6B2F2F]/80 dark:text-[#F4D6C6]/80 mt-0.5">
                    {t.moderationNoticeDesc}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-[#6B2F2F] text-[#F4D6C6] border border-[#D88C72]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>AI Moderated</span>
                </div>
              </div>

              {/* Write a Review Form */}
              <form onSubmit={handleReviewSubmit} className="p-5 rounded-2xl bg-[#FFF7F2] dark:bg-[#A44A3F]/30 border border-[#D88C72] shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.firstName}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-[#A44A3F]"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#6B2F2F] dark:text-[#F4D6C6]">
                        {currentUser.firstName} {currentUser.lastName}
                      </div>
                      <div className="text-[10px] text-[#A44A3F] dark:text-[#D88C72] font-semibold">
                        {currentUser.badge}
                      </div>
                    </div>
                  </div>

                  {/* Star Picker */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 mr-1 shadow-2xs">
                      <Award className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-xs font-bold text-[#6B2F2F] dark:text-[#F4D6C6] mr-1">
                      {t.yourRating}
                    </span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 focus:outline-none cursor-pointer transition-transform hover:scale-115"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            (hoverRating || rating) >= star
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-[#D88C72]/50'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-sm font-extrabold text-[#6B2F2F] dark:text-[#F4D6C6] ml-1">
                      {rating}.0
                    </span>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={signatureOrdered}
                    onChange={(e) => setSignatureOrdered(e.target.value)}
                    placeholder={t.dishOrderedPlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#6B2F2F] border border-[#D88C72] text-[#6B2F2F] dark:text-[#F4D6C6] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#A44A3F]"
                  />
                </div>

                <div>
                  <textarea
                    rows={3}
                    value={reviewContent}
                    onChange={(e) => {
                      setReviewContent(e.target.value);
                      if (moderationError) setModerationError(null);
                    }}
                    placeholder={t.yourReviewPlaceholder}
                    className="w-full p-3.5 rounded-xl bg-white dark:bg-[#6B2F2F] border border-[#D88C72] text-[#6B2F2F] dark:text-[#F4D6C6] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#A44A3F] resize-none leading-relaxed"
                    required
                  />
                </div>

                {moderationError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-900 text-xs"
                  >
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold">{t.moderationRejected}</p>
                      <p className="leading-relaxed">
                        {language === 'el' ? moderationError.messageEl : moderationError.message}
                      </p>
                      <p className="text-[11px] text-rose-700 font-semibold pt-1">
                        💡 {t.moderationStrictWarning}
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-[#A44A3F] dark:text-[#D88C72] font-medium">
                    {t.moderationNotice}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !reviewContent.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6B2F2F] hover:bg-[#A44A3F] disabled:opacity-50 text-[#F4D6C6] text-xs font-bold shadow-md cursor-pointer transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span>{t.submittingReview}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{t.submitReview}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* List of Existing Reviews */}
              <div className="space-y-4">
                {spotReviews.map((rev) => {
                  const revAuthorBadge = BADGE_TRANSLATIONS[rev.author?.badge || 'Food Scout'];
                  const isReplying = activeReplyReviewId === rev.id;

                  return (
                    <div
                      key={rev.id}
                      className="p-5 rounded-2xl bg-[#FFF7F2] dark:bg-[#A44A3F]/30 border border-[#D88C72] shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={rev.author.avatarUrl}
                            alt={rev.author.firstName}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-[#A44A3F]"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[#6B2F2F] dark:text-[#F4D6C6]">
                                {rev.author.firstName} {rev.author.lastName}
                              </span>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${revAuthorBadge.color}`}>
                                {language === 'el' ? revAuthorBadge.el : revAuthorBadge.en}
                              </span>
                            </div>
                            {rev.visitDate && (
                              <div className="text-[11px] text-[#A44A3F] dark:text-[#D88C72] flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" />
                                <span>Visited: {rev.visitDate}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6B2F2F] text-[#F4D6C6] border border-[#D88C72]/50 font-extrabold text-xs shadow-xs">
                          <Award className="w-4 h-4 text-amber-300" />
                          <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                          <span>{rev.rating}.0</span>
                        </div>
                      </div>

                      {rev.signatureOrdered && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#D88C72]/35 text-[#6B2F2F] dark:text-[#F4D6C6] text-xs font-semibold">
                          <Utensils className="w-3 h-3" />
                          <span>Ordered: <strong>{rev.signatureOrdered}</strong></span>
                        </div>
                      )}

                      <p className="text-sm text-[#6B2F2F] dark:text-[#F4D6C6] font-medium leading-relaxed">
                        {rev.content}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-[#D88C72]/50 text-xs">
                        <div className="flex items-center gap-1.5 text-[#A44A3F] dark:text-[#D88C72]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified Culinary Review</span>
                        </div>

                        <button
                          onClick={() => {
                            setActiveReplyReviewId(isReplying ? null : rev.id);
                            setReplyContent('');
                          }}
                          className="font-bold text-[#6B2F2F] dark:text-[#F4D6C6] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <CornerDownRight className="w-3.5 h-3.5" />
                          <span>{t.replyToComment}</span>
                        </button>
                      </div>

                      {rev.replies && rev.replies.length > 0 && (
                        <div className="pl-6 pt-2 space-y-2.5 border-l-2 border-[#A44A3F]">
                          {rev.replies.map((reply) => {
                            const replyBadge = BADGE_TRANSLATIONS[reply.author?.badge || 'Food Scout'];
                            return (
                              <div
                                key={reply.id}
                                className="p-3 rounded-xl bg-white/80 dark:bg-[#6B2F2F] border border-[#D88C72] text-xs space-y-1.5"
                              >
                                <div className="flex items-center gap-2">
                                  <img
                                    src={reply.author.avatarUrl}
                                    alt=""
                                    className="w-5 h-5 rounded-full object-cover"
                                  />
                                  <span className="font-bold text-[#6B2F2F] dark:text-[#F4D6C6]">
                                    {reply.author.firstName} {reply.author.lastName}
                                  </span>
                                  <span className="text-[10px] text-[#A44A3F] dark:text-[#D88C72] font-semibold">
                                    ({language === 'el' ? replyBadge.el : replyBadge.en})
                                  </span>
                                </div>
                                <p className="text-[#6B2F2F] dark:text-[#F4D6C6] leading-relaxed font-medium">
                                  {reply.content}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {isReplying && (
                        <div className="pl-6 pt-2 border-l-2 border-[#A44A3F] flex items-center gap-2">
                          <input
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Απαντήστε στο σχόλιο..."
                            className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#6B2F2F] border border-[#D88C72] text-xs font-medium"
                          />
                          <button
                            onClick={() => handleReplySubmit(rev.id)}
                            disabled={isSubmittingReply || !replyContent.trim()}
                            className="px-3 py-2 rounded-xl bg-[#6B2F2F] text-[#F4D6C6] text-xs font-bold disabled:opacity-50 cursor-pointer"
                          >
                            {isSubmittingReply ? '...' : <Send className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

            </div>

          </div>

        </motion.div>
      </div>

      <StreetViewModal
        isOpen={isStreetViewOpen}
        onClose={() => setIsStreetViewOpen(false)}
        spotName={displayTitle}
      />
    </>
  );
};
