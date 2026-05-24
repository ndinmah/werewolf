import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { ChatMessage } from './ChatMessage';

export const ChatPanel = () => {
  const { id: roomId } = useParams();
  const socket = useSocket();
  const { chatLogs, myPlayer, phase } = useGame();
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatLogs, activeTab]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket || !myPlayer) return;

    socket.emit('SEND_CHAT', { roomId, channel: currentTab, content: message });
    setMessage('');
  };

  const tabs = useMemo(() => {
    const t = [{ id: 'general', label: 'Chung' }];
    if (myPlayer?.role === 'WEREWOLF') t.push({ id: 'wolves', label: 'Sói' });
    if (myPlayer && !myPlayer.isAlive) t.push({ id: 'ghost', label: 'Cõi Chết' });
    return t;
  }, [myPlayer]);

  // Derive tab hiệu lực: nếu activeTab không còn hợp lệ thì fallback về 'general'
  const currentTab = tabs.some((t) => t.id === activeTab) ? activeTab : 'general';

  const isInputDisabled = () => {
    if (!myPlayer) return true;
    if (currentTab === 'general') {
      return !myPlayer.isAlive || (phase !== 'dayDiscuss' && phase !== 'voting');
    }
    if (currentTab === 'wolves') {
      return myPlayer.role !== 'WEREWOLF' || !myPlayer.isAlive || phase !== 'night';
    }
    return myPlayer.isAlive; // Chỉ người chết mới chat được cõi chết
  };

  return (
    <div className="flex flex-col h-full bg-dark/80 rounded-xl border border-gray-800 overflow-hidden">
      <div className="flex bg-darker border-b border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              currentTab === tab.id
                ? tab.id === 'wolves'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-wolf-light border-b-2 border-wolf-light'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
        {chatLogs[currentTab]?.map((msg) => (
          <ChatMessage key={msg.id} message={msg} isMe={msg.senderId === myPlayer?.id} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 bg-darker border-t border-gray-800 flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isInputDisabled()}
          placeholder={isInputDisabled() ? 'Bạn không thể gửi lúc này' : 'Nhập tin nhắn...'}
          className="flex-1 bg-dark text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-wolf-light disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isInputDisabled() || !message.trim()}
          className="bg-wolf hover:bg-wolf-light text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 shrink-0"
        >
          Gửi
        </button>
      </form>
    </div>
  );
};
