import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { ChatPanel } from '../components/Game/ChatPanel';
import { VotePanel } from '../components/Game/VotePanel';

export const GamePage = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const { gameState, myPlayer, phase, dayCount } = useGame();

  useEffect(() => {
    if (!gameState) {
      // Nếu không có state, thử về lobby
      navigate(`/room/${roomId}`);
    }
  }, [gameState, navigate, roomId]);

  if (!gameState) return <div className="pt-20 text-center">Đang tải...</div>;

  const getPhaseName = () => {
    switch (phase) {
      case 'night': return 'Ban Đêm';
      case 'day': return 'Ban Ngày';
      case 'VotingPhase': return 'Bỏ Phiếu';
      case 'gameOver': return 'Kết Thúc Game';
      default: return 'Đang xử lý...';
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 container mx-auto max-w-7xl pb-10">
      <div className="stars-bg absolute inset-0 -z-10 opacity-30"></div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mã phòng: <span className="text-wolf-light font-mono">{roomId}</span></h1>
          <p className="text-gray-400 text-lg">
            Ngày thứ {dayCount} — <span className="text-yellow-500 font-bold">{getPhaseName()}</span>
          </p>
        </div>
        
        <div className="bg-darker px-6 py-3 rounded-xl border border-gray-700 flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-400">Bạn là</p>
            <p className="font-bold text-xl text-white">{myPlayer?.name}</p>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border-2
            ${myPlayer?.role === 'werewolf' ? 'bg-red-900 border-red-500 text-red-100' : 'bg-gray-700 border-gray-500 text-white'}
          `}>
            {myPlayer?.role === 'werewolf' ? '🐺' : '🧑'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[70vh]">
        <div className="lg:col-span-1 h-full">
          <ChatPanel />
        </div>
        
        <div className="lg:col-span-3 overflow-y-auto">
          <VotePanel />
        </div>
      </div>
    </div>
  );
};
