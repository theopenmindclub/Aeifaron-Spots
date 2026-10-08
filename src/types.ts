export type UserBadge = 
  | 'Αρχάριο Μέλος'
  | 'ΠΑΜΕ ΠΑΙΔΙΑ'
  | 'ΕΝΕΡΓΟΠΟΙΗΘΗΚΑ ΠΑΙΔΙΑ'
  | 'ΕΝΕΡΓΟ ΜΕΛΟΣ'
  | 'ΜΕΡΑΚΛΗΣ/ΜΕΡΑΚΛΙΝΑ'
  | 'ΚΑΛΟΦΑΓΑΣ/ΟΥ'
  | 'ΕΙΜΑΙ ΑΠΟΛΑΥΣΗ'
  | 'ΑΠΟΛΑΥΣΤΙΚΗ ΖΩΗ'
  | 'ΦΙΛΟΣ ΚΙ ΑΔΕΡΦΟΣ/Η'
  | 'ΤΟ ΚΑΛΥΤΕΡΟ ΠΑΙΔΙ'
  | 'ΜΑΣΤΕΡ'
  | 'ΜΑΣΤΕΡΜΑΙΝΤ'
  | 'Food Scout' 
  | 'Culinary Expert'
  | 'Taste Master' 
  | 'Culinary Critic' 
  | 'Executive Chef' 
  | 'Artisan Hunter'
  | 'Local Legend';

export interface GamificationLevelInfo {
  level: number;
  badge: UserBadge;
  titleEl: string;
  titleEn: string;
  xp: number;
  nextLevelXp: number;
  minSpots: number;
  icon: string;
}

export function getGamificationBadge(spotsCount: number): UserBadge {
  if (spotsCount >= 6) return 'ΜΑΣΤΕΡΜΑΙΝΤ';
  if (spotsCount === 5) return 'ΜΑΣΤΕΡ';
  if (spotsCount === 4) return 'ΦΙΛΟΣ ΚΙ ΑΔΕΡΦΟΣ/Η';
  if (spotsCount === 3) return 'ΚΑΛΟΦΑΓΑΣ/ΟΥ';
  if (spotsCount === 2) return 'ΜΕΡΑΚΛΗΣ/ΜΕΡΑΚΛΙΝΑ';
  if (spotsCount === 1) return 'ΠΑΜΕ ΠΑΙΔΙΑ';
  return 'Αρχάριο Μέλος';
}

export function getGamificationInfo(spotsCount: number, reviewsCount: number = 0): GamificationLevelInfo {
  const xp = spotsCount * 100 + reviewsCount * 20;
  if (spotsCount >= 6) {
    return {
      level: 6,
      badge: 'ΜΑΣΤΕΡΜΑΙΝΤ',
      titleEl: 'ΜΑΣΤΕΡΜΑΙΝΤ • A Living Myth',
      titleEn: 'MASTERMIND • A Living Myth',
      xp,
      nextLevelXp: Math.max(xp + 100, 700),
      minSpots: 6,
      icon: '💎'
    };
  }
  if (spotsCount === 5) {
    return {
      level: 5,
      badge: 'ΜΑΣΤΕΡ',
      titleEl: 'ΜΑΣΤΕΡ • Food Legend',
      titleEn: 'MASTER • Food Legend',
      xp,
      nextLevelXp: 600,
      minSpots: 5,
      icon: '👑'
    };
  }
  if (spotsCount === 4) {
    return {
      level: 4,
      badge: 'ΦΙΛΟΣ ΚΙ ΑΔΕΡΦΟΣ/Η',
      titleEl: 'ΦΙΛΟΣ ΚΙ ΑΔΕΡΦΟΣ/Η • Michelin Level',
      titleEn: 'FRIEND & SIBLING • Michelin Level',
      xp,
      nextLevelXp: 500,
      minSpots: 4,
      icon: '⭐'
    };
  }
  if (spotsCount === 3) {
    return {
      level: 3,
      badge: 'ΚΑΛΟΦΑΓΑΣ/ΟΥ',
      titleEl: 'ΚΑΛΟΦΑΓΑΣ/ΟΥ • Food Expert',
      titleEn: 'ΚΑΛΟΦΑΓΑΣ/ΟΥ • Food Expert',
      xp,
      nextLevelXp: 400,
      minSpots: 3,
      icon: '🥇'
    };
  }
  if (spotsCount === 2) {
    return {
      level: 2,
      badge: 'ΜΕΡΑΚΛΗΣ/ΜΕΡΑΚΛΙΝΑ',
      titleEl: 'ΜΕΡΑΚΛΗΣ / ΜΕΡΑΚΛΙΝΑ • Food Lover',
      titleEn: 'ΜΕΡΑΚΛΗΣ / ΜΕΡΑΚΛΙΝΑ • Food Lover',
      xp,
      nextLevelXp: 300,
      minSpots: 2,
      icon: '🥈'
    };
  }
  if (spotsCount === 1) {
    return {
      level: 1,
      badge: 'ΠΑΜΕ ΠΑΙΔΙΑ',
      titleEl: 'ΠΑΜΕ ΠΑΙΔΙΑ • First Lover',
      titleEn: 'ΠΑΜΕ ΠΑΙΔΙΑ • First Lover',
      xp,
      nextLevelXp: 200,
      minSpots: 1,
      icon: '🥉'
    };
  }
  return {
    level: 0,
    badge: 'Αρχάριο Μέλος',
    titleEl: 'Αρχάριο Μέλος',
    titleEn: 'Newcomer',
    xp,
    nextLevelXp: 100,
    minSpots: 0,
    icon: '🌱'
  };
}

