import { useGame } from '../../context/GameContext';
import { Skull, Ghost } from 'lucide-react';
import { S } from '../../constants/strings';

export const VotingResultBanner = () => {
  const { votingResult } = useGame();

  if (!votingResult) return null;

  const { eliminated: eliminatedPlayer, isTie } = votingResult;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 animate-slide-down font-['Cormorant_Garamond',serif]">
      <div
        className={`p-8 rounded-none border backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex items-center gap-6 relative overflow-hidden
        ${
          eliminatedPlayer
            ? 'bg-[#0a0a0a]/95 border-[#8a0303]/50 text-white'
            : 'bg-[#0a0a0a]/95 border-[#aa8c55]/50 text-[#e2e8f0]'
        }
      `}
      >
        {/* Glow behind */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[150%] blur-[80px] -z-10 ${eliminatedPlayer ? 'bg-[#8a0303]/20' : 'bg-[#aa8c55]/10'}`}></div>

        {/* Edge Lines */}
        <div className={`absolute top-0 left-0 w-full h-px ${eliminatedPlayer ? 'bg-linear-to-r from-transparent via-[#8a0303] to-transparent' : 'bg-linear-to-r from-transparent via-[#aa8c55] to-transparent'}`}></div>

        {/* Banner Icon */}
        <div
          className={`p-5 rounded-none border relative shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]
          ${
            eliminatedPlayer
              ? 'bg-[#030303] border-[#8a0303] text-[#8a0303]'
              : 'bg-[#030303] border-[#aa8c55] text-[#aa8c55]'
          }
        `}
        >
          {eliminatedPlayer ? <Skull className="w-10 h-10 animate-pulse" /> : <Ghost className="w-10 h-10" />}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className={`font-['Cinzel_Decorative',serif] text-2xl tracking-[0.2em] uppercase mb-2 ${eliminatedPlayer ? 'text-[#ffdddd]' : 'text-[#aa8c55]'}`}>
            {eliminatedPlayer ? S.votingResult.titleEliminated : S.votingResult.titleTie}
          </h3>
          <p className="text-gray-300 text-lg leading-relaxed italic border-l border-white/20 pl-4">
            {eliminatedPlayer ? (
              S.votingResult.storyEliminated(eliminatedPlayer.name)
            ) : isTie ? (
              S.votingResult.storyTie
            ) : (
              S.votingResult.storyNoVote
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
