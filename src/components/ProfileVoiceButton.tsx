import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Square, Loader2 } from 'lucide-react';
import { UserProfile, getGamificationInfo } from '../types';
import { useApp } from '../context/AppContext';

interface ProfileVoiceButtonProps {
  user: UserProfile;
  spotsCount: number;
  compact?: boolean;
}

export const ProfileVoiceButton: React.FC<ProfileVoiceButtonProps> = ({
  user,
  spotsCount,
  compact = false
}) => {
  const { language, showToast } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsLoading(false);
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [user.id]);

  const buildNarrationScript = () => {
    const gamification = getGamificationInfo(spotsCount, user.reviewsCount || 0);
    const topFoods =
      user.topFoods && user.topFoods.length === 3
        ? user.topFoods
        : [
            'Αυθεντικό σουβλάκι στα κάρβουνα',
            'Παραδοσιακή πίτα στον ξυλόφουρνο',
            'Gelato Φιστίκι Αιγίνης ΠΟΠ'
          ];

    if (language === 'el') {
      return `Προφίλ μέλους: ${user.firstName} ${user.lastName}. Επίπεδο Gamification ${gamification.level}: ${gamification.titleEl}. Ψευδώνυμο Nickname: ${user.nickname || 'Food Scout'}. Βιογραφικό: ${user.bio}. Τα 3 κορυφαία του πιάτα είναι: Πρώτο, ${topFoods[0]}. Δεύτερο, ${topFoods[1]}. Τρίτο, ${topFoods[2]}.`;
    } else {
      return `Member Profile: ${user.firstName} ${user.lastName}. Gamification Level ${gamification.level}: ${gamification.titleEn}. Nickname: ${user.nickname || 'Food Scout'}. Biography: ${user.bio}. Top 3 favorite dishes: First, ${topFoods[0]}. Second, ${topFoods[1]}. Third, ${topFoods[2]}.`;
    }
  };

  const speakWithBrowserFallback = (script: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      showToast(
        language === 'el'
          ? 'Το πρόγραμμα περιήγησής σας δεν υποστηρίζει αναπαραγωγή φωνής.'
          : 'Your browser does not support speech synthesis.',
        'error'
      );
      setIsPlaying(false);
      setIsLoading(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.lang = language === 'el' ? 'el-GR' : 'en-US';
    utterance.rate = 0.98;
    utterance.pitch = 1.0;

    // Pick a matching Greek or English voice if available
    const voices = window.speechSynthesis.getVoices();
    const targetLangPrefix = language === 'el' ? 'el' : 'en';
    const matchingVoice = voices.find((v) => v.lang.toLowerCase().startsWith(targetLangPrefix));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };
    utterance.onend = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    setIsLoading(false);
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleVoiceOver = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isPlaying || isLoading) {
      stopAudio();
      return;
    }

    const script = buildNarrationScript();
    setIsLoading(true);

    try {
      const res = await fetch('/api/tts/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: script })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const mimeType = data.mimeType || 'audio/wav';
          const audio = new Audio(`data:${mimeType};base64,${data.audioBase64}`);
          audioRef.current = audio;

          audio.onended = () => {
            setIsPlaying(false);
            setIsLoading(false);
          };
          audio.onerror = () => {
            speakWithBrowserFallback(script);
          };

          setIsLoading(false);
          setIsPlaying(true);
          await audio.play();
          return;
        }
      }
      speakWithBrowserFallback(script);
    } catch (err) {
      speakWithBrowserFallback(script);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleVoiceOver}
      title={
        language === 'el'
          ? 'Ακούστε σε Voice Over το Ονοματεπώνυμο, Επίπεδο, Nickname, Βιογραφικό και τα 3 Κορυφαία Πιάτα'
          : 'Listen to Voice Over of Name, Level, Nickname, Bio, and Top 3 Dishes'
      }
      className={`inline-flex items-center gap-1.5 rounded-xl font-heading font-bold transition-all cursor-pointer shadow-xs border ${
        isPlaying
          ? 'bg-[#A44A3F] text-[#F4D6C6] border-[#6B2F2F] ring-2 ring-[#D88C72] animate-pulse'
          : 'bg-[#6B2F2F] hover:bg-[#A44A3F] text-[#F4D6C6] border-[#D88C72]/60'
      } ${compact ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 text-xs sm:text-sm'}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          <span>{language === 'el' ? 'Φόρτωση Φωνής...' : 'Loading Voice...'}</span>
        </>
      ) : isPlaying ? (
        <>
          <Square className="w-3.5 h-3.5 fill-current shrink-0" />
          <span>{language === 'el' ? 'Διακοπή Voice Over' : 'Stop Voice Over'}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 shrink-0" />
          <span>{language === 'el' ? '🔊 Ακούστε Προφίλ (Voice Over)' : '🔊 Listen to Profile (Voice Over)'}</span>
        </>
      )}
    </button>
  );
};
