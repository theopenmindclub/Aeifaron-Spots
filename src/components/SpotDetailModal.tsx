import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORY_TRANSLATIONS, REGION_TRANSLATIONS, BADGE_TRANSLATIONS } from '../i18n/translations';
import { getGamificationBadge } from '../types';
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
  Link2
} from 'lucide-react';
import { motion } from 'motion/react';

export const SpotDetailModal: React.FC = () => {
  const { 
    selectedSpot, 
    setSelectedSpot, 
    reviews, 
    language, 
    t, 
    currentUser, 
    addReview, 
    addReply, 
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

  if (!selectedSpot) return null;

  const isBeach = selectedSpot.category === 'Παραλίες';
  const spotReviews = reviews.filter((r) => r.spotId === selectedSpot.id);
  const categoryConfig = CATEGORY_TRANSLATIONS[selectedSpot.category] || { el: selectedSpot.category, en: selectedSpot.category, icon: '🍽️' };
  const regionConfig = REGION_TRANSLATIONS[selectedSpot.region] || { el: selectedSpot.region, en: selectedSpot.region };
  const authorBadgeName = getGamificationBadge(selectedSpot.author?.spotsSubmittedCount || 1);

  const displayTitle = language === 'el' && selectedSpot.titleEl ? selectedSpot.titleEl : selectedSpot.title;
  const displaySecretSauce = language === 'el' && selectedSpot.whyIsItSpecialEl ? selectedSpot.whyIsItSpecialEl : selectedSpot.whyIsItSpecial;
  const displaySignature = (language === 'el' && selectedSpot.signatureDishesEl && selectedSpot.signatureDishesEl.length > 0) 
    ? selectedSpot.signatureDishesEl 
    : selectedSpot.signatureDishes;

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

  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${selectedSpot.coordinates.lng - 0.008}%2C${selectedSpot.coordinates.lat - 0.005}%2C${selectedSpot.coordinates.lng + 0.008}%2C${selectedSpot.coordinates.lat + 0.005}&layer=mapnik&marker=${selectedSpot.coordinates.lat}%2C${selectedSpot.coordinates.lng}`;

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
              : 'bg-[#F4D6C6] dark:bg-[#6B2F2F] border-[#A44A3F]'
          }`}
        >
          
          {/* Sticky Header using [#6B2F2F #A44A3F #D88C72 #F4D6C6] for Food Spots */}
          <div
            className={`sticky top-0 z-20 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b ${
              isBeach
                ? 'bg-[#14B8A6] text-white border-[#FF6B54]'
                : 'bg-[#6B2F2F] text-[#F4D6C6] border-[#A44A3F]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={selectedSpot.author.avatarUrl}
                alt={selectedSpot.author.firstName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#D88C72] shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold">
                    {selectedSpot.author.firstName} {selectedSpot.author.lastName}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#A44A3F] text-[#F4D6C6] text-[10px] font-black">
                    🏅 {authorBadgeName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-heading text-base sm:text-lg font-bold truncate">
                    {displayTitle}
                  </span>
                  {selectedSpot.verifiedSpot && (
                    <CheckCircle2 className="w-4 h-4 text-[#D88C72] shrink-0" />
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons: Viber, Copy Link, Close */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleViberShare}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#7360F2] hover:bg-[#5f4de0] text-white text-xs font-bold shadow-xs transition-all hover:scale-105 cursor-pointer"
                title="Κοινοποίηση στο Viber"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Viber</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#A44A3F] hover:bg-[#D88C72] text-[#F4D6C6] hover:text-[#6B2F2F] text-xs font-bold transition-colors cursor-pointer border border-[#D88C72]/50"
                title="Αντιγραφή συνδέσμου καρτέλας"
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{isCopied ? 'Αντιγράφηκε!' : 'Link'}</span>
              </button>

              <button
                onClick={() => setSelectedSpot(null)}
                className="p-2.5 rounded-xl bg-[#A44A3F] hover:bg-[#D88C72] text-[#F4D6C6] hover:text-[#6B2F2F] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto px-6 py-6 space-y-7">
            
            {/* Main Photo Gallery */}
            <div className="space-y-3">
              <div 
                onClick={() => setLightboxUrl(selectedSpot.coverImageUrl)}
                className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#D88C72]/30 cursor-zoom-in shadow-md group border-2 border-[#A44A3F]"
              >
                <img
                  src={selectedSpot.coverImageUrl}
                  alt={displayTitle}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />

                {/* Overlay on top-left of the photo */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6B2F2F]/90 backdrop-blur-md text-[#F4D6C6] text-xs font-bold border border-[#D88C72]/50 shadow-lg pointer-events-none">
                  <img
                    src={selectedSpot.author.avatarUrl}
                    alt={selectedSpot.author.firstName}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-[#D88C72]"
                  />
                  <span>
                    Ανέβηκε από: {selectedSpot.author.firstName} {selectedSpot.author.lastName}
                  </span>
                </div>

                {/* Overlay on top-right of the photo */}
                <div className="absolute top-3.5 right-3.5 flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleViberShare(); }}
                    className="px-2.5 py-1.5 rounded-xl bg-[#7360F2] text-white text-xs font-bold shadow-md hover:scale-105 transition-transform cursor-pointer flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Viber</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopyLink(); }}
                    className="p-1.5 rounded-xl bg-[#6B2F2F]/90 text-[#F4D6C6] shadow-md hover:scale-105 transition-transform cursor-pointer"
                    title="Αντιγραφή link"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-[#6B2F2F]/85 backdrop-blur-md text-[#F4D6C6] text-xs font-bold flex items-center gap-1.5 pointer-events-none">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{t.viewFullGallery}</span>
                </div>
              </div>

              {/* Gallery Thumbnails */}
              {selectedSpot.galleryUrls && selectedSpot.galleryUrls.length > 1 && (
                <div className="grid grid-cols-3 gap-3">
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

              {/* Helper directly below the photos for missing photos / Street View */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FFF7F2] dark:bg-[#A44A3F]/35 border border-[#A44A3F]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#6B2F2F] text-[#F4D6C6] flex items-center justify-center shrink-0">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#6B2F2F] dark:text-[#F4D6C6]">
                      Δεν έχετε δική σας φωτογραφία από το μαγαζί;
                    </div>
                    <div className="text-[11px] text-[#A44A3F] dark:text-[#F4D6C6]/80 font-medium">
                      Μπορείτε να ανεβάσετε screenshot από το Google Maps Street View!
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsStreetViewOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6] font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0 self-start sm:self-center"
                >
                  Οδηγός Street View Screenshot
                </button>
              </div>
            </div>

            {/* Price Category & Quick Metrics Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFF7F2] dark:bg-[#A44A3F]/40 border border-[#D88C72]">
              
              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#6B2F2F] text-[#F4D6C6] font-black text-xl shadow-md">
                  ★ {selectedSpot.rating.toFixed(1)}
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

            {/* Insider Tips */}
            {selectedSpot.insiderTips && (
              <div className="p-4 rounded-2xl bg-[#FFF7F2] dark:bg-[#A44A3F]/30 border border-[#D88C72] flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-[#A44A3F] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#6B2F2F] dark:text-[#F4D6C6]">
                    {t.insiderTip}
                  </span>
                  <p className="text-sm font-medium text-[#6B2F2F] dark:text-[#F4D6C6] mt-0.5 leading-relaxed">
                    {selectedSpot.insiderTips}
                  </p>
                </div>
              </div>
            )}

            {/* Location & Embedded Map Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-heading text-lg font-bold text-[#6B2F2F] dark:text-[#F4D6C6] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#A44A3F]" />
                  <span>{t.interactiveMap}</span>
                </h4>
                <a
                  href={selectedSpot.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6] text-xs font-bold transition-colors"
                >
                  <span>{t.openGoogleMaps}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="text-sm font-bold text-[#6B2F2F] dark:text-[#F4D6C6]">
                {selectedSpot.address}
              </p>

              <div className="w-full h-56 rounded-2xl overflow-hidden border-2 border-[#A44A3F] shadow-inner bg-stone-100">
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
                              ? 'text-[#A44A3F] fill-[#A44A3F]'
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

                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#6B2F2F] text-[#F4D6C6] font-extrabold text-xs">
                          <Star className="w-3.5 h-3.5 fill-current" />
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
