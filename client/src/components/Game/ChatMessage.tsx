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
        return 'text-red-400';
      case 'ghost':
        return 'text-purple-400 italic';
      default:
        return 'text-gray-200';
    }
  };

  return (
    <div className={`mb-3 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
      <div className={`text-xs text-gray-500 mb-1`}>
        <span className="font-bold">{senderName}</span>
        <span className="ml-2">
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div
        className={`inline-block px-3 py-2 rounded-lg max-w-[85%] wrap-break-word ${isMe ? 'bg-wolf/80' : 'bg-gray-800'} ${getChannelStyle()}`}
      >
        {content}
      </div>
    </div>
  );
});
