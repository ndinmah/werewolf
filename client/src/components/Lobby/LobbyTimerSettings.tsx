import React from 'react';
import { Clock } from 'lucide-react';
import type { RoomSettings } from '../../types/game';

interface LobbyTimerSettingsProps {
  roomSettings: RoomSettings | undefined;
  isHost: boolean;
  onTimerChange: (key: keyof RoomSettings, value: string) => void;
}

export const LobbyTimerSettings: React.FC<LobbyTimerSettingsProps> = ({
  roomSettings,
  isHost,
  onTimerChange,
}) => {
  return (
    <div className="bg-dark/50 p-6 rounded-xl border border-gray-800 backdrop-blur-xs flex flex-col justify-between gap-4">
      <div>
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 mb-4">
          <Clock className="w-4 h-4" />
          <span>Thời gian các Phase (giây)</span>
        </h3>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] text-gray-400 font-bold block mb-1">Bình minh</label>
            <input
              type="number"
              disabled={!isHost}
              value={roomSettings?.dayStartDuration || 8}
              onChange={(e) => onTimerChange('dayStartDuration', e.target.value)}
              className="w-full bg-darker border border-gray-800 rounded-lg py-2 px-3 text-white text-center disabled:opacity-50"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-1 font-bold">Thảo luận</label>
            <input
              type="number"
              disabled={!isHost}
              value={roomSettings?.discussionTime || 120}
              onChange={(e) => onTimerChange('discussionTime', e.target.value)}
              className="w-full bg-darker border border-gray-800 rounded-lg py-2 px-3 text-white text-center disabled:opacity-50"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-1 font-bold">Biểu quyết</label>
            <input
              type="number"
              disabled={!isHost}
              value={roomSettings?.voteTime || 60}
              onChange={(e) => onTimerChange('voteTime', e.target.value)}
              className="w-full bg-darker border border-gray-800 rounded-lg py-2 px-3 text-white text-center disabled:opacity-50"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
