import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { SpotCategory, GreekRegion, PriceRange, SearchMacroGroup } from '../types';
import { CATEGORY_TRANSLATIONS, REGION_TRANSLATIONS } from '../i18n/translations';
import { 
  X, 
  Sparkles, 
  Check, 
  Loader2,
  Camera,
  Upload
} from 'lucide-react';
import { motion } from 'motion/react';
import { StreetViewModal } from './StreetViewModal';

const CATEGORIES: SpotCategory[] = [
  'Παραλίες',
  'Τοποθεσίες',
  'Εκδρομές',
  'Μηχανάδες',
  'Gelato',
  'Authentic Souvlaki',
  'Seafood & Psarotaverna',
  'Hidden Mountain Taverna',
  'Bougatsa & Pastry',
  'Modern Greek',
  'Traditional Bakery',
  'Mezedopoleio',
  'Artisan Coffee & Brunch',
  'Street Food Hit'
];

const MACRO_GROUPS: { id: Exclude<SearchMacroGroup, 'ALL'>; labelEl: string; labelEn: string; icon: string }[] = [
  { id: 'ΠΡΩΙΝΑ/BRUNCH', labelEl: 'ΠΡΩΙΝΑ/BRUNCH', labelEn: 'BREAKFAST/BRUNCH', icon: '🥐' },
  { id: 'ΦΑΓΗΤΟ/FOOD', labelEl: 'ΦΑΓΗΤΟ/FOOD', labelEn: 'FOOD/DINING', icon: '🍽️' },
  { id: 'ΓΛΥΚΑ/DESERTS', labelEl: 'ΓΛΥΚΑ/DESERTS', labelEn: 'SWEETS/DESSERTS', icon: '🍨' },
  { id: 'ΦΟΥΡΝΟΙ/PIES', labelEl: 'ΦΟΥΡΝΟΙ/PIES', labelEn: 'BAKERIES/PIES', icon: '🥖' },
  { id: 'ΚΑΦΕΣ/COFFEE', labelEl: 'ΚΑΦΕΣ/COFFEE', labelEn: 'COFFEE', icon: '☕' }
];

