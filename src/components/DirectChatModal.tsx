import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getGamificationInfo } from '../types';
import { X, Send, MessageSquare, Users } from 'lucide-react';
import { motion } from 'motion/react';

export const DirectChatModal: React.FC = () => {
  const {
    currentUser,
    allUsers,
    activeDirectChatUser,
    setActiveDirectChatUser,
    directMessages,
    sendDirectMessage,
    spots
  } = useApp();

  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherMembers = allUsers.filter((u) => u.id !== currentUser.id);
  const targetUser = activeDirectChatUser;

  const conversation = targetUser
    ? directMessages.filter(
        (m) =>
          (m.senderId === currentUser.id && m.receiverId === targetUser.id) ||
          (m.senderId === targetUser.id && m.receiverId === currentUser.id)
      )
    : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.length, targetUser?.id]);

  if (!targetUser) return null;

  const targetSpotsCount = Math.max(
    targetUser.spotsSubmittedCount || 0,
    spots.filter((s) => s.authorId === targetUser.id).length
  );
  const targetGamification = getGamificationInfo(targetSpotsCount, targetUser.reviewsCount || 0);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    const text = messageText.trim();
    setMessageText('');
    await sendDirectMessage(targetUser.id, text);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-2xl bg-[#FFFDF9] dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-[#A44A3F] my-auto overflow-hidden flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#6B2F2F] text-[#F4D6C6] border-b border-[#D88C72]">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={targetUser.avatarUrl}
              alt={targetUser.firstName}
              className="w-11 h-11 rounded-2xl object-cover ring-2 ring-[#D88C72] shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg sm:text-xl font-bold truncate">
                  Προσωπικό Chat με {targetUser.firstName} {targetUser.lastName}
                </h3>
              </div>
              <p className="text-xs text-[#F4D6C6]/80 font-semibold truncate">
                {targetGamification.icon} {targetGamification.titleEl} • «{targetUser.nickname || 'Food Scout'}»
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveDirectChatUser(null)}
            className="p-2 rounded-xl bg-[#A44A3F] hover:bg-[#D88C72] text-[#F4D6C6] hover:text-[#6B2F2F] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Member Switcher Bar */}
        <div className="px-4 py-2.5 bg-[#F4D6C6]/60 dark:bg-slate-800 border-b border-[#D88C72] flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs font-extrabold text-[#6B2F2F] dark:text-[#F4D6C6] flex items-center gap-1 shrink-0">
            <Users className="w-3.5 h-3.5" />
            <span>Συνομιλία με:</span>
          </span>
          {otherMembers.map((m) => {
            const active = m.id === targetUser.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveDirectChatUser(m)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition-all ${
                  active
                    ? 'bg-[#6B2F2F] text-[#F4D6C6] shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-stone-700 dark:text-stone-300 border border-[#D88C72]'
                }`}
              >
                <img src={m.avatarUrl} alt={m.firstName} className="w-4 h-4 rounded-full object-cover" />
                <span>{m.firstName}</span>
              </button>
            );
          })}
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#FFF7F2] dark:bg-slate-900 min-h-[280px]">
          {conversation.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center p-4 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#F4D6C6] text-[#6B2F2F] flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="font-heading text-base font-bold text-[#6B2F2F] dark:text-[#F4D6C6]">
                Ξεκινήστε προσωπική συνομιλία με τον/την {targetUser.firstName}!
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm">
                Στείλτε προσωπικό μήνυμα για προτάσεις φαγητού, εκδρομές ή συνάντηση στα αγαπημένα σας Spots.
              </p>
            </div>
          ) : (
            conversation.map((dm) => {
              const isMine = dm.senderId === currentUser.id;
              return (
                <div
                  key={dm.id}
                  className={`flex items-start gap-2.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <img
                    src={dm.senderAvatar}
                    alt={dm.senderName}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-[#A44A3F] shrink-0 mt-0.5"
                  />
                  <div
                    className={`max-w-[78%] p-3.5 rounded-2xl space-y-1 shadow-xs ${
                      isMine
                        ? 'bg-[#6B2F2F] text-[#F4D6C6] rounded-tr-xs'
                        : 'bg-white dark:bg-slate-800 text-stone-900 dark:text-stone-100 border border-[#D88C72] rounded-tl-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] opacity-80 font-bold">
                      <span>{dm.senderName}</span>
                      <span>{dm.createdAt}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium leading-relaxed break-words">
                      {dm.content}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSend}
          className="p-4 bg-[#F4D6C6] dark:bg-slate-800 border-t border-[#D88C72] flex items-center gap-2"
        >
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={`Γράψτε προσωπικό μήνυμα στον/στην ${targetUser.firstName}...`}
            className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-[#A44A3F] text-sm font-medium text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B2F2F]"
            autoFocus
          />
          <button
            type="submit"
            disabled={!messageText.trim()}
            className="px-5 py-3 rounded-xl bg-[#6B2F2F] hover:bg-[#A44A3F] disabled:opacity-50 text-[#F4D6C6] font-heading text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Αποστολή</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};
