import React from 'react';
import { Button } from '../../UI/Button';
import { ModalOverlay } from '../../UI/ModalOverlay';
import { Avatar } from '../../UI/Avatar';
import type { Player } from '../../../types/game';
import { S } from '../../../constants/strings';

interface DefaultActionPanelProps {
  roleHeader: {
    title: string;
    desc: string;
    icon: React.ReactNode;
    color: string;
  };
  targets: Pick<Player, 'id' | 'name' | 'isAlive'>[];
  players: Player[];
  myPlayer: Player;
  selectedId: string | null;
  onSelect: (playerId: string) => void;
  onConfirm: () => void;
  hasConfirmed: boolean;
  excludeTargetId?: string | null;
}

export const DefaultActionPanel: React.FC<DefaultActionPanelProps> = ({
  roleHeader,
  targets,
  players,
  myPlayer,
  selectedId,
  onSelect,
  onConfirm,
  hasConfirmed,
  excludeTargetId,
}) => {
  return (
    <ModalOverlay opacity="deep">
      <div
        className={`w-full max-w-4xl bg-[#030303] border border-white/20 rounded-none p-8 md:p-12 flex flex-col gap-8 relative z-10 font-['Cormorant_Garamond',serif] shadow-[0_0_50px_rgba(255,255,255,0.05)]`}
      >
        {/* Glow background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white rounded-full blur-[200px] opacity-[0.03] pointer-events-none"></div>

        {/* Edge highlights */}
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/50 to-transparent opacity-80"></div>

        {/* Header */}
        <div className="flex flex-col md:flex-row items-center gap-6 border-b border-white/10 pb-8 relative z-10">
          <div className="p-6 bg-[#0a0a0a] rounded-none border border-white/20 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]">
            {roleHeader.icon}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-['Cinzel_Decorative',serif] text-white tracking-widest uppercase">{roleHeader.title}</h2>
            <p className="text-gray-400 mt-2 text-xl italic max-w-2xl">"{roleHeader.desc}"</p>
          </div>
        </div>

        {/* Grid người chơi */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto max-h-[50vh] pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent relative z-10">
          {targets.map((player) => {
            const isExcluded = player.id === excludeTargetId;
            const isSelected = selectedId === player.id;
            const isSelf = player.id === myPlayer.id;

            const fullPlayer = players.find((p) => p.id === player.id);

            return (
              <div
                key={player.id}
                onClick={() => !isExcluded && onSelect(player.id)}
                className={`relative p-5 rounded-none border transition-all duration-300 flex flex-col items-center justify-center text-center select-none min-h-[140px] overflow-hidden group
                  ${
                    isExcluded
                      ? 'bg-[#030303] border-[#8a0303]/30 opacity-50 cursor-not-allowed'
                      : isSelected
                        ? 'bg-white/10 border-white scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)] cursor-pointer'
                        : 'bg-[#0a0a0a] border-white/10 hover:border-white/40 hover:bg-white/5 cursor-pointer'
                  }
                `}
              >
                {/* Selection glow */}
                {isSelected && (
                  <div className="absolute inset-0 bg-linear-to-t from-white/10 to-transparent pointer-events-none"></div>
                )}

                <Avatar
                  name={player.name}
                  size="md"
                  className={`mb-3 relative z-10
                    ${
                      isSelected
                        ? 'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                        : isExcluded
                          ? 'bg-[#030303] border-[#8a0303]/50 text-[#8a0303]/50'
                          : 'bg-[#030303] border-white/20 text-gray-300 group-hover:border-white/50 group-hover:text-white'
                    }
                  `}
                />

                <span className={`font-['Cinzel_Decorative',serif] text-lg tracking-wider flex flex-col items-center gap-1 relative z-10 transition-colors ${isSelected ? 'text-white' : isExcluded ? 'text-[#8a0303]/50' : 'text-gray-300 group-hover:text-white'}`}>
                  <span>{player.name}</span>
                  <span className="flex gap-2 flex-wrap justify-center mt-1">
                    {fullPlayer?.isLover && (
                      <span className="text-[10px] font-sans bg-[#030303] border border-pink-500/30 text-pink-500 px-1.5 py-0.5 uppercase tracking-widest animate-pulse">
                        {S.nightAction.badgeLover}
                      </span>
                    )}
                    {isSelf && (
                      <span className={`text-[10px] font-sans bg-[#030303] px-1.5 py-0.5 uppercase tracking-widest border ${isSelected ? 'border-white text-white' : 'border-white/30 text-gray-400'}`}>
                        {S.nightAction.badgeYou}
                      </span>
                    )}
                  </span>
                </span>

                {isExcluded && (
                  <span className="text-[10px] text-[#8a0303] font-sans uppercase tracking-widest mt-2 border border-[#8a0303]/30 px-2 py-0.5 bg-[#030303]">
                    {S.nightAction.badgeInviolable}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center border-t border-white/10 pt-8 mt-4 relative z-10">
          <Button
            size="lg"
            variant={hasConfirmed ? 'ghost' : 'secondary'}
            disabled={!selectedId || hasConfirmed}
            onClick={onConfirm}
            className={`min-w-[300px] ${!hasConfirmed && 'border-white text-white hover:bg-white hover:text-black'}`}
          >
            {hasConfirmed ? S.defaultAction.btnDone : S.defaultAction.btnConfirm}
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
};
