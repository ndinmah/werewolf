import React from 'react';
import { Button } from '../../UI/Button';
import { ModalOverlay } from '../../UI/ModalOverlay';
import type { Player } from '../../../types/game';

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
    <ModalOverlay opacity="light" showStars={false}>
      <div className="bg-darker border border-pink-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl shadow-pink-900/20 relative z-10 animate-scale-up">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-pink-950 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
            <span className="text-3xl">💘</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Đêm Đầu Tiên</h2>
          <p className="text-pink-300">
            Hãy chọn 2 người để ghép đôi. Nếu một người chết, người kia sẽ chết theo vì đau lòng.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
          {targets.map((p) => {
            const isSelected = selectedLovers.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => onToggle(p.id)}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-pink-900/40 border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.2)]'
                    : 'bg-dark border-gray-800 hover:border-gray-600'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-pink-500' : 'border-gray-600'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-pink-500" />}
                </div>
                <span className={`font-semibold ${isSelected ? 'text-pink-100' : 'text-gray-300'}`}>{p.name}</span>
              </button>
            );
          })}
        </div>

        <Button
          onClick={onSubmit}
          disabled={selectedLovers.length !== 2}
          className={`w-full font-bold py-3 cursor-pointer ${
            selectedLovers.length === 2
              ? 'bg-linear-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500'
              : 'bg-gray-800 text-gray-500'
          }`}
        >
          {selectedLovers.length === 2 ? 'Xác nhận ghép đôi' : `Đã chọn ${selectedLovers.length}/2`}
        </Button>
      </div>
    </ModalOverlay>
  );
};
