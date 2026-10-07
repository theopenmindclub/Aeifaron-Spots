import { Language, SpotCategory, GreekRegion, UserBadge } from '../types';

export interface Translations {
  appName: string;
  appTagline: string;
  appDescription: string;
  
  // Navigation
  navExplore: string;
  navMap: string;
  navCommunity: string;
  navAddSpot: string;
  navSignIn: string;
  navSignOut: string;
  navProfile: string;
  navMySubmissions: string;
  
  // Hero & Search
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  searchPlaceholder: string;
  filterAllRegions: string;
  filterAllCategories: string;
  filterSortBy: string;
  sortHighestRated: string;
  sortMostRecent: string;
  sortMostReviewed: string;
  spotsFound: string;
  clearFilters: string;
  secretGemsOnly: string;
  
  // Spot Card & Detail
  theSecretSauce: string;
  theSecretSauceSubtitle: string;
  signatureDishes: string;
  spotAddress: string;
  openGoogleMaps: string;
  viewDetails: string;
  authorScout: string;
  verifiedHitSpot: string;
  memberReviews: string;
  writeReview: string;
  yourRating: string;
  yourReviewPlaceholder: string;
  dishOrderedPlaceholder: string;
  submitReview: string;
  submittingReview: string;
  replyToComment: string;
  replies: string;
  insiderTip: string;
  priceLevel: string;
  interactiveMap: string;
  viewFullGallery: string;
  moderationNotice: string;
  moderationNoticeDesc: string;
  
  // Moderation Messages
  moderationPassed: string;
  moderationRejected: string;
  moderationStrictWarning: string;
  moderationChecking: string;
  
  // Spot Creation Form
  createSpotTitle: string;
  createSpotSubtitle: string;
  fieldTitle: string;
  fieldCategory: string;
  fieldRegion: string;
  fieldAddress: string;
  fieldMapsUrl: string;
  fieldWhySpecial: string;
  fieldWhySpecialHelp: string;
  fieldSignatureDishes: string;
  fieldSignatureDishesHelp: string;
  fieldPriceLevel: string;
  fieldCoverImage: string;
  fieldCoverImageHelp: string;
  fieldGalleryImages: string;
  fieldInsiderTips: string;
  buttonPublishSpot: string;
  publishingSpot: string;
  aiAssistPrompt: string;
  aiAssistButton: string;
  aiAssistLoading: string;
  
  // Community Page
  communityTitle: string;
  communitySubtitle: string;
  topScouts: string;
  communityGuidelines: string;
  guideline1Title: string;
  guideline1Desc: string;
  guideline2Title: string;
  guideline2Desc: string;
  guideline3Title: string;
  guideline3Desc: string;
  joinExclusiveClub: string;
  applyForScoutBadge: string;
  totalSpotsShared: string;
  totalReviews: string;
  verifiedMembers: string;

  // Auth / Profile
  welcomeMember: string;
  memberBadge: string;
  editProfile: string;
  inviteCode: string;
  inviteCodePlaceholder: string;
  enterInviteCode: string;
  demoAccounts: string;
  switchUser: string;
  close: string;
}

