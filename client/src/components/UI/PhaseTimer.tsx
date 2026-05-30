import { useGame } from '../../context/GameContext';
import { useCountdownTimer } from '../../hooks/useCountdownTimer';
import { Hourglass } from 'lucide-react';

const formatTime = (secs: number): string => {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const PhaseTimer = () => {
  const { gameState } = useGame();
  const secondsLeft = useCountdownTimer(gameState?.timerDuration, gameState?.timerStartAt);

  if (!gameState?.timerDuration || !gameState?.timerStartAt || secondsLeft == null) return null;


  const isLowTime = secondsLeft <= 15;
  const isMediumTime = secondsLeft <= 30 && secondsLeft > 15;

  return (
    <div
      className={`flex items-center gap-3 px-5 py-2 border backdrop-blur-xl transition-all duration-300 font-['Cinzel_Decorative',serif] text-xl tracking-widest uppercase
      ${
        isLowTime
          ? 'bg-[#0a0a0a]/80 border-[#8a0303] text-[#ffdddd] animate-pulse shadow-[0_0_20px_rgba(138,3,3,0.5)]'
          : isMediumTime
            ? 'bg-[#0a0a0a]/80 border-[#aa8c55]/80 text-[#aa8c55] shadow-[0_0_15px_rgba(170,140,85,0.2)]'
            : 'bg-[#0a0a0a]/80 border-white/10 text-gray-300'
      }
    `}
    >
      <Hourglass className={`w-5 h-5 ${isLowTime ? 'animate-bounce text-[#8a0303]' : isMediumTime ? 'text-[#aa8c55]' : 'text-gray-400'}`} />
      <span className="min-w-[60px] text-center">{formatTime(secondsLeft)}</span>
    </div>
  );
};
