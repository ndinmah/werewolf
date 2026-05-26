import { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Sun, Skull, Heart } from 'lucide-react';

export const NarratorScreen = () => {
  const { phase, gameState } = useGame();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const nightDeaths = gameState?.nightDeaths || [];
  const hasDeaths = nightDeaths.length > 0;

  useEffect(() => {
    if (phase !== 'dayStart' || !gameState?.timerDuration || !gameState?.timerStartAt) return;

    const timerDuration = gameState.timerDuration;
    const timerStartAt = gameState.timerStartAt;

    const interval = setInterval(() => {
      const elapsed = Date.now() - timerStartAt;
      const remaining = Math.max(0, timerDuration - elapsed);
      setTimeLeft(Math.ceil(remaining / 1000));
    }, 500);

    return () => clearInterval(interval);
  }, [phase, gameState?.timerDuration, gameState?.timerStartAt]);

  if (phase !== 'dayStart') return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-center animate-fade-in px-4">
      {/* Sun/Morning light overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900 to-amber-950/20 pointer-events-none"></div>

      {/* Animated glowing rays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

      <div className="max-w-2xl bg-dark/70 backdrop-blur border border-gray-800 p-8 rounded-2xl relative z-10 shadow-2xl animate-scale-up">
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          {hasDeaths ? (
            <div className="p-5 bg-red-950/50 rounded-full border border-red-500/30 text-red-500 animate-bounce">
              <Skull className="w-16 h-16" />
            </div>
          ) : (
            <div className="p-5 bg-green-950/50 rounded-full border border-green-500/30 text-green-400 animate-pulse">
              <Heart className="w-16 h-16 animate-pulse" />
            </div>
          )}
        </div>

        {/* Title */}
        <div className="flex items-center justify-center gap-2 text-amber-500 font-extrabold text-2xl tracking-wide uppercase mb-4">
          <Sun className="w-6 h-6 animate-spin-slow" />
          <span>Bình Minh Ló Dạng</span>
        </div>

        {/* Story text */}
        <p className="text-gray-300 text-lg leading-relaxed mb-8">
          {hasDeaths
            ? 'Tiếng gà gáy vang lên phá tan bầu không khí tĩnh mịch... Dân làng thức giấc và bàng hoàng phát hiện một cảnh tượng đẫm máu. Đêm qua, thế lực hắc ám đã ra tay tàn nhẫn.'
            : 'Ánh bình minh ấm áp chiếu rọi xuống ngôi làng. Thật kỳ diệu, đêm qua trôi qua trong bình yên vô sự. Tất cả mọi người đều sống sót!'}
        </p>

        {/* Victim Information */}
        {hasDeaths && (
          <div className="space-y-4 mb-8">
            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Danh sách nạn nhân:</p>
            <div className="flex flex-wrap justify-center gap-4">
              {nightDeaths.map((victim) => (
                <div
                  key={victim.id}
                  className="bg-darker/90 border border-red-500/20 px-6 py-4 rounded-xl flex flex-col items-center min-w-[200px]"
                >
                  <div className="w-12 h-12 rounded-full bg-red-950 text-red-400 border border-red-500/30 flex items-center justify-center text-xl font-bold mb-2">
                    💀
                  </div>
                  <span className="font-extrabold text-white text-lg">{victim.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Countdown footer */}
        <div className="flex flex-col items-center">
          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden max-w-xs mb-3">
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{
                width: `${gameState?.timerDuration && timeLeft != null ? ((timeLeft * 1000) / gameState.timerDuration) * 100 : 100}%`,
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            {timeLeft != null ? `Thảo luận chung sẽ bắt đầu sau ${timeLeft} giây...` : 'Đang tải...'}
          </p>
        </div>
      </div>
    </div>
  );
};