export const translations: Record<Language, Translations> = {
  el: {
    appName: 'Hit Spots Greece',
    appTagline: 'Κλειστή Γαστρονομική Κοινότητα',
    appDescription: 'Η αποκλειστική λέσχη για τα αυθεντικά διαμάντια γεύσης σε όλη την Ελλάδα. Από το κορυφαίο χειροποίητο gelato μέχρι τα θρυλικά σουβλάκια και τις κρυφές ορεινές ταβέρνες.',
    
    // Navigation
    navExplore: 'Εξερεύνηση',
    navMap: 'Χάρτης Spots',
    navCommunity: 'Κοινότητα Scouts',
    navAddSpot: '+ Προσθήκη Hit Spot',
    navSignIn: 'Είσοδος Μέλους',
    navSignOut: 'Αποσύνδεση',
    navProfile: 'Το Προφίλ μου',
    navMySubmissions: 'Τα Spots μου',
    
    // Hero & Search
    heroTitle: 'Ανακαλύψτε τα απόλυτα',
    heroHighlight: 'Food Hit Spots',
    heroSubtitle: 'Μια κλειστή κοινότητα επαληθευμένων γευσιγνωστών & food scouts αφιερωμένη στην ανάδειξη της αυθεντικής ελληνικής γαστρονομίας.',
    searchPlaceholder: 'Αναζήτηση spot, πιάτου, γειτονιάς (π.χ. Μοναστηράκι, Μπουγάτσα, Χανιά)...',
    filterAllRegions: 'Όλες οι Περιοχές',
    filterAllCategories: 'Όλες οι Κατηγορίες',
    filterSortBy: 'Ταξινόμηση',
    sortHighestRated: 'Υψηλότερη Βαθμολογία ⭐',
    sortMostRecent: 'Πιο Πρόσφατα 🕒',
    sortMostReviewed: 'Περισσότερες Κριτικές 💬',
    spotsFound: 'Hit Spots βρέθηκαν',
    clearFilters: 'Καθαρισμός Φίλτρων',
    secretGemsOnly: 'Μόνο Κρυφά Διαμάντια 💎',
    
    // Spot Card & Detail
    theSecretSauce: 'Γιατί είναι Hit Spot (The Secret Sauce)',
    theSecretSauceSubtitle: 'Τι κάνει αυτό το μέρος μοναδικό σύμφωνα με τους Food Scouts:',
    signatureDishes: 'Signature Πιάτα & Παραγγελίες',
    spotAddress: 'Διεύθυνση & Τοποθεσία',
    openGoogleMaps: 'Άνοιγμα στο Google Maps',
    viewDetails: 'Προβολή & Κριτικές',
    authorScout: 'Προτάθηκε από τον Scout',
    verifiedHitSpot: 'Επαληθευμένο Hit Spot',
    memberReviews: 'Κριτικές Μελών Κοινότητας',
    writeReview: 'Γράψτε την κριτική σας',
    yourRating: 'Η βαθμολογία σας:',
    yourReviewPlaceholder: 'Μοιραστείτε την αυθεντική γευστική σας εμπειρία (υλικά, γεύση, service, χρόνος αναμονής)...',
    dishOrderedPlaceholder: 'Τι παραγγείλατε; (π.χ. Προβατίνα στα κάρβουνα, Gelato Φιστίκι Αιγίνης)',
    submitReview: 'Δημοσίευση Κριτικής (Με AI Έλεγχο)',
    submittingReview: 'Έλεγχος γαστρονομικής εγκυρότητας...',
    replyToComment: 'Απάντηση',
    replies: 'Απαντήσεις',
    insiderTip: 'Foodie Insider Tip:',
    priceLevel: 'Επίπεδο Τιμής',
    interactiveMap: 'Διαδραστικός Χάρτης & Στίγμα',
    viewFullGallery: 'Προβολή Όλων των Φωτογραφιών',
    moderationNotice: 'Αυστηρός Έλεγχος Σχολίων',
    moderationNoticeDesc: 'Όλα τα σχόλια ελέγχονται αυτόματα με AI ώστε να αφορούν αποκλειστικά το φαγητό και την εμπειρία στο συγκεκριμένο spot.',
    
    // Moderation Messages
    moderationPassed: 'Το σχόλιό σας εγκρίθηκε επιτυχώς! Ευχαριστούμε για τη γαστρονομική σας συνεισφορά.',
    moderationRejected: 'Το σχόλιο δεν δημοσιεύτηκε.',
    moderationStrictWarning: 'Το σχόλιό σας πρέπει να σχετίζεται άμεσα με το φαγητό, τα υλικά ή την εμπειρία στο συγκεκριμένο spot. Παρακαλούμε αποφύγετε άσχετα ή γενικά θέματα.',
    moderationChecking: 'Το AI επαληθεύει τη γαστρονομική συνάφεια...',
    
    // Spot Creation Form
    createSpotTitle: 'Προσθήκη Νέου Food Spot',
    createSpotSubtitle: 'Μοιραστείτε ένα αυθεντικό διαμάντι με την Αειφαρειώτικη οικογένεια. Όλα τα πεδία είναι υποχρεωτικά.',
    fieldTitle: 'Όνομα Καταστήματος / Spot',
    fieldCategory: 'Κατηγορία Spot',
    fieldRegion: 'Γεωγραφική Περιοχή',
    fieldAddress: 'Ακριβής Διεύθυνση (Οδός, Αριθμός, Περιοχή)',
    fieldMapsUrl: 'Google Maps Link / URL',
    fieldWhySpecial: 'Γιατί είναι Food Spot (The Secret Sauce)',
    fieldWhySpecialHelp: 'Εξηγήστε αναλυτικά τι κάνει αυτό το μέρος ασύγκριτο: πρώτη ύλη, τεχνική ψησίματος, μυστική συνταγή, ιστορία.',
    fieldSignatureDishes: 'Signature Πιάτα (Χωρισμένα με κόμμα)',
    fieldSignatureDishesHelp: 'π.χ. Σουβλάκι με χειροποίητη σάλτσα, Μπουγάτσα με κρέμα και κανέλα, Ταρτάρ τόνου',
    fieldPriceLevel: 'Κατηγορία Τιμής (ανά άτομο)',
    fieldCoverImage: 'URL Κύριας Φωτογραφίας (Υψηλή Ανάλυση)',
    fieldCoverImageHelp: 'Προσθέστε έναν καθαρό σύνδεσμο εικόνας ή επιλέξτε από τις προτεινόμενες.',
    fieldGalleryImages: 'Επιπλέον Φωτογραφίες Gallery (URLs χωρισμένα με γραμμή)',
    fieldInsiderTips: 'Insider Tips για τα μέλη (π.χ. Ώρα αιχμής, κράτηση, μυστικό πιάτο)',
    buttonPublishSpot: 'Δημοσίευση Food Spot στην Κοινότητα',
    publishingSpot: 'Δημοσίευση...',
    aiAssistPrompt: 'Βοηθός AI για το Secret Sauce',
    aiAssistButton: '✨ Βελτίωση Περιγραφής με AI',
    aiAssistLoading: 'Το AI δημιουργεί γαστρονομική ανάλυση...',
    
    // Community Page
    communityTitle: 'Η Κοινότητα των Food Scouts',
    communitySubtitle: 'Γνωρίστε τους επαληθευμένους γευσιγνώστες, chef και locals που διαμορφώνουν τον απόλυτο γαστρονομικό οδηγό της Ελλάδας.',
    topScouts: 'Κορυφαίοι Taste Masters & Scouts',
    communityGuidelines: 'Κανόνες & Πρωτόκολλο Αποκλειστικότητας',
    guideline1Title: '1. Αυθεντικότητα & Πρώτη Ύλη',
    guideline1Desc: 'Προτείνουμε μέρη που διακρίνονται για την εξαιρετική ποιότητα υλικών, την παράδοση ή την πρωτοποριακή τεχνική τους — όχι τουριστικές παγίδες.',
    guideline2Title: '2. Αυστηρή Συνάφεια Σχολίων',
    guideline2Desc: 'Κάθε κριτική και σχόλιο περνάει από αυτόματο έλεγχο AI. Σχόλια εκτός θέματος ή γενικόλογα απορρίπτονται άμεσα.',
    guideline3Title: '3. Επαληθευμένη Ταυτότητα Μελών',
    guideline3Desc: 'Όλα τα μέλη φέρουν επίσημο προφίλ και badge αξιοπιστίας (Food Scout, Taste Master, Executive Chef).',
    joinExclusiveClub: 'Πρόσκληση & Εγγραφή Μέλους',
    applyForScoutBadge: 'Αίτηση για Αναβάθμιση σε Scout',
    totalSpotsShared: 'Καταγεγραμμένα Hit Spots',
    totalReviews: 'Επαληθευμένες Κριτικές',
    verifiedMembers: 'Ενεργοί Food Scouts',

    // Auth / Profile
    welcomeMember: 'Καλωσήρθατε,',
    memberBadge: 'Τίτλος Μέλους',
    editProfile: 'Επεξεργασία Προφίλ',
    inviteCode: 'Κωδικός Πρόσκλησης (Invite Code)',
    inviteCodePlaceholder: 'π.χ. GREECE-TASTE-2026',
    enterInviteCode: 'Εισαγωγή Κωδικού',
    demoAccounts: 'Γρήγορη Εναλλαγή Επαληθευμένων Προφίλ (Demo Mode)',
    switchUser: 'Σύνδεση ως',
    close: 'Κλείσιμο'
  },
  en: {
    appName: 'Hit Spots Greece',
    appTagline: 'Exclusive Culinary Community',
    appDescription: 'The private club for authentic food gems across Greece. From artisan gelato and legendary souvlaki to hidden island fish tavernas and mountain bakeries.',
    
    // Navigation
    navExplore: 'Explore Spots',
    navMap: 'Interactive Map',
    navCommunity: 'Scouts Club',
    navAddSpot: '+ Submit Hit Spot',
    navSignIn: 'Member Sign In',
    navSignOut: 'Sign Out',
    navProfile: 'My Profile',
    navMySubmissions: 'My Spots',
    
    // Hero & Search
    heroTitle: 'Discover Authentic',
    heroHighlight: 'Food Hit Spots in Greece',
    heroSubtitle: 'An exclusive community of verified food scouts, taste masters, and culinary connoisseurs sharing genuine gastronomic gems.',
    searchPlaceholder: 'Search spots, signature dishes, regions (e.g. Athens, Bougatsa, Chania)...',
    filterAllRegions: 'All Greek Regions',
    filterAllCategories: 'All Categories',
    filterSortBy: 'Sort By',
    sortHighestRated: 'Highest Rated ⭐',
    sortMostRecent: 'Recently Added 🕒',
    sortMostReviewed: 'Most Discussed 💬',
    spotsFound: 'Hit Spots found',
    clearFilters: 'Reset Filters',
    secretGemsOnly: 'Hidden Gems Only 💎',
    
    // Spot Card & Detail
    theSecretSauce: "Why It's a Hit Spot (The Secret Sauce)",
    theSecretSauceSubtitle: 'What makes this culinary venue exceptional according to Scouts:',
    signatureDishes: 'Signature Dishes & Must-Orders',
    spotAddress: 'Address & Coordinates',
    openGoogleMaps: 'Open in Google Maps',
    viewDetails: 'View Details & Reviews',
    authorScout: 'Submitted by Scout',
    verifiedHitSpot: 'Verified Hit Spot',
    memberReviews: 'Community Member Reviews',
    writeReview: 'Leave a Member Review',
    yourRating: 'Your Star Rating:',
    yourReviewPlaceholder: 'Share your genuine culinary experience (ingredients, flavors, wait time, best time to visit)...',
    dishOrderedPlaceholder: 'What did you order? (e.g. Grilled Mutton Chops, Aegina Pistachio Gelato)',
    submitReview: 'Post Review (AI Moderated)',
    submittingReview: 'Checking culinary relevance...',
    replyToComment: 'Reply',
    replies: 'Replies',
    insiderTip: 'Foodie Insider Tip:',
    priceLevel: 'Price Range',
    interactiveMap: 'Location & Interactive Preview',
    viewFullGallery: 'View Full Photo Gallery',
    moderationNotice: 'Strict Culinary Moderation',
    moderationNoticeDesc: 'All comments are checked via automated AI to ensure strict relevance to food, ingredients, and dining experience at this spot.',
    
    // Moderation Messages
    moderationPassed: 'Your review passed AI verification! Thank you for your culinary contribution.',
    moderationRejected: 'Review could not be posted.',
    moderationStrictWarning: 'Your comment must be directly related to the food, ingredients, or experience at this specific spot. Generic or off-topic comments are rejected.',
    moderationChecking: 'AI is evaluating culinary relevance...',
    
    // Spot Creation Form
    createSpotTitle: 'Add New Food Spot',
    createSpotSubtitle: 'Share an authentic gem with the Aeifaron family. All fields are required.',
    fieldTitle: 'Venue / Spot Name',
    fieldCategory: 'Spot Category',
    fieldRegion: 'Geographic Region',
    fieldAddress: 'Full Street Address',
    fieldMapsUrl: 'Google Maps Link / URL',
    fieldWhySpecial: "Why It's a Food Spot (The Secret Sauce)",
    fieldWhySpecialHelp: 'Detail what makes this venue exceptional: raw ingredients, cooking technique, legacy recipe, sourdough hydration, etc.',
    fieldSignatureDishes: 'Signature Dishes (Comma separated)',
    fieldSignatureDishesHelp: 'e.g., Handcrafted Pita Souvlaki, Bougatsa with warm custard, Dry-Aged Aegean Sea Bream',
    fieldPriceLevel: 'Price Category (per person)',
    fieldCoverImage: 'Cover Image URL (High Resolution)',
    fieldCoverImageHelp: 'Provide a direct image URL or choose one of the curated presets.',
    fieldGalleryImages: 'Additional Gallery Photos (One URL per line)',
    fieldInsiderTips: 'Insider Tips for members (e.g., Best arrival time, secret menu items)',
    buttonPublishSpot: 'Publish Food Spot to Community',
    publishingSpot: 'Publishing...',
    aiAssistPrompt: 'AI Secret Sauce Assistant',
    aiAssistButton: '✨ Enhance Description with AI',
    aiAssistLoading: 'AI crafting culinary notes...',
    
    // Community Page
    communityTitle: 'The Food Scouts Community',
    communitySubtitle: 'Meet the verified critics, chefs, and passionate foodies curating the most credible gastronomic guide in Greece.',
    topScouts: 'Top Taste Masters & Scouts',
    communityGuidelines: 'Community Protocol & Integrity',
    guideline1Title: '1. Authenticity & Ingredients First',
    guideline1Desc: 'We prioritize venues with uncompromising ingredient sourcing, artisanal mastery, and genuine Greek culinary roots.',
    guideline2Title: '2. Strict Culinary Relevance',
    guideline2Desc: 'Every review and discussion is monitored by AI. Non-food chatter or abusive remarks are filtered immediately.',
    guideline3Title: '3. Verified Identity',
    guideline3Desc: 'Members carry distinctive reputation badges earned through high-quality spot contributions and tasting pedigree.',
    joinExclusiveClub: 'Invite & Membership Access',
    applyForScoutBadge: 'Apply for Scout Status',
    totalSpotsShared: 'Curated Hit Spots',
    totalReviews: 'Verified Reviews',
    verifiedMembers: 'Active Food Scouts',

    // Auth / Profile
    welcomeMember: 'Welcome,',
    memberBadge: 'Member Badge',
    editProfile: 'Edit Profile',
    inviteCode: 'Invite Code',
    inviteCodePlaceholder: 'e.g. GREECE-TASTE-2026',
    enterInviteCode: 'Enter Invite Code',
    demoAccounts: 'Quick Switch Verified Profiles (Demo Mode)',
    switchUser: 'Login as',
    close: 'Close'
  }
};