export type PriceRange = 
  | '5-10€'
  | '10-15€'
  | '15-20€'
  | '20-25€ και πάνω';

export type SearchMacroGroup = 
  | 'ALL'
  | 'ΠΡΩΙΝΑ/BRUNCH'
  | 'ΦΑΓΗΤΟ/FOOD'
  | 'ΓΛΥΚΑ/DESERTS'
  | 'ΦΟΥΡΝΟΙ/PIES'
  | 'ΚΑΦΕΣ/COFFEE';

export type UserRole = 'admin' | 'scout' | 'member';

export interface ProfileComment {
  id: string;
  targetUserId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorBadge: string;
  content: string;
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

export interface PublicChatMessage {
  id: string;
  userId: string;
  firstName: string;
  lastName?: string;
  avatarUrl: string;
  title?: string;
  content: string;
  categoryTag?: string;
  pinned?: boolean;
  likesCount?: number;
  thumbnailUrl?: string;
  parentId?: string | null;
  depth?: number; // 0 = root post, 1 = reply, 2 = 3rd level nested reply
  createdAt: string;
}

export interface PublicChatState {
  messages: PublicChatMessage[];
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  email: string;
  avatarUrl: string;
  bio: string;
  topFoods?: [string, string, string];
  badge: UserBadge;
  role: UserRole;
  favoriteRegions: string[];
  spotsSubmittedCount: number;
  reviewsCount: number;
  joinedAt: string;
  points?: number;
}

export type SpotCategory = 
  | 'Παραλίες'
  | 'Τοποθεσίες'
  | 'Εκδρομές'
  | 'Μηχανάδες'
  | 'Gelato' 
  | 'Traditional Bakery' 
  | 'Seafood & Psarotaverna' 
  | 'Authentic Souvlaki' 
  | 'Modern Greek' 
  | 'Mezedopoleio' 
  | 'Bougatsa & Pastry' 
  | 'Artisan Coffee & Brunch' 
  | 'Hidden Mountain Taverna'
  | 'Street Food Hit';

export type GreekRegion = 
  | 'Athens & Attica' 
  | 'Thessaloniki & North' 
  | 'Chania & West Crete' 
  | 'Heraklion & East Crete' 
  | 'Cyclades (Naxos/Santorini/Paros)' 
  | 'Ionian Islands (Corfu/Lefkada)' 
  | 'Peloponnese (Mani/Nafplio)' 
  | 'Dodecanese (Rhodes/Kos)' 
  | 'Epirus & Zagori';

export type AppNotificationType =
  | 'comment_on_shared_spot'
  | 'favorite_spot_updated'
  | 'reply_on_comment';

export interface AppNotification {
  id: string;
  targetUserId: string;
  type: AppNotificationType;
  spotId: string;
  spotTitle: string;
  spotCategory?: SpotCategory;
  actorId: string;
  actorName: string;
  actorAvatar: string;
  messageEl: string;
  messageEn: string;
  snippet?: string;
  read: boolean;
  createdAt: string;
}

export interface HitSpot {
  id: string;
  authorId: string;
  author: UserProfile;
  title: string;
  titleEl?: string;
  category: SpotCategory;
  region: GreekRegion;
  address: string;
  googleMapsUrl: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  whyIsItSpecial: string;
  whyIsItSpecialEl?: string;
  signatureDishes: string[];
  signatureDishesEl?: string[];
  priceLevel: string;
  coverImageUrl: string;
  galleryUrls: string[];
  youtubeVideoUrls?: string[];
  rating: number;
  reviewsCount: number;
  helpfulVotes?: number;
  createdAt: string;
  tags: string[];
  insiderTips?: string;
  verifiedSpot: boolean;
}

export interface CommentReply {
  id: string;
  reviewId: string;
  author: UserProfile;
  content: string;
  createdAt: string;
  isApproved: boolean;
}

export interface Review {
  id: string;
  spotId: string;
  author: UserProfile;
  rating: number;
  content: string;
  visitDate?: string;
  signatureOrdered?: string;
  isApproved: boolean;
  moderationReason?: string;
  likesCount: number;
  createdAt: string;
  replies: CommentReply[];
}

export type Language = 'el' | 'en';
export type Theme = 'light' | 'dark';

export interface ModerationResult {
  approved: boolean;
  reason: string;
  reasonEl: string;
  confidenceScore?: number;
  culinaryKeywordsDetected?: string[];
}
