import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '../../UI/Button';
import type { SeerVision } from '../../../types/game';

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
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in px-4">
      <div className="w-full max-w-md bg-dark border-2 border-purple-500 rounded-2xl p-6 shadow-[0_0_30px_rgba(147,51,234,0.3)] text-center flex flex-col items-center gap-5">
        <div className="p-4 bg-purple-950/50 rounded-full border border-purple-500/30">
          <Search className="w-12 h-12 text-purple-400 animate-pulse" />
        </div>

        {vision ? (
          <>
            <h3 className="text-2xl font-bold text-white tracking-wide">Kết quả Tiên Tri</h3>
            <div className="py-4 px-6 w-full rounded-xl bg-darker border border-gray-800 flex flex-col gap-2">
              <p className="text-gray-400 text-sm">
                Người chơi <span className="font-bold text-white">{vision.targetName}</span> thuộc phe:
              </p>
              <p
                className={`text-2xl font-black uppercase tracking-widest ${
                  vision.isWerewolf ? 'text-red-500 animate-pulse' : 'text-green-400'
                }`}
              >
                {vision.isWerewolf ? '🐺 MA SÓI' : '✅ DÂN LÀNG'}
              </p>
            </div>
            <Button
              size="lg"
              onClick={onConfirm}
              className="w-full bg-purple-600 hover:bg-purple-700 font-bold tracking-wider cursor-pointer"
            >
              XÁC NHẬN & ĐI NGỦ
            </Button>
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold text-white animate-pulse">Đang soi danh tính...</h3>
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </>
        )}
      </div>
    </div>
  );
};
