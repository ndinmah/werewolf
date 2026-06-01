import React from 'react';
import { Eye } from 'lucide-react';
import { Button } from '../../UI/Button';
import type { SeerVision } from '../../../types/game';
import { S } from '../../../constants/strings';

interface SeerResultModalProps {
  selectedId: string;
  seerVisions: SeerVision[];
  onConfirm: () => void;
}

export const SeerResultModal: React.FC<SeerResultModalProps> = ({
  selectedId,
  seerVisions,
  onConfirm,
}) => {
  const vision = seerVisions?.find((v) => v.targetId === selectedId);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-[#030303]/90 backdrop-blur-xl animate-fade-in px-4 font-['Cormorant_Garamond',serif]">
      {/* Mystical Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#a855f7] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

      <div className="w-full max-w-lg bg-[#0a0a0a] border border-[#a855f7]/50 rounded-none p-10 shadow-[0_0_50px_rgba(168,85,247,0.3)] text-center flex flex-col items-center gap-6 relative z-10 overflow-hidden">
        {/* Edge line */}
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#a855f7] to-transparent"></div>

        <div className="p-6 bg-[#030303] rounded-none border border-[#a855f7]/50 shadow-[inset_0_0_20px_rgba(168,85,247,0.5)]">
          <Eye className="w-16 h-16 text-[#d8b4fe] animate-pulse" />
        </div>

        {vision ? (
          <>
            <h3 className="text-3xl font-['Cinzel_Decorative',serif] text-[#d8b4fe] tracking-widest uppercase">{S.seer.resultTitle}</h3>
            <div className="py-6 px-8 w-full bg-[#030303] border border-[#a855f7]/20 flex flex-col gap-4 relative">
              <div className="absolute top-0 left-0 w-full h-full bg-[#a855f7]/5 pointer-events-none"></div>
              <p className="text-gray-400 text-xl italic relative z-10">
                {S.seer.resultNarrative(vision.targetName)}
              </p>
              <p
                className={`text-4xl font-['Cinzel_Decorative',serif] uppercase tracking-[0.2em] relative z-10 mt-2 ${
                  vision.isWerewolf ? 'text-[#8a0303] drop-shadow-[0_0_10px_rgba(138,3,3,0.8)]' : 'text-[#aa8c55] drop-shadow-[0_0_10px_rgba(170,140,85,0.8)]'
                }`}
              >
                {vision.isWerewolf ? S.seer.resultWerewolf : S.seer.resultVillager}
              </p>
            </div>
            <Button
              size="lg"
              onClick={onConfirm}
              variant="secondary"
              className="w-full mt-4 border-[#a855f7]/50 text-[#d8b4fe] hover:bg-[#a855f7]/10"
            >
              {S.seer.btnClose}
            </Button>
          </>
        ) : (
          <>
            <h3 className="text-2xl font-['Cinzel_Decorative',serif] text-[#d8b4fe] tracking-widest uppercase animate-pulse">{S.seer.resultLoading}</h3>
            <div className="w-12 h-12 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin mt-4"></div>
          </>
        )}
      </div>
    </div>
  );
};
