import { memo } from 'react';
import { ChatMessage as ChatMessageType } from '../../types/game';

interface ChatMessageProps {
  message: ChatMessageType;
  isMe: boolean;
}

export const ChatMessage = memo(({ message, isMe }: ChatMessageProps) => {
  const { senderName, content, channel, timestamp } = message;

  const getChannelStyle = () => {
    switch (channel) {
      case 'wolves':
        return 'text-[#ffdddd] border-[#8a0303]/50 bg-[#8a0303]/10';
      case 'ghost':
        return 'text-purple-200 border-purple-500/30 bg-purple-900/10 italic';
      default:
        return isMe ? 'text-white border-[#aa8c55]/30 bg-[#aa8c55]/10' : 'text-gray-300 border-white/10 bg-white/5';
    }
  };

  const getNameStyle = () => {
    switch (channel) {
      case 'wolves': return 'text-[#8a0303]';
      case 'ghost': return 'text-purple-400';
      default: return isMe ? 'text-[#aa8c55]' : 'text-gray-400';
    }
  }

  return (
    <div className={`mb-4 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
      <div className={`text-xs text-gray-500 mb-1.5 font-sans tracking-widest uppercase flex items-center gap-2`}>
        <span className={`font-bold ${getNameStyle()}`}>{senderName}</span>
        <span className="opacity-50 text-[10px]">
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div
        className={`inline-block px-4 py-2.5 rounded-none border max-w-[85%] wrap-break-word text-lg shadow-sm ${getChannelStyle()}`}
      >
        {content}
      </div>
    </div>
  );
});
