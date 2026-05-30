import React from 'react';
import { Avatar } from '../UI/Avatar';
import type { Player } from '../../types/game';
import { Skull } from 'lucide-react';

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
    <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 p-8 relative overflow-hidden group">
      {/* Edge highlights */}
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#aa8c55] to-transparent opacity-30"></div>
      
      <h2 className="text-2xl font-['Cinzel_Decorative',serif] text-white mb-6 flex items-center justify-between tracking-widest">
        <span>Souls Gathered ({players.length})</span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {players.map((player) => (
          <div
            key={player.id}
            className="group/player bg-white/2 p-4 flex items-center justify-between border border-white/5 hover:border-[#8a0303]/50 hover:bg-[#8a0303]/10 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <Avatar
                name={player.name}
                size="sm"
                className="bg-[#030303] border border-[#aa8c55]/30 text-[#aa8c55] group-hover/player:border-[#8a0303] group-hover/player:text-[#ffdddd] transition-colors"
              />
              <div className="flex flex-col">
                <p className="font-bold text-white text-lg tracking-wide font-['Cinzel_Decorative',serif]">{player.name}</p>
                {player.id === hostId && <span className="text-[10px] text-[#aa8c55] uppercase tracking-widest font-sans">Ritual Master</span>}
              </div>
            </div>
            {isHost && player.id !== myPlayerId && (
              <button
                onClick={() => onKick(player)}
                className="p-2 rounded-none border border-[#8a0303]/30 text-[#8a0303] hover:text-[#ffdddd] hover:bg-[#8a0303] transition-all cursor-pointer group-hover/player:border-[#8a0303]"
                title="Banish Soul"
              >
                <Skull className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
