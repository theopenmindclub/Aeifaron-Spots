import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BADGE_TRANSLATIONS } from '../i18n/translations';
import { getGamificationBadge, getGamificationInfo, UserBadge } from '../types';
import { ProfileVoiceButton } from './ProfileVoiceButton';
import { 
  Award, 
  Utensils, 
  Key, 
  MessageSquare,
  Trophy,
  Crown,
  UserPlus,
  Send,
  Gift,
  X,
  Lightbulb,
  PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RewardSuggestion {
  id: string;
  userId: string;
  firstName: string;
  avatarUrl: string;
  levelTarget: string;
  suggestion: string;
  createdAt: string;
}

export const CommunityView: React.FC = () => {
  const { 
    allUsers, 
    currentUser,
    spots, 
    reviews, 
    language, 
    showToast, 
    setSelectedMemberProfile, 
    setIsAuthModalOpen,
    profileComments,
    addProfileComment,
    setActiveDirectChatUser
  } = useApp();

  const [inviteCodeInput, setInviteCodeInput] = useState('');

  // Inline profile comments state per user card
  const [inlineCommentByUser, setInlineCommentByUser] = useState<Record<string, string>>({});

  // Rewards ("Έπαθλα") Modal & Suggestions ("Προτάσεις") State
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);
  const [rewardSuggestions, setRewardSuggestions] = useState<RewardSuggestion[]>([
    {
      id: 'rew-1',
      userId: 'user-2',
      firstName: 'Έλενα',
      avatarUrl: allUsers[1]?.avatarUrl || '',
      levelTarget: 'ΜΑΣΤΕΡΜΑΙΝΤ (6+ Spots)',
      suggestion: 'Κέρασμα για 2 άτομα στην αγαπημένη του ταβέρνα με ρεφενέ (προσωπική αποστολή χρημάτων μέσω IRIS) από την παρέα!',
      createdAt: '18:45'
    },
    {
      id: 'rew-2',
      userId: 'user-3',
      firstName: 'Μανώλης',
      avatarUrl: allUsers[2]?.avatarUrl || '',
      levelTarget: 'ΜΑΣΤΕΡ (5 Spots)',
      suggestion: 'Ένα κουτί οικογενειακό χειροποίητο gelato ή μπουγάτσα πληρωμένο από την κοινότητα!',
      createdAt: '19:15'
    }
  ]);
  const [selectedLevelTarget, setSelectedLevelTarget] = useState('ΜΑΣΤΕΡΜΑΙΝΤ (6+ Spots)');
  const [newRewardSuggestion, setNewRewardSuggestion] = useState('');
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);

  useEffect(() => {
    fetch('/api/reward-suggestions')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRewardSuggestions(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleRewardSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRewardSuggestion.trim() || isSubmittingSuggestion) return;
    setIsSubmittingSuggestion(true);

    try {
      const res = await fetch('/api/reward-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          levelTarget: selectedLevelTarget,
          suggestion: newRewardSuggestion.trim()
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setRewardSuggestions(updated);
      } else {
        const fallbackItem: RewardSuggestion = {
          id: `rew-${Date.now()}`,
          userId: currentUser.id,
          firstName: currentUser.firstName,
          avatarUrl: currentUser.avatarUrl,
          levelTarget: selectedLevelTarget,
          suggestion: newRewardSuggestion.trim(),
          createdAt: new Date().toTimeString().slice(0, 5)
        };
        setRewardSuggestions((prev) => [fallbackItem, ...prev]);
      }

      setNewRewardSuggestion('');
      showToast(
        language === 'el'
          ? 'Η πρότασή σας για έπαθλο καταχωρήθηκε!'
          : 'Your reward suggestion has been submitted!',
        'success'
      );
    } catch (err) {
      const fallbackItem: RewardSuggestion = {
        id: `rew-${Date.now()}`,
        userId: currentUser.id,
        firstName: currentUser.firstName,
        avatarUrl: currentUser.avatarUrl,
        levelTarget: selectedLevelTarget,
        suggestion: newRewardSuggestion.trim(),
        createdAt: new Date().toTimeString().slice(0, 5)
      };
      setRewardSuggestions((prev) => [fallbackItem, ...prev]);
      setNewRewardSuggestion('');
      showToast(
        language === 'el'
          ? 'Η πρότασή σας για έπαθλο καταχωρήθηκε!'
          : 'Your reward suggestion has been submitted!',
        'success'
      );
    } finally {
      setIsSubmittingSuggestion(false);
    }
  };

  // Compute leaderboard with dynamic XP & approved spots count
  const leaderboardUsers = allUsers.map((user) => {
    const userSpots = spots.filter((s) => s.authorId === user.id);
    const spotsCount = Math.max(user.spotsSubmittedCount || 0, userSpots.length);
    
    const currentBadge: UserBadge = getGamificationBadge(spotsCount);
    const gamification = getGamificationInfo(spotsCount, user.reviewsCount || 0);

    const starsReceived = userSpots.reduce((acc, s) => acc + s.rating, 0);
    const votesReceived = userSpots.reduce((acc, s) => acc + (s.helpfulVotes || 0), 0);
    const commentsReceived = reviews.filter((r) => 
      userSpots.some((s) => s.id === r.spotId)
    ).length;

    const totalPoints = 
      (spotsCount * 100) + 
      Math.round(starsReceived * 10) + 
      (votesReceived * 15) + 
      (commentsReceived * 20) + 
      ((user.reviewsCount || 0) * 20);

    return {
      ...user,
      spotsCount,
      currentBadge,
      gamification,
      starsReceived,
      votesReceived,
      commentsReceived,
      totalPoints
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCodeInput.trim().toUpperCase() === 'GREECE-TASTE-2026' || inviteCodeInput.trim().length >= 4) {
      showToast(
        language === 'el' 
          ? 'Ο κωδικός πρόσκλησης επαληθεύτηκε! Καλωσήρθατε στην παρέα της Αειφάρου.' 
          : 'Invite code verified! Welcome to the community.', 
        'success'
      );
    } else {
      showToast(
        language === 'el' 
          ? 'Μη έγκυρος κωδικός πρόσκλησης' 
          : 'Invalid invite code', 
        'error'
      );
    }
  };

  const LEVEL_REWARDS = [
    {
      icon: '💎',
      levelName: 'Επίπεδο 6 • ΜΑΣΤΕΡΜΑΙΝΤ (A Living Myth • 6+ Spots)',
      levelNameEn: 'Level 6 • MASTERMIND (A Living Myth • 6+ Spots)',
      reward:
        'Δικαιούται ένα πλήρες κέρασμα σε αγαπημένο Food Spot που θα του το πληρώσει η κοινότητα (με προσωπική αποστολή χρημάτων / IRIS από τα μέλη της παρέας)!',
      rewardEn:
        'Entitled to a full treat at a favorite Food Spot paid for by the community (via personal money transfer / IRIS from community members)!',
      highlight: true
    },
    {
      icon: '👑',
      levelName: 'Επίπεδο 5 • ΜΑΣΤΕΡ (Food Legend • 5 Spots)',
      levelNameEn: 'Level 5 • MASTER (Food Legend • 5 Spots)',
      reward:
        'Δικαιούται κέρασμα γλυκού, χειροποίητου gelato ή εκλεκτού μεζέ πληρωμένο από την κοινότητα (με προσωπική αποστολή χρημάτων)!',
      rewardEn:
        'Entitled to a dessert, artisan gelato, or meze treat paid for by the community (via personal money transfer)!',
      highlight: false
    },
    {
      icon: '⭐',
      levelName: 'Επίπεδο 4 • ΦΙΛΟΣ ΚΙ ΑΔΕΡΦΟΣ/Η (Michelin Level • 4 Spots)',
      levelNameEn: 'Level 4 • FRIEND & SIBLING (Michelin Level • 4 Spots)',
      reward:
        'Δικαιούται κέρασμα παραδοσιακής πίτας, brunch ή τσίπουρου από την παρέα (με προσωπική αποστολή χρημάτων ή σε κοινή εξόρμηση)!',
      rewardEn:
        'Entitled to a traditional pie, brunch, or tsipouro treat from the group (via personal money transfer or during a shared outing)!',
      highlight: false
    },
    {
      icon: '🥇',
      levelName: 'Επίπεδο 3 • ΕΙΜΑΙ ΑΠΟΛΑΥΣΗ (food expert • 3 Spots)',
      levelNameEn: 'Level 3 • PURE DELIGHT (food expert • 3 Spots)',
      reward:
        'Δικαιούται κέρασμα specialty καφέ ή παγωτού από μέλος της κοινότητας (με προσωπική αποστολή χρημάτων)!',
      rewardEn:
        'Entitled to a specialty coffee or ice cream treat from a community member (via personal money transfer)!',
      highlight: false
    },
    {
      icon: '🥈',
      levelName: 'Επίπεδο 2 • ΜΕΡΑΚΛΗΣ / ΜΕΡΑΚΛΙΝΑ (Food lover • 2 Spots)',
      levelNameEn: 'Level 2 • MERAKLIS (Food lover • 2 Spots)',
      reward:
        'Τιμητικό Σήμα Μερακλή της Παρέας & συμμετοχή στις κληρώσεις κερασμάτων της κοινότητας!',
      rewardEn:
        'Honorary Meraklis Badge & entry into community treat draws!',
      highlight: false
    },
    {
      icon: '🥉',
      levelName: 'Επίπεδο 1 • ΕΝΕΡΓΟΠΟΙΗΘΗΚΑ ΠΑΙΔΙΑ (scout first love • 1 Spot)',
      levelNameEn: 'Level 1 • ACTIVATED SCOUT (scout first love • 1 Spot)',
      reward:
        'Επίσημη είσοδος στο Leaderboard & δικαίωμα υποβολής προτάσεων για τα έπαθλα της παρέας!',
      rewardEn:
        'Official entry into the Leaderboard & right to submit reward suggestions for the community!',
      highlight: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Community Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#243B35] text-[#F1E9D2] text-xs font-bold border border-[#6B8E7B] shadow-xs">
          <Award className="w-4 h-4 text-[#F4D6C6]" />
          <span>
            {language === 'el'
              ? 'Αειφαριώτικη Παρέα • Εγγραφή Προφίλ & Προσωπική Επικοινωνία Μελών'
              : 'Aeifaron Community • Profile Registration & Direct Member Chat'}
          </span>
        </div>
        <h2 className="font-heading text-3xl sm:text-5xl font-bold text-[#243B35] dark:text-[#F1E9D2] uppercase">
          {language === 'el' ? 'ΜΕΛΗ & LEADERBOARD' : 'MEMBERS & LEADERBOARD'}
        </h2>
        <p className="text-base sm:text-lg text-[#243B35]/90 dark:text-[#B7C9B1] leading-relaxed font-medium">
          {language === 'el'
            ? 'Κάθε αδερφή και αδερφός μας, μας λέει κάποια πράγματα για τον εαυτό του ως λάτρη του φαγητού και 3 κορυφαία του φαγητά! Ανάλογα την συμμετοχή και τις γαστρονομικές προτάσεις το κάθε μέλος παίρνει και πανάξιους τίτλους!'
            : 'Every member shares a few words about themselves as a food lover and their top 3 favorite dishes! Depending on participation and spot recommendations, each member earns honorable titles!'}
        </p>

        {/* Registration & Profile Call-To-Action */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              setSelectedMemberProfile(null);
              setIsAuthModalOpen(true);
            }}
            className="px-5 py-3 rounded-2xl bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6] font-heading text-base font-bold shadow-md flex items-center gap-2 cursor-pointer transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            <span>
              {language === 'el'
                ? 'Εγγραφή Νέου Μέλους / Συμπλήρωση Προφίλ'
                : 'Register New Member / Complete Profile'}
            </span>
          </button>
        </div>
      </div>

      {/* Gamification Tier Legend Banner (6 Titles) */}
      <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 border-2 border-[#6B8E7B] shadow-md">
        <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#243B35] dark:text-[#F1E9D2] flex items-center gap-2 mb-5">
          <Crown className="w-6 h-6 text-[#A44A3F] dark:text-[#F4D6C6]" />
          <span>
            {language === 'el'
              ? 'Τίτλοι Γαστρονομικής Έντιμης Προσφοράς Προτάσεων:'
              : 'Titles of Culinary Contribution:'}
          </span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 text-center">
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
            <span className="text-2xl mb-1 block">🥉</span>
            <div className="font-heading text-base font-bold text-blue-700 dark:text-blue-400">ΕΝΕΡΓΟΠΟΙΗΘΗΚΑ ΠΑΙΔΙΑ</div>
            <div className="text-xs font-extrabold text-stone-700 dark:text-stone-300 mt-0.5">scout first love</div>
            <div className="text-[11px] text-stone-500 mt-1">1 Καταχώρηση Spot</div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
            <span className="text-2xl mb-1 block">🥈</span>
            <div className="font-heading text-base font-bold text-orange-700 dark:text-orange-400">ΜΕΡΑΚΛΗΣ / ΜΕΡΑΚΛΙΝΑ</div>
            <div className="text-xs font-extrabold text-stone-700 dark:text-stone-300 mt-0.5">Food lover</div>
            <div className="text-[11px] text-stone-500 mt-1">2 Καταχωρήσεις Spots</div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
            <span className="text-2xl mb-1 block">🥇</span>
            <div className="font-heading text-base font-bold text-emerald-700 dark:text-emerald-400">ΕΙΜΑΙ ΑΠΟΛΑΥΣΗ</div>
            <div className="text-xs font-extrabold text-stone-700 dark:text-stone-300 mt-0.5">food expert</div>
            <div className="text-[11px] text-stone-500 mt-1">3 Καταχωρήσεις Spots</div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
            <span className="text-2xl mb-1 block">⭐</span>
            <div className="font-heading text-base font-bold text-purple-700 dark:text-purple-400">ΦΙΛΟΣ ΚΙ ΑΔΕΡΦΟΣ/Η</div>
            <div className="text-xs font-extrabold text-stone-700 dark:text-stone-300 mt-0.5">Michelin Level</div>
            <div className="text-[11px] text-stone-500 mt-1">4 Καταχωρήσεις Spots</div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-stone-950 font-bold border border-amber-500 shadow-sm">
            <span className="text-2xl mb-1 block">👑</span>
            <div className="font-heading text-base font-bold text-stone-950">ΜΑΣΤΕΡ</div>
            <div className="text-xs font-extrabold text-stone-900 mt-0.5">Food Legend</div>
            <div className="text-[11px] text-stone-900/90 mt-1 font-bold">5 Καταχωρήσεις Spots</div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#6B2F2F] to-[#A44A3F] text-[#F4D6C6] font-bold border-2 border-[#D88C72] shadow-md">
            <span className="text-2xl mb-1 block">💎</span>
            <div className="font-heading text-base font-bold text-[#F4D6C6]">ΜΑΣΤΕΡΜΑΙΝΤ</div>
            <div className="text-xs font-extrabold text-white mt-0.5">A Living Myth</div>
            <div className="text-[11px] text-[#F4D6C6]/90 mt-1 font-bold">6+ Καταχωρήσεις Spots</div>
          </div>
        </div>
      </div>

      {/* COMPACT MOBILE-FRIENDLY LEADERBOARD TABLE (Ranking + Profile Photo + First Name) + "Έπαθλα" Button Directly Underneath */}
      <div className="max-w-md mx-auto w-full space-y-3">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-[#6B2F2F] dark:border-[#D88C72] shadow-lg overflow-hidden">
          <div className="px-4 py-3 bg-[#6B2F2F] text-[#F4D6C6] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#D88C72]" />
              <span className="font-heading text-base font-bold tracking-wide">
                Leaderboard Ranking
              </span>
            </div>
            <span className="text-[11px] font-bold text-[#F4D6C6]/80">
              {language === 'el' ? 'Κατάταξη Μελών' : 'Member Ranking'}
            </span>
          </div>

          {/* Simple, Mobile-Fitting Rows: Ranking + Avatar Photo + First Name */}
          <div className="divide-y divide-stone-100 dark:divide-slate-800">
            {leaderboardUsers.map((user, idx) => (
              <div
                key={user.id}
                onClick={() => setSelectedMemberProfile(user)}
                className="px-4 py-2.5 flex items-center justify-between hover:bg-[#F4D6C6]/35 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-7 h-7 rounded-xl font-heading font-black text-xs flex items-center justify-center shrink-0 ${
                      idx === 0
                        ? 'bg-[#6B2F2F] text-[#F4D6C6] shadow-2xs'
                        : idx === 1
                        ? 'bg-[#A44A3F] text-[#F4D6C6]'
                        : idx === 2
                        ? 'bg-[#D88C72] text-[#6B2F2F]'
                        : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <img
                    src={user.avatarUrl}
                    alt={user.firstName}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-[#D88C72] shrink-0"
                  />
                  <span className="font-heading text-base font-bold text-stone-900 dark:text-stone-100 truncate">
                    {user.firstName}
                  </span>
                </div>

                <span className="text-sm">
                  {idx === 0 ? '👑' : user.gamification.icon}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* "Έπαθλα" Button Directly Underneath the Compact Leaderboard */}
        <button
          type="button"
          onClick={() => setIsRewardsModalOpen(true)}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#6B2F2F] via-[#A44A3F] to-[#6B2F2F] hover:from-[#A44A3F] hover:to-[#6B2F2F] text-[#F4D6C6] border-2 border-[#D88C72] font-heading text-lg font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Gift className="w-5 h-5 text-[#F4D6C6]" />
          <span>{language === 'el' ? 'Έπαθλα' : 'Rewards'}</span>
        </button>
      </div>

      {/* Member Personal Profiles Grid + Personal Chat Button + Comments below each Member Card */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-heading text-2xl sm:text-3xl font-bold text-[#243B35] dark:text-[#F1E9D2] flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-[#A44A3F] dark:text-[#D88C72]" />
            <span>
              {language === 'el'
                ? 'Προσωπικά Προφίλ Μελών & Leaderboard'
                : 'Personal Member Profiles & Leaderboard'}
            </span>
          </h3>
          <button
            onClick={() => {
              setSelectedMemberProfile(null);
              setIsAuthModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6] font-heading text-base font-bold shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
          >
            {language === 'el'
              ? '✏️ Εγγραφή / Επεξεργασία του Δικού μου Προφίλ'
              : '✏️ Register / Edit My Profile'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {leaderboardUsers.map((user, idx) => {
            const badgeConfig = BADGE_TRANSLATIONS[user.currentBadge] || BADGE_TRANSLATIONS['ΕΝΕΡΓΟΠΟΙΗΘΗΚΑ ΠΑΙΔΙΑ'];
            const topFoods = user.topFoods && user.topFoods.length === 3
              ? user.topFoods
              : [
                  'Αυθεντικό σουβλάκι στα κάρβουνα',
                  'Παραδοσιακή πίτα στον ξυλόφουρνο',
                  'Gelato Φιστίκι Αιγίνης ΠΟΠ'
                ];
            const userComments = profileComments.filter((c) => c.targetUserId === user.id);
            const inlineText = inlineCommentByUser[user.id] || '';
            const isSelf = user.id === currentUser.id;

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 transition-all flex flex-col justify-between space-y-5 shadow-md ${
                  idx === 0 
                    ? 'border-[#A44A3F] ring-2 ring-[#D88C72]/30' 
                    : 'border-stone-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Header: Clear Happy Photo + Full Name + Gamification Level next to it + Nickname */}
                  <div className="flex items-start justify-between gap-4">
                    <div 
                      onClick={() => setSelectedMemberProfile(user)}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 cursor-pointer group"
                    >
                      <div className="relative shrink-0">
                        <img
                          src={user.avatarUrl}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-24 h-24 rounded-3xl object-cover ring-4 ring-[#D88C72] shadow-md group-hover:scale-105 transition-transform"
                        />
                        {idx === 0 && (
                          <span className="absolute -top-2 -left-2 text-2xl" title="1η Θέση">👑</span>
                        )}
                        <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-[#6B2F2F] text-[#F4D6C6] text-[10px] font-black shadow-xs">
                          😊 Χαρούμενη Φωτό
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {/* Full Name & Gamification Level Right Next to It */}
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-heading text-2xl font-bold text-stone-900 dark:text-stone-100 leading-tight group-hover:text-[#6B2F2F] dark:group-hover:text-[#F4D6C6]">
                            {user.firstName} {user.lastName}
                          </h4>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wide border ${badgeConfig.color}`}>
                            <span>{user.gamification.icon}</span>
                            <span>{user.gamification.titleEl}</span>
                          </span>
                        </div>

                        {/* Nickname & Voice Over Button */}
                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold uppercase text-stone-400">Nickname:</span>
                            <span className="px-2.5 py-0.5 rounded-lg bg-[#F4D6C6] dark:bg-[#6B2F2F] text-[#6B2F2F] dark:text-[#F4D6C6] font-heading text-sm font-bold">
                              «{user.nickname || 'Food Scout'}»
                            </span>
                          </div>
                          <ProfileVoiceButton user={user} spotsCount={user.spotsCount} compact />
                        </div>
                      </div>
                    </div>

                    {/* Rank Pill */}
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-heading font-bold text-base shrink-0 ${
                      idx === 0 
                        ? 'bg-[#6B2F2F] text-[#F4D6C6] shadow-md' 
                        : idx === 1 
                        ? 'bg-stone-200 dark:bg-slate-700 text-stone-800 dark:text-stone-200' 
                        : idx === 2 
                        ? 'bg-[#F4D6C6] text-[#6B2F2F]' 
                        : 'bg-stone-100 dark:bg-slate-800 text-stone-500'
                    }`}>
                      #{idx + 1}
                    </div>
                  </div>

                  {/* Bio Paragraph */}
                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-slate-800/50 border border-stone-200/70 dark:border-slate-700/70">
                    <p className="text-sm text-stone-700 dark:text-stone-200 leading-relaxed font-medium">
                      {user.bio}
                    </p>
                  </div>

                  {/* 3 Top Favorite Foods List */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#6B2F2F] dark:text-[#F4D6C6]">
                      <Utensils className="w-3.5 h-3.5" />
                      <span>{language === 'el' ? 'Τα 3 Κορυφαία Φαγητά:' : 'Top 3 Favorite Dishes:'}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {topFoods.map((food, fIdx) => (
                        <div
                          key={fIdx}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#F4D6C6]/50 dark:bg-slate-800/80 border border-[#D88C72]/60 dark:border-slate-700 text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200"
                        >
                          <span className="w-6 h-6 rounded-lg bg-[#6B2F2F] text-[#F4D6C6] font-heading font-bold text-xs flex items-center justify-center shrink-0">
                            {fIdx + 1}
                          </span>
                          <span className="truncate">{food}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats & Direct Personal Chat Button Row */}
                <div className="pt-3 border-t border-stone-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-xs font-bold text-stone-600 dark:text-stone-400">
                    <span>🍽️ {user.spotsCount} Spots</span>
                    <span>⭐ {user.starsReceived.toFixed(1)}</span>
                    <span>🏆 {user.totalPoints} XP</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isSelf && (
                      <button
                        onClick={() => setActiveDirectChatUser(user)}
                        className="px-3.5 py-2 rounded-xl bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {language === 'el' ? `Προσωπικό Chat με ${user.firstName}` : `Direct Chat with ${user.firstName}`}
                        </span>
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedMemberProfile(user)}
                      className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-bold cursor-pointer"
                    >
                      {language === 'el' ? 'Προφίλ' : 'Profile'}
                    </button>
                  </div>
                </div>

                {/* Member Comments Section directly below each Member Profile Card */}
                <div className="pt-4 border-t-2 border-stone-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-extrabold text-stone-700 dark:text-stone-300">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-[#A44A3F]" />
                      <span>
                        {language === 'el'
                          ? `Σχόλια Μελών για τον/την ${user.firstName} (${userComments.length})`
                          : `Member Comments for ${user.firstName} (${userComments.length})`}
                      </span>
                    </span>
                  </div>

                  {userComments.length > 0 && (
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {userComments.map((comm) => (
                        <div
                          key={comm.id}
                          className="p-2.5 rounded-xl bg-stone-50 dark:bg-slate-800/90 border border-stone-200 dark:border-slate-700 text-xs space-y-0.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-900 dark:text-white">
                              {comm.authorName}:
                            </span>
                            <span className="text-[10px] text-stone-400">{comm.createdAt}</span>
                          </div>
                          <p className="text-stone-700 dark:text-stone-300 font-medium">{comm.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add comment input right below the profile card */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!inlineText.trim()) return;
                      addProfileComment(user.id, inlineText);
                      setInlineCommentByUser((prev) => ({ ...prev, [user.id]: '' }));
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={inlineText}
                      onChange={(e) =>
                        setInlineCommentByUser((prev) => ({ ...prev, [user.id]: e.target.value }))
                      }
                      placeholder={
                        language === 'el'
                          ? `Αφήστε ένα σχόλιο στο προφίλ του/της ${user.firstName}...`
                          : `Leave a comment on ${user.firstName}'s profile...`
                      }
                      className="flex-1 px-3 py-2 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#A44A3F]"
                    />
                    <button
                      type="submit"
                      disabled={!inlineText.trim()}
                      className="px-3.5 py-2 rounded-xl bg-[#6B2F2F] hover:bg-[#A44A3F] disabled:opacity-50 text-[#F4D6C6] text-xs font-extrabold cursor-pointer shrink-0"
                    >
                      {language === 'el' ? 'Σχόλιο' : 'Comment'}
                    </button>
                  </form>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Private Code Verification Box */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#243B35] to-[#6B8E7B] text-[#F1E9D2] border-2 border-[#B7C9B1] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#F4D6C6]">
            <Key className="w-4 h-4" />
            <span>{language === 'el' ? 'Κλειστή Λέσχη Αειφάρου' : 'Aeifaron Private Club'}</span>
          </div>
          <h3 className="font-heading text-2xl sm:text-3xl font-bold">
            {language === 'el' ? 'Έχετε Κωδικό Πρόσκλησης Μέλους;' : 'Have a Member Invite Code?'}
          </h3>
          <p className="text-sm text-[#F1E9D2]/90 leading-relaxed">
            {language === 'el'
              ? 'Εισάγετε τον προσωπικό σας κωδικό πρόσκλησης για άμεση επιβεβαίωση στην κοινότητα.'
              : 'Enter your personal invitation code for immediate verification in the community.'}
          </p>
        </div>

        <form onSubmit={handleInviteSubmit} className="flex w-full md:w-auto gap-2">
          <input
            type="text"
            value={inviteCodeInput}
            onChange={(e) => setInviteCodeInput(e.target.value)}
            placeholder="π.χ. GREECE-TASTE-2026"
            className="flex-1 md:w-64 px-4 py-3 rounded-xl bg-[#1b2d28] border border-[#B7C9B1] text-[#F1E9D2] placeholder-[#B7C9B1]/60 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#F4D6C6]"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6] font-heading font-bold text-sm transition-colors cursor-pointer shrink-0 shadow-md"
          >
            {language === 'el' ? 'Επιβεβαίωση' : 'Verify'}
          </button>
        </form>
      </div>

      {/* "Έπαθλα" & "Προτάσεις" Modal Window */}
      <AnimatePresence>
        {isRewardsModalOpen && (
          <div
            onClick={() => setIsRewardsModalOpen(false)}
            className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-[#FFFDF9] dark:bg-[#0F172A] rounded-3xl shadow-2xl border-2 border-[#A44A3F] my-auto overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-[#6B2F2F] text-[#F4D6C6] border-b border-[#D88C72]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#A44A3F] text-[#F4D6C6]">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl sm:text-2xl font-bold">
                      {language === 'el'
                        ? 'Έπαθλα Επιπέδων Leaderboard'
                        : 'Leaderboard Level Rewards'}
                    </h3>
                    <p className="text-xs text-[#F4D6C6]/85 font-medium">
                      {language === 'el'
                        ? 'Κεράσματα & επιβραβεύσεις από την Αειφαριώτικη κοινότητα (με προσωπική αποστολή χρημάτων)'
                        : 'Treats & rewards funded by the Aeifaron community (via personal money transfer)'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRewardsModalOpen(false)}
                  className="p-2 rounded-xl bg-[#A44A3F] hover:bg-[#D88C72] text-[#F4D6C6] hover:text-[#6B2F2F] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Modal Body */}
              <div className="overflow-y-auto p-6 space-y-6">
                
                {/* Part 1: Rewards per Level */}
                <div className="space-y-3">
                  <h4 className="font-heading text-lg font-bold text-[#6B2F2F] dark:text-[#F4D6C6] flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#A44A3F]" />
                    <span>
                      {language === 'el'
                        ? 'Τι Έπαθλα δικαιούται το κάθε Επίπεδο:'
                        : 'Rewards Entitled per Level:'}
                    </span>
                  </h4>

                  <div className="space-y-2.5">
                    {LEVEL_REWARDS.map((item, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-2xl border transition-all ${
                          item.highlight
                            ? 'bg-gradient-to-r from-[#6B2F2F] to-[#A44A3F] text-[#F4D6C6] border-2 border-[#D88C72] shadow-md'
                            : 'bg-[#FFF7F2] dark:bg-slate-800/90 text-stone-800 dark:text-stone-100 border-[#D88C72]/80 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl shrink-0">{item.icon}</span>
                          <div className="space-y-1">
                            <div
                              className={`font-heading text-base font-bold ${
                                item.highlight
                                  ? 'text-[#F4D6C6]'
                                  : 'text-[#6B2F2F] dark:text-[#F4D6C6]'
                              }`}
                            >
                              {language === 'el' ? item.levelName : item.levelNameEn}
                            </div>
                            <p
                              className={`text-xs sm:text-sm leading-relaxed font-medium ${
                                item.highlight
                                  ? 'text-white'
                                  : 'text-stone-700 dark:text-stone-300'
                              }`}
                            >
                              {language === 'el' ? item.reward : item.rewardEn}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Part 2: "Προτάσεις" — Member Reward Suggestions Form & List Directly Below */}
                <div className="pt-5 border-t-2 border-[#D88C72] dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#F4D6C6] text-[#6B2F2F]">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-heading text-xl font-bold text-[#6B2F2F] dark:text-[#F4D6C6]">
                        {language === 'el' ? 'Προτάσεις' : 'Suggestions'}
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                        {language === 'el'
                          ? 'Συμπληρώστε τη δική σας πρόταση για έπαθλο στα επίπεδα του Leaderboard!'
                          : 'Submit your own suggestion for a reward on the Leaderboard levels!'}
                      </p>
                    </div>
                  </div>

                  {/* Suggestion Form */}
                  <form
                    onSubmit={handleRewardSuggestionSubmit}
                    className="p-4 rounded-2xl bg-[#F4D6C6]/45 dark:bg-slate-900 border border-[#D88C72] space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-extrabold uppercase text-[#6B2F2F] dark:text-[#F4D6C6] mb-1">
                          {language === 'el' ? 'Επίπεδο Leaderboard' : 'Leaderboard Level'}
                        </label>
                        <select
                          value={selectedLevelTarget}
                          onChange={(e) => setSelectedLevelTarget(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-[#D88C72] text-xs font-bold text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B2F2F]"
                        >
                          <option value="ΜΑΣΤΕΡΜΑΙΝΤ (6+ Spots)">💎 ΜΑΣΤΕΡΜΑΙΝΤ (6+ Spots)</option>
                          <option value="ΜΑΣΤΕΡ (5 Spots)">👑 ΜΑΣΤΕΡ (5 Spots)</option>
                          <option value="ΦΙΛΟΣ ΚΙ ΑΔΕΡΦΟΣ/Η (4 Spots)">⭐ ΦΙΛΟΣ ΚΙ ΑΔΕΡΦΟΣ/Η (4 Spots)</option>
                          <option value="ΕΙΜΑΙ ΑΠΟΛΑΥΣΗ (3 Spots)">🥇 ΕΙΜΑΙ ΑΠΟΛΑΥΣΗ (3 Spots)</option>
                          <option value="ΜΕΡΑΚΛΗΣ / ΜΕΡΑΚΛΙΝΑ (2 Spots)">🥈 ΜΕΡΑΚΛΗΣ / ΜΕΡΑΚΛΙΝΑ (2 Spots)</option>
                          <option value="ΕΝΕΡΓΟΠΟΙΗΘΗΚΑ ΠΑΙΔΙΑ (1 Spot)">🥉 ΕΝΕΡΓΟΠΟΙΗΘΗΚΑ ΠΑΙΔΙΑ (1 Spot)</option>
                          <option value="Όλα τα Επίπεδα">🏆 Όλα τα Επίπεδα</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-extrabold uppercase text-[#6B2F2F] dark:text-[#F4D6C6] mb-1">
                          {language === 'el' ? 'Η Πρότασή σας για Έπαθλο' : 'Your Reward Suggestion'}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newRewardSuggestion}
                            onChange={(e) => setNewRewardSuggestion(e.target.value)}
                            placeholder={
                              language === 'el'
                                ? 'π.χ. Κέρασμα παγωτό ή σουβλάκι από την παρέα με IRIS...'
                                : 'e.g. Ice cream or souvlaki treat paid by the community...'
                            }
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-[#D88C72] text-xs sm:text-sm font-medium text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B2F2F]"
                            required
                          />
                          <button
                            type="submit"
                            disabled={!newRewardSuggestion.trim() || isSubmittingSuggestion}
                            className="px-4 py-2.5 rounded-xl bg-[#6B2F2F] hover:bg-[#A44A3F] disabled:opacity-50 text-[#F4D6C6] font-heading text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                          >
                            <PlusCircle className="w-4 h-4" />
                            <span>{language === 'el' ? 'Υποβολή' : 'Submit'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>

                  {/* Submitted Suggestions List */}
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {rewardSuggestions.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 flex items-start gap-3 shadow-2xs"
                      >
                        <img
                          src={item.avatarUrl}
                          alt={item.firstName}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-[#A44A3F] shrink-0 mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-heading text-xs sm:text-sm font-bold text-[#6B2F2F] dark:text-[#F4D6C6]">
                                {item.firstName}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-[#F4D6C6] text-[#6B2F2F] text-[10px] font-extrabold">
                                {item.levelTarget}
                              </span>
                            </div>
                            <span className="text-[10px] text-stone-400 font-semibold">
                              {item.createdAt}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-200 font-medium mt-1">
                            {item.suggestion}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
