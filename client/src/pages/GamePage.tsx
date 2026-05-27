import { useEffect, useState } from 'react';
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

import { getRoleEmoji, getRoleName } from '../constants/roles';

import { getPhaseName } from '../constants/phases';

export const GamePage = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const { gameState, myPlayer, phase, dayCount, nightActionPrompt, hunterPrompt } = useGame();

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
      {showRoleReveal && (
        <RoleRevealScreen onConfirm={() => setShowRoleReveal(false)} />
      )}
      
      {!showRoleReveal && (
        <NightActionModal
          key={`${phase}-${nightActionPrompt ? nightActionPrompt.role : 'none'}`}
        />
      )}
      {phase === 'firstNight' && <FirstNightModal />}
      <NarratorScreen />
      <VotingResultBanner />
      <HunterRetaliationModal
        key={`${phase}-${hunterPrompt ? 'prompt' : 'no-prompt'}`}
      />
      <GameOverScreen />

      <div className="stars-bg absolute inset-0 -z-10 opacity-30"></div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mã phòng: <span className="text-wolf-light font-mono">{roomId}</span></h1>
          <div className="flex items-center gap-3 text-gray-400 text-lg">
            <p>
              Ngày thứ {dayCount} — <span className="text-yellow-500 font-bold">{getPhaseName(phase)}</span>
            </p>
            <PhaseTimer />
          </div>
        </div>
        
        <div className="bg-darker px-6 py-3 rounded-xl border border-gray-800 flex items-center gap-4 shadow-lg shadow-black/30">
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Bạn là</p>
            <p className="font-extrabold text-lg text-white">{myPlayer?.name}</p>
            {myPlayer?.role && (
              <p className={`text-xs font-bold ${myPlayer.role === 'WEREWOLF' ? 'text-red-400' : 'text-indigo-400'}`}>
                {getRoleName(myPlayer.role)}
              </p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border-2
            ${myPlayer?.role === 'WEREWOLF' ? 'bg-red-950 border-red-500 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-indigo-950 border-indigo-500 text-white'}
          `}>
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
