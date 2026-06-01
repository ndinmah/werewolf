import React from 'react';
import { Button } from '../../UI/Button';
import { ModalOverlay } from '../../UI/ModalOverlay';
import { Heart } from 'lucide-react';
import type { Player } from '../../../types/game';
import { S } from '../../../constants/strings';

interface CupidSelectionModalProps {
  targets: Pick<Player, 'id' | 'name'>[];
  selectedLovers: string[];
  onToggle: (id: string) => void;
  onSubmit: () => void;
}

export const CupidSelectionModal: React.FC<CupidSelectionModalProps> = ({
  targets,
  selectedLovers,
  onToggle,
  onSubmit,
}) => {
  return (
    <ModalOverlay opacity="deep" showStars={false}>
      <div className="bg-[#030303] border border-[#be185d]/50 rounded-none p-10 max-w-2xl w-full shadow-[0_0_50px_rgba(190,24,93,0.3)] relative z-10 animate-scale-up font-['Cormorant_Garamond',serif]">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-[#be185d]/20 to-transparent pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="w-20 h-20 bg-[#0a0a0a] rounded-none flex items-center justify-center mx-auto mb-6 border border-[#be185d]/50 shadow-[inset_0_0_20px_rgba(190,24,93,0.5)]">
            <Heart className="w-10 h-10 text-[#fbcfe8] fill-[#be185d] animate-pulse" />
          </div>
          <h2 className="text-4xl font-['Cinzel_Decorative',serif] text-[#fbcfe8] tracking-widest uppercase mb-4 drop-shadow-[0_0_10px_rgba(190,24,93,0.8)]">
            {S.cupid.title}
          </h2>
          <div className="h-px w-32 bg-linear-to-r from-transparent via-[#be185d] to-transparent mx-auto mb-6"></div>
          <p className="text-gray-300 text-xl italic leading-relaxed">
            {S.cupid.story}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#be185d]/50 scrollbar-track-transparent relative z-10">
          {targets.map((p) => {
            const isSelected = selectedLovers.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => onToggle(p.id)}
                className={`p-4 rounded-none border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer min-h-[100px] group overflow-hidden relative
                  ${
                    isSelected
                      ? 'bg-[#be185d]/20 border-[#be185d] shadow-[0_0_15px_rgba(190,24,93,0.4)]'
                      : 'bg-[#0a0a0a] border-white/10 hover:border-[#be185d]/50 hover:bg-white/5'
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute inset-0 bg-linear-to-t from-[#be185d]/30 to-transparent pointer-events-none"></div>
                )}
                <div
                  className={`w-6 h-6 rounded-none border flex items-center justify-center rotate-45 transition-colors relative z-10 ${
                    isSelected
                      ? 'border-[#be185d] bg-[#030303]'
                      : 'border-white/30 bg-[#030303] group-hover:border-[#be185d]/50'
                  }`}
                >
                  {isSelected && <div className="w-3 h-3 bg-[#be185d]" />}
                </div>
                <span
                  className={`font-['Cinzel_Decorative',serif] text-lg tracking-wider relative z-10 transition-colors ${isSelected ? 'text-[#fbcfe8]' : 'text-gray-300 group-hover:text-white'}`}
                >
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center border-t border-[#be185d]/30 pt-8 relative z-10">
          <Button
            size="lg"
            onClick={onSubmit}
            disabled={selectedLovers.length !== 2}
            className={`min-w-[300px] border font-['Cinzel_Decorative',serif] text-lg tracking-widest uppercase cursor-pointer transition-all duration-300 ${
              selectedLovers.length === 2
                ? 'bg-[#be185d] border-[#be185d] text-[#030303] shadow-[0_0_20px_rgba(190,24,93,0.5)] hover:bg-[#9d174d]'
                : 'bg-transparent border-white/20 text-gray-500 hover:bg-white/5'
            }`}
          >
            {S.cupid.btnReady(selectedLovers.length)}
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
};
