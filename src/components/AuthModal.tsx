import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { BADGE_TRANSLATIONS } from '../i18n/translations';
import { getGamificationInfo, getGamificationBadge } from '../types';
import { ProfileVoiceButton } from './ProfileVoiceButton';
import { 
  X, 
  User, 
  Check, 
  Edit3, 
  Save, 
  Users,
  Smile,
  Utensils,
  Upload,
  Trophy,
  MessageSquare,
  Send,
  UserPlus,
  Mail,
  Lock,
  LogIn,
  LogOut,
  ShieldCheck,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';

const HAPPY_AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'
];

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
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
    setActiveDirectChatUser,
    spots,
    showToast 
  } = useApp();

  // Which profile is being displayed: selectedMemberProfile (if viewing someone else) or currentUser
  const displayedUser = selectedMemberProfile || currentUser;
  const isCurrentUser = displayedUser.id === currentUser.id;

  const [mode, setMode] = useState<'view' | 'edit' | 'register' | 'login'>('view');
  const [commentInput, setCommentInput] = useState('');
  const [showProviderSetupHelp, setShowProviderSetupHelp] = useState(false);

  // Edit / Register / Login form fields
  const [firstName, setFirstName] = useState(displayedUser.firstName);
  const [lastName, setLastName] = useState(displayedUser.lastName);
  const [nickname, setNickname] = useState(displayedUser.nickname || '');
  const [email, setEmail] = useState(displayedUser.email || '');
  const [password, setPassword] = useState('');
  const [authProviderUsed, setAuthProviderUsed] = useState<'email' | 'google' | 'facebook' | 'instagram'>('email');
  const [bio, setBio] = useState(displayedUser.bio);
  const [avatarUrl, setAvatarUrl] = useState(displayedUser.avatarUrl);
  const [food1, setFood1] = useState(displayedUser.topFoods?.[0] || '');
  const [food2, setFood2] = useState(displayedUser.topFoods?.[1] || '');
  const [food3, setFood3] = useState(displayedUser.topFoods?.[2] || '');
  const [isRegistering, setIsRegistering] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFirstName(displayedUser.firstName);
    setLastName(displayedUser.lastName);
    setNickname(displayedUser.nickname || '');
    setEmail(displayedUser.email || '');
    setPassword('');
    setAuthProviderUsed('email');
    setBio(displayedUser.bio);
    setAvatarUrl(displayedUser.avatarUrl);
    setFood1(displayedUser.topFoods?.[0] || '');
    setFood2(displayedUser.topFoods?.[1] || '');
    setFood3(displayedUser.topFoods?.[2] || '');
    setMode('view');
  }, [displayedUser.id, isAuthModalOpen]);

  if (!isAuthModalOpen && !selectedMemberProfile) return null;

  const startRegistrationMode = () => {
    setFirstName('');
    setLastName('');
    setNickname('');
    setEmail('');
    setPassword('');
    setAuthProviderUsed('email');
    setBio('');
    setAvatarUrl(HAPPY_AVATAR_PRESETS[1]);
    setFood1('');
    setFood2('');
    setFood3('');
    setMode('register');
  };

  const startLoginMode = () => {
    setEmail('');
    setPassword('');
    setMode('login');
  };

  const handleSocialAuth = async (provider: 'google' | 'facebook' | 'instagram') => {
    setIsRegistering(true);
    const res = await signInWithProvider(provider);
    setIsRegistering(false);

    if (res.success) {
      if (res.needsProfileCompletion && res.prefill) {
        setFirstName(res.prefill.firstName);
        setLastName(res.prefill.lastName);
        setEmail(res.prefill.email);
        setAvatarUrl(res.prefill.avatarUrl || HAPPY_AVATAR_PRESETS[1]);
        setAuthProviderUsed(res.prefill.authProvider);
        setMode('register');
      } else {
        setSelectedMemberProfile(null);
        setMode('view');
      }
    }
  };

  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setIsRegistering(true);
    const res = await loginWithEmailPassword(email.trim(), password);
    setIsRegistering(false);
    if (res.success) {
      setSelectedMemberProfile(null);
      setMode('view');
    }
  };

  // Dynamic spots count & XP gamification calculation
  const userApprovedSpotsCount = Math.max(
    displayedUser.spotsSubmittedCount || 0,
    spots.filter((s) => s.authorId === displayedUser.id).length
  );
  const gamification = getGamificationInfo(userApprovedSpotsCount, displayedUser.reviewsCount || 0);
  const earnedBadge = getGamificationBadge(userApprovedSpotsCount);
  const currentBadgeConfig = BADGE_TRANSLATIONS[earnedBadge] || BADGE_TRANSLATIONS['ΕΝΕΡΓΟΠΟΙΗΘΗΚΑ ΠΑΙΔΙΑ'];

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setSelectedMemberProfile(null);
    setMode('view');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        showToast('Η χαρούμενη φωτογραφία σας φορτώθηκε επιτυχώς! 😊', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTopFoods: [string, string, string] = [
      food1.trim() || 'Αγαπημένο Πιάτο #1',
      food2.trim() || 'Αγαπημένο Πιάτο #2',
      food3.trim() || 'Αγαπημένο Πιάτο #3'
    ];

    if (mode === 'register') {
      setIsRegistering(true);
      const ok = await registerNewMember({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nickname: nickname.trim() || 'Food Lover',
        email: email.trim() || `${Date.now()}@aeifaron.gr`,
        password: authProviderUsed === 'email' ? password : undefined,
        authProvider: authProviderUsed,
        avatarUrl: avatarUrl.trim(),
        bio: bio.trim(),
        topFoods: updatedTopFoods
      });
      setIsRegistering(false);
      if (ok) {
        setSelectedMemberProfile(null);
        setMode('view');
      }
      return;
    }

    updateCurrentUserProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      nickname: nickname.trim() || 'Food Lover',
      email: email.trim(),
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim(),
      topFoods: updatedTopFoods,
      badge: earnedBadge
    });
    setMode('view');
  };

  const progressPercentage = Math.min(100, Math.round((gamification.xp / gamification.nextLevelXp) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-2xl bg-[#FFFDF9] dark:bg-[#0F172A] rounded-3xl shadow-2xl border-2 border-[#A44A3F] my-auto overflow-hidden flex flex-col max-h-[92vh]"
      >
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 border-b border-[#D88C72] bg-[#6B2F2F] text-[#F4D6C6]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#A44A3F] text-[#F4D6C6]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold">
                {mode === 'register'
                  ? 'Εγγραφή Νέου Μέλους & Δημιουργία Προφίλ'
                  : mode === 'login'
                  ? 'Σύνδεση Εγγεγραμμένου Μέλους'
                  : isCurrentUser
                  ? 'Προσωπικό Προφίλ Μέλους'
                  : `Προφίλ Μέλους: ${displayedUser.firstName} ${displayedUser.lastName}`}
              </h2>
              {isFirebaseAuthenticated && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#CDFF9B]">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Συνδεδεμένος Λογαριασμός Μέλους</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {mode !== 'login' && (
              <button
                onClick={startLoginMode}
                className="px-3 py-1.5 rounded-xl bg-[#A44A3F] hover:bg-[#D88C72] text-[#F4D6C6] hover:text-[#6B2F2F] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors border border-[#D88C72]/50"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Σύνδεση</span>
              </button>
            )}
            {mode !== 'register' && (
              <button
                onClick={startRegistrationMode}
                className="px-3 py-1.5 rounded-xl bg-[#D88C72] hover:bg-[#F4D6C6] text-[#6B2F2F] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Νέα Εγγραφή Μέλους</span>
              </button>
            )}
            {isFirebaseAuthenticated && (
              <button
                onClick={logoutUser}
                title="Αποσύνδεση"
                className="p-2 rounded-xl bg-[#A44A3F] hover:bg-red-700 text-[#F4D6C6] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 rounded-xl bg-[#A44A3F] hover:bg-[#D88C72] text-[#F4D6C6] hover:text-[#6B2F2F] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          
          {mode === 'login' ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-[#A44A3F] space-y-5 shadow-lg">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-slate-800 pb-3">
                <h3 className="font-heading text-xl font-bold text-[#6B2F2F] dark:text-[#F4D6C6]">
                  Σύνδεση Μέλους (Email/Κωδικός, Google, Facebook, Instagram)
                </h3>
                <button
                  type="button"
                  onClick={startRegistrationMode}
                  className="text-xs font-extrabold text-[#A44A3F] hover:underline cursor-pointer"
                >
                  Δεν έχετε λογαριασμό; Εγγραφή →
                </button>
              </div>

              {/* Social Authentication Buttons */}
              <div className="space-y-2.5">
                <span className="block text-xs font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Άμεση Σύνδεση με Κοινωνικά Δίκτυα &amp; Google:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    disabled={isRegistering}
                    onClick={() => handleSocialAuth('google')}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-stone-50 border-2 border-stone-200 dark:border-slate-700 text-stone-800 dark:text-stone-100 text-xs font-extrabold shadow-xs cursor-pointer transition-all"
                  >
                    <span className="text-base font-black text-red-500">G</span>
                    <span>Google Auth</span>
                  </button>

                  <button
                    type="button"
                    disabled={isRegistering}
                    onClick={() => handleSocialAuth('facebook')}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-extrabold shadow-xs cursor-pointer transition-all"
                  >
                    <span className="text-base font-black">f</span>
                    <span>Facebook</span>
                  </button>

                  <button
                    type="button"
                    disabled={isRegistering}
                    onClick={() => handleSocialAuth('instagram')}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 text-white text-xs font-extrabold shadow-xs cursor-pointer transition-all"
                  >
                    <span className="text-base">📸</span>
                    <span>Instagram</span>
                  </button>
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-stone-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-3 text-xs font-bold uppercase text-stone-400">
                  Ή Σύνδεση με Email &amp; Κωδικό
                </span>
                <div className="flex-grow border-t border-stone-200 dark:border-slate-800"></div>
              </div>

              <form onSubmit={handleEmailLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-stone-700 dark:text-stone-300 mb-1">
                    Email Μέλους *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nikos@aeifaron.gr"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-sm font-semibold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-stone-700 dark:text-stone-300 mb-1">
                    Κωδικός Πρόσβασης *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Εισάγετε τον κωδικό σας..."
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-sm font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setMode('view')}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Ακύρωση
                  </button>
                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6] text-sm font-bold shadow-md cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Σύνδεση με Email</span>
                  </button>
                </div>
              </form>
            </div>
          ) : mode === 'view' ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-[#D88C72] dark:border-slate-800 shadow-md space-y-6">
              
              {/* Top Profile Section: Clear Happy Photo + Full Name + Gamification Level next to it + Nickname */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                  {/* Large Clear Happy Photo */}
                  <div className="relative shrink-0">
                    <img
                      src={displayedUser.avatarUrl}
                      alt={`${displayedUser.firstName} ${displayedUser.lastName}`}
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-[#A44A3F] shadow-lg"
                    />
                    <span 
                      className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-[#6B2F2F] text-[#F4D6C6] text-xs font-extrabold shadow-md flex items-center gap-1"
                      title="Χαρούμενη Φωτογραφία Μέλους"
                    >
                      😊 Χαρούμενο Μέλος
                    </span>
                  </div>

                  {/* Name, Gamification Level right next to it, and Nickname */}
                  <div className="space-y-2 pt-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                      <h3 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50 leading-tight">
                        {displayedUser.firstName} {displayedUser.lastName}
                      </h3>
                      
                      {/* Gamification Level Badge right next to Full Name */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wide border shadow-xs ${currentBadgeConfig.color}`}>
                        <span>{gamification.icon}</span>
                        <span>Επίπεδο {gamification.level}: {gamification.titleEl}</span>
                      </span>
                    </div>

                    {/* Nickname & Voice Over Button */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                          Nickname:
                        </span>
                        <span className="px-3 py-0.5 rounded-lg bg-[#F4D6C6] dark:bg-[#6B2F2F] text-[#6B2F2F] dark:text-[#F4D6C6] font-heading text-base font-bold">
                          «{displayedUser.nickname || 'Ο Καλοφαγάς της Παρέας'}»
                        </span>
                      </div>
                      <ProfileVoiceButton user={displayedUser} spotsCount={userApprovedSpotsCount} />
                    </div>

                    {/* Experience Points (XP) Progress Bar */}
                    <div className="pt-2 max-w-md space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-[#6B2F2F] dark:text-[#F4D6C6] flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5" />
                          <span>{gamification.xp} XP ({userApprovedSpotsCount} Εγκεκριμένα Spots)</span>
                        </span>
                        <span className="text-stone-500 dark:text-stone-400">
                          Επόμενο Επίπεδο: {gamification.nextLevelXp} XP
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-stone-100 dark:bg-slate-800 overflow-hidden border border-stone-200 dark:border-slate-700">
                        <div 
                          className="h-full bg-gradient-to-r from-[#6B2F2F] to-[#A44A3F] rounded-full transition-all duration-500"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons: Edit (if self) or Personal Direct Chat (if other member) */}
                <div className="flex flex-col gap-2 shrink-0">
                  {isCurrentUser ? (
                    <button
                      onClick={() => setMode('edit')}
                      className="px-4 py-2.5 rounded-xl bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6] text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Επεξεργασία Προφίλ</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleClose();
                        setActiveDirectChatUser(displayedUser);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6] text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Send className="w-4 h-4" />
                      <span>Προσωπικό Chat με {displayedUser.firstName}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Personal Bio Paragraph */}
              <div className="p-4 rounded-2xl bg-[#FFF7F2] dark:bg-slate-800/70 border border-[#D88C72] dark:border-slate-700 space-y-1.5">
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#6B2F2F] dark:text-[#F4D6C6]">
                  Λίγα λόγια για μένα (Το γαστρονομικό μου προφίλ):
                </div>
                <p className="text-sm sm:text-base text-stone-700 dark:text-stone-200 leading-relaxed font-medium">
                  {displayedUser.bio}
                </p>
              </div>

              {/* 3 Top Favorite Foods List */}
              <div className="space-y-3">
                <h4 className="font-heading text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-[#A44A3F]" />
                  <span>Τα 3 Κορυφαία Φαγητά μου:</span>
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {(displayedUser.topFoods && displayedUser.topFoods.length === 3
                    ? displayedUser.topFoods
                    : [
                        'Αυθεντικό χειροποίητο σουβλάκι στα κάρβουνα',
                        'Παραδοσιακή πίτα στον ξυλόφουρνο',
                        'Gelato Φιστίκι Αιγίνης ΠΟΠ'
                      ]
                  ).map((food, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#F4D6C6]/60 dark:bg-slate-800 border border-[#D88C72] dark:border-slate-700 shadow-2xs"
                    >
                      <span className="w-8 h-8 rounded-xl bg-[#6B2F2F] text-[#F4D6C6] font-heading font-bold text-base flex items-center justify-center shrink-0 shadow-2xs">
                        #{idx + 1}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                        {food}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats Footer */}
              <div className="pt-3 border-t border-stone-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-stone-500 dark:text-stone-400">
                <span>🍽️ {userApprovedSpotsCount} Εγκεκριμένα Spots</span>
                <span>⭐ {displayedUser.reviewsCount} Κριτικές στην Κοινότητα</span>
                <span>🏆 Συνολικά XP: {gamification.xp} πόντοι</span>
              </div>
            </div>
          ) : (
            /* Edit or Register Profile Form */
            <form onSubmit={handleSave} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-[#A44A3F] space-y-5 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 dark:border-slate-800 pb-3">
                <h3 className="font-heading text-xl font-bold text-[#6B2F2F] dark:text-[#F4D6C6]">
                  {mode === 'register'
                    ? 'Κανονική Εγγραφή Νέου Μέλους & Συμπλήρωση Προφίλ'
                    : 'Επεξεργασία Προσωπικού Προφίλ'}
                </h3>
                <span className="text-xs font-bold text-[#A44A3F]">* Όλα τα πεδία είναι απαραίτητα</span>
              </div>

              {mode === 'register' && (
                <div className="p-4 rounded-2xl bg-[#F4D6C6]/45 dark:bg-slate-800 border border-[#D88C72] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#6B2F2F] dark:text-[#F4D6C6]">
                      1. Επιλέξτε Τρόπο Εγγραφής (Google, Facebook, Instagram ή Email &amp; Κωδικό):
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowProviderSetupHelp(!showProviderSetupHelp)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#A44A3F] hover:underline cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Οδηγός Ενεργοποίησης Παρόχων</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      disabled={isRegistering}
                      onClick={() => handleSocialAuth('google')}
                      className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border-2 text-xs font-extrabold shadow-2xs cursor-pointer transition-all ${
                        authProviderUsed === 'google'
                          ? 'bg-[#6B2F2F] text-[#F4D6C6] border-[#A44A3F] ring-2 ring-[#D88C72]'
                          : 'bg-white dark:bg-slate-900 hover:bg-stone-50 border-stone-200 dark:border-slate-700 text-stone-800 dark:text-stone-100'
                      }`}
                    >
                      <span className="text-base font-black text-red-500">G</span>
                      <span>Εγγραφή με Google</span>
                    </button>

                    <button
                      type="button"
                      disabled={isRegistering}
                      onClick={() => handleSocialAuth('facebook')}
                      className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-extrabold shadow-2xs cursor-pointer transition-all ${
                        authProviderUsed === 'facebook'
                          ? 'bg-[#1877F2] text-white ring-2 ring-[#6B2F2F]'
                          : 'bg-[#1877F2] hover:bg-[#166FE5] text-white'
                      }`}
                    >
                      <span className="text-base font-black">f</span>
                      <span>Εγγραφή με Facebook</span>
                    </button>

                    <button
                      type="button"
                      disabled={isRegistering}
                      onClick={() => handleSocialAuth('instagram')}
                      className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-extrabold shadow-2xs cursor-pointer transition-all bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white ${
                        authProviderUsed === 'instagram' ? 'ring-2 ring-[#6B2F2F]' : 'hover:opacity-95'
                      }`}
                    >
                      <span className="text-base">📸</span>
                      <span>Εγγραφή με Instagram</span>
                    </button>
                  </div>

                  {authProviderUsed !== 'email' && (
                    <div className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
                      <span>✓ Ταυτοποιήθηκε με {authProviderUsed.toUpperCase()}! Συμπληρώστε παρακάτω το προφίλ σας.</span>
                      <button
                        type="button"
                        onClick={() => setAuthProviderUsed('email')}
                        className="underline text-[11px] cursor-pointer"
                      >
                        Αλλαγή σε Email/Κωδικό
                      </button>
                    </div>
                  )}

                  {showProviderSetupHelp && (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-[#D88C72] text-[11px] text-stone-700 dark:text-stone-300 space-y-1 leading-relaxed">
                      <p className="font-bold text-[#6B2F2F] dark:text-[#F4D6C6]">
                        ℹ️ Πληροφορίες Ρύθμισης Firebase Authentication (Project: youthful-manifest-m61jg):
                      </p>
                      <ul className="list-disc pl-4 space-y-0.5">
                        <li><strong>Google Auth:</strong> Είναι ήδη έτοιμο και ενεργοποιημένο αυτόματα!</li>
                        <li><strong>Email &amp; Κωδικός:</strong> Στο Firebase Console → Authentication → Sign-in method → ενεργοποιήστε το <em>Email/Password</em>.</li>
                        <li><strong>Facebook &amp; Instagram:</strong> Στο Firebase Console → Authentication → Sign-in method → προσθέστε <em>Facebook</em> (ή OIDC <code>oidc.instagram</code>) με το App ID &amp; Secret από το Meta for Developers.</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {/* Happy Photo Notice & Uploader */}
              <div className="p-4 rounded-2xl bg-[#FFF7F2] dark:bg-slate-800 border border-[#D88C72] space-y-3">
                <div className="flex items-start gap-3">
                  <Smile className="w-6 h-6 text-[#A44A3F] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-heading text-base font-bold text-[#6B2F2F] dark:text-[#F4D6C6]">
                      Ανεβάστε μόνο μία Χαρούμενη &amp; Ευδιάκριτη Φωτογραφία σας! 😊
                    </h4>
                    <p className="text-xs text-[#6B2F2F]/80 dark:text-[#F4D6C6]/80 mt-0.5">
                      Στην παρέα μας θέλουμε θετική ενέργεια και χαμόγελα! Επιλέξτε μια καθαρή, χαρούμενη φωτογραφία προσώπου.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                  <img
                    src={avatarUrl}
                    alt="Preview"
                    className="w-20 h-20 rounded-2xl object-cover ring-2 ring-[#A44A3F] shrink-0"
                  />
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Ανέβασμα Φωτογραφίας από Συσκευή</span>
                      </button>
                    </div>
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="Ή επικολλήστε URL χαρούμενης φωτογραφίας..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-xs font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Preset Happy Photos */}
                <div className="pt-1">
                  <span className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 mb-1.5">
                    Ή επιλέξτε μια έτοιμη χαρούμενη φωτογραφία προφίλ:
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {HAPPY_AVATAR_PRESETS.map((url, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setAvatarUrl(url)}
                        className={`w-11 h-11 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                          avatarUrl === url ? 'border-[#6B2F2F] scale-105 ring-2 ring-[#A44A3F]' : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Full Name, Nickname & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-stone-700 dark:text-stone-300 mb-1">
                    Όνομα *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="π.χ. Νίκος"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-sm font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-stone-700 dark:text-stone-300 mb-1">
                    Επώνυμο *
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="π.χ. Οικονόμου"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-sm font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-[#6B2F2F] dark:text-[#F4D6C6] mb-1">
                    Nickname (Παρατσούκλι) *
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="π.χ. Ο Μερακλής, Souvlaki Master"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4D6C6]/40 dark:bg-slate-800 border border-[#D88C72] text-sm font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-stone-700 dark:text-stone-300 mb-1">
                    Email Μέλους *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nikos@aeifaron.gr"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-sm font-semibold"
                      required
                    />
                  </div>
                </div>
                {mode === 'register' && authProviderUsed === 'email' && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-extrabold uppercase text-[#6B2F2F] dark:text-[#F4D6C6] mb-1">
                      Κωδικός Πρόσβασης (Τουλάχιστον 6 χαρακτήρες) *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#A44A3F] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Επιλέξτε έναν ασφαλή κωδικό πρόσβασης..."
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#F4D6C6]/40 dark:bg-slate-800 border border-[#D88C72] text-sm font-semibold"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Personal Bio Paragraph */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-stone-700 dark:text-stone-300 mb-1">
                  Μια παράγραφος για εσάς &amp; τις γαστρονομικές σας προτιμήσεις *
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Γράψτε μια παράγραφο για το τι σας αρέσει να ανακαλύπτετε σε ταβέρνες, στέκια, εκδρομές..."
                  className="w-full p-3.5 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-sm font-medium resize-none"
                  required
                />
              </div>

              {/* Top 3 Favorite Foods */}
              <div className="space-y-2.5">
                <label className="block text-xs font-extrabold uppercase text-[#6B2F2F] dark:text-[#F4D6C6]">
                  Τα 3 Κορυφαία Φαγητά σας (Συμπληρώστε τα 3 αγαπημένα σας πιάτα) *
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#6B2F2F] text-[#F4D6C6] font-heading font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <input
                      type="text"
                      value={food1}
                      onChange={(e) => setFood1(e.target.value)}
                      placeholder="1ο Κορυφαίο Φαγητό (π.χ. Κατσικάκι στον ξυλόφουρνο)"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-sm font-semibold"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#6B2F2F] text-[#F4D6C6] font-heading font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <input
                      type="text"
                      value={food2}
                      onChange={(e) => setFood2(e.target.value)}
                      placeholder="2ο Κορυφαίο Φαγητό (π.χ. Φαγκρί στα κάρβουνα)"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-sm font-semibold"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#6B2F2F] text-[#F4D6C6] font-heading font-bold flex items-center justify-center shrink-0">
                      3
                    </span>
                    <input
                      type="text"
                      value={food3}
                      onChange={(e) => setFood3(e.target.value)}
                      placeholder="3ο Κορυφαίο Φαγητό (π.χ. Gelato Φιστίκι Αιγίνης ΠΟΠ)"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-sm font-semibold"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setMode('view')}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6] text-sm font-bold shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{mode === 'register' ? 'Ολοκλήρωση Εγγραφής & Δημιουργία Προφίλ' : 'Αποθήκευση Προφίλ'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Member Profile Comments Section right below the Profile Card */}
          {mode === 'view' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="font-heading text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#A44A3F]" />
                  <span>Σχόλια Μελών στο Προφίλ ({profileComments.filter((c) => c.targetUserId === displayedUser.id).length})</span>
                </h4>
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                  Αφήστε μια ευχή ή σχόλιο!
                </span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!commentInput.trim()) return;
                  addProfileComment(displayedUser.id, commentInput);
                  setCommentInput('');
                }}
                className="flex items-center gap-2"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.firstName}
                  className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#A44A3F] shrink-0"
                />
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder={`Γράψτε ένα σχόλιο στο προφίλ του/της ${displayedUser.firstName}...`}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#A44A3F]"
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#6B2F2F] hover:bg-[#A44A3F] disabled:opacity-50 text-[#F4D6C6] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Αποστολή</span>
                </button>
              </form>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {profileComments
                  .filter((c) => c.targetUserId === displayedUser.id)
                  .map((comm) => (
                    <div
                      key={comm.id}
                      className="p-3.5 rounded-2xl bg-[#FFF7F2] dark:bg-slate-800/80 border border-[#D88C72]/70 dark:border-slate-700 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={comm.authorAvatar}
                            alt={comm.authorName}
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-[#A44A3F]"
                          />
                          <span className="font-heading text-sm font-bold text-stone-900 dark:text-stone-100">
                            {comm.authorName}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F4D6C6] text-[#6B2F2F]">
                            {comm.authorBadge}
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-semibold">{comm.createdAt}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-200 font-medium pl-8">
                        {comm.content}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Quick Switch / View All Members */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#A44A3F]" />
                <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Εγγεγραμμένα Μέλη Παρέας (Κλικ για σύνδεση ή Προσωπικό Chat)
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allUsers.map((u) => {
                const isSelected = displayedUser.id === u.id;
                const uSpotsCount = Math.max(
                  u.spotsSubmittedCount || 0,
                  spots.filter((s) => s.authorId === u.id).length
                );
                const uGamification = getGamificationInfo(uSpotsCount, u.reviewsCount || 0);

                return (
                  <div
                    key={u.id}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between gap-2 transition-all ${
                      isSelected
                        ? 'bg-[#F4D6C6]/50 dark:bg-slate-800 border-[#6B2F2F] ring-2 ring-[#A44A3F]/30'
                        : 'bg-white dark:bg-slate-900 border-stone-200 dark:border-slate-800 hover:border-[#D88C72]'
                    }`}
                  >
                    <div
                      onClick={() => {
                        setSelectedMemberProfile(null);
                        setCurrentUser(u);
                        setMode('view');
                        showToast(`Συνδεθήκατε ως ${u.firstName} ${u.lastName}`, 'info');
                      }}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <img
                        src={u.avatarUrl}
                        alt={u.firstName}
                        className="w-11 h-11 rounded-2xl object-cover ring-2 ring-[#D88C72] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-heading text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                            {u.firstName} {u.lastName}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#6B2F2F] shrink-0" />}
                        </div>
                        <div className="text-[11px] text-[#6B2F2F] dark:text-[#F4D6C6] font-bold truncate">
                          {uGamification.icon} {uGamification.titleEl}
                        </div>
                      </div>
                    </div>

                    {u.id !== currentUser.id && (
                      <button
                        type="button"
                        onClick={() => {
                          handleClose();
                          setActiveDirectChatUser(u);
                        }}
                        title={`Προσωπικό Chat με ${u.firstName}`}
                        className="px-2.5 py-1.5 rounded-xl bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6] text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Send className="w-3 h-3" />
                        <span>Chat</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </motion.div>
    </div>
  );
};
