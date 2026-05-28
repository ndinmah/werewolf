import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { ChatPanel } from '../components/Game/ChatPanel';
import { VotePanel } from '../components/Game/VotePanel';
import { NightActionModal } from '../components/Game/NightActionModal';
import { NarratorScreen } from '../components/Narrator/NarratorScreen';
import { PhaseTimer } from '../components/UI/PhaseTimer';
import { VotingResultBanner } from '../components/Game/VotingResultBanner';
import { RoleRevealScreen } from '../components/Game/RoleRevealScreen';
import { GameOverScreen } from '../components/GameOver/GameOverScreen';
import { HunterRetaliationModal } from '../components/Game/HunterRetaliationModal';
import { FirstNightModal } from '../components/Game/FirstNightModal';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { useSocket } from '../context/SocketContext';
import { useSocketEvent } from '../hooks/useSocketEvent';

import { getRoleEmoji, getRoleName } from '../constants/roles';

import { getPhaseName } from '../constants/phases';
import type { Role } from '../types/game';

export const GamePage = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { gameState, myPlayer, phase, dayCount, nightActionPrompt, hunterPrompt } = useGame();

  const [showCurseOverlay, setShowCurseOverlay] = useState(false);
  const [showInheritedOverlay, setShowInheritedOverlay] = useState<Role | null>(null);
  const prevRoleRef = useRef<string | undefined>(undefined);

  useSocketEvent(socket, 'ELDER_CURSE_ACTIVATED', () => {
    setShowCurseOverlay(true);
  });

  useEffect(() => {
    if (prevRoleRef.current === 'DOPPELGANGER' && myPlayer?.role && myPlayer.role !== 'DOPPELGANGER') {
      setShowInheritedOverlay(myPlayer.role);
    }
    prevRoleRef.current = myPlayer?.role;
  }, [myPlayer?.role]);

  // Chỉ hiện màn lật bài ở ngày đầu tiên, phase lật bài hoặc đêm đầu và chưa bấm tắt
  const [showRoleReveal, setShowRoleReveal] = useState(() => {
    return phase === 'roleReveal' || ((phase === 'night' || phase === 'firstNight') && dayCount === 1);
  });

  useEffect(() => {
    if (!gameState) {
      // Đợi 2 giây xem có reconnect được không trước khi quay về lobby
      const timer = setTimeout(() => {
        navigate(`/room/${roomId}`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState, navigate, roomId]);

  if (!gameState) return <LoadingSpinner text="Đang tải..." />;

  return (
    <div className="min-h-screen pt-20 px-4 container mx-auto max-w-7xl pb-10">
      {/* Overlays & Modals */}
      {showCurseOverlay && (
        <div className="fixed inset-0 z-100lex items-center justify-center bg-black/85 backdrop-blur-lg p-4 animate-fade-in">
          <div className="bg-zinc-950 border-2 border-red-500 rounded-3xl p-8 max-w-lg w-full text-center shadow-[0_0_80px_rgba(239,68,68,0.3)] transform scale-100 transition-all duration-300">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-950/60 border border-red-500 rounded-full flex items-center justify-center text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)] animate-bounce">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-red-500 mb-4 tracking-wider uppercase">LỜI NGUYỀN GIÀ LÀNG!</h2>
            <p className="text-gray-200 text-base leading-relaxed mb-6 font-semibold">
              Dân làng đã sát hại Già Làng thông thái! Cơn thịnh nộ của người tối cao tước đi toàn bộ sức mạnh của các
              chức năng đặc biệt trong làng.
            </p>
            <div className="text-zinc-400 text-xs py-3 px-4 bg-zinc-900/60 rounded-xl border border-zinc-800/80 mb-8 max-w-sm mx-auto">
              ⚠️ Các vai trò đặc biệt (Tiên tri, Bảo vệ, Phù thủy, Thợ săn, Cupid) đã bị biến thành Dân thường.
            </div>
            <button
              onClick={() => setShowCurseOverlay(false)}
              className="w-full max-w-xs bg-red-600 hover:bg-red-750 text-white font-black py-3 px-8 rounded-full border border-red-500 shadow-lg shadow-red-700/30 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] uppercase tracking-wider cursor-pointer"
            >
              Tôi đã hiểu
            </button>
          </div>
        </div>
      )}

      {showInheritedOverlay && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/85 backdrop-blur-lg p-4 animate-fade-in">
          <div className="bg-zinc-950 border-2 border-cyan-500 rounded-3xl p-8 max-w-lg w-full text-center shadow-[0_0_80px_rgba(6,182,212,0.3)] transform scale-100 transition-all duration-300">
            <div className="w-24 h-24 mx-auto mb-6 bg-cyan-950/60 border border-cyan-500 rounded-full flex items-center justify-center text-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.4)] animate-bounce">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-cyan-400 mb-4 tracking-wider uppercase">KẾ THỪA DI CHÚC!</h2>
            <p className="text-gray-200 text-base leading-relaxed mb-6 font-semibold">
              Bản gốc của bạn đã hy sinh! Lời nguyền nhân bản hoàn tất, bạn đã kế thừa toàn bộ vai trò, phe phái và sức
              mạnh của họ:
            </p>
            <div className="text-2xl font-black text-white py-4 px-6 bg-cyan-950/40 rounded-2xl border border-cyan-500/30 mb-8 max-w-xs mx-auto flex items-center justify-center gap-3">
              <span>{getRoleEmoji(showInheritedOverlay)}</span>
              <span>{getRoleName(showInheritedOverlay)}</span>
            </div>
            <button
              onClick={() => setShowInheritedOverlay(null)}
              className="w-full max-w-xs bg-cyan-600 hover:bg-cyan-750 text-white font-black py-3 px-8 rounded-full border border-cyan-500 shadow-lg shadow-cyan-700/30 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] uppercase tracking-wider cursor-pointer"
            >
              Tiếp tục trò chơi
            </button>
          </div>
        </div>
      )}

      {showRoleReveal && <RoleRevealScreen onConfirm={() => setShowRoleReveal(false)} />}

      {!showRoleReveal && <NightActionModal key={`${phase}-${nightActionPrompt ? nightActionPrompt.role : 'none'}`} />}
      {phase === 'firstNight' && <FirstNightModal />}
      <NarratorScreen />
      <VotingResultBanner />
      <HunterRetaliationModal key={`${phase}-${hunterPrompt ? 'prompt' : 'no-prompt'}`} />
      <GameOverScreen />

      <div className="stars-bg absolute inset-0 -z-10 opacity-30"></div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Mã phòng: <span className="text-wolf-light font-mono">{roomId}</span>
          </h1>
          <div className="flex items-center gap-3 text-gray-400 text-lg">
            <p>
              Ngày thứ {dayCount} — <span className="text-yellow-500 font-bold">{getPhaseName(phase)}</span>
            </p>
            <PhaseTimer />
          </div>
        </div>

        <div className="bg-darker px-6 py-3 rounded-xl border border-gray-800 flex items-center gap-4 shadow-lg shadow-black/30">
          <div className="text-right flex flex-col items-end">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Bạn là</p>
            <p className="font-extrabold text-lg text-white">{myPlayer?.name}</p>
            {myPlayer?.role && (
              <p className={`text-xs font-bold ${myPlayer.role === 'WEREWOLF' ? 'text-red-400' : 'text-indigo-400'}`}>
                {getRoleName(myPlayer.role)}
              </p>
            )}
            {gameState?.villagersLostPowers &&
              myPlayer?.role &&
              ['SEER', 'WITCH', 'BODYGUARD', 'CUPID', 'HUNTER'].includes(myPlayer.role) && (
                <span className="text-[10px] bg-red-950 border border-red-500/30 text-red-400 px-1.5 py-0.5 rounded font-bold animate-pulse mt-1 flex items-center gap-1">
                  🚫 Mất kỹ năng
                </span>
              )}
            {myPlayer?.role === 'ELDER' && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold mt-1 flex items-center gap-1 border ${
                  (gameState?.elderShields ?? 1) > 0
                    ? 'bg-amber-950 border-amber-500/30 text-amber-400 animate-pulse'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                }`}
              >
                🛡️ Khiên: {(gameState?.elderShields ?? 1) > 0 ? '1/1' : 'Đã vỡ'}
              </span>
            )}
            {myPlayer?.role === 'DOPPELGANGER' && gameState?.doppelgangerTargetId && (
              <span className="text-[10px] bg-cyan-950 border border-cyan-500/30 text-cyan-400 px-1.5 py-0.5 rounded font-bold mt-1 flex items-center gap-1">
                👥 Bản gốc: {gameState.players.find((p) => p.id === gameState.doppelgangerTargetId)?.name || 'Không rõ'}
              </span>
            )}
          </div>
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border-2
            ${myPlayer?.role === 'WEREWOLF' ? 'bg-red-950 border-red-500 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-indigo-950 border-indigo-500 text-white'}
          `}
          >
            {getRoleEmoji(myPlayer?.role)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[70vh]">
        <div className="lg:col-span-1 h-full">
          <ChatPanel />
        </div>

        <div className="lg:col-span-3 overflow-y-auto">
          <VotePanel key={phase} />
        </div>
      </div>
    </div>
  );
};
