import React from 'react';
import { Avatar } from '../UI/Avatar';
import type { Player } from '../../types/game';

interface LobbyPlayerListProps {
  players: Player[];
  hostId: string;
  myPlayerId?: string;
  isHost: boolean;
  onKick: (player: Player) => void;
}

export const LobbyPlayerList: React.FC<LobbyPlayerListProps> = ({
  players,
  hostId,
  myPlayerId,
  isHost,
  onKick,
}) => {
  return (
    <div className="bg-dark/50 p-6 rounded-xl border border-gray-800 backdrop-blur-xs">
      <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
        <span>Người chơi tham gia ({players.length})</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {players.map((player) => (
          <div
            key={player.id}
            className="bg-darker/60 p-4 rounded-lg flex items-center justify-between border border-gray-800 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar
                name={player.name}
                size="sm"
                className="bg-linear-to-tr from-indigo-600 to-indigo-500 text-white"
              />
              <div>
                <p className="font-bold text-gray-200">{player.name}</p>
                {player.id === hostId && <span className="text-xs text-yellow-500 font-bold">Chủ phòng</span>}
              </div>
            </div>
            {isHost && player.id !== myPlayerId && (
              <button
                onClick={() => onKick(player)}
                className="px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-900/65 text-red-400 hover:text-white hover:bg-red-600 hover:border-red-600 transition-all cursor-pointer text-xs font-bold"
                title="Kick người chơi"
              >
                Kick
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
