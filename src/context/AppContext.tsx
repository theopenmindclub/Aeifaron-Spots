import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  HitSpot, 
  UserProfile, 
  Review, 
  Language, 
  Theme, 
  SpotCategory, 
  GreekRegion,
  ModerationResult,
  ProfileComment,
  DirectMessage,
  PublicChatState,
  SearchMacroGroup,
  AppNotification,
  getGamificationBadge
} from '../types';
import { translations, Translations } from '../i18n/translations';
import { INITIAL_HIT_SPOTS, INITIAL_REVIEWS, DEMO_USERS, INITIAL_NOTIFICATIONS } from '../data/mockData';
import {
  auth,
  db,
  googleProvider,
  facebookProvider,
  instagramProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  firebaseSignOut,
  updateProfile,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  writeBatch,
  handleFirestoreError,
  OperationType
} from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: Translations;
  
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  allUsers: UserProfile[];
  isFirebaseAuthenticated: boolean;
  updateCurrentUserProfile: (updated: Partial<UserProfile>) => void;
  registerNewMember: (data: {
    firstName: string;
    lastName: string;
    nickname: string;
    email: string;
    password?: string;
    authProvider?: 'email' | 'google' | 'facebook' | 'instagram';
    avatarUrl: string;
    bio: string;
    topFoods: [string, string, string];
  }) => Promise<boolean>;
  loginWithEmailPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithProvider: (providerName: 'google' | 'facebook' | 'instagram') => Promise<{
    success: boolean;
    needsProfileCompletion?: boolean;
    prefill?: {
      firstName: string;
      lastName: string;
      email: string;
      avatarUrl: string;
      authProvider: 'google' | 'facebook' | 'instagram';
    };
    error?: string;
  }>;
  logoutUser: () => Promise<void>;
  selectedMemberProfile: UserProfile | null;
  setSelectedMemberProfile: (user: UserProfile | null) => void;
  
  profileComments: ProfileComment[];
  addProfileComment: (targetUserId: string, content: string) => void;
  
  directMessages: DirectMessage[];
  activeDirectChatUser: UserProfile | null;
  setActiveDirectChatUser: (user: UserProfile | null) => void;
  sendDirectMessage: (receiverId: string, content: string) => Promise<void>;
  
  publicChat: PublicChatState;
  sendPublicChatMessage: (content: string, parentId?: string | null) => Promise<{ success: boolean; error?: string }>;
  
  spots: HitSpot[];
  reviews: Review[];
  activeView: 'explore' | 'map' | 'community' | 'onboarding' | 'my-spots';
  setActiveView: (view: 'explore' | 'map' | 'community' | 'onboarding' | 'my-spots') => void;
  
  selectedSpot: HitSpot | null;
  setSelectedSpot: (spot: HitSpot | null) => void;
  
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isAiSearchModalOpen: boolean;
  setIsAiSearchModalOpen: (open: boolean) => void;
  lightboxUrl: string | null;
  setLightboxUrl: (url: string | null) => void;
  
  // Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedMacroGroup: SearchMacroGroup;
  setSelectedMacroGroup: (group: SearchMacroGroup) => void;
  selectedCategory: SpotCategory | 'ALL';
  setSelectedCategory: (cat: SpotCategory | 'ALL') => void;
  selectedRegion: GreekRegion | 'ALL';
  setSelectedRegion: (region: GreekRegion | 'ALL') => void;
  sortBy: 'highest-rated' | 'recent' | 'reviews';
  setSortBy: (sort: 'highest-rated' | 'recent' | 'reviews') => void;
  secretGemsOnly: boolean;
  setSecretGemsOnly: (val: boolean) => void;
  
  // Actions
  createHitSpot: (spotData: Partial<HitSpot>) => Promise<{ success: boolean; spot?: HitSpot; error?: string }>;
  updateHitSpot: (spotId: string, updates: Partial<HitSpot> & { updateSummary?: string }) => Promise<{ success: boolean; spot?: HitSpot; error?: string }>;
  addReview: (spotId: string, content: string, rating: number, signatureOrdered?: string) => Promise<{ success: boolean; review?: Review; moderation?: ModerationResult; error?: string }>;
  addReply: (reviewId: string, content: string) => Promise<{ success: boolean; error?: string }>;
  moderateCommentText: (content: string, spotTitle: string, category: string) => Promise<ModerationResult>;

  // Favorites & In-App Notification Center
  favoriteSpotIds: string[];
  toggleFavoriteSpot: (spotId: string) => void;
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Toast notifications
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('hitspots_lang');
    return (saved === 'en' || saved === 'el') ? saved : 'el';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('hitspots_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[0]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(DEMO_USERS);
  const [isFirebaseAuthenticated, setIsFirebaseAuthenticated] = useState<boolean>(false);
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<UserProfile | null>(null);
  
  const [spots, setSpots] = useState<HitSpot[]>(INITIAL_HIT_SPOTS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [favoriteSpotIds, setFavoriteSpotIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hitspots_favorites');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return ['spot-1', 'spot-3', 'spot-4'];
  });
  
  const [activeView, setActiveView] = useState<'explore' | 'map' | 'community' | 'onboarding' | 'my-spots'>('explore');
  const [selectedSpot, setSelectedSpot] = useState<HitSpot | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAiSearchModalOpen, setIsAiSearchModalOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const [profileComments, setProfileComments] = useState<ProfileComment[]>([
    {
      id: 'pcomm-1',
      targetUserId: 'user-1',
      authorId: 'user-2',
      authorName: 'Έλενα Βασιλείου',
      authorAvatar: DEMO_USERS[1].avatarUrl,
      authorBadge: 'ΦΙΛΟΣ ΚΙ ΑΔΕΡΦΟΣ/Η • Michelin Level',
      content: 'Κώστα, οι προτάσεις σου στα Χανιά και στη Νάξο είναι πραγματικοί θησαυροί για την παρέα μας! ❤️',
      createdAt: '2025-02-15'
    },
    {
      id: 'pcomm-2',
      targetUserId: 'user-2',
      authorId: 'user-3',
      authorName: 'Μανώλης Κατσανεβάκης',
      authorAvatar: DEMO_USERS[2].avatarUrl,
      authorBadge: 'ΚΑΛΟΦΑΓΑΣ/ΟΥ • Food Expert',
      content: 'Το Gelato Φιστίκι Αιγίνης που μας πρότεινες στο Σύνταγμα δεν παίζεται! Να είσαι πάντα καλά Έλενα!',
      createdAt: '2025-02-16'
    }
  ]);

  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [activeDirectChatUser, setActiveDirectChatUser] = useState<UserProfile | null>(null);

  const [publicChat, setPublicChat] = useState<PublicChatState>({
    messages: [
      {
        id: 'pub-1',
        userId: 'user-1',
        firstName: 'Κώστας',
        lastName: 'Παπαγεωργίου',
        avatarUrl: DEMO_USERS[0].avatarUrl,
        title: 'Καλωσήρθατε στην Αειφαριώτικη Κοινότητα! Ποιο είναι το αγαπημένο σας Spot;',
        content: 'Καλησπέρα σε όλη την Αειφαριώτικη οικογένεια! Γράψτε από κάτω ποιο είναι το κορυφαίο σας food spot ή παραλία για σήμερα ώστε να ανταλλάξουμε προτάσεις!',
        categoryTag: '💬 Ανταλλαγή',
        pinned: true,
        likesCount: 28,
        thumbnailUrl: INITIAL_HIT_SPOTS[3].coverImageUrl,
        parentId: null,
        depth: 0,
        createdAt: '19:30'
      },
      {
        id: 'pub-2',
        userId: 'user-2',
        firstName: 'Έλενα',
        lastName: 'Βασιλείου',
        avatarUrl: DEMO_USERS[1].avatarUrl,
        content: 'Καλησπέρα Κώστα! Μόλις δοκίμασα το φιστίκι Αιγίνης στο Σύνταγμα, απλά όνειρο!',
        likesCount: 12,
        parentId: 'pub-1',
        depth: 1,
        createdAt: '19:32'
      },
      {
        id: 'pub-3',
        userId: 'user-3',
        firstName: 'Μανώλης',
        lastName: 'Κατσανεβάκης',
        avatarUrl: DEMO_USERS[2].avatarUrl,
        content: 'Συμφωνώ απόλυτα Έλενα! Και το καϊμάκι με σαλέπι εκεί δεν παίζεται!',
        likesCount: 9,
        parentId: 'pub-2',
        depth: 2,
        createdAt: '19:35'
      },
      {
        id: 'pub-4',
        userId: 'user-5',
        firstName: 'Σοφία',
        lastName: 'Νικολάου',
        avatarUrl: DEMO_USERS[4].avatarUrl,
        title: 'Νέα Ανακάλυψη στα Ζαγοροχώρια & Προτάσεις Εβδομάδας',
        content: 'Χαιρετίσματα από τα Ζαγοροχώρια! Η χειροποίητη αλευρόπιτα σήμερα βγήκε τραγανή από τον ξυλόφουρνο! Κάντε κλικ για να σχολιάσετε τις δικές σας ορεινές προτάσεις.',
        categoryTag: '🆕 Νέα & Προτάσεις',
        pinned: true,
        likesCount: 19,
        thumbnailUrl: INITIAL_HIT_SPOTS[2].coverImageUrl,
        parentId: null,
        depth: 0,
        createdAt: '19:40'
      }
    ]
  });
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMacroGroup, setSelectedMacroGroup] = useState<SearchMacroGroup>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<SpotCategory | 'ALL'>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<GreekRegion | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'highest-rated' | 'recent' | 'reviews'>('highest-rated');
  const [secretGemsOnly, setSecretGemsOnly] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('hitspots_lang', lang);
    document.documentElement.lang = lang;
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setThemeState(next);
    localStorage.setItem('hitspots_theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.lang = language;
  }, []);

  // Fetch initial spots and establish real-time SSE stream
  useEffect(() => {
    fetch('/api/spots')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSpots(data);
        }
      })
      .catch(() => {});

    const evtSource = new EventSource('/api/events');

    evtSource.addEventListener('init', (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        if (Array.isArray(parsed.users) && parsed.users.length > 0) {
          setAllUsers(parsed.users);
        }
        if (Array.isArray(parsed.spots) && parsed.spots.length > 0) {
          setSpots(parsed.spots);
        }
        if (parsed.publicChat) {
          setPublicChat(parsed.publicChat);
        }
        if (Array.isArray(parsed.directMessages)) {
          setDirectMessages(parsed.directMessages);
        }
        if (Array.isArray(parsed.notifications)) {
          setNotifications(parsed.notifications);
        }
      } catch (err) {}
    });

    evtSource.addEventListener('user:registered', (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        if (Array.isArray(parsed.users)) {
          setAllUsers(parsed.users);
        }
        if (parsed.publicChat) {
          setPublicChat(parsed.publicChat);
        }
      } catch (err) {}
    });

    evtSource.addEventListener('user:updated', (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        if (Array.isArray(parsed.users)) {
          setAllUsers(parsed.users);
        }
      } catch (err) {}
    });

    evtSource.addEventListener('spot:created', (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        if (Array.isArray(parsed.spots)) {
          setSpots(parsed.spots);
        } else if (parsed.spot) {
          setSpots((prev) => {
            if (prev.some((s) => s.id === parsed.spot.id)) return prev;
            return [parsed.spot, ...prev];
          });
        }
        if (Array.isArray(parsed.users)) {
          setAllUsers(parsed.users);
        }
      } catch (err) {}
    });

    evtSource.addEventListener('public-chat:updated', (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        if (parsed && Array.isArray(parsed.messages)) {
          setPublicChat(parsed);
        }
      } catch (err) {}
    });

    evtSource.addEventListener('dm:created', (e: MessageEvent) => {
      try {
        const newDm: DirectMessage = JSON.parse(e.data);
        setDirectMessages((prev) => {
          if (prev.some((m) => m.id === newDm.id)) return prev;
          return [...prev, newDm];
        });
      } catch (err) {}
    });

    evtSource.addEventListener('spot:updated', (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        if (Array.isArray(parsed.spots)) {
          setSpots(parsed.spots);
        } else if (parsed.spot) {
          setSpots((prev) => prev.map((s) => (s.id === parsed.spot.id ? parsed.spot : s)));
        }
        if (parsed.spot) {
          setSelectedSpot((prev) => (prev && prev.id === parsed.spot.id ? parsed.spot : prev));
        }
      } catch (err) {}
    });

    evtSource.addEventListener('notification:created', (e: MessageEvent) => {
      try {
        const newNotif: AppNotification = JSON.parse(e.data);
        setNotifications((prev) => {
          if (prev.some((n) => n.id === newNotif.id)) return prev;
          return [newNotif, ...prev];
        });
      } catch (err) {}
    });

    evtSource.addEventListener('review:created', (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        if (parsed.review) {
          setReviews((prev) => {
            if (prev.some((r) => r.id === parsed.review.id)) return prev;
            return [parsed.review, ...prev];
          });
        }
        if (parsed.spotId) {
          setSpots((prev) =>
            prev.map((s) =>
              s.id === parsed.spotId
                ? {
                    ...s,
                    rating: parsed.spotUpdatedRating || s.rating,
                    reviewsCount: s.reviewsCount + 1
                  }
                : s
            )
          );
        }
      } catch (err) {}
    });

    return () => {
      evtSource.close();
    };
  }, []);

  // Listen to Firebase Auth state and load Firestore member profiles
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setIsFirebaseAuthenticated(true);
        const userDocPath = `users/${fbUser.uid}`;
        try {
          const snap = await getDoc(doc(db, 'users', fbUser.uid));
          if (snap.exists()) {
            const d = snap.data();
            const loadedProfile: UserProfile = {
              id: fbUser.uid,
              firstName: d.firstName || 'Μέλος',
              lastName: d.lastName || 'Αείφαρον',
              nickname: d.nickname || 'Food Lover',
              email: fbUser.email || '',
              avatarUrl: d.avatarUrl || fbUser.photoURL || DEMO_USERS[0].avatarUrl,
              bio: d.bio || 'Μέλος της Αειφαριώτικης οικογένειας.',
              topFoods: Array.isArray(d.topFoods) && d.topFoods.length === 3
                ? [d.topFoods[0], d.topFoods[1], d.topFoods[2]]
                : ['Σουβλάκι στα κάρβουνα', 'Παραδοσιακή πίτα', 'Gelato Φιστίκι'],
              badge: (d.badge as any) || getGamificationBadge(d.spotsSubmittedCount || 1),
              role: 'member',
              favoriteRegions: ['Athens & Attica'],
              spotsSubmittedCount: typeof d.spotsSubmittedCount === 'number' ? d.spotsSubmittedCount : 1,
              reviewsCount: typeof d.reviewsCount === 'number' ? d.reviewsCount : 0,
              joinedAt: new Date().toISOString().split('T')[0],
              points: (d.spotsSubmittedCount || 1) * 100
            };
            setCurrentUser(loadedProfile);
            setAllUsers((prev) => {
              const exists = prev.some((u) => u.id === loadedProfile.id);
              return exists
                ? prev.map((u) => (u.id === loadedProfile.id ? loadedProfile : u))
                : [loadedProfile, ...prev];
            });
          }

          // Also fetch all registered Firestore community profiles
          const q = query(collection(db, 'users'), where('spotsSubmittedCount', '>=', 0));
          const listSnap = await getDocs(q);
          const firestoreUsers: UserProfile[] = [];
          listSnap.forEach((docSnap) => {
            const d = docSnap.data();
            firestoreUsers.push({
              id: docSnap.id,
              firstName: d.firstName || 'Μέλος',
              lastName: d.lastName || 'Αείφαρον',
              nickname: d.nickname || 'Food Lover',
              email: docSnap.id === fbUser.uid ? (fbUser.email || '') : '',
              avatarUrl: d.avatarUrl || DEMO_USERS[0].avatarUrl,
              bio: d.bio || 'Μέλος της Αειφαριώτικης οικογένειας.',
              topFoods: Array.isArray(d.topFoods) && d.topFoods.length === 3
                ? [d.topFoods[0], d.topFoods[1], d.topFoods[2]]
                : ['Σουβλάκι στα κάρβουνα', 'Παραδοσιακή πίτα', 'Gelato Φιστίκι'],
              badge: (d.badge as any) || getGamificationBadge(d.spotsSubmittedCount || 1),
              role: 'member',
              favoriteRegions: ['Athens & Attica'],
              spotsSubmittedCount: typeof d.spotsSubmittedCount === 'number' ? d.spotsSubmittedCount : 1,
              reviewsCount: typeof d.reviewsCount === 'number' ? d.reviewsCount : 0,
              joinedAt: new Date().toISOString().split('T')[0],
              points: (d.spotsSubmittedCount || 1) * 100
            });
          });
          if (firestoreUsers.length > 0) {
            setAllUsers((prev) => {
              const merged = [...prev];
              for (const fu of firestoreUsers) {
                const idx = merged.findIndex((u) => u.id === fu.id);
                if (idx >= 0) {
                  merged[idx] = fu;
                } else {
                  merged.unshift(fu);
                }
              }
              return merged;
            });
          }
        } catch (err) {
          if (err instanceof Error && err.message.includes('Missing or insufficient permissions')) {
            handleFirestoreError(err, OperationType.GET, userDocPath);
          }
        }
      } else {
        setIsFirebaseAuthenticated(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const persistUserToFirestore = async (
    uid: string,
    profileData: {
      firstName: string;
      lastName: string;
      nickname: string;
      email: string;
      avatarUrl: string;
      bio: string;
      topFoods: [string, string, string];
      badge: string;
      authProvider: string;
      spotsSubmittedCount: number;
      reviewsCount: number;
    },
    isNew: boolean
  ) => {
    const safeFirst = (profileData.firstName || 'Μέλος').trim().slice(0, 80);
    const safeLast = (profileData.lastName || 'Αείφαρον').trim().slice(0, 80);
    const safeNick = (profileData.nickname || 'Food Lover').trim().slice(0, 80);
    const safeAvatar = (profileData.avatarUrl || DEMO_USERS[0].avatarUrl).trim().slice(0, 200000);
    const safeBio = (profileData.bio || 'Λάτρης του καλού φαγητού στην Αειφαριώτικη παρέα!').trim().slice(0, 1000);
    const safeFoods: [string, string, string] = [
      (profileData.topFoods[0] || 'Αυθεντικό σουβλάκι').trim().slice(0, 120),
      (profileData.topFoods[1] || 'Χωριάτικη πίτα').trim().slice(0, 120),
      (profileData.topFoods[2] || 'Gelato φιστίκι').trim().slice(0, 120)
    ];
    const safeBadge = (profileData.badge || 'ΕΝΕΡΓΟΠΟΙΗΘΗΚΑ ΠΑΙΔΙΑ').trim().slice(0, 80);
    const safeProvider = (profileData.authProvider || 'email').trim().slice(0, 40);
    const safeEmail = (profileData.email || 'member@aeifaron.gr').trim().slice(0, 254);

    const userRef = doc(db, 'users', uid);
    const privateRef = doc(db, 'users', uid, 'private', 'info');

    try {
      const existingSnap = await getDoc(userRef);
      const batch = writeBatch(db);

      if (!existingSnap.exists() || isNew) {
        batch.set(userRef, {
          uid,
          firstName: safeFirst,
          lastName: safeLast,
          nickname: safeNick,
          avatarUrl: safeAvatar,
          bio: safeBio,
          topFoods: safeFoods,
          badge: safeBadge,
          authProvider: safeProvider,
          spotsSubmittedCount: Math.max(0, Math.floor(profileData.spotsSubmittedCount || 1)),
          reviewsCount: Math.max(0, Math.floor(profileData.reviewsCount || 0)),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        batch.set(privateRef, {
          uid,
          email: safeEmail,
          authProvider: safeProvider,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        const existingData = existingSnap.data();
        batch.set(userRef, {
          uid,
          firstName: safeFirst,
          lastName: safeLast,
          nickname: safeNick,
          avatarUrl: safeAvatar,
          bio: safeBio,
          topFoods: safeFoods,
          badge: safeBadge,
          authProvider: existingData.authProvider || safeProvider,
          spotsSubmittedCount: Math.max(0, Math.floor(profileData.spotsSubmittedCount ?? existingData.spotsSubmittedCount ?? 1)),
          reviewsCount: Math.max(0, Math.floor(profileData.reviewsCount ?? existingData.reviewsCount ?? 0)),
          createdAt: existingData.createdAt,
          updatedAt: serverTimestamp()
        });
      }

      await batch.commit();
    } catch (err) {
      if (err instanceof Error && err.message.includes('Missing or insufficient permissions')) {
        handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `users/${uid}`);
      }
      throw err;
    }
  };

  const updateCurrentUserProfile = (updated: Partial<UserProfile>) => {
    const newUser = { ...currentUser, ...updated };
    setCurrentUser(newUser);
    setAllUsers((prev) => prev.map((u) => (u.id === newUser.id ? newUser : u)));

    if (auth.currentUser && auth.currentUser.uid === newUser.id) {
      persistUserToFirestore(
        auth.currentUser.uid,
        {
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          nickname: newUser.nickname || 'Food Lover',
          email: newUser.email || auth.currentUser.email || 'member@aeifaron.gr',
          avatarUrl: newUser.avatarUrl,
          bio: newUser.bio,
          topFoods: newUser.topFoods && newUser.topFoods.length === 3
            ? newUser.topFoods
            : ['Αγαπημένο Πιάτο #1', 'Αγαπημένο Πιάτο #2', 'Αγαπημένο Πιάτο #3'],
          badge: newUser.badge,
          authProvider: 'email',
          spotsSubmittedCount: newUser.spotsSubmittedCount || 1,
          reviewsCount: newUser.reviewsCount || 0
        },
        false
      ).catch(() => {});
    }

    fetch(`/api/users/${newUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    }).catch(() => {});
    showToast(language === 'el' ? 'Το προφίλ ενημερώθηκε επιτυχώς!' : 'Profile updated successfully!', 'success');
  };

  const registerNewMember = async (data: {
    firstName: string;
    lastName: string;
    nickname: string;
    email: string;
    password?: string;
    authProvider?: 'email' | 'google' | 'facebook' | 'instagram';
    avatarUrl: string;
    bio: string;
    topFoods: [string, string, string];
  }): Promise<boolean> => {
    try {
      let firebaseUid = auth.currentUser?.uid || null;
      const providerUsed = data.authProvider || 'email';

      // If registering with email & password, create real Firebase Auth account
      if (providerUsed === 'email' && data.password) {
        if (data.password.length < 6) {
          showToast('Ο κωδικός πρόσβασης πρέπει να έχει τουλάχιστον 6 χαρακτήρες.', 'error');
          return false;
        }
        try {
          const userCred = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
          firebaseUid = userCred.user.uid;
          await updateProfile(userCred.user, {
            displayName: `${data.firstName.trim()} ${data.lastName.trim()}`,
            photoURL: data.avatarUrl.startsWith('http') ? data.avatarUrl : undefined
          });
        } catch (fbErr: any) {
          if (fbErr?.code === 'auth/email-already-in-use') {
            showToast('Αυτό το email χρησιμοποιείται ήδη! Δοκιμάστε Σύνδεση Μέλους.', 'error');
            return false;
          } else if (fbErr?.code === 'auth/operation-not-allowed') {
            // Guide admin/user if Email/Password provider isn't enabled yet in Firebase Console while still completing registration
            showToast(
              'Σημείωση: Ενεργοποιήστε το Email/Password στο Firebase Console > Authentication > Sign-in method. Το προφίλ σας καταχωρήθηκε!',
              'info'
            );
          } else if (fbErr?.code === 'auth/invalid-email') {
            showToast('Παρακαλώ εισάγετε ένα έγκυρο email.', 'error');
            return false;
          } else {
            showToast(fbErr?.message || 'Σφάλμα αυθεντικοποίησης Firebase.', 'error');
            return false;
          }
        }
      }

      // Save to Firestore if authenticated with Firebase
      if (firebaseUid && auth.currentUser) {
        await persistUserToFirestore(
          firebaseUid,
          {
            firstName: data.firstName,
            lastName: data.lastName,
            nickname: data.nickname,
            email: data.email,
            avatarUrl: data.avatarUrl,
            bio: data.bio,
            topFoods: data.topFoods,
            badge: 'ΕΝΕΡΓΟΠΟΙΗΘΗΚΑ ΠΑΙΔΙΑ',
            authProvider: providerUsed,
            spotsSubmittedCount: 1,
            reviewsCount: 0
          },
          true
        );
      }

      // Also sync with backend live session state so all connected clients see the new member immediately
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          id: firebaseUid || undefined
        })
      });
      const json = await res.json();
      if (!res.ok) {
        showToast(json.error || 'Σφάλμα κατά την εγγραφή μέλους.', 'error');
        return false;
      }
      if (json.user) {
        const syncedUser = firebaseUid ? { ...json.user, id: firebaseUid } : json.user;
        setCurrentUser(syncedUser);
      }
      if (Array.isArray(json.users)) {
        setAllUsers(json.users);
      }
      if (json.publicChat) {
        setPublicChat(json.publicChat);
      }
      showToast(`Καλωσήρθατε στην παρέα, ${data.firstName}! Η εγγραφή σας ολοκληρώθηκε! 🎉`, 'success');
      return true;
    } catch (e) {
      showToast('Σφάλμα σύνδεσης κατά την εγγραφή.', 'error');
      return false;
    }
  };

  const loginWithEmailPassword = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = cred.user;
      const snap = await getDoc(doc(db, 'users', fbUser.uid));
      if (snap.exists()) {
        const d = snap.data();
        const profile: UserProfile = {
          id: fbUser.uid,
          firstName: d.firstName || 'Μέλος',
          lastName: d.lastName || 'Αείφαρον',
          nickname: d.nickname || 'Food Lover',
          email: fbUser.email || email.trim(),
          avatarUrl: d.avatarUrl || DEMO_USERS[0].avatarUrl,
          bio: d.bio || 'Μέλος της Αειφαριώτικης οικογένειας.',
          topFoods: Array.isArray(d.topFoods) && d.topFoods.length === 3
            ? [d.topFoods[0], d.topFoods[1], d.topFoods[2]]
            : ['Σουβλάκι στα κάρβουνα', 'Παραδοσιακή πίτα', 'Gelato Φιστίκι'],
          badge: (d.badge as any) || 'ΕΝΕΡΓΟΠΟΙΗΘΗΚΑ ΠΑΙΔΙΑ',
          role: 'member',
          favoriteRegions: ['Athens & Attica'],
          spotsSubmittedCount: d.spotsSubmittedCount || 1,
          reviewsCount: d.reviewsCount || 0,
          joinedAt: new Date().toISOString().split('T')[0],
          points: (d.spotsSubmittedCount || 1) * 100
        };
        setCurrentUser(profile);
        showToast(`Καλωσήρθατε ξανά, ${profile.firstName}!`, 'success');
      } else {
        showToast('Συνδεθήκατε επιτυχώς!', 'success');
      }
      return { success: true };
    } catch (err: any) {
      if (err instanceof Error && err.message.includes('Missing or insufficient permissions')) {
        handleFirestoreError(err, OperationType.GET, `users/${auth.currentUser?.uid || 'unknown'}`);
      }
      let msg = 'Λάθος email ή κωδικός πρόσβασης.';
      if (err?.code === 'auth/operation-not-allowed') {
        msg = 'Η σύνδεση με Email/Κωδικό χρειάζεται ενεργοποίηση στο Firebase Console (Authentication > Sign-in method).';
      } else if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
        msg = 'Δεν βρέθηκε λογαριασμός με αυτά τα στοιχεία. Κάντε πρώτα Εγγραφή Νέου Μέλους!';
      }
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const signInWithProvider = async (providerName: 'google' | 'facebook' | 'instagram') => {
    try {
      const selectedProvider =
        providerName === 'google'
          ? googleProvider
          : providerName === 'facebook'
          ? facebookProvider
          : instagramProvider;

      const result = await signInWithPopup(auth, selectedProvider);
      const fbUser = result.user;

      // Check if user already has a profile in Firestore
      const snap = await getDoc(doc(db, 'users', fbUser.uid));
      if (snap.exists()) {
        const d = snap.data();
        const profile: UserProfile = {
          id: fbUser.uid,
          firstName: d.firstName || 'Μέλος',
          lastName: d.lastName || 'Αείφαρον',
          nickname: d.nickname || 'Food Lover',
          email: fbUser.email || '',
          avatarUrl: d.avatarUrl || fbUser.photoURL || DEMO_USERS[0].avatarUrl,
          bio: d.bio || 'Μέλος της Αειφαριώτικης οικογένειας.',
          topFoods: Array.isArray(d.topFoods) && d.topFoods.length === 3
            ? [d.topFoods[0], d.topFoods[1], d.topFoods[2]]
            : ['Σουβλάκι στα κάρβουνα', 'Παραδοσιακή πίτα', 'Gelato Φιστίκι'],
          badge: (d.badge as any) || 'ΕΝΕΡΓΟΠΟΙΗΘΗΚΑ ΠΑΙΔΙΑ',
          role: 'member',
          favoriteRegions: ['Athens & Attica'],
          spotsSubmittedCount: d.spotsSubmittedCount || 1,
          reviewsCount: d.reviewsCount || 0,
          joinedAt: new Date().toISOString().split('T')[0],
          points: (d.spotsSubmittedCount || 1) * 100
        };
        setCurrentUser(profile);
        showToast(`Συνδεθήκατε επιτυχώς μέσω ${providerName.toUpperCase()}, ${profile.firstName}!`, 'success');
        return { success: true, needsProfileCompletion: false };
      }

      // New user via OAuth: prefill their registration profile fields so they can complete their Aeifaron profile
      const displayParts = (fbUser.displayName || '').trim().split(' ');
      const firstName = displayParts[0] || '';
      const lastName = displayParts.slice(1).join(' ') || '';

      showToast(
        `Επιτυχής ταυτοποίηση με ${providerName.toUpperCase()}! Συμπληρώστε τα 3 αγαπημένα σας φαγητά για να ολοκληρωθεί το προφίλ σας.`,
        'info'
      );

      return {
        success: true,
        needsProfileCompletion: true,
        prefill: {
          firstName,
          lastName,
          email: fbUser.email || '',
          avatarUrl: fbUser.photoURL || DEMO_USERS[1].avatarUrl,
          authProvider: providerName
        }
      };
    } catch (err: any) {
      if (err instanceof Error && err.message.includes('Missing or insufficient permissions')) {
        handleFirestoreError(err, OperationType.GET, `users/${auth.currentUser?.uid || 'unknown'}`);
      }
      let errorMsg = `Σφάλμα σύνδεσης με ${providerName.toUpperCase()}.`;
      if (err?.code === 'auth/operation-not-allowed') {
        errorMsg = `Ο πάροχος ${providerName.toUpperCase()} χρειάζεται ενεργοποίηση στο Firebase Console (Authentication > Sign-in method).`;
      } else if (err?.code === 'auth/popup-closed-by-user') {
        errorMsg = 'Το παράθυρο σύνδεσης έκλεισε πριν ολοκληρωθεί η είσοδος.';
      }
      showToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }
  };

  const logoutUser = async () => {
    try {
      await firebaseSignOut(auth);
      setIsFirebaseAuthenticated(false);
      showToast('Αποσυνδεθήκατε από τον λογαριασμό σας.', 'info');
    } catch (e) {}
  };

  const sendDirectMessage = async (receiverId: string, content: string) => {
    if (!content.trim()) return;
    try {
      const res = await fetch('/api/direct-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId,
          content: content.trim()
        })
      });
      if (res.ok) {
        const newDm: DirectMessage = await res.json();
        setDirectMessages((prev) => {
          if (prev.some((m) => m.id === newDm.id)) return prev;
          return [...prev, newDm];
        });
      }
    } catch (e) {
      showToast('Σφάλμα αποστολής προσωπικού μηνύματος.', 'error');
    }
  };

  const sendPublicChatMessage = async (content: string, parentId?: string | null): Promise<{ success: boolean; error?: string }> => {
    const trimmed = content.trim();
    if (!trimmed) return { success: false, error: 'Το μήνυμα είναι κενό.' };
    if (trimmed.length > 200) {
      return { success: false, error: 'Το μήνυμα δεν μπορεί να ξεπερνά τους 200 χαρακτήρες.' };
    }

    try {
      const res = await fetch('/api/public-chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          content: trimmed,
          parentId: parentId || null
        })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Σφάλμα αποστολής μηνύματος.', 'error');
        return { success: false, error: data.error };
      }
      setPublicChat(data);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const addProfileComment = (targetUserId: string, content: string) => {
    if (!content.trim()) return;
    const newComment: ProfileComment = {
      id: `pcomm-${Date.now()}`,
      targetUserId,
      authorId: currentUser.id,
      authorName: `${currentUser.firstName} ${currentUser.lastName}`,
      authorAvatar: currentUser.avatarUrl,
      authorBadge: getGamificationBadge(currentUser.spotsSubmittedCount || 1),
      content: content.trim(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProfileComments((prev) => [newComment, ...prev]);
    showToast('Το σχόλιό σας προστέθηκε στο προφίλ του μέλους!', 'success');
  };

  const moderateCommentText = async (content: string, spotTitle: string, category: string): Promise<ModerationResult> => {
    try {
      const res = await fetch('/api/moderate-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, spotTitle, category })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
    return {
      approved: true,
      reason: 'Review approved.',
      reasonEl: 'Το σχόλιο εγκρίθηκε.'
    };
  };

  const addReview = async (
    spotId: string, 
    content: string, 
    rating: number, 
    signatureOrdered?: string
  ): Promise<{ success: boolean; review?: Review; moderation?: ModerationResult; error?: string }> => {
    try {
      const res = await fetch(`/api/spots/${spotId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spotId,
          content,
          rating,
          signatureOrdered,
          authorId: currentUser.id
        })
      });

      const data = await res.json();

      if (!res.ok) {
        return { 
          success: false, 
          error: data.error || (language === 'el' ? 'Σφάλμα ελέγχου κριτικής' : 'Review moderation check failed'),
          moderation: data.moderation
        };
      }

      const newRev = data.review;
      setReviews((prev) => [newRev, ...prev]);

      setSpots((prev) => prev.map((s) => {
        if (s.id === spotId) {
          return {
            ...s,
            rating: data.spotUpdatedRating || s.rating,
            reviewsCount: s.reviewsCount + 1
          };
        }
        return s;
      }));

      if (selectedSpot && selectedSpot.id === spotId) {
        setSelectedSpot((prev) => prev ? {
          ...prev,
          rating: data.spotUpdatedRating || prev.rating,
          reviewsCount: prev.reviewsCount + 1
        } : null);
      }

      showToast(
        language === 'el' 
          ? 'Η κριτική σας εγκρίθηκε από το AI και δημοσιεύτηκε!' 
          : 'Your review was approved by AI and published!',
        'success'
      );

      return { success: true, review: newRev, moderation: data.moderation };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const addReply = async (reviewId: string, content: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          authorId: currentUser.id
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to post reply' };
      }

      setReviews((prev) => prev.map((r) => {
        if (r.id === reviewId) {
          return {
            ...r,
            replies: [...(r.replies || []), data]
          };
        }
        return r;
      }));

      showToast(language === 'el' ? 'Η απάντηση προστέθηκε' : 'Reply posted', 'success');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const createHitSpot = async (spotData: Partial<HitSpot>): Promise<{ success: boolean; spot?: HitSpot; error?: string }> => {
    try {
      const res = await fetch('/api/spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...spotData,
          authorId: currentUser.id
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to create spot' };
      }

      setSpots((prev) => {
        if (prev.some((s) => s.id === data.id)) return prev;
        return [data, ...prev];
      });
      
      const updatedSpotsCount = (currentUser.spotsSubmittedCount || 0) + 1;
      const earnedBadge = getGamificationBadge(updatedSpotsCount);
      const updatedUser: UserProfile = {
        ...currentUser,
        spotsSubmittedCount: updatedSpotsCount,
        badge: earnedBadge
      };
      setCurrentUser(updatedUser);
      setAllUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));

      setIsCreateModalOpen(false);
      setSelectedSpot(data);

      showToast(
        language === 'el' 
          ? `Το νέο Food Spot προστέθηκε! Κερδίσατε +100 XP (Επίπεδο: ${earnedBadge})!` 
          : `New Food Spot added! You earned +100 XP (Title: ${earnedBadge})!`,
        'success'
      );

      return { success: true, spot: data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const toggleFavoriteSpot = (spotId: string) => {
    const spot = spots.find((s) => s.id === spotId);
    const spotTitle = spot ? (spot.titleEl || spot.title) : 'Spot';
    setFavoriteSpotIds((prev) => {
      const isFav = prev.includes(spotId);
      const next = isFav ? prev.filter((id) => id !== spotId) : [...prev, spotId];
      try {
        localStorage.setItem('hitspots_favorites', JSON.stringify(next));
      } catch {}
      showToast(
        isFav
          ? `Το «${spotTitle}» αφαιρέθηκε από τα Αγαπημένα σας Spots.`
          : `Το «${spotTitle}» προστέθηκε στα Αγαπημένα σας! Θα λαμβάνετε ειδοποιήσεις όταν ενημερώνεται. ❤️`,
        isFav ? 'info' : 'success'
      );
      return next;
    });
  };

  const updateHitSpot = async (
    spotId: string,
    updates: Partial<HitSpot> & { updateSummary?: string }
  ): Promise<{ success: boolean; spot?: HitSpot; error?: string }> => {
    try {
      const res = await fetch(`/api/spots/${spotId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          updatedByUserId: currentUser.id
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update spot' };
      }

      const updatedSpot: HitSpot = data.spot || data;
      setSpots((prev) => prev.map((s) => (s.id === spotId ? updatedSpot : s)));
      if (selectedSpot && selectedSpot.id === spotId) {
        setSelectedSpot(updatedSpot);
      }
      if (data.notification) {
        setNotifications((prev) => {
          if (prev.some((n) => n.id === data.notification.id)) return prev;
          return [data.notification, ...prev];
        });
      }

      showToast('Το Spot ενημερώθηκε και στάλθηκε ειδοποίηση στα μέλη που το έχουν στα Αγαπημένα τους! 🔔', 'success');
      return { success: true, spot: updatedSpot };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Filter notifications relevant to currentUser:
  // 1) Comments or replies on spots shared by currentUser (or targeted to currentUser)
  // 2) Updates or comments on spots in currentUser's favoriteSpotIds
  const relevantNotifications = notifications.filter((n) => {
    const isMySharedSpot = spots.some((s) => s.id === n.spotId && s.authorId === currentUser.id);
    const isMyFavoriteSpot = favoriteSpotIds.includes(n.spotId);
    const isTargetedToMe = n.targetUserId === currentUser.id;
    const isGlobalFavoriteUpdate = n.type === 'favorite_spot_updated' && (isMyFavoriteSpot || n.targetUserId === 'ALL');
    return isTargetedToMe || isMySharedSpot || isMyFavoriteSpot || isGlobalFavoriteUpdate;
  });

  const unreadNotificationsCount = relevantNotifications.filter((n) => !n.read).length;

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
    fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId, userId: currentUser.id })
    }).catch(() => {});
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true, userId: currentUser.id })
    }).catch(() => {});
  };

  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        toggleTheme,
        t,
        currentUser,
        setCurrentUser,
        allUsers,
        isFirebaseAuthenticated,
        updateCurrentUserProfile,
        registerNewMember,
        loginWithEmailPassword,
        signInWithProvider,
        logoutUser,
        selectedMemberProfile,
        setSelectedMemberProfile,
        profileComments,
        addProfileComment,
        directMessages,
        activeDirectChatUser,
        setActiveDirectChatUser,
        sendDirectMessage,
        publicChat,
        sendPublicChatMessage,
        spots,
        reviews,
        activeView,
        setActiveView,
        selectedSpot,
        setSelectedSpot,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isAiSearchModalOpen,
        setIsAiSearchModalOpen,
        lightboxUrl,
        setLightboxUrl,
        searchQuery,
        setSearchQuery,
        selectedMacroGroup,
        setSelectedMacroGroup,
        selectedCategory,
        setSelectedCategory,
        selectedRegion,
        setSelectedRegion,
        sortBy,
        setSortBy,
        secretGemsOnly,
        setSecretGemsOnly,
        createHitSpot,
        updateHitSpot,
        addReview,
        addReply,
        moderateCommentText,
        favoriteSpotIds,
        toggleFavoriteSpot,
        notifications: relevantNotifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