const PRICE_RANGES: { value: PriceRange; labelEl: string; labelEn: string }[] = [
  { value: '5-10€', labelEl: '5-10€', labelEn: '5-10€' },
  { value: '10-15€', labelEl: '10-15€', labelEn: '10-15€' },
  { value: '15-20€', labelEl: '15-20€', labelEn: '15-20€' },
  { value: '20-25€ και πάνω', labelEl: '20-25€ και πάνω', labelEn: '20-25€ and above' }
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

const PHOTO_PRESETS = [
  {
    name: 'Artisan Gelato & Cream',
    url: 'https://images.unsplash.com/photo-1560008511-318a7a92383c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Charcoal Grilled Souvlaki & Meat',
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Fresh Aegean Seafood & Fish',
    url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Mountain Clay Pot & Sourdough',
    url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Golden Hand-thrown Bougatsa & Phyllo',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Cycladic Mezedes & Organic Garden',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80'
  }
];

export const CreateSpotModal: React.FC = () => {
  const { isCreateModalOpen, setIsCreateModalOpen, language, t, createHitSpot, showToast } = useApp();

  const [titleEl, setTitleEl] = useState('');
  const [category, setCategory] = useState<SpotCategory>('Gelato');
  const [macroGroup, setMacroGroup] = useState<Exclude<SearchMacroGroup, 'ALL'>>('ΦΑΓΗΤΟ/FOOD');
  const [region, setRegion] = useState<GreekRegion>('Athens & Attica');
  const [address, setAddress] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [whyIsItSpecialEl, setWhyIsItSpecialEl] = useState('');
  const [signatureDishesRaw, setSignatureDishesRaw] = useState('');
  const [priceLevel, setPriceLevel] = useState<PriceRange>('10-15€');
  const [coverImageUrl, setCoverImageUrl] = useState(PHOTO_PRESETS[0].url);
  const [insiderTips, setInsiderTips] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStreetViewOpen, setIsStreetViewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isCreateModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setCoverImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedTitle = titleEl.trim();
    const resolvedWhy = whyIsItSpecialEl.trim();

    if (!resolvedTitle || !address.trim() || !resolvedWhy) {
      showToast(
        language === 'el'
          ? 'Συμπληρώστε όλα τα υποχρεωτικά πεδία'
          : 'Please fill all required fields',
        'error'
      );
      return;
    }

    setIsSubmitting(true);

    const dishes = signatureDishesRaw
      .split(',')
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    const spotPayload = {
      title: resolvedTitle,
      titleEl: resolvedTitle,
      category,
      region,
      address: address.trim(),
      googleMapsUrl: googleMapsUrl.trim() || `https://maps.google.com/?q=${encodeURIComponent(resolvedTitle + ' ' + address)}`,
      whyIsItSpecial: resolvedWhy,
      whyIsItSpecialEl: resolvedWhy,
      signatureDishes: dishes.length > 0 ? dishes : ['Chef Signature Special'],
      signatureDishesEl: dishes.length > 0 ? dishes : ['Σπεσιαλιτέ του Σεφ'],
      priceLevel,
      coverImageUrl,
      galleryUrls: [coverImageUrl],
      tags: [category, macroGroup, region.split(' ')[0]],
      insiderTips
    };

    const res = await createHitSpot(spotPayload);
    setIsSubmitting(false);

    if (res.success) {
      setIsCreateModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#302B4D]/80 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6">
      {/* Modal Container using [#302B4D #625B8C #A9A1D1 #E8E4F3] palette */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-3xl bg-[#E8E4F3] dark:bg-[#302B4D] rounded-3xl shadow-2xl border-2 border-[#625B8C] my-auto overflow-hidden flex flex-col max-h-[92vh] text-[#302B4D] dark:text-[#E8E4F3]"
      >
        
        {/* Modal Header (#302B4D background, #E8E4F3 text, #A9A1D1 subtitle) */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-5 bg-[#302B4D] text-[#E8E4F3] border-b-2 border-[#625B8C]">
          <div className="flex items-center gap-3">
            <img
              src="/aeifaron-pin-logo.svg"
              alt="Aeifaron Pin Logo"
              className="w-11 h-12 rounded-xl object-contain bg-[#E8E4F3] p-0.5 shadow-sm border border-[#A9A1D1] shrink-0"
            />
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#E8E4F3]">
                {language === 'el' ? 'Προσθήκη Νέου Food Spot' : 'Add New Food Spot'}
              </h2>
              <p className="text-xs sm:text-sm text-[#A9A1D1] font-semibold mt-0.5">
                {language === 'el'
                  ? 'Μοιραστείτε ένα αυθεντικό διαμάντι με την Αειφαρειώτικη οικογένεια. Όλα τα πεδία είναι υποχρεωτικά.'
                  : 'Share an authentic gem with the Aeifaron family. All fields are required.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="p-2 rounded-xl bg-[#625B8C] hover:bg-[#A9A1D1] text-[#E8E4F3] hover:text-[#302B4D] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-6 space-y-6 bg-[#E8E4F3] dark:bg-[#302B4D]">
          
          {/* Single Title Input */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#302B4D] dark:text-[#A9A1D1] mb-1.5">
              {t.fieldTitle} *
            </label>
            <input
              type="text"
              value={titleEl}
              onChange={(e) => setTitleEl(e.target.value)}
              placeholder={language === 'el' ? 'π.χ. Epik Gelato Συντάγματος' : 'e.g. Epik Gelato Syntagma'}
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#231f3a] border-2 border-[#A9A1D1] dark:border-[#625B8C] text-[#302B4D] dark:text-[#E8E4F3] text-sm font-semibold focus:ring-2 focus:ring-[#625B8C] focus:outline-none"
              required
            />
          </div>

          {/* Macro Category (ΠΡΩΙΝΑ/BRUNCH, ΦΑΓΗΤΟ/FOOD, ΓΛΥΚΑ/DESERTS, ΦΟΥΡΝΟΙ/PIES, ΚΑΦΕΣ/COFFEE) */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#302B4D] dark:text-[#A9A1D1] mb-2">
              {language === 'el' ? 'Κατηγορία Αναζήτησης *' : 'Search Category *'}
            </label>
            <div className="flex flex-wrap gap-2">
              {MACRO_GROUPS.map((grp) => {
                const active = macroGroup === grp.id;
                return (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => setMacroGroup(grp.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer border-2 ${
                      active
                        ? 'bg-[#302B4D] text-[#E8E4F3] border-[#625B8C] shadow-md scale-[1.02]'
                        : 'bg-white dark:bg-[#231f3a] text-[#302B4D] dark:text-[#E8E4F3] border-[#A9A1D1] hover:bg-[#A9A1D1]/30'
                    }`}
                  >
                    <span>{grp.icon}</span>
                    <span>{language === 'el' ? grp.labelEl : grp.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category & Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#302B4D] dark:text-[#A9A1D1] mb-1.5">
                {t.fieldCategory} *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SpotCategory)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#231f3a] border-2 border-[#A9A1D1] dark:border-[#625B8C] text-[#302B4D] dark:text-[#E8E4F3] text-sm font-semibold focus:ring-2 focus:ring-[#625B8C] focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_TRANSLATIONS[cat].icon} {language === 'el' ? CATEGORY_TRANSLATIONS[cat].el : CATEGORY_TRANSLATIONS[cat].en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#302B4D] dark:text-[#A9A1D1] mb-1.5">
                {t.fieldRegion} *
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as GreekRegion)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#231f3a] border-2 border-[#A9A1D1] dark:border-[#625B8C] text-[#302B4D] dark:text-[#E8E4F3] text-sm font-semibold focus:ring-2 focus:ring-[#625B8C] focus:outline-none"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {language === 'el' ? REGION_TRANSLATIONS[r].el : REGION_TRANSLATIONS[r].en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address & Google Maps Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#302B4D] dark:text-[#A9A1D1] mb-1.5">
                {t.fieldAddress} *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Δωρού 2, Σύνταγμα, Αθήνα"
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#231f3a] border-2 border-[#A9A1D1] dark:border-[#625B8C] text-[#302B4D] dark:text-[#E8E4F3] text-sm font-medium focus:ring-2 focus:ring-[#625B8C] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#302B4D] dark:text-[#A9A1D1] mb-1.5">
                {t.fieldMapsUrl} *
              </label>
              <input
                type="url"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="https://maps.app.goo.gl/..."
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#231f3a] border-2 border-[#A9A1D1] dark:border-[#625B8C] text-[#302B4D] dark:text-[#E8E4F3] text-sm font-medium focus:ring-2 focus:ring-[#625B8C] focus:outline-none"
              />
            </div>
          </div>

          {/* THE SECRET SAUCE - Single Clean Section without AI Button or English Tasting Notes */}
          <div className="p-5 rounded-2xl bg-[#A9A1D1]/35 dark:bg-[#231f3a] border-2 border-[#625B8C] space-y-3">
            <div>
              <label className="block text-sm font-black uppercase tracking-wider text-[#302B4D] dark:text-[#E8E4F3]">
                {t.fieldWhySpecial} *
              </label>
              <p className="text-xs text-[#625B8C] dark:text-[#A9A1D1] font-semibold mt-0.5">
                {t.fieldWhySpecialHelp}
              </p>
            </div>

            <div>
              <textarea
                rows={4}
                value={whyIsItSpecialEl}
                onChange={(e) => setWhyIsItSpecialEl(e.target.value)}
                placeholder={
                  language === 'el'
                    ? 'Αναλύστε την πρώτη ύλη, την παραδοσιακή τεχνική, τη μυστική συνταγή...'
                    : 'Explain the raw ingredients, traditional technique, secret recipe...'
                }
                className="w-full p-3.5 rounded-xl bg-white dark:bg-[#302B4D] border-2 border-[#A9A1D1] dark:border-[#625B8C] text-[#302B4D] dark:text-[#E8E4F3] text-sm font-medium focus:ring-2 focus:ring-[#625B8C] focus:outline-none resize-none leading-relaxed"
                required
              />
            </div>
          </div>

          {/* Signature Dishes & Price Level (5-10€, 10-15€, 15-20€, 20-25€ και πάνω) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#302B4D] dark:text-[#A9A1D1] mb-1.5">
                {t.fieldSignatureDishes} *
              </label>
              <input
                type="text"
                value={signatureDishesRaw}
                onChange={(e) => setSignatureDishesRaw(e.target.value)}
                placeholder={t.fieldSignatureDishesHelp}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#231f3a] border-2 border-[#A9A1D1] dark:border-[#625B8C] text-[#302B4D] dark:text-[#E8E4F3] text-sm font-medium focus:ring-2 focus:ring-[#625B8C] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#302B4D] dark:text-[#A9A1D1] mb-1.5">
                {t.fieldPriceLevel} *
              </label>
              <select
                value={priceLevel}
                onChange={(e) => setPriceLevel(e.target.value as PriceRange)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#231f3a] border-2 border-[#A9A1D1] dark:border-[#625B8C] text-[#302B4D] dark:text-[#E8E4F3] text-sm font-bold focus:ring-2 focus:ring-[#625B8C] focus:outline-none"
              >
                {PRICE_RANGES.map((pr) => (
                  <option key={pr.value} value={pr.value}>
                    {language === 'el' ? pr.labelEl : pr.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cover Photo Preset Selector, Device Upload & URL */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#302B4D] dark:text-[#A9A1D1]">
                {t.fieldCoverImage} *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#625B8C] hover:bg-[#302B4D] text-[#E8E4F3] text-xs font-bold transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{language === 'el' ? 'Μεταφόρτωση Φωτογραφίας' : 'Upload Photo'}</span>
              </button>
            </div>
            
            {/* Quick Photo Presets */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PHOTO_PRESETS.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => setCoverImageUrl(preset.url)}
                  className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    coverImageUrl === preset.url
                      ? 'border-[#302B4D] ring-2 ring-[#625B8C] scale-102 shadow-md'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                  title={preset.name}
                >
                  <img src={preset.url} alt="" className="w-full h-full object-cover" />
                  {coverImageUrl === preset.url && (
                    <div className="absolute inset-0 bg-[#302B4D]/45 flex items-center justify-center text-[#E8E4F3]">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <input
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#231f3a] border-2 border-[#A9A1D1] dark:border-[#625B8C] text-[#302B4D] dark:text-[#E8E4F3] text-xs font-mono focus:ring-2 focus:ring-[#625B8C] focus:outline-none"
              required
            />

            {/* Missing photo helper button */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#A9A1D1]/40 dark:bg-[#231f3a] border border-[#625B8C]">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#302B4D] dark:text-[#A9A1D1] shrink-0" />
                <span className="text-xs text-[#302B4D] dark:text-[#E8E4F3] font-semibold">
                  {language === 'el'
                    ? 'Δεν έχετε δική σας φωτογραφία από το μαγαζί;'
                    : "Don't have your own photo of the venue?"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsStreetViewOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-[#302B4D] hover:bg-[#625B8C] text-[#E8E4F3] text-xs font-bold transition-colors cursor-pointer"
              >
                {language === 'el' ? 'Οδηγός Street View Screenshot' : 'Street View Screenshot Guide'}
              </button>
            </div>
          </div>

          {/* Insider Tips */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#302B4D] dark:text-[#A9A1D1] mb-1.5">
              {t.fieldInsiderTips} *
            </label>
            <input
              type="text"
              value={insiderTips}
              onChange={(e) => setInsiderTips(e.target.value)}
              placeholder={
                language === 'el'
                  ? 'π.χ. Καλύτερη ώρα 11:30 π.μ. πριν δημιουργηθεί ουρά. Ζητήστε το προζυμένιο ψωμί.'
                  : 'e.g. Best time is 11:30 AM before the queue forms. Ask for the secret house sourdough.'
              }
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#231f3a] border-2 border-[#A9A1D1] dark:border-[#625B8C] text-[#302B4D] dark:text-[#E8E4F3] text-sm font-medium focus:ring-2 focus:ring-[#625B8C] focus:outline-none"
              required
            />
          </div>

          {/* Submit Button (#302B4D / #625B8C / #A9A1D1 / #E8E4F3) */}
          <div className="pt-4 border-t-2 border-[#A9A1D1] dark:border-[#625B8C] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-5 py-3 rounded-xl bg-[#A9A1D1]/40 hover:bg-[#A9A1D1] text-[#302B4D] text-sm font-bold cursor-pointer transition-colors"
            >
              {t.close}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#302B4D] hover:bg-[#625B8C] disabled:opacity-50 text-[#E8E4F3] border border-[#A9A1D1] text-sm font-extrabold shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.publishingSpot}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#A9A1D1]" />
                  <span>{t.buttonPublishSpot}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </motion.div>

      {/* Street View Screenshot Helper Modal */}
      <StreetViewModal
        isOpen={isStreetViewOpen}
        onClose={() => setIsStreetViewOpen(false)}
        spotName={titleEl}
      />
    </div>
  );
};