export const CATEGORY_TRANSLATIONS: Record<SpotCategory, { el: string; en: string; icon: string }> = {
  'Παραλίες': { el: 'Παραλίες', en: 'Beaches', icon: '🏖️' },
  'Τοποθεσίες': { el: 'Τοποθεσίες', en: 'Locations & Places', icon: '🏞️' },
  'Εκδρομές': { el: 'Εκδρομές & Αποδράσεις', en: 'Excursions & Getaways', icon: '🎒' },
  'Μηχανάδες': { el: 'Μηχανάδες & Ride Spots', en: 'Moto & Ride Spots', icon: '🏍️' },
  'Gelato': { el: 'Αυθεντικό Gelato', en: 'Artisan Gelato', icon: '🍨' },
  'Traditional Bakery': { el: 'Παραδοσιακός Φούρνος', en: 'Traditional Bakery', icon: '🥖' },
  'Seafood & Psarotaverna': { el: 'Ψαροταβέρνα & Θαλασσινά', en: 'Seafood & Psarotaverna', icon: '🐟' },
  'Authentic Souvlaki': { el: 'Αυθεντικό Σουβλάκι', en: 'Authentic Souvlaki', icon: '🍢' },
  'Modern Greek': { el: 'Σύγχρονη Ελληνική Κουζίνα', en: 'Modern Greek Gastronomy', icon: '🍽️' },
  'Mezedopoleio': { el: 'Μεζεδοπωλείο & Τσιπουράδικο', en: 'Mezedopoleio & Tsipouro', icon: '🫒' },
  'Bougatsa & Pastry': { el: 'Μπουγάτσα & Ζαχαροπλαστείο', en: 'Bougatsa & Pastry', icon: '🥐' },
  'Artisan Coffee & Brunch': { el: 'Specialty Coffee & Brunch', en: 'Specialty Coffee & Brunch', icon: '☕' },
  'Hidden Mountain Taverna': { el: 'Κρυφή Ορεινή Ταβέρνα', en: 'Hidden Mountain Taverna', icon: '🏔️' },
  'Street Food Hit': { el: 'Legendary Street Food', en: 'Legendary Street Food', icon: '🥪' }
};

