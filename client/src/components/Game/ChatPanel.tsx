import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { ChatMessage } from './ChatMessage';
import type { ChatLogs } from '../../types/game';

export const ChatPanel = () => {
  const { id: roomId } = useParams();
  const socket = useSocket();
  const { chatLogs, myPlayer, phase } = useGame();
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [lastReadMessageCount, setLastReadMessageCount] = useState<Record<string, number>>(() => ({
    general: chatLogs.general?.length || 0,
    wolves: chatLogs.wolves?.length || 0,
    ghost: chatLogs.ghost?.length || 0,
  }));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatLogs, activeTab]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !socket || !myPlayer) return;

    socket.emit('SEND_CHAT', { roomId, channel: currentTab, content: message });
    setMessage('');
  };

  const tabs = useMemo(() => {
    const t = [{ id: 'general', label: 'Quảng Trường' }];
    if (myPlayer?.role === 'WEREWOLF') t.push({ id: 'wolves', label: 'Hang Sói' });
    if (myPlayer && !myPlayer.isAlive) t.push({ id: 'ghost', label: 'Cõi Âm' });
    return t;
  }, [myPlayer]);

  const currentTab = (tabs.some((t) => t.id === activeTab) ? activeTab : 'general') as keyof ChatLogs;

  const handleTabChange = (tabId: string) => {
    setLastReadMessageCount((prev) => ({
      ...prev,
      [currentTab]: chatLogs[currentTab]?.length || 0,
      [tabId]: chatLogs[tabId as keyof ChatLogs]?.length || 0,
    }));
    setActiveTab(tabId);
  };

  const getUnreadCount = (tabId: string) => {
    const total = chatLogs[tabId as keyof ChatLogs]?.length || 0;
    const read = lastReadMessageCount[tabId] || 0;
    return Math.max(0, total - read);
  };

  const isInputDisabled = () => {
    if (!myPlayer) return true;
    if (currentTab === 'general') {
      return !myPlayer.isAlive || (phase !== 'dayDiscuss' && phase !== 'voting');
    }
    if (currentTab === 'wolves') {
      return myPlayer.role !== 'WEREWOLF' || !myPlayer.isAlive || phase === 'gameOver' || phase === 'roleReveal';
    }
    return myPlayer.isAlive;
  };

  return (
    <div className="flex flex-col h-full bg-[#030303]/80 backdrop-blur-md rounded-none border border-white/10 overflow-hidden font-['Cormorant_Garamond',serif]">
      {/* Edge highlight */}
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/20 to-transparent"></div>

      <div className="flex bg-[#0a0a0a] border-b border-white/10">
        {tabs.map((tab) => {
          const unread = getUnreadCount(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 py-4 text-sm font-['Cinzel_Decorative',serif] uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
                currentTab === tab.id
                  ? tab.id === 'wolves'
                    ? 'text-[#8a0303] bg-[#8a0303]/5 shadow-[inset_0_-2px_0_#8a0303]'
                    : tab.id === 'ghost'
                    ? 'text-purple-500 bg-purple-500/5 shadow-[inset_0_-2px_0_#a855f7]'
                    : 'text-[#aa8c55] bg-[#aa8c55]/5 shadow-[inset_0_-2px_0_#aa8c55]'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <span>{tab.label}</span>
              {unread > 0 && (
                <span className={`text-[10px] font-sans text-white font-bold px-1.5 py-0.5 rounded-none shrink-0 min-w-[18px] text-center ${
                  tab.id === 'wolves' ? 'bg-[#8a0303] animate-pulse' : tab.id === 'ghost' ? 'bg-purple-600' : 'bg-[#aa8c55]'
                }`}>
                  {unread}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-linear-to-b from-transparent to-black/50 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {chatLogs[currentTab]?.map((msg) => (
          <ChatMessage key={msg.id} message={msg} isMe={msg.senderId === myPlayer?.id} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 bg-[#0a0a0a] border-t border-white/10 flex gap-3 relative">
        <div className={`absolute top-0 left-0 w-full h-px ${currentTab === 'wolves' ? 'bg-[#8a0303]/30' : 'bg-[#aa8c55]/30'}`}></div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isInputDisabled()}
          placeholder={isInputDisabled() ? 'Im lặng là vàng...' : 'Thì thầm...'}
          className="flex-1 bg-[#030303] text-white rounded-none px-4 py-3 border border-white/10 focus:outline-none focus:border-[#aa8c55] disabled:opacity-50 text-lg font-['Cormorant_Garamond',serif] italic placeholder:text-gray-600 transition-colors"
        />
        <button
          type="submit"
          disabled={isInputDisabled() || !message.trim()}
          className="bg-transparent border border-[#aa8c55]/50 hover:bg-[#aa8c55]/20 text-[#aa8c55] px-6 py-2 rounded-none font-['Cinzel_Decorative',serif] tracking-widest uppercase transition-colors disabled:opacity-50 disabled:border-gray-700 disabled:text-gray-700 shrink-0"
        >
          Gửi
        </button>
      </form>
    </div>
  );
};
