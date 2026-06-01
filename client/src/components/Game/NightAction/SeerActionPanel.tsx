import React from 'react';
import { Button } from '../../UI/Button';
import { Avatar } from '../../UI/Avatar';
import { ModalOverlay } from '../../UI/ModalOverlay';
import { SeerResultModal } from './SeerResultModal';
import type { Player, SeerVision } from '../../../types/game';
import { S } from '../../../constants/strings';

interface SeerActionPanelProps {
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
  seerVisions: SeerVision[];
  onCloseResult: () => void;
}

export const SeerActionPanel: React.FC<SeerActionPanelProps> = ({
  roleHeader,
  targets,
  players,
  myPlayer,
  selectedId,
  onSelect,
  onConfirm,
  hasConfirmed,
  seerVisions,
  onCloseResult,
}) => {
  return (
    <ModalOverlay opacity="deep">
      <div
        className={`w-full max-w-4xl bg-[#030303] border border-[#a855f7]/30 rounded-none p-8 md:p-12 flex flex-col gap-8 relative z-10 font-['Cormorant_Garamond',serif] shadow-[0_0_50px_rgba(168,85,247,0.2)]`}
      >
        {/* Mystical Glow background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900 rounded-full blur-[200px] opacity-10 pointer-events-none"></div>

        {/* Edge highlights */}
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#a855f7] to-transparent opacity-80"></div>

        {/* Header */}
        <div className="flex flex-col md:flex-row items-center gap-6 border-b border-[#a855f7]/20 pb-8 relative z-10">
          <div className="p-6 bg-[#0a0a0a] rounded-none border border-[#a855f7]/50 shadow-[inset_0_0_20px_rgba(168,85,247,0.3)]">
            {roleHeader.icon}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-['Cinzel_Decorative',serif] text-[#d8b4fe] tracking-widest uppercase">{roleHeader.title}</h2>
            <p className="text-gray-400 mt-2 text-xl italic max-w-2xl">"{roleHeader.desc}"</p>
          </div>
        </div>

        {/* Grid người chơi */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto max-h-[50vh] pr-2 scrollbar-thin scrollbar-thumb-[#a855f7]/50 scrollbar-track-transparent relative z-10">
          {targets
            .filter((player) => player.id !== myPlayer.id)
            .map((player) => {
              const isSelected = selectedId === player.id;
              const isSelf = player.id === myPlayer.id;

            const fullPlayer = players.find((p) => p.id === player.id);

            const isSeerInvestigated = seerVisions?.some((v) => v.targetId === player.id);
            const investigatedVision = seerVisions?.find((v) => v.targetId === player.id);

            return (
              <div
                key={player.id}
                onClick={() => onSelect(player.id)}
                className={`relative p-5 rounded-none border transition-all duration-300 flex flex-col items-center justify-center text-center select-none min-h-[140px] cursor-pointer group overflow-hidden
                  ${
                    isSelected
                      ? 'bg-[#a855f7]/20 border-[#a855f7] scale-105 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                      : isSeerInvestigated
                        ? 'bg-[#0a0a0a] border-[#a855f7]/30 hover:border-[#a855f7]/70 shadow-[inset_0_0_15px_rgba(168,85,247,0.1)]'
                        : 'bg-[#0a0a0a] border-white/10 hover:border-white/30 hover:bg-white/5'
                  }
                `}
              >
                {/* Selection glow */}
                {isSelected && (
                  <div className="absolute inset-0 bg-linear-to-t from-[#a855f7]/30 to-transparent pointer-events-none"></div>
                )}

                <Avatar
                  name={player.name}
                  size="md"
                  className={`mb-3 relative z-10
                    ${
                      isSelected
                        ? 'bg-[#030303] border-[#a855f7] text-[#f3e8ff] shadow-[0_0_10px_rgba(168,85,247,0.8)]'
                        : isSeerInvestigated
                          ? 'bg-[#030303] border-[#a855f7]/50 text-[#d8b4fe]'
                          : 'bg-[#030303] border-white/20 text-gray-300'
                    }
                  `}
                />

                <span className="font-['Cinzel_Decorative',serif] text-lg tracking-wider text-gray-200 flex flex-col items-center gap-1 relative z-10 group-hover:text-white transition-colors">
                  <span>{player.name}</span>
                  <span className="flex gap-2 flex-wrap justify-center mt-1">
                    {fullPlayer?.isLover && (
                      <span className="text-[10px] font-sans bg-[#030303] border border-pink-500/30 text-pink-500 px-1.5 py-0.5 uppercase tracking-widest animate-pulse">
                        ❤️
                      </span>
                    )}
                    {isSelf && (
                      <span className="text-[10px] font-sans bg-[#030303] border border-[#a855f7]/50 text-[#a855f7] px-1.5 py-0.5 uppercase tracking-widest">
                        {S.nightAction.badgeYou}
                      </span>
                    )}
                    {isSeerInvestigated && investigatedVision && (
                      <span className="text-[10px] font-sans bg-[#030303] border border-[#a855f7]/50 text-[#d8b4fe] px-1.5 py-0.5 uppercase tracking-widest animate-pulse shadow-sm">
                        {investigatedVision.isWerewolf ? S.seer.badgeWerewolf : S.seer.badgeVillager}
                      </span>
                    )}
                  </span>
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center border-t border-[#a855f7]/20 pt-8 mt-4 relative z-10">
          <Button
            size="lg"
            variant={hasConfirmed ? 'ghost' : 'secondary'}
            disabled={!selectedId || hasConfirmed}
            onClick={onConfirm}
            className={`min-w-[300px] ${!hasConfirmed && 'border-[#a855f7] text-[#a855f7] hover:bg-[#a855f7]/10'}`}
          >
            {hasConfirmed ? S.seer.btnDone : S.seer.btnReveal}
          </Button>
        </div>
      </div>

      {hasConfirmed && selectedId && (
        <SeerResultModal
          selectedId={selectedId}
          seerVisions={seerVisions}
          onConfirm={onCloseResult}
        />
      )}
    </ModalOverlay>
  );
};