export const REGION_TRANSLATIONS: Record<GreekRegion, { el: string; en: string }> = {
  'Athens & Attica': { el: 'Αθήνα & Αττική', en: 'Athens & Attica' },
  'Thessaloniki & North': { el: 'Θεσσαλονίκη & Βόρεια Ελλάδα', en: 'Thessaloniki & North Greece' },
  'Chania & West Crete': { el: 'Χανιά & Δυτική Κρήτη', en: 'Chania & West Crete' },
  'Heraklion & East Crete': { el: 'Ηράκλειο & Ανατολική Κρήτη', en: 'Heraklion & East Crete' },
  'Cyclades (Naxos/Santorini/Paros)': { el: 'Κυκλάδες (Νάξος, Σαντορίνη, Πάρος)', en: 'Cyclades (Naxos, Santorini, Paros)' },
  'Ionian Islands (Corfu/Lefkada)': { el: 'Ιόνια Νησιά (Κέρκυρα, Λευκάδα)', en: 'Ionian Islands (Corfu, Lefkada)' },
  'Peloponnese (Mani/Nafplio)': { el: 'Πελοπόννησος (Μάνη, Ναύπλιο)', en: 'Peloponnese (Mani, Nafplio)' },
  'Dodecanese (Rhodes/Kos)': { el: 'Δωδεκάνησα (Ρόδος, Κως)', en: 'Dodecanese (Rhodes, Kos)' },
  'Epirus & Zagori': { el: 'Ήπειρος & Ζαγοροχώρια', en: 'Epirus & Zagori' }
};

