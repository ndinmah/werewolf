import React from 'react';
import { Hourglass } from 'lucide-react';
import type { RoomSettings } from '../../types/game';
import { S } from '../../constants/strings';

interface LobbyTimerSettingsProps {
  roomSettings: RoomSettings | undefined;
  isHost: boolean;
  onTimerChange: (key: keyof RoomSettings, value: string) => void;
}

export const LobbyTimerSettings: React.FC<LobbyTimerSettingsProps> = ({ roomSettings, isHost, onTimerChange }) => {
  return (
    <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#8a0303] to-transparent opacity-50"></div>

      <div>
        <h3 className="text-sm font-['Cinzel_Decorative',serif] uppercase tracking-[0.2em] text-[#aa8c55] flex items-center gap-2 mb-6">
          <Hourglass className="w-4 h-4" />
          <span>{S.lobbyUI.timerTitle}</span>
        </h3>

        <div className="grid grid-cols-3 gap-6">
          <div className="relative group/input">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2 font-sans">
              {S.lobbyUI.timerDayStart}
            </label>
            <input
              type="number"
              disabled={!isHost}
              value={roomSettings?.dayStartDuration || 8}
              onChange={(e) => onTimerChange('dayStartDuration', e.target.value)}
              className="w-full bg-transparent border-0 border-b border-white/20 pb-2 text-white text-center text-xl focus:ring-0 focus:border-[#aa8c55] focus:outline-none transition-colors disabled:opacity-50 font-['Cinzel_Decorative',serif]"
            />
          </div>
          <div className="relative group/input">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2 font-sans">
              {S.lobbyUI.timerDiscuss}
            </label>
            <input
              type="number"
              disabled={!isHost}
              value={roomSettings?.discussionTime || 120}
              onChange={(e) => onTimerChange('discussionTime', e.target.value)}
              className="w-full bg-transparent border-0 border-b border-white/20 pb-2 text-white text-center text-xl focus:ring-0 focus:border-[#aa8c55] focus:outline-none transition-colors disabled:opacity-50 font-['Cinzel_Decorative',serif]"
            />
          </div>
          <div className="relative group/input">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2 font-sans">
              {S.lobbyUI.timerVote}
            </label>
            <input
              type="number"
              disabled={!isHost}
              value={roomSettings?.voteTime || 60}
              onChange={(e) => onTimerChange('voteTime', e.target.value)}
              className="w-full bg-transparent border-0 border-b border-white/20 pb-2 text-white text-center text-xl focus:ring-0 focus:border-[#aa8c55] focus:outline-none transition-colors disabled:opacity-50 font-['Cinzel_Decorative',serif]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
