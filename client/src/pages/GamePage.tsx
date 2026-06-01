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
import { S } from '../constants/strings';

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

  if (!gameState) return <LoadingSpinner text={S.game.loading} />;

  return (
    <div className="min-h-screen pt-20 px-4 container mx-auto max-w-7xl pb-10">
      {/* Overlays & Modals */}
      {showCurseOverlay ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-[#030303]/90 backdrop-blur-md p-4 animate-fade-in font-['Cormorant_Garamond',serif]">
          <div className="bg-[#0a0a0a] border border-[#8a0303] rounded-none p-8 md:p-12 max-w-2xl w-full text-center shadow-[0_0_80px_rgba(138,3,3,0.5)] transform scale-100 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-[#8a0303]/20 to-transparent pointer-events-none"></div>
            
            <div className="w-24 h-24 mx-auto mb-8 bg-[#030303] border border-[#8a0303] flex items-center justify-center text-[#8a0303] shadow-[inset_0_0_20px_rgba(138,3,3,0.5)] animate-pulse relative z-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-4xl font-['Cinzel_Decorative',serif] text-[#8a0303] mb-4 tracking-[0.2em] uppercase drop-shadow-[0_0_10px_rgba(138,3,3,0.8)] relative z-10">{S.events.elderCurse.title}</h2>
            <div className="h-px w-32 bg-linear-to-r from-transparent via-[#8a0303] to-transparent mx-auto mb-6 relative z-10"></div>
            <p className="text-gray-300 text-2xl italic leading-relaxed mb-8 relative z-10">
              {S.events.elderCurse.story}
            </p>
            <div className="text-gray-400 text-lg py-4 px-6 bg-[#030303] border border-[#8a0303]/30 mb-8 max-w-md mx-auto relative z-10 font-sans tracking-wide">
              {S.events.elderCurse.detail}
            </div>
            <button
              onClick={() => setShowCurseOverlay(false)}
              className="w-full max-w-xs bg-transparent hover:bg-[#8a0303]/20 text-[#ffdddd] font-['Cinzel_Decorative',serif] py-4 px-8 rounded-none border border-[#8a0303] shadow-[0_0_15px_rgba(138,3,3,0.3)] transition-all duration-300 hover:scale-105 active:scale-95 uppercase tracking-widest cursor-pointer relative z-10 text-xl"
            >
              {S.events.elderCurse.btnAck}
            </button>
          </div>
        </div>
      ) : null}

      {showInheritedOverlay ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-[#030303]/90 backdrop-blur-md p-4 animate-fade-in font-['Cormorant_Garamond',serif]">
          <div className="bg-[#0a0a0a] border border-[#06b6d4]/50 rounded-none p-8 md:p-12 max-w-2xl w-full text-center shadow-[0_0_80px_rgba(6,182,212,0.3)] transform scale-100 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-[#06b6d4]/10 to-transparent pointer-events-none"></div>
            
            <div className="w-24 h-24 mx-auto mb-8 bg-[#030303] border border-[#06b6d4] flex items-center justify-center text-[#06b6d4] shadow-[inset_0_0_20px_rgba(6,182,212,0.4)] animate-pulse relative z-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h2 className="text-4xl font-['Cinzel_Decorative',serif] text-[#06b6d4] mb-4 tracking-[0.2em] uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] relative z-10">{S.events.doppelgangerInherit.title}</h2>
            <div className="h-px w-32 bg-linear-to-r from-transparent via-[#06b6d4] to-transparent mx-auto mb-6 relative z-10"></div>
            <p className="text-gray-300 text-2xl italic leading-relaxed mb-8 relative z-10">
              {S.events.doppelgangerInherit.story}
            </p>
            <div className="text-2xl font-['Cinzel_Decorative',serif] tracking-wider text-white py-6 px-8 bg-[#030303] border border-[#06b6d4]/50 mb-8 max-w-sm mx-auto flex flex-col items-center justify-center gap-2 relative z-10 shadow-[inset_0_0_15px_rgba(6,182,212,0.2)]">
              <span className="text-4xl mb-2">{getRoleEmoji(showInheritedOverlay)}</span>
              <span className="uppercase">{getRoleName(showInheritedOverlay)}</span>
            </div>
            <button
              onClick={() => setShowInheritedOverlay(null)}
              className="w-full max-w-xs bg-transparent hover:bg-[#06b6d4]/20 text-[#cffafe] font-['Cinzel_Decorative',serif] py-4 px-8 rounded-none border border-[#06b6d4] shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300 hover:scale-105 active:scale-95 uppercase tracking-widest cursor-pointer relative z-10 text-xl"
            >
              {S.events.doppelgangerInherit.btnAck}
            </button>
          </div>
        </div>
      ) : null}

      {showRoleReveal ? <RoleRevealScreen onConfirm={() => setShowRoleReveal(false)} /> : null}

      {!showRoleReveal ? <NightActionModal key={`${phase}-${nightActionPrompt ? nightActionPrompt.role : 'none'}`} /> : null}
      {phase === 'firstNight' ? <FirstNightModal /> : null}
      <NarratorScreen />
      <VotingResultBanner />
      <HunterRetaliationModal key={`${phase}-${hunterPrompt ? 'prompt' : 'no-prompt'}`} />
      <GameOverScreen />

      {/* Thêm background overlay để tạo độ tối sâu hơn */}
      <div className="fixed inset-0 bg-[#030303]/80 -z-10 pointer-events-none"></div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 font-['Cormorant_Garamond',serif]">
        <div>
          <h1 className="text-2xl font-['Cinzel_Decorative',serif] text-gray-400 mb-1 tracking-widest uppercase">
            {S.game.roomLabel} <span className="text-[#8a0303] font-bold drop-shadow-[0_0_5px_rgba(138,3,3,0.8)]">{roomId}</span>
          </h1>
          <div className="flex items-center gap-3 text-gray-300 text-xl italic">
            <p>
              {S.game.dayLabel(dayCount)} — <span className="text-[#aa8c55] font-bold not-italic ml-1 drop-shadow-[0_0_5px_rgba(170,140,85,0.5)]">{getPhaseName(phase)}</span>
            </p>
            <PhaseTimer />
          </div>
        </div>

        <div className="bg-[#0a0a0a] px-6 py-4 rounded-none border border-white/10 flex items-center gap-6 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
          <div className="text-right flex flex-col items-end">
            <p className="text-sm text-gray-500 uppercase tracking-[0.2em] font-sans">{S.game.playerIdentityLabel}</p>
            <p className="font-['Cinzel_Decorative',serif] text-2xl text-white tracking-widest">{myPlayer?.name}</p>
            {myPlayer?.role ? (
              <p className={`text-lg font-bold font-['Cormorant_Garamond',serif] italic ${myPlayer.role === 'WEREWOLF' ? 'text-[#8a0303]' : 'text-[#aa8c55]'}`}>
                {getRoleName(myPlayer.role)}
              </p>
            ) : null}
            {gameState?.villagersLostPowers &&
              myPlayer?.role &&
              ['SEER', 'WITCH', 'BODYGUARD', 'CUPID', 'HUNTER'].includes(myPlayer.role) ? (
                <span className="text-[11px] font-sans tracking-widest uppercase bg-[#030303] border border-[#8a0303]/50 text-[#8a0303] px-2 py-1 mt-2 flex items-center gap-1 shadow-[0_0_10px_rgba(138,3,3,0.3)]">
                  {S.game.lostPowerBadge}
                </span>
              ) : null}
            {myPlayer?.role === 'ELDER' ? (
              <span
                className={`text-[11px] font-sans tracking-widest uppercase px-2 py-1 mt-2 flex items-center gap-1 border ${
                  (gameState?.elderShields ?? 1) > 0
                    ? 'bg-[#030303] border-[#aa8c55]/50 text-[#aa8c55] shadow-[0_0_10px_rgba(170,140,85,0.3)]'
                    : 'bg-[#030303] border-white/10 text-gray-600'
                }`}
              >
                {(gameState?.elderShields ?? 1) > 0 ? S.game.elderShieldActive : S.game.elderShieldBroken}
              </span>
            ) : null}
            {myPlayer?.role === 'DOPPELGANGER' && gameState?.doppelgangerTargetId ? (
              <span className="text-[11px] font-sans tracking-widest uppercase bg-[#030303] border border-[#06b6d4]/50 text-[#06b6d4] px-2 py-1 mt-2 flex items-center gap-1 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                {S.game.doppelgangerOriginLabel(gameState.players.find((p) => p.id === gameState.doppelgangerTargetId)?.name || S.game.unknownOrigin)}
              </span>
            ) : null}
          </div>
          <div
            className={`w-16 h-16 rounded-none flex items-center justify-center text-3xl border
            ${myPlayer?.role === 'WEREWOLF' ? 'bg-[#030303] border-[#8a0303] text-[#ffdddd] shadow-[inset_0_0_15px_rgba(138,3,3,0.5)]' : 'bg-[#030303] border-[#aa8c55]/50 text-white shadow-[inset_0_0_15px_rgba(170,140,85,0.2)]'}
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
