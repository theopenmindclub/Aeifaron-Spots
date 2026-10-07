import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HitSpot, getGamificationBadge } from '../types';
import { CATEGORY_TRANSLATIONS, REGION_TRANSLATIONS } from '../i18n/translations';
import { StreetViewModal } from './StreetViewModal';
import { 
  Star, 
  MapPin, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  Utensils, 
  Send,
  Link2,
  Camera
} from 'lucide-react';
import { motion } from 'motion/react';

interface SpotCardProps {
  spot: HitSpot;
}

export const SpotCard: React.FC<SpotCardProps> = ({ spot }) => {
  const { language, t, setSelectedSpot, setSelectedMemberProfile, showToast } = useApp();
  const [imageError, setImageError] = useState(false);
  const [isStreetViewOpen, setIsStreetViewOpen] = useState(false);

  const categoryConfig = CATEGORY_TRANSLATIONS[spot.category] || { el: spot.category, en: spot.category, icon: '📍' };
  const regionConfig = REGION_TRANSLATIONS[spot.region] || { el: spot.region, en: spot.region };
  
  const authorBadgeName = getGamificationBadge(spot.author?.spotsSubmittedCount || 1);

  const displayTitle = language === 'el' && spot.titleEl ? spot.titleEl : spot.title;
  const displaySecretSauce = language === 'el' && spot.whyIsItSpecialEl ? spot.whyIsItSpecialEl : spot.whyIsItSpecial;
  const displaySignature = (language === 'el' && spot.signatureDishesEl && spot.signatureDishesEl.length > 0) 
    ? spot.signatureDishesEl 
    : spot.signatureDishes;

  const isBeach = spot.category === 'Παραλίες';
  const isLocation = spot.category === 'Τοποθεσίες';

  const handleViberShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/?spot=${spot.id}`;
    const shareText = `Δείτε αυτό το Spot στο Aeifaron Spots: "${displayTitle}" (${spot.address})! ${shareUrl}`;
    window.location.href = `viber://forward?text=${encodeURIComponent(shareText)}`;
    showToast('Άνοιγμα Viber για κοινοποίηση...', 'info');
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/?spot=${spot.id}`;
    navigator.clipboard.writeText(shareUrl);
    showToast('Το link της καρτέλας αντιγράφηκε επιτυχώς!', 'success');
  };

  const hasPhoto = Boolean(spot.coverImageUrl && !imageError);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`group flex flex-col rounded-3xl overflow-hidden border-2 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
          isBeach
            ? 'bg-[#FFFDF9] dark:bg-slate-900 border-[#14B8A6]'
            : 'bg-[#F4D6C6] dark:bg-[#6B2F2F] border-[#A44A3F]'
        }`}
      >
        
        {/* Top Card Header Banner: Food spot (#6B2F2F #A44A3F #D88C72 #F4D6C6), Beach (#FF6B54 & #14B8A6), or Location (#243B35 & #6B8E7B) */}
        <div
          className={`px-4 py-2.5 flex items-center justify-between text-xs font-extrabold uppercase tracking-wider border-b ${
            isBeach
              ? 'bg-[#14B8A6] text-white border-[#FF6B54]'
              : isLocation
              ? 'bg-[#243B35] text-[#F1E9D2] border-[#6B8E7B]'
              : 'bg-[#6B2F2F] text-[#F4D6C6] border-[#A44A3F]'
          }`}
        >
          <span className="font-heading text-sm font-black tracking-wider flex items-center gap-1.5">
            <span>{categoryConfig.icon}</span>
            <span>{isBeach ? 'ΠΑΡΑΛΙΕΣ' : isLocation ? 'ΤΟΠΟΘΕΣΙΕΣ' : 'food spot'}</span>
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-md font-heading text-xs font-bold ${
              isBeach
                ? 'bg-[#FF6B54] text-white'
                : isLocation
                ? 'bg-[#6B8E7B] text-[#CDFF9B]'
                : 'bg-[#D88C72] text-[#6B2F2F]'
            }`}
          >
            {language === 'el' ? categoryConfig.el : categoryConfig.en}
          </span>
        </div>

        {/* Cover Image with Aspect Ratio Lock */}
        <div className="relative aspect-[16/10] overflow-hidden bg-[#D88C72]/30 dark:bg-[#6B2F2F] cursor-pointer">
          {hasPhoto ? (
            <img
              src={spot.coverImageUrl}
              alt={displayTitle}
              onClick={() => setSelectedSpot(spot)}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            <div 
              onClick={() => setSelectedSpot(spot)}
              className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-[#F4D6C6] to-[#D88C72]/40 dark:from-[#6B2F2F] dark:to-[#A44A3F]"
            >
              <Camera className="w-8 h-8 text-[#6B2F2F] dark:text-[#F4D6C6] mb-1.5" />
              <p className="text-xs font-bold text-[#6B2F2F] dark:text-[#F4D6C6] mb-2">
                Χωρίς φωτογραφία
              </p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsStreetViewOpen(true); }}
                className="px-3 py-1.5 rounded-lg bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6] font-bold text-xs shadow-xs transition-colors"
              >
                Οδηγός Street View Screenshot
              </button>
            </div>
          )}

          {/* Top Overlay: Author on Left, Viber & Link on Right */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-auto">
            {/* Top Left: Author Profile Pill */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMemberProfile(spot.author);
              }}
              title={`Προβολή Προφίλ: ${spot.author.firstName} ${spot.author.lastName} (${authorBadgeName})`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#6B2F2F]/90 hover:bg-[#6B2F2F] backdrop-blur-md text-[#F4D6C6] text-xs font-bold shadow-lg border border-[#D88C72]/50 max-w-[220px] cursor-pointer transition-transform hover:scale-105"
            >
              <img
                src={spot.author.avatarUrl}
                alt={spot.author.firstName}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-[#D88C72] shrink-0"
              />
              <span className="truncate text-[11px]">
                {spot.author.firstName} {spot.author.lastName}
              </span>
            </div>

            {/* Top Right: Viber Share & Copy Direct Link */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleViberShare}
                title="Κοινοποίηση στο Viber"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#7360F2] hover:bg-[#5f4de0] text-white text-xs font-bold shadow-lg transition-all hover:scale-105 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px]">Viber</span>
              </button>

              <button
                onClick={handleCopyLink}
                title="Αντιγραφή συνδέσμου καρτέλας"
                className="p-1.5 rounded-xl bg-[#6B2F2F]/90 hover:bg-[#A44A3F] backdrop-blur-md text-[#F4D6C6] shadow-lg border border-[#D88C72]/40 transition-all hover:scale-105 cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5 text-[#F4D6C6]" />
              </button>
            </div>
          </div>

          {/* Bottom Overlay on Image: Category & Rating Pill */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold shadow-md ${
                isBeach
                  ? 'bg-[#14B8A6] text-white border border-[#FF6B54]'
                  : isLocation
                  ? 'bg-[#243B35] text-[#CDFF9B] border border-[#6B8E7B]'
                  : 'bg-[#6B2F2F] text-[#F4D6C6] border border-[#D88C72]'
              }`}
            >
              <span>{categoryConfig.icon}</span>
              <span className="truncate max-w-[140px]">
                {isBeach ? 'Παραλίες' : isLocation ? 'Τοποθεσίες' : 'food spot'}
              </span>
            </div>

            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold shadow-md ${
                isBeach
                  ? 'bg-[#FF6B54] text-white'
                  : 'bg-[#A44A3F] text-[#F4D6C6] border border-[#F4D6C6]/40'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{spot.rating.toFixed(1)}</span>
              <span className="text-[10px] font-semibold opacity-90">({spot.reviewsCount})</span>
            </div>
          </div>
        </div>

        {/* Card Body using [#6B2F2F #A44A3F #D88C72 #F4D6C6] palette for Food Spots */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Title & Verified Stamp */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 
                onClick={() => setSelectedSpot(spot)}
                className={`font-heading text-xl sm:text-2xl font-bold transition-colors cursor-pointer leading-snug ${
                  isBeach
                    ? 'text-stone-900 dark:text-stone-50 group-hover:text-[#14B8A6]'
                    : 'text-[#6B2F2F] dark:text-[#F4D6C6] group-hover:text-[#A44A3F] dark:group-hover:text-[#D88C72]'
                }`}
              >
                {displayTitle}
              </h3>
              {spot.verifiedSpot && (
                <span title="Πιστοποιημένη Επιλογή" className={`shrink-0 mt-1 ${isBeach ? 'text-[#14B8A6]' : 'text-[#A44A3F] dark:text-[#D88C72]'}`}>
                  <CheckCircle2 className="w-5 h-5" />
                </span>
              )}
            </div>

            {/* Price per Person & Region */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
                  isBeach
                    ? 'bg-[#14B8A6]/15 border-[#14B8A6] text-[#14B8A6]'
                    : 'bg-[#D88C72]/35 dark:bg-[#A44A3F]/50 border-[#A44A3F] text-[#6B2F2F] dark:text-[#F4D6C6]'
                }`}
              >
                Τιμή: {spot.priceLevel} / άτομο
              </span>
              <span className={`text-xs flex items-center gap-1 font-bold ${isBeach ? 'text-stone-600 dark:text-stone-300' : 'text-[#6B2F2F]/90 dark:text-[#F4D6C6]/90'}`}>
                <MapPin className={`w-3.5 h-3.5 ${isBeach ? 'text-[#FF6B54]' : 'text-[#A44A3F] dark:text-[#D88C72]'}`} />
                <span>{language === 'el' ? regionConfig.el : regionConfig.en}</span>
              </span>
            </div>

            {/* Address snippet */}
            <p className={`text-xs flex items-center gap-1.5 mb-3.5 line-clamp-1 font-medium ${isBeach ? 'text-stone-500' : 'text-[#6B2F2F]/80 dark:text-[#F4D6C6]/80'}`}>
              <MapPin className="w-3.5 h-3.5 shrink-0 opacity-75" />
              <span>{spot.address}</span>
            </p>

            {/* "Why It's a Hit Spot" Highlight Box */}
            <div
              className={`p-3.5 rounded-2xl border mb-4 ${
                isBeach
                  ? 'bg-teal-50/70 dark:bg-slate-800 border-[#14B8A6]/40'
                  : 'bg-[#FFF7F2] dark:bg-[#A44A3F]/35 border-[#D88C72]'
              }`}
            >
              <div
                className={`flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-1.5 ${
                  isBeach ? 'text-[#14B8A6]' : 'text-[#6B2F2F] dark:text-[#F4D6C6]'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 shrink-0 ${isBeach ? 'text-[#FF6B54]' : 'text-[#A44A3F] dark:text-[#D88C72]'}`} />
                <span>{t.theSecretSauce}</span>
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed line-clamp-3 italic font-medium ${isBeach ? 'text-stone-700 dark:text-stone-300' : 'text-[#6B2F2F] dark:text-[#F4D6C6]'}`}>
                "{displaySecretSauce}"
              </p>
            </div>

            {/* Signature Dishes Tags */}
            {displaySignature && displaySignature.length > 0 && (
              <div className="mb-4">
                <div className={`flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider mb-1.5 ${isBeach ? 'text-stone-500' : 'text-[#A44A3F] dark:text-[#D88C72]'}`}>
                  <Utensils className="w-3 h-3" />
                  <span>{t.signatureDishes}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {displaySignature.slice(0, 2).map((dish, i) => (
                    <span
                      key={i}
                      className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        isBeach
                          ? 'bg-stone-100 dark:bg-slate-800 text-stone-800 dark:text-stone-200 border-stone-200'
                          : 'bg-[#D88C72]/30 dark:bg-[#A44A3F]/50 text-[#6B2F2F] dark:text-[#F4D6C6] border-[#A44A3F]/40'
                      }`}
                    >
                      {dish}
                    </span>
                  ))}
                  {displaySignature.length > 2 && (
                    <span className="inline-block px-2 py-1 rounded-lg bg-[#D88C72]/40 text-[#6B2F2F] dark:text-[#F4D6C6] text-xs font-bold">
                      +{displaySignature.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer: Author Badge & Actions */}
          <div className={`pt-3 border-t flex items-center justify-between gap-2 ${isBeach ? 'border-stone-100 dark:border-slate-800' : 'border-[#D88C72]/60 dark:border-[#A44A3F]'}`}>
            {/* Author Badge */}
            <div
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold truncate ${
                isBeach
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-[#6B2F2F] text-[#F4D6C6]'
              }`}
            >
              🏅 {authorBadgeName}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={spot.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-xl transition-colors ${
                  isBeach
                    ? 'bg-stone-100 hover:bg-[#14B8A6] text-stone-700 hover:text-white'
                    : 'bg-[#D88C72]/40 hover:bg-[#A44A3F] text-[#6B2F2F] dark:text-[#F4D6C6] hover:text-[#F4D6C6]'
                }`}
                title={t.openGoogleMaps}
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => setSelectedSpot(spot)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shadow-xs cursor-pointer ${
                  isBeach
                    ? 'bg-[#FF6B54] hover:bg-[#e85842] text-white'
                    : 'bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6] border border-[#D88C72]/50'
                }`}
              >
                <span>{t.viewDetails}</span>
              </button>
            </div>

          </div>
        </div>
      </motion.div>

      {/* Street View Screenshot Helper Modal */}
      <StreetViewModal
        isOpen={isStreetViewOpen}
        onClose={() => setIsStreetViewOpen(false)}
        spotName={displayTitle}
      />
    </>
  );
};
