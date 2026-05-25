import { useGame } from '../../context/GameContext';
import { Scale, HeartCrack } from 'lucide-react';

export const VotingResultBanner = () => {
  const { votingResult } = useGame();

  if (!votingResult) return null;

  const { eliminated: eliminatedPlayer, isTie } = votingResult;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-slide-down">
      <div
        className={`p-6 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center gap-4
        ${
          eliminatedPlayer
            ? 'bg-red-950/90 border-red-500/30 text-white shadow-[0_10px_30px_rgba(220,38,38,0.2)]'
            : 'bg-slate-900/90 border-indigo-500/30 text-indigo-200'
        }
      `}
      >
        {/* Banner Icon */}
        <div
          className={`p-3.5 rounded-xl bg-opacity-20 border
          ${
            eliminatedPlayer
              ? 'bg-red-500 border-red-500/30 text-red-400'
              : 'bg-indigo-500 border-indigo-500/30 text-indigo-400'
          }
        `}
        >
          {eliminatedPlayer ? <HeartCrack className="w-8 h-8 animate-pulse" /> : <Scale className="w-8 h-8" />}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-extrabold text-xl tracking-wide uppercase">
            {eliminatedPlayer ? '⚖️ Kết quả biểu quyết' : '🤝 Không ai bị treo cổ'}
          </h3>
          <p className="text-gray-300 text-sm mt-1 leading-relaxed">
            {eliminatedPlayer ? (
              <>
                Dân làng đồng lòng treo cổ <span className="font-extrabold text-red-300">{eliminatedPlayer.name}</span>.
                Họ thuộc vai trò:{' '}
                <span className="font-extrabold text-red-400 underline uppercase">
                  {eliminatedPlayer.role === 'WEREWOLF'
                    ? 'Ma Sói'
                    : eliminatedPlayer.role === 'SEER'
                      ? 'Tiên tri'
                      : eliminatedPlayer.role === 'BODYGUARD'
                        ? 'Bảo vệ'
                        : 'Dân làng'}
                </span>
                .
              </>
            ) : isTie ? (
              'Kết quả bỏ phiếu bị hòa! Thần linh quyết định tha mạng cho tất cả mọi người hôm nay.'
            ) : (
              'Không có phiếu bầu nào được đưa ra. Ngày hôm nay kết thúc trong yên lặng.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
