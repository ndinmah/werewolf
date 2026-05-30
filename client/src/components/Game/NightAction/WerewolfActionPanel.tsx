import React from 'react';
import { Button } from '../../UI/Button';
import { Avatar } from '../../UI/Avatar';
import { ModalOverlay } from '../../UI/ModalOverlay';
import type { Player } from '../../../types/game';

interface WerewolfActionPanelProps {
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
  wolfPartnersTargets: Record<string, string>;
  wolfVotes: { votes: Record<string, string>; submitted: string[] };
}

export const WerewolfActionPanel: React.FC<WerewolfActionPanelProps> = ({
  roleHeader,
  targets,
  players,
  myPlayer,
  selectedId,
  onSelect,
  onConfirm,
  hasConfirmed,
  wolfPartnersTargets,
  wolfVotes,
}) => {
  return (
    <ModalOverlay opacity="deep">
      <div
        className={`w-full max-w-4xl bg-[#030303] border border-[#8a0303]/30 rounded-none p-8 md:p-12 flex flex-col gap-8 relative z-10 font-['Cormorant_Garamond',serif] shadow-[0_0_50px_rgba(138,3,3,0.3)]`}
      >
        {/* Bloody Glow background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#8a0303] rounded-full blur-[200px] opacity-10 pointer-events-none"></div>

        {/* Edge highlights */}
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#8a0303] to-transparent"></div>

        {/* Header */}
        <div className="flex flex-col md:flex-row items-center gap-6 border-b border-[#8a0303]/20 pb-8 relative z-10">
          <div className="p-6 bg-[#0a0a0a] rounded-none border border-[#8a0303]/50 shadow-[inset_0_0_20px_rgba(138,3,3,0.5)]">
            {roleHeader.icon}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-['Cinzel_Decorative',serif] text-[#8a0303] tracking-widest uppercase">{roleHeader.title}</h2>
            <p className="text-gray-400 mt-2 text-xl italic max-w-2xl">"{roleHeader.desc}"</p>
          </div>
        </div>

        {/* Grid người chơi */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto max-h-[50vh] pr-2 scrollbar-thin scrollbar-thumb-[#8a0303]/50 scrollbar-track-transparent relative z-10">
          {targets.map((player) => {
            const isSelected = selectedId === player.id;
            const isSelf = player.id === myPlayer.id;

            const fullPlayer = players.find((p) => p.id === player.id);
            const isWolfAlly = fullPlayer?.role === 'WEREWOLF';

            const partnersTargeting = Object.entries(wolfPartnersTargets)
              .filter(([actorName, targetId]) => {
                const wolfPlayer = players.find((x) => x.name === actorName);
                const hasLocked = wolfPlayer && wolfVotes.submitted.includes(wolfPlayer.id);
                return targetId === player.id && !hasLocked;
              })
              .map(([actorName]) => actorName);

            const lockedVotesForPlayer = Object.entries(wolfVotes.votes)
              .filter(([wolfId, targetId]) => targetId === player.id && wolfVotes.submitted.includes(wolfId))
              .map(([wolfId]) => {
                const p = players.find((x) => x.id === wolfId);
                return wolfId === myPlayer.id ? 'Ngươi' : p ? p.name : 'Đồng bọn';
              });

            return (
              <div
                key={player.id}
                onClick={() => onSelect(player.id)}
                className={`relative p-5 rounded-none border transition-all duration-300 flex flex-col items-center justify-center text-center select-none min-h-[140px] cursor-pointer group overflow-hidden
                  ${
                    isSelected
                      ? 'bg-[#8a0303]/20 border-[#8a0303] scale-105 shadow-[0_0_20px_rgba(138,3,3,0.4)]'
                      : isWolfAlly
                        ? 'bg-[#0a0a0a] border-[#8a0303]/30 hover:border-[#8a0303]/70 shadow-[inset_0_0_15px_rgba(138,3,3,0.2)]'
                        : 'bg-[#0a0a0a] border-white/10 hover:border-white/30 hover:bg-white/5'
                  }
                `}
              >
                {/* Selection glow */}
                {isSelected && (
                  <div className="absolute inset-0 bg-linear-to-t from-[#8a0303]/30 to-transparent pointer-events-none"></div>
                )}

                <Avatar
                  name={player.name}
                  size="md"
                  className={`mb-3 relative z-10
                    ${
                      isSelected
                        ? 'bg-[#030303] border-[#8a0303] text-[#ffdddd] shadow-[0_0_10px_rgba(138,3,3,0.8)]'
                        : isWolfAlly
                          ? 'bg-[#030303] border-[#8a0303]/50 text-[#8a0303]'
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
                      <span className="text-[10px] font-sans bg-[#030303] border border-[#8a0303]/50 text-[#8a0303] px-1.5 py-0.5 uppercase tracking-widest">
                        Ngươi
                      </span>
                    )}
                    {isWolfAlly && !isSelf && (
                      <span className="text-[10px] font-sans bg-[#030303] border border-[#8a0303]/50 text-[#8a0303] px-1.5 py-0.5 uppercase tracking-widest">
                        🐺 Đồng loại
                      </span>
                    )}
                  </span>
                </span>

                {/* Sói đang ngắm */}
                {partnersTargeting.length > 0 && (
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-20">
                    {partnersTargeting.map((name) => (
                      <span
                        key={name}
                        className="text-[9px] font-sans bg-[#8a0303] text-white px-2 py-0.5 uppercase tracking-widest shadow animate-pulse"
                        title={`${name} đang nhắm tới`}
                      >
                        🐺 {name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Sói đã chốt */}
                {lockedVotesForPlayer.length > 0 && (
                  <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-20">
                    {lockedVotesForPlayer.map((name) => (
                      <span
                        key={name}
                        className="text-[9px] font-sans bg-[#030303] border border-[#8a0303] text-[#ffdddd] px-2 py-0.5 uppercase tracking-widest shadow"
                        title={`${name} đã chốt`}
                      >
                        🩸 {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center border-t border-[#8a0303]/20 pt-8 mt-4 relative z-10">
          <Button
            size="lg"
            variant={hasConfirmed ? 'ghost' : 'primary'}
            disabled={!selectedId || hasConfirmed}
            onClick={onConfirm}
            className="min-w-[300px]"
          >
            {hasConfirmed ? 'ĐÃ NHUỐM MÁU (CHỜ ĐỒNG LOẠI)' : 'CẮN XÉ'}
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
};
