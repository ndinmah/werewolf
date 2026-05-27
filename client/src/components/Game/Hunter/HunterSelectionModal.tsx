import React from 'react';
import { Skull, AlertCircle } from 'lucide-react';
import { Button } from '../../UI/Button';
import { Avatar } from '../../UI/Avatar';
import { ModalOverlay } from '../../UI/ModalOverlay';
import type { Player } from '../../../types/game';

interface HunterSelectionModalProps {
  targets: Pick<Player, 'id' | 'name'>[];
  selectedId: string | null;
  hasConfirmed: boolean;
  onSelect: (id: string) => void;
  onConfirm: () => void;
  onSkip: () => void;
}

export const HunterSelectionModal: React.FC<HunterSelectionModalProps> = ({
  targets,
  selectedId,
  hasConfirmed,
  onSelect,
  onConfirm,
  onSkip,
}) => {
  return (
    <ModalOverlay opacity="dark">
      <div className="w-full max-w-3xl bg-dark border border-red-600 rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative z-10 shadow-[0_0_30px_rgba(220,38,38,0.2)] animate-scale-up">
        <div className="flex flex-col md:flex-row items-center gap-4 border-b border-gray-800 pb-6">
          <div className="p-4 bg-red-950/40 rounded-2xl border border-red-900/30 text-red-500 animate-pulse">
            <Skull className="w-12 h-12" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-white tracking-wide">Lằn Ranh Sinh Tử</h2>
            <p className="text-gray-400 mt-1 max-w-xl">
              Bạn đã hy sinh! Nhưng bản năng Thợ Săn cho phép bạn nổ phát súng cuối cùng để tiêu diệt một mục tiêu đáng
              ngờ.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto max-h-[40vh] pr-1">
          {targets.map((player) => {
            const isSelected = selectedId === player.id;
            return (
              <div
                key={player.id}
                onClick={() => !hasConfirmed && onSelect(player.id)}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none min-h-[100px]
                  ${
                    isSelected
                      ? 'bg-red-950/40 border-red-500 scale-[1.03] shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                      : 'bg-darker border-gray-800 hover:border-gray-700'
                  }
                `}
              >
                <Avatar
                  fallbackIcon={<span>🎯</span>}
                  size="sm"
                  className={`mb-2 ${isSelected ? 'bg-red-600 border-red-400 text-white' : 'bg-gray-800 border-gray-700 text-gray-300'}`}
                />
                <span className="font-bold text-gray-200 text-sm truncate max-w-full">{player.name}</span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center border-t border-gray-800 pt-6">
          <span className="text-xs text-gray-500 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
            <span>Nếu hết thời gian đếm ngược, súng của bạn sẽ bị kẹt!</span>
          </span>
          <div className="flex gap-3">
            <Button
              size="lg"
              disabled={hasConfirmed}
              onClick={onSkip}
              className={`px-5 font-bold tracking-wider border cursor-pointer ${
                hasConfirmed ? 'bg-gray-700 border-gray-600' : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
              }`}
            >
              Bỏ qua
            </Button>
            <Button
              size="lg"
              disabled={!selectedId || hasConfirmed}
              onClick={onConfirm}
              className={`px-8 font-bold tracking-wider cursor-pointer ${
                hasConfirmed ? 'bg-gray-600' : 'bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20'
              }`}
            >
              {hasConfirmed ? 'ĐÃ NỔ SÚNG' : 'BẮN TIÊU DIỆT'}
            </Button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
};
