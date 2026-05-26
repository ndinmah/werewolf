import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useSocket } from '../../context/SocketContext';
import { useParams } from 'react-router-dom';
import { Button } from '../UI/Button';
import { Target, Skull, AlertCircle } from 'lucide-react';

export const HunterRetaliationModal = () => {
  const { id: roomId } = useParams();
  const socket = useSocket();
  const { myPlayer, phase, hunterPrompt, setHunterPrompt, hunterShotResult } = useGame();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const [prevPhase, setPrevPhase] = useState(phase);
  const [prevPrompt, setPrevPrompt] = useState(hunterPrompt);

  if (phase !== prevPhase || hunterPrompt !== prevPrompt) {
    setPrevPhase(phase);
    setPrevPrompt(hunterPrompt);
    setSelectedId(null);
    setHasConfirmed(false);
  }

  const handleConfirm = () => {
    if (!selectedId || hasConfirmed) return;

    socket.emit('HUNTER_SHOOT', { roomId, targetId: selectedId });
    setHasConfirmed(true);
    setHunterPrompt(null); // Ẩn prompt sau khi bắn
  };

  const handleSkip = () => {
    if (hasConfirmed) return;
    socket.emit('HUNTER_SKIP', { roomId });
    setHasConfirmed(true);
    setHunterPrompt(null);
  };


  // Render 1: Banner kết quả phát súng (Cho tất cả người chơi nhìn thấy)
  // Auto-clear được xử lý trong GameContext (5 giây)
  if (hunterShotResult) {
    const { hunterName, targetName } = hunterShotResult;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 animate-fade-in px-4">
        <div className="bg-dark/95 border border-red-500 max-w-xl p-8 rounded-2xl text-center shadow-2xl animate-scale-up">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-red-950/60 border border-red-500/30 rounded-full text-red-500 animate-bounce">
              <Target className="w-16 h-16" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">🔫 Phát Súng Cuối Cùng!</h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Thợ săn <span className="text-red-400 font-extrabold">{hunterName}</span> trước khi trút hơi thở cuối cùng
            đã rút súng nhắm thẳng vào thái dương của <span className="text-red-400 font-extrabold">{targetName}</span>{' '}
            và bóp cò!
          </p>
        </div>
      </div>
    );
  }

  // Nếu phase là retaliation và người chơi đang được prompt
  if (phase === 'hunterRetaliation' && hunterPrompt && myPlayer?.role === 'HUNTER') {
    const targets = hunterPrompt.targetablePlayers || [];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/98 px-4 py-8 overflow-y-auto">
        <div className="absolute inset-0 stars-bg opacity-30 pointer-events-none"></div>

        <div className="w-full max-w-3xl bg-dark border border-red-600 rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative z-10 shadow-[0_0_30px_rgba(220,38,38,0.2)] animate-scale-up">
          <div className="flex flex-col md:flex-row items-center gap-4 border-b border-gray-800 pb-6">
            <div className="p-4 bg-red-950/40 rounded-2xl border border-red-900/30 text-red-500 animate-pulse">
              <Skull className="w-12 h-12" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-extrabold text-white tracking-wide">Lằn Ranh Sinh Tử</h2>
              <p className="text-gray-400 mt-1 max-w-xl">
                Bạn đã hy sinh! Nhưng bản năng Thợ Săn cho phép bạn nổ phát súng cuối cùng để tiêu diệt một mục tiêu
                đáng ngờ.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto max-h-[40vh] pr-1">
            {targets.map((player) => {
              const isSelected = selectedId === player.id;
              return (
                <div
                  key={player.id}
                  onClick={() => handleSelect(player.id)}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none min-h-[100px]
                    ${
                      isSelected
                        ? 'bg-red-950/40 border-red-500 scale-[1.03] shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                        : 'bg-darker border-gray-800 hover:border-gray-700'
                    }
                  `}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 border
                    ${isSelected ? 'bg-red-600 border-red-400 text-white' : 'bg-gray-800 border-gray-700 text-gray-300'}
                  `}
                  >
                    🎯
                  </div>
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
                onClick={handleSkip}
                className={`px-5 font-bold tracking-wider border ${
                  hasConfirmed ? 'bg-gray-700 border-gray-600' : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                }`}
              >
                Bỏ qua
              </Button>
              <Button
                size="lg"
                disabled={!selectedId || hasConfirmed}
                onClick={handleConfirm}
                className={`px-8 font-bold tracking-wider ${
                  hasConfirmed ? 'bg-gray-600' : 'bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20'
                }`}
              >
                {hasConfirmed ? 'ĐÃ NỔ SÚNG' : 'BẮN TIÊU DIỆT'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Nếu ở phase retaliation nhưng bản thân không phải Thợ săn (Hiển thị màn hình chờ nín thở)
  if (phase === 'hunterRetaliation' && myPlayer?.isAlive) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 text-center px-4">
        <div className="absolute inset-0 stars-bg opacity-30 pointer-events-none"></div>
        <Target className="w-20 h-20 text-red-500 animate-spin-slow mb-6" />
        <h2 className="text-3xl font-extrabold text-white mb-2 tracking-wide">Nín Thở Chờ Đợi...</h2>
        <p className="text-gray-400 text-lg max-w-md leading-relaxed">
          Thợ Săn đang hấp hối và có quyền nổ súng kéo theo một người chết cùng. Cầu nguyện rằng họng súng đen ngòm đó
          không chĩa về phía bạn!
        </p>
      </div>
    );
  }

  return null;

  function handleSelect(playerId: string) {
    if (hasConfirmed) return;
    setSelectedId(playerId);
  }
};