export const BADGE_TRANSLATIONS: Record<UserBadge, { el: string; en: string; color: string }> = {
  'ΜΑΣΤΕΡΜΑΙΝΤ': { el: 'ΜΑΣΤΕΡΜΑΙΝΤ • A Living Myth', en: 'MASTERMIND • A Living Myth', color: 'bg-rose-600 text-white border-rose-400 dark:bg-rose-600 dark:text-white' },
  'ΜΑΣΤΕΡ': { el: 'ΜΑΣΤΕΡ • Food Legend', en: 'MASTER • Food Legend', color: 'bg-amber-500 text-stone-950 border-amber-400 dark:bg-amber-500 dark:text-stone-950' },
  'ΦΙΛΟΣ ΚΙ ΑΔΕΡΦΟΣ/Η': { el: 'ΦΙΛΟΣ ΚΙ ΑΔΕΡΦΟΣ/Η • Michelin Level', en: 'Michelin Level', color: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300' },
  'ΤΟ ΚΑΛΥΤΕΡΟ ΠΑΙΔΙ': { el: 'ΦΙΛΟΣ ΚΙ ΑΔΕΡΦΟΣ/Η • Michelin Level', en: 'Michelin Level', color: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300' },
  'ΚΑΛΟΦΑΓΑΣ/ΟΥ': { el: 'ΚΑΛΟΦΑΓΑΣ/ΟΥ • Food Expert', en: 'Food Expert', color: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300' },
  'ΕΙΜΑΙ ΑΠΟΛΑΥΣΗ': { el: 'ΚΑΛΟΦΑΓΑΣ/ΟΥ • Food Expert', en: 'Food Expert', color: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300' },
  'ΑΠΟΛΑΥΣΤΙΚΗ ΖΩΗ': { el: 'ΚΑΛΟΦΑΓΑΣ/ΟΥ • Food Expert', en: 'Food Expert', color: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300' },
  'ΜΕΡΑΚΛΗΣ/ΜΕΡΑΚΛΙΝΑ': { el: 'ΜΕΡΑΚΛΗΣ / ΜΕΡΑΚΛΙΝΑ • Food Lover', en: 'Food Lover', color: 'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300' },
  'ΠΑΜΕ ΠΑΙΔΙΑ': { el: 'ΠΑΜΕ ΠΑΙΔΙΑ • First Lover', en: 'First Lover', color: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300' },
  'ΕΝΕΡΓΟΠΟΙΗΘΗΚΑ ΠΑΙΔΙΑ': { el: 'ΠΑΜΕ ΠΑΙΔΙΑ • First Lover', en: 'First Lover', color: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300' },
  'ΕΝΕΡΓΟ ΜΕΛΟΣ': { el: 'ΠΑΜΕ ΠΑΙΔΙΑ • First Lover', en: 'First Lover', color: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300' },
  'Αρχάριο Μέλος': { el: 'Αρχάριο Μέλος', en: 'New Member', color: 'bg-stone-100 text-stone-700 border-stone-300 dark:bg-slate-800 dark:text-stone-300' },
  'Food Scout': { el: 'ΠΑΜΕ ΠΑΙΔΙΑ • First Lover', en: 'First Lover', color: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300' },
  'Culinary Expert': { el: 'ΚΑΛΟΦΑΓΑΣ/ΟΥ • Food Expert', en: 'Food Expert', color: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300' },
  'Taste Master': { el: 'ΜΑΣΤΕΡ • Food Legend', en: 'Food Legend', color: 'bg-amber-500 text-stone-950 border-amber-400 dark:bg-amber-500 dark:text-stone-950' },
  'Culinary Critic': { el: 'ΦΙΛΟΣ ΚΙ ΑΔΕΡΦΟΣ/Η • Michelin Level', en: 'Michelin Level', color: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300' },
  'Executive Chef': { el: 'ΜΑΣΤΕΡ • Food Legend', en: 'Food Legend', color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300' },
  'Artisan Hunter': { el: 'ΚΑΛΟΦΑΓΑΣ/ΟΥ • Food Expert', en: 'Food Expert', color: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-300' },
  'Local Legend': { el: 'ΜΑΣΤΕΡΜΑΙΝΤ • A Living Myth', en: 'A Living Myth', color: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300' }
};
