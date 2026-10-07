import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  BookOpen, 
  PlusCircle, 
  Compass, 
  MapPin, 
  Sparkles, 
  Camera, 
  Share2, 
  Utensils, 
  MessageSquare, 
  Award,
  ArrowRight,
  Search
} from 'lucide-react';
import { motion } from 'motion/react';

export const OnboardingView: React.FC = () => {
  const { language, setActiveView, setIsCreateModalOpen, setIsAuthModalOpen } = useApp();

  const uploadSteps = language === 'el' ? [
    {
      step: 'Βήμα 1',
      title: 'Πατήστε το κουμπί «+ Food Spot»',
      desc: 'Στο πάνω μέρος του μενού θα βρείτε το κουμπί «+ Food Spot». Πατήστε το για να ανοίξει η φόρμα καταχώρησης Προσθήκης Νέου Food Spot.',
      icon: PlusCircle
    },
    {
      step: 'Βήμα 2',
      title: 'Συμπληρώστε Όνομα, Κατηγορία & Περιοχή',
      desc: 'Γράψτε το όνομα του μαγαζιού ή του σημείου (είτε στα Ελληνικά είτε στα Αγγλικά με αυτόματο sync), επιλέξτε κατηγορία και γεωγραφική περιοχή.',
      icon: MapPin
    },
    {
      step: 'Βήμα 3',
      title: 'Γράψτε το «Secret Sauce» & τα Signature Πιάτα',
      desc: 'Εξηγήστε με απλά λόγια γιατί αυτό το μέρος ξεχωρίζει (πρώτη ύλη, ψήσιμο, ατμόσφαιρα). Μπορείτε να πατήσετε και το κουμπί «✨ Βελτίωση Περιγραφής με AI» για αυτόματη βοήθεια! Έπειτα συμπληρώστε τα Signature Πιάτα και την κατηγορία τιμής (5-10€, 10-15€, 15-20€, 20-25€ και πάνω).',
      icon: Sparkles
    },
    {
      step: 'Βήμα 4',
      title: 'Προσθέστε Φωτογραφία (ή Screenshot από Street View)',
      desc: 'Επιλέξτε μία έτοιμη φωτογραφία, ανεβάστε δική σας ή χρησιμοποιήστε τον «Οδηγό Street View Screenshot». Πατήστε «Δημοσίευση» και κερδίστε αμέσως +100 XP!',
      icon: Camera
    }
  ] : [
    {
      step: 'Step 1',
      title: 'Click the "+ Food Spot" Button',
      desc: 'At the top navigation bar, click the "+ Food Spot" button to open the Add New Food Spot submission form.',
      icon: PlusCircle
    },
    {
      step: 'Step 2',
      title: 'Fill in Name, Category & Region',
      desc: 'Enter the spot name (in either English or Greek with instant bilingual sync), choose the category and geographic region.',
      icon: MapPin
    },
    {
      step: 'Step 3',
      title: 'Write the "Secret Sauce" & Signature Dishes',
      desc: 'Explain what makes this venue special (raw ingredients, cooking technique, atmosphere). Use the "✨ Enhance Description with AI" button for instant assistance, then add Signature Dishes and price range (5-10€, 10-15€, 15-20€, 20-25€ and above).',
      icon: Sparkles
    },
    {
      step: 'Step 4',
      title: 'Add a Photo (or Street View Screenshot)',
      desc: 'Select a preset photo, upload your own, or use the "Street View Screenshot Guide". Click "Publish" and immediately earn +100 XP!',
      icon: Camera
    }
  ];

  const readSteps = language === 'el' ? [
    {
      step: 'Βήμα 1',
      title: 'Αναζήτηση & Κατηγορίες στην Κεντρική Σελίδα',
      desc: 'Χρησιμοποιήστε τη μπάρα αναζήτησης με κατηγορίες (ΠΡΩΙΝΑ/BRUNCH, ΦΑΓΗΤΟ/FOOD, ΓΛΥΚΑ/DESERTS, ΦΟΥΡΝΟΙ/PIES, ΚΑΦΕΣ/COFFEE) ή πατήστε πάνω στις επιλογές ακριβώς από κάτω.',
      icon: Search
    },
    {
      step: 'Βήμα 2',
      title: 'Άνοιγμα Καρτέλας & Ανάγνωση του «Secret Sauce»',
      desc: 'Κάντε κλικ σε οποιαδήποτε κάρτα Food Spot για να δείτε αναλυτικά γιατί είναι ξεχωριστό, ποια είναι η τιμή ανά άτομο, τα Signature Πιάτα και τα Insider Tips.',
      icon: Utensils
    },
    {
      step: 'Βήμα 3',
      title: 'Χάρτης, Πλοήγηση Google Maps & Κοινοποίηση στο Viber',
      desc: 'Μέσα στην καρτέλα βλέπετε τον διαδραστικό χάρτη. Πατήστε «Άνοιγμα στο Google Maps» για άμεση πλοήγηση ή πατήστε «Viber» για να στείλετε το spot κατευθείαν στην παρέα!',
      icon: Share2
    },
    {
      step: 'Βήμα 4',
      title: 'Διαβάστε & Γράψτε Κριτικές Μελών',
      desc: 'Στο κάτω μέρος της καρτέλας διαβάστε τι παρήγγειλαν τα άλλα μέλη της Αειφαριώτικης οικογένειας και γράψτε τη δική σας εμπειρία βαθμολογώντας με αστέρια!',
      icon: MessageSquare
    }
  ] : [
    {
      step: 'Step 1',
      title: 'Search & Filter on the Home Page',
      desc: 'Use the search bar with quick categories (BREAKFAST/BRUNCH, FOOD/DINING, SWEETS/DESSERTS, BAKERIES/PIES, COFFEE) or tap any of the visible category pills right below.',
      icon: Search
    },
    {
      step: 'Step 2',
      title: 'Open Card & Read the "Secret Sauce"',
      desc: 'Click on any Food Spot or Beach card to see why it is special, the price per person, Signature Dishes to order, and Insider Tips.',
      icon: Utensils
    },
    {
      step: 'Step 3',
      title: 'Map, Google Maps Navigation & Viber Share',
      desc: 'Inside the card modal, view the interactive map, click "Open in Google Maps" for instant directions, or share directly on Viber with friends!',
      icon: Share2
    },
    {
      step: 'Step 4',
      title: 'Read & Write Member Reviews',
      desc: 'At the bottom of the card, read what other members of the Aeifaron family ordered and post your own star-rated review!',
      icon: MessageSquare
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 text-sm font-bold border border-amber-300 dark:border-amber-800 shadow-xs">
          <BookOpen className="w-4 h-4 text-amber-600" />
          <span>
            {language === 'el' ? 'Οδηγός Χρήσης • Onboarding Μελών' : 'User Guide • Member Onboarding'}
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-50 uppercase tracking-tight">
          {language === 'el'
            ? 'ΠΩΣ ΝΑ ΧΡΗΣΙΜΟΠΟΙΗΣΕΤΕ ΤΟ AEIFARON SPOTS'
            : 'HOW TO USE AEIFARON SPOTS'}
        </h1>
        <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
          {language === 'el'
            ? 'Αναλυτικός οδηγός βήμα-βήμα για το πώς να ανεβάσετε το δικό σας αγαπημένο Food Spot και πώς να διαβάζετε και να ανακαλύπτετε τις προτάσεις της Αειφαριώτικης οικογένειας!'
            : 'Step-by-step guide on how to upload your own favorite Food Spot and how to read and discover recommendations from the Aeifaron family!'}
        </p>
      </div>

      {/* Main Two-Column Onboarding Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Section 1: Πώς να ανεβάσετε ένα Food Spot */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 sm:p-8 rounded-3xl bg-[#E8E4F3] dark:bg-[#302B4D] border-2 border-[#625B8C] shadow-lg space-y-6"
        >
          <div className="flex items-center gap-3.5 pb-4 border-b border-[#A9A1D1] dark:border-[#625B8C]">
            <div className="w-12 h-12 rounded-2xl bg-[#302B4D] dark:bg-[#625B8C] text-[#E8E4F3] flex items-center justify-center shadow-md shrink-0">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#625B8C] dark:text-[#A9A1D1]">
                {language === 'el' ? 'ΟΔΗΓΟΣ ΚΑΤΑΧΩΡΗΣΗΣ' : 'SUBMISSION GUIDE'}
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#302B4D] dark:text-[#E8E4F3]">
                {language === 'el' ? 'Πώς να ανεβάσετε ένα Food Spot' : 'How to Upload a Food Spot'}
              </h2>
            </div>
          </div>

          <div className="space-y-5">
            {uploadSteps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white/80 dark:bg-[#231f3a] border border-[#A9A1D1] dark:border-[#625B8C] flex items-start gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#625B8C] text-[#E8E4F3] font-heading font-bold flex items-center justify-center shrink-0 shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="inline-block px-2.5 py-0.5 rounded-md bg-[#A9A1D1]/50 text-[#302B4D] dark:text-[#E8E4F3] text-xs font-extrabold uppercase">
                      {item.step}
                    </div>
                    <h3 className="font-heading text-xl font-bold text-[#302B4D] dark:text-[#E8E4F3]">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[#302B4D]/85 dark:text-[#E8E4F3]/85 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full py-4 px-6 rounded-2xl bg-[#302B4D] hover:bg-[#625B8C] text-[#E8E4F3] font-heading text-lg font-bold shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>
                {language === 'el'
                  ? 'Δοκιμάστε το τώρα: Προσθήκη Νέου Food Spot'
                  : 'Try it now: Add New Food Spot'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Section 2: Πώς να διαβάσετε ένα Food Spot */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-6 sm:p-8 rounded-3xl bg-[#F4D6C6] dark:bg-[#1b2d28] border-2 border-[#6B2F2F] dark:border-[#6B8E7B] shadow-lg space-y-6"
        >
          <div className="flex items-center gap-3.5 pb-4 border-b border-[#D88C72] dark:border-[#6B8E7B]">
            <div className="w-12 h-12 rounded-2xl bg-[#6B2F2F] text-[#F4D6C6] flex items-center justify-center shadow-md shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#A44A3F] dark:text-[#D88C72]">
                {language === 'el' ? 'ΟΔΗΓΟΣ ΑΝΑΓΝΩΣΗΣ & ΕΞΕΡΕΥΝΗΣΗΣ' : 'READING & EXPLORATION GUIDE'}
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#6B2F2F] dark:text-[#F4D6C6]">
                {language === 'el' ? 'Πώς να διαβάσετε ένα Food Spot' : 'How to Read a Food Spot'}
              </h2>
            </div>
          </div>

          <div className="space-y-5">
            {readSteps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white/85 dark:bg-slate-800/80 border border-[#D88C72] dark:border-slate-700 flex items-start gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#A44A3F] text-[#F4D6C6] font-heading font-bold flex items-center justify-center shrink-0 shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="inline-block px-2.5 py-0.5 rounded-md bg-[#F4D6C6] text-[#6B2F2F] text-xs font-extrabold uppercase">
                      {item.step}
                    </div>
                    <h3 className="font-heading text-xl font-bold text-[#6B2F2F] dark:text-[#F4D6C6]">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              onClick={() => setActiveView('explore')}
              className="w-full py-4 px-6 rounded-2xl bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6] font-heading text-lg font-bold shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-5 h-5" />
              <span>
                {language === 'el'
                  ? 'Μετάβαση στην Εξερεύνηση Food Spots'
                  : 'Go to Explore Food Spots'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

      </div>

      {/* Bonus Section: Προσωπικό Προφίλ & Gamification */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#F4D6C6] via-[#FFF7F2] to-[#E8E4F3] dark:from-slate-900 dark:via-slate-900 dark:to-[#302B4D] border-2 border-[#6B2F2F] dark:border-[#625B8C] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#6B2F2F] dark:text-[#F4D6C6]">
            <Award className="w-4 h-4" />
            <span>
              {language === 'el' ? 'ΠΡΟΣΩΠΙΚΟ ΠΡΟΦΙΛ & ΤΙΤΛΟΙ ΜΕΛΩΝ' : 'PERSONAL PROFILE & MEMBER BADGES'}
            </span>
          </div>
          <h3 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50">
            {language === 'el'
              ? 'Φτιάξτε το Προσωπικό σας Προφίλ Μέλους!'
              : 'Create Your Personal Member Profile!'}
          </h3>
          <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed">
            {language === 'el'
              ? 'Ανεβάστε μια χαρούμενη, ευδιάκριτη φωτογραφία σας, συμπληρώστε το Ονοματεπώνυμο και το Nickname σας, γράψτε μια παράγραφο για εσάς και δηλώστε τα 3 Κορυφαία Φαγητά σας! Με κάθε εγκεκριμένο spot που ανεβάζετε, κερδίζετε XP και ανεβαίνετε επίπεδο.'
              : 'Upload a happy, clear photo of yourself, fill in your Full Name and Nickname, write a bio paragraph, and list your Top 3 Favorite Foods! With every approved spot you submit, you earn XP and level up.'}
          </p>
        </div>

        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-6 py-4 rounded-2xl bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6] font-heading text-lg font-bold shadow-md cursor-pointer shrink-0 transition-all"
        >
          {language === 'el' ? 'Άνοιγμα του Προφίλ μου' : 'Open My Profile'}
        </button>
      </div>

    </div>
  );
};
