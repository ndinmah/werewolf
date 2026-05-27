import { useGame } from '../../context/GameContext';
import { useCountdownTimer } from '../../hooks/useCountdownTimer';
import { Clock } from 'lucide-react';

export const PhaseTimer = () => {
  const { gameState } = useGame();
  const secondsLeft = useCountdownTimer(gameState?.timerDuration, gameState?.timerStartAt);

  // Ẩn khi không có timer hoặc chưa có giá trị từ interval lần đầu
  if (!gameState?.timerDuration || !gameState?.timerStartAt || secondsLeft == null) return null;

  // Định dạng mm:ss
  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isLowTime = secondsLeft <= 15;
  const isMediumTime = secondsLeft <= 30 && secondsLeft > 15;

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur transition-all duration-300 font-mono font-bold text-lg
      ${
        isLowTime
          ? 'bg-red-950/40 border-red-500 text-red-400 animate-pulse scale-105 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
          : isMediumTime
            ? 'bg-yellow-950/40 border-yellow-500 text-yellow-400'
            : 'bg-dark/60 border-gray-800 text-gray-300'
      }
    `}
    >
      <Clock className={`w-5 h-5 ${isLowTime ? 'animate-bounce text-red-500' : 'text-gray-400'}`} />
      <span>{formatTime(secondsLeft)}</span>
    </div>
  );
};
