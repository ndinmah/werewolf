import React from 'react';
import { Button } from '../../UI/Button';
import { Avatar } from '../../UI/Avatar';
import { ModalOverlay } from '../../UI/ModalOverlay';
import { SeerResultModal } from './SeerResultModal';
import type { Player, SeerVision } from '../../../types/game';

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

            const isSeerInvestigated = seerVisions?.some((v) => v.targetId === player.id);
            const investigatedVision = seerVisions?.find((v) => v.targetId === player.id);

            return (
              <div
                key={player.id}
                onClick={() => onSelect(player.id)}
                className={`relative p-4 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center text-center select-none min-h-[120px] cursor-pointer
                  ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 scale-[1.03] shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                      : isSeerInvestigated
                        ? 'bg-purple-950/20 border-purple-900/50 hover:border-purple-750 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
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
                        ? 'bg-indigo-600 border-indigo-400 text-white'
                        : isSeerInvestigated
                          ? 'bg-purple-950 border-purple-800 text-purple-200'
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
                    {isSeerInvestigated && investigatedVision && (
                      <span className="text-[10px] bg-purple-950/85 border border-purple-500/25 text-purple-400 px-1.5 py-0.5 rounded font-bold shadow-sm animate-pulse">
                        {investigatedVision.isWerewolf ? '🐺 Sói' : '✅ Dân'}
                      </span>
                    )}
                  </span>
                </span>
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
            {hasConfirmed ? 'HÀNH ĐỘNG ĐÃ GỬI' : 'SOI DANH TÍNH'}
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
