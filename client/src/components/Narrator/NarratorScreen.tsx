import { useGame } from '../../context/GameContext';
import { useCountdownTimer } from '../../hooks/useCountdownTimer';
import { Sun, Skull, Heart } from 'lucide-react';

export const NarratorScreen = () => {
  const { phase, gameState } = useGame();

  const nightDeaths = gameState?.nightDeaths || [];
  const hasDeaths = nightDeaths.length > 0;

  const timeLeft = useCountdownTimer(
    phase === 'dayStart' ? gameState?.timerDuration : undefined,
    phase === 'dayStart' ? gameState?.timerStartAt : undefined
  );

  if (phase !== 'dayStart') return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030303] text-center animate-fade-in px-4 font-['Cormorant_Garamond',serif]">
      {/* Sun/Morning light overlay */}
      <div className={`absolute inset-0 pointer-events-none ${hasDeaths ? 'bg-linear-to-t from-[#030303] via-[#030303] to-[#4a0000]/20' : 'bg-linear-to-t from-[#030303] via-[#030303] to-[#aa8c55]/20'}`}></div>

      {/* Animated glowing rays */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[150px] -z-10 animate-pulse duration-5000 ${hasDeaths ? 'bg-[#8a0303]/10' : 'bg-[#aa8c55]/10'}`}></div>

      <div className="max-w-2xl bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/5 p-12 relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-scale-up overflow-hidden group">
        {/* Edge highlights */}
        <div className={`absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent ${hasDeaths ? 'via-[#8a0303]' : 'via-[#aa8c55]'} to-transparent opacity-50`}></div>

        {/* Header Icon */}
        <div className="flex justify-center mb-8 relative">
          <div className={`absolute inset-0 blur-[30px] opacity-50 ${hasDeaths ? 'bg-[#8a0303]' : 'bg-[#aa8c55]'}`}></div>
          {hasDeaths ? (
            <div className="relative p-6 bg-[#030303] rounded-full border border-[#8a0303]/50 text-[#8a0303] animate-bounce shadow-[inset_0_0_20px_rgba(138,3,3,0.5)]">
              <Skull className="w-16 h-16" />
            </div>
          ) : (
            <div className="relative p-6 bg-[#030303] rounded-full border border-[#aa8c55]/50 text-[#aa8c55] animate-pulse shadow-[inset_0_0_20px_rgba(170,140,85,0.5)]">
              <Heart className="w-16 h-16" />
            </div>
          )}
        </div>

        {/* Title */}
        <div className={`flex items-center justify-center gap-4 ${hasDeaths ? 'text-[#8a0303]' : 'text-[#aa8c55]'} font-['Cinzel_Decorative',serif] text-4xl tracking-widest uppercase mb-6`}>
          <Sun className="w-8 h-8 animate-spin-slow" />
          <span>Bình Minh Ló Dạng</span>
        </div>

        {/* Story text */}
        <p className="text-gray-300 text-xl leading-relaxed mb-10 italic px-4 border-l-2 border-r-2 border-white/10">
          {hasDeaths
            ? '"Mặt trời mọc không thể xóa nhòa vết máu trong đêm. Một linh hồn đã vĩnh viễn rời bỏ trần thế."'
            : '"Ánh sáng thanh tẩy xua tan bóng tối. Không một ai phải đổ máu đêm qua. Phép màu đã xuất hiện."'}
        </p>

        {/* Victim Information */}
        {hasDeaths && (
          <div className="space-y-6 mb-10">
            <p className="text-sm text-[#8a0303] font-sans font-bold uppercase tracking-[0.3em]">Danh sách tử nạn:</p>
            <div className="flex flex-wrap justify-center gap-6">
              {nightDeaths.map((victim) => (
                <div
                  key={victim.id}
                  className="bg-[#030303] border border-[#8a0303]/30 px-8 py-5 flex flex-col items-center min-w-[220px] relative overflow-hidden group/victim"
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-[#8a0303]/5 opacity-0 group-hover/victim:opacity-100 transition-opacity"></div>
                  <div className="w-12 h-12 rounded-none bg-[#8a0303]/10 text-[#8a0303] border border-[#8a0303]/50 flex items-center justify-center text-xl font-bold mb-3 shadow-[0_0_10px_rgba(138,3,3,0.3)]">
                    <Skull className="w-6 h-6" />
                  </div>
                  <span className="font-['Cinzel_Decorative',serif] text-[#ffdddd] text-2xl tracking-widest">{victim.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Countdown footer */}
        <div className="flex flex-col items-center mt-8">
          <div className="w-full bg-white/5 h-[2px] overflow-hidden max-w-sm mb-4">
            <div
              className={`h-full transition-all duration-500 ${hasDeaths ? 'bg-[#8a0303]' : 'bg-[#aa8c55]'}`}
              style={{
                width: `${gameState?.timerDuration && timeLeft != null ? ((timeLeft * 1000) / gameState.timerDuration) * 100 : 100}%`,
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-[0.2em] font-sans">
            {timeLeft != null ? `Hội đồng phán xét bắt đầu sau ${timeLeft} giây...` : 'Đang triệu tập hội đồng...'}
          </p>
        </div>
      </div>
    </div>
  );
};
