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
    <ModalOverlay opacity="dark">
      <div
        className={`w-full max-w-4xl bg-dark/95 border backdrop-blur-md rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative z-10 ${roleHeader.color}`}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center gap-4 border-b border-gray-800 pb-6">
          <div className="p-4 bg-darker rounded-2xl border border-gray-800">{roleHeader.icon}</div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-white tracking-wide">{roleHeader.title}</h2>
            <p className="text-gray-400 mt-1 max-w-2xl">{roleHeader.desc}</p>
          </div>
        </div>

        {/* Grid người chơi */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[50vh] pr-2">
          {targets.map((player) => {
            const isSelected = selectedId === player.id;
            const isSelf = player.id === myPlayer.id;

            const fullPlayer = players.find((p) => p.id === player.id);
            const isWolfAlly = fullPlayer?.role === 'WEREWOLF';

            // Xem có đồng bọn sói nào đang nhắm vào người này không (nháp)
            const partnersTargeting = Object.entries(wolfPartnersTargets)
              .filter(([actorName, targetId]) => {
                const wolfPlayer = players.find((x) => x.name === actorName);
                const hasLocked = wolfPlayer && wolfVotes.submitted.includes(wolfPlayer.id);
                return targetId === player.id && !hasLocked;
              })
              .map(([actorName]) => actorName);

            // Danh sách Sói đã chốt (locked) mục tiêu này
            const lockedVotesForPlayer = Object.entries(wolfVotes.votes)
              .filter(([wolfId, targetId]) => targetId === player.id && wolfVotes.submitted.includes(wolfId))
              .map(([wolfId]) => {
                const p = players.find((x) => x.id === wolfId);
                return wolfId === myPlayer.id ? 'Bạn' : p ? p.name : 'Đồng bọn';
              });

            return (
              <div
                key={player.id}
                onClick={() => onSelect(player.id)}
                className={`relative p-4 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center text-center select-none min-h-[120px] cursor-pointer
                  ${
                    isSelected
                      ? 'bg-red-950/40 border-red-500 scale-[1.03] shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                      : isWolfAlly
                        ? 'bg-red-950/20 border-red-900/50 hover:border-red-750 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                        : 'bg-darker/80 border-gray-800 hover:border-gray-700'
                  }
                `}
              >
                <Avatar
                  name={player.name}
                  size="md"
                  className={`mb-2
                    ${
                      isSelected
                        ? 'bg-red-600 border-red-400 text-white'
                        : isWolfAlly
                          ? 'bg-red-950 border-red-800 text-red-200'
                          : 'bg-gray-800 border-gray-700 text-gray-300'
                    }
                  `}
                />

                <span className="font-bold text-gray-200 text-sm truncate max-w-full flex flex-col items-center gap-1">
                  <span>{player.name}</span>
                  <span className="flex gap-1 flex-wrap justify-center">
                    {fullPlayer?.isLover && (
                      <span className="text-[10px] bg-pink-950/80 border border-pink-500/20 text-pink-400 px-1 py-0.5 rounded font-bold animate-pulse">
                        ❤️ Người tình
                      </span>
                    )}
                    {isSelf && (
                      <span className="text-[10px] bg-indigo-950/80 border border-indigo-500/20 text-indigo-400 px-1 py-0.5 rounded font-semibold">
                        (Bạn)
                      </span>
                    )}
                    {isWolfAlly && !isSelf && (
                      <span className="text-[10px] bg-red-950/80 border border-red-500/20 text-red-400 px-1 py-0.5 rounded font-bold">
                        🐺 Đồng minh
                      </span>
                    )}
                    {isWolfAlly && isSelf && (
                      <span className="text-[10px] bg-red-950/80 border border-red-500/20 text-red-400 px-1 py-0.5 rounded font-bold">
                        🐺
                      </span>
                    )}
                  </span>
                </span>

                {/* Hiển thị đồng bọn sói đang chọn (nháp) */}
                {partnersTargeting.length > 0 && (
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-20">
                    {partnersTargeting.map((name) => (
                      <span
                        key={name}
                        className="text-[9px] bg-red-600/90 text-white px-1.5 py-0.5 rounded-full font-bold shadow animate-bounce"
                        title={`${name} đang ngắm`}
                      >
                        🐺 {name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Hiển thị đồng bọn sói đã chốt */}
                {lockedVotesForPlayer.length > 0 && (
                  <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-20">
                    {lockedVotesForPlayer.map((name) => (
                      <span
                        key={name}
                        className="text-[9px] bg-red-800 border border-red-600 text-white px-1.5 py-0.5 rounded-full font-bold shadow"
                        title={`${name} đã chốt`}
                      >
                        🗳️ {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-4 border-t border-gray-800 pt-6 mt-2">
          <Button
            size="lg"
            disabled={!selectedId || hasConfirmed}
            onClick={onConfirm}
            className={`px-8 font-bold tracking-wider ${
              hasConfirmed
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20'
            }`}
          >
            {hasConfirmed ? 'ĐÃ CHỐT (ĐANG CHỜ ĐỒNG ĐỘI...)' : 'CHỐT HÀNH ĐỘNG'}
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
};
