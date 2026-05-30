import React from 'react';
import { Crosshair, AlertTriangle } from 'lucide-react';
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
    <ModalOverlay opacity="deep">
      <div className="w-full max-w-4xl bg-[#030303] border border-[#8a0303]/50 rounded-none p-8 md:p-12 flex flex-col gap-8 relative z-10 shadow-[0_0_50px_rgba(138,3,3,0.3)] animate-scale-up font-['Cormorant_Garamond',serif]">
        
        {/* Bloody Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#8a0303] rounded-full blur-[200px] opacity-10 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#8a0303] to-transparent"></div>

        <div className="flex flex-col md:flex-row items-center gap-6 border-b border-[#8a0303]/20 pb-8 relative z-10">
          <div className="p-6 bg-[#0a0a0a] rounded-none border border-[#8a0303]/50 shadow-[inset_0_0_20px_rgba(138,3,3,0.3)] text-[#8a0303] animate-pulse">
            <Crosshair className="w-16 h-16" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-['Cinzel_Decorative',serif] text-[#8a0303] tracking-widest uppercase">Phát Đạn Báo Thù</h2>
            <p className="text-gray-400 mt-2 text-xl italic max-w-2xl">
              "Ngươi sắp trút hơi thở cuối cùng, nhưng họng súng vẫn còn một viên đạn bạc. Hãy mang kẻ thủ ác xuống mồ cùng ngươi."
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto max-h-[40vh] pr-2 scrollbar-thin scrollbar-thumb-[#8a0303]/50 scrollbar-track-transparent relative z-10">
          {targets.map((player) => {
            const isSelected = selectedId === player.id;
            return (
              <div
                key={player.id}
                onClick={() => !hasConfirmed && onSelect(player.id)}
                className={`relative p-5 rounded-none border transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer select-none min-h-[140px] overflow-hidden group
                  ${
                    isSelected
                      ? 'bg-[#8a0303]/20 border-[#8a0303] scale-105 shadow-[0_0_20px_rgba(138,3,3,0.4)]'
                      : 'bg-[#0a0a0a] border-white/10 hover:border-white/30 hover:bg-white/5'
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-[#8a0303]/20 to-transparent pointer-events-none"></div>
                )}
                
                <Avatar
                  name={player.name}
                  size="md"
                  className={`mb-3 relative z-10 transition-colors ${isSelected ? 'bg-[#030303] border-[#8a0303] text-[#ffdddd] shadow-[0_0_15px_rgba(138,3,3,0.8)]' : 'bg-[#030303] border-white/20 text-gray-400 group-hover:border-[#8a0303]/50 group-hover:text-[#8a0303]'}`}
                />
                <span className={`font-['Cinzel_Decorative',serif] text-lg tracking-wider relative z-10 transition-colors ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>{player.name}</span>
                
                {isSelected && (
                  <Crosshair className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 text-[#8a0303] opacity-20 animate-pulse pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center border-t border-[#8a0303]/20 pt-8 relative z-10 flex-col md:flex-row gap-4">
          <span className="text-sm font-sans text-gray-400 flex items-center gap-2 tracking-widest uppercase">
            <AlertTriangle className="w-5 h-5 text-[#8a0303] animate-pulse" />
            <span>Nhanh lên, máu đang cạn dần!</span>
          </span>
          <div className="flex gap-4 w-full md:w-auto">
            <Button
              size="lg"
              disabled={hasConfirmed}
              onClick={onSkip}
              variant="secondary"
              className={`flex-1 md:flex-none border-white/20 text-gray-400 hover:text-white hover:border-white/50`}
            >
              CHẾT TRONG IM LẶNG
            </Button>
            <Button
              size="lg"
              disabled={!selectedId || hasConfirmed}
              onClick={onConfirm}
              variant={hasConfirmed ? 'ghost' : 'primary'}
              className={`flex-1 md:flex-none min-w-[200px]`}
            >
              {hasConfirmed ? 'ĐẠN ĐÃ LÊN NÒNG' : 'BÓP CÒ'}
            </Button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
};
