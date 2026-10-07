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
  getGamificationBadge
} from '../types';
import { translations, Translations } from '../i18n/translations';
import { INITIAL_HIT_SPOTS, INITIAL_REVIEWS, DEMO_USERS } from '../data/mockData';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: Translations;
  
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  allUsers: UserProfile[];
  updateCurrentUserProfile: (updated: Partial<UserProfile>) => void;
  registerNewMember: (data: {
    firstName: string;
    lastName: string;
    nickname: string;
    email: string;
    avatarUrl: string;
    bio: string;
    topFoods: [string, string, string];
  }) => Promise<boolean>;
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
  addReview: (spotId: string, content: string, rating: number, signatureOrdered?: string) => Promise<{ success: boolean; review?: Review; moderation?: ModerationResult; error?: string }>;
  addReply: (reviewId: string, content: string) => Promise<{ success: boolean; error?: string }>;
  moderateCommentText: (content: string, spotTitle: string, category: string) => Promise<ModerationResult>;
  
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
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<UserProfile | null>(null);
  
  const [spots, setSpots] = useState<HitSpot[]>(INITIAL_HIT_SPOTS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  
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
      authorBadge: 'ΕΙΜΑΙ ΑΠΟΛΑΥΣΗ • food expert',
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
        avatarUrl: DEMO_USERS[0].avatarUrl,
        content: 'Καλησπέρα σε όλη την Αειφαριώτικη οικογένεια! Ποιο είναι το αγαπημένο σας spot για σήμερα;',
        parentId: null,
        depth: 0,
        createdAt: '19:30'
      },
      {
        id: 'pub-2',
        userId: 'user-2',
        firstName: 'Έλενα',
        avatarUrl: DEMO_USERS[1].avatarUrl,
        content: 'Καλησπέρα Κώστα! Μόλις δοκίμασα το φιστίκι Αιγίνης στο Σύνταγμα, απλά όνειρο!',
        parentId: 'pub-1',
        depth: 1,
        createdAt: '19:32'
      },
      {
        id: 'pub-3',
        userId: 'user-3',
        firstName: 'Μανώλης',
        avatarUrl: DEMO_USERS[2].avatarUrl,
        content: 'Συμφωνώ απόλυτα Έλενα! Και το καϊμάκι με σαλέπι εκεί δεν παίζεται!',
        parentId: 'pub-2',
        depth: 2,
        createdAt: '19:35'
      },
      {
        id: 'pub-4',
        userId: 'user-5',
        firstName: 'Σοφία',
        avatarUrl: DEMO_USERS[4].avatarUrl,
        content: 'Χαιρετίσματα από τα Ζαγοροχώρια! Η χειροποίητη αλευρόπιτα σήμερα βγήκε τραγανή από τον ξυλόφουρνο!',
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

    return () => {
      evtSource.close();
    };
  }, []);

  const updateCurrentUserProfile = (updated: Partial<UserProfile>) => {
    const newUser = { ...currentUser, ...updated };
    setCurrentUser(newUser);
    setAllUsers((prev) => prev.map((u) => (u.id === newUser.id ? newUser : u)));
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
    avatarUrl: string;
    bio: string;
    topFoods: [string, string, string];
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) {
        showToast(json.error || 'Σφάλμα κατά την εγγραφή μέλους.', 'error');
        return false;
      }
      if (json.user) {
        setCurrentUser(json.user);
      }
      if (Array.isArray(json.users)) {
        setAllUsers(json.users);
      }
      if (json.publicChat) {
        setPublicChat(json.publicChat);
      }
      showToast(`Καλωσήρθατε στην παρέα, ${data.firstName}! Το προφίλ σας δημιουργήθηκε! 🎉`, 'success');
      return true;
    } catch (e) {
      showToast('Σφάλμα σύνδεσης κατά την εγγραφή.', 'error');
      return false;
    }
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
        updateCurrentUserProfile,
        registerNewMember,
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
        addReview,
        addReply,
        moderateCommentText,
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
