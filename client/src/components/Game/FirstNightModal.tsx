import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useSocket } from '../../context/SocketContext';
import { useParams } from 'react-router-dom';
import { Button } from '../UI/Button';

export const FirstNightModal = () => {
  const { id: roomId } = useParams();
  const { phase, myPlayer, wolfReveal, nightActionPrompt } = useGame();
  const socket = useSocket();

  const [selectedLovers, setSelectedLovers] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  if (phase !== 'firstNight') return null;

  // Xử lý nộp lựa chọn của Cupid
  const handleCupidSubmit = () => {
    if (selectedLovers.length === 2 && !hasSubmitted) {
      socket?.emit('CUPID_ACTION', {
        roomId,
        lover1Id: selectedLovers[0],
        lover2Id: selectedLovers[1],
      });
      setHasSubmitted(true);
    }
  };

  const toggleLover = (id: string) => {
    setSelectedLovers((prev) => {
      if (prev.includes(id)) {
        return prev.filter((l) => l !== id);
      }
      if (prev.length < 2) {
        return [...prev, id];
      }
      return prev;
    });
  };

  // 1. Nếu là Cupid và đang được hỏi chọn người tình
  if (myPlayer?.role === 'CUPID' && nightActionPrompt?.role === 'CUPID' && !hasSubmitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-darker border border-pink-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl shadow-pink-900/20">
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
            {nightActionPrompt.targetablePlayers.map((p) => {
              const isSelected = selectedLovers.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleLover(p.id)}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
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
            onClick={handleCupidSubmit}
            disabled={selectedLovers.length !== 2}
            className={`w-full font-bold py-3 ${
              selectedLovers.length === 2
                ? 'bg-linear-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500'
                : 'bg-gray-800 text-gray-500'
            }`}
          >
            {selectedLovers.length === 2 ? 'Xác nhận ghép đôi' : `Đã chọn ${selectedLovers.length}/2`}
          </Button>
        </div>
      </div>
    );
  }

  // 2. Nếu là Ma Sói và đã nhận được dữ liệu wolfReveal
  if (wolfReveal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
        <div className="bg-darker border border-red-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-red-900/30 text-center">
          <div className="w-20 h-20 bg-red-950 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse">
            <span className="text-4xl">🐺</span>
          </div>
          <h2 className="text-3xl font-black text-red-500 tracking-wider uppercase mb-2">Đồng Bọn Ma Sói</h2>

          <div className="space-y-3">
            <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-xl">
              <span className="text-red-300 font-bold text-lg">{myPlayer?.name} (Bạn)</span>
            </div>

            {wolfReveal.teammates.length > 0 ? (
              wolfReveal.teammates.map((teammate) => (
                <div key={teammate.id} className="p-4 bg-dark border border-gray-800 rounded-xl shadow-inner">
                  <span className="text-gray-200 font-semibold text-lg">{teammate.name}</span>
                </div>
              ))
            ) : (
              <div className="p-4 bg-dark border border-gray-800 rounded-xl border-dashed">
                <span className="text-gray-500 italic">Bạn là con Sói duy nhất lẻ loi...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Mặc định: Chờ đợi trong đêm đầu tiên (Dân làng, các vai trò khác, hoặc Sói chờ Cupid)
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-1000">
      <div className="text-center px-4">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-900/20 border border-blue-500/20 mb-6 shadow-[0_0_40px_rgba(59,130,246,0.1)]">
          <span className="text-5xl opacity-50">🌙</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-bold text-blue-100 mb-3 tracking-wide">Đêm Đầu Tiên</h2>
        <p className="text-blue-300/60 text-lg md:text-xl">
          Xin hãy nhắm mắt lại. Chỉ có một số vai trò đặc biệt được phép thức dậy...
        </p>
      </div>
    </div>
  );
};
