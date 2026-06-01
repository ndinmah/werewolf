import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { useSocketEvent } from '../../hooks/useSocketEvent';
import { PlayerCard } from './PlayerCard';
import { Button } from '../UI/Button';
import { Flame } from 'lucide-react';
import { S } from '../../constants/strings';

export const VotePanel = () => {
  const { id: roomId } = useParams();
  const socket = useSocket();
  const { gameState, myPlayer, phase } = useGame();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteData, setVoteData] = useState<{
    tally: Record<string, number>;
    totalVoters: number;
    votersMap: Record<string, { id: string; name: string }[]>;
  }>({ tally: {}, totalVoters: 0, votersMap: {} });

  useSocketEvent(
    socket,
    'VOTE_UPDATED',
    (data: {
      tally: Record<string, number>;
      totalVoters: number;
      votersMap?: Record<string, { id: string; name: string }[]>;
    }) => {
      setVoteData({
        tally: data.tally || {},
        totalVoters: data.totalVoters || 0,
        votersMap: data.votersMap || {}
      });
    }
  );

  const handleVote = () => {
    if (!selectedPlayerId || hasVoted || phase !== 'voting' || !myPlayer?.isAlive) return;
    
    socket.emit('CAST_VOTE', { roomId, targetId: selectedPlayerId });
    setHasVoted(true);
  };

  const canVote = phase === 'voting' && myPlayer?.isAlive && !hasVoted;

  return (
    <div className="bg-[#0a0a0a]/80 backdrop-blur-md p-8 rounded-none border border-white/5 relative font-['Cormorant_Garamond',serif]">
      {/* Edge Details */}
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#aa8c55] to-transparent opacity-50"></div>
      
      {gameState?.villagersLostPowers ? (
        <div className="mb-8 p-6 bg-[#030303] border border-[#8a0303]/50 flex items-center gap-4 text-[#ffdddd] shadow-[inset_0_0_20px_rgba(138,3,3,0.3)] animate-pulse relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[#8a0303]/10 pointer-events-none"></div>
          <Flame className="w-10 h-10 text-[#8a0303] animate-bounce relative z-10 shrink-0" />
          <div className="text-left relative z-10">
            <p className="font-['Cinzel_Decorative',serif] text-xl text-[#8a0303] uppercase tracking-widest">{S.votePanel.elderCurseTitle}</p>
            <p className="text-gray-400 mt-1 italic text-lg">{S.votePanel.elderCurseStory}</p>
          </div>
        </div>
      ) : null}

      <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
        <h2 className="text-3xl font-['Cinzel_Decorative',serif] uppercase tracking-widest text-white">{S.votePanel.title}</h2>
        {phase === 'voting' ? (
          <div className="text-[#aa8c55] font-sans text-xs tracking-[0.2em] uppercase font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#aa8c55] animate-ping"></span>
            {S.votePanel.votingStatus(Object.values(voteData.tally).reduce((a,b)=>a+b, 0), voteData.totalVoters)}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {gameState?.players.map(player => {
          const isSelected = selectedPlayerId === player.id;
          const voters = voteData.votersMap?.[player.id] || [];

          return (
            <div 
              key={player.id} 
              className={`relative cursor-pointer transition-transform duration-300 ${isSelected ? 'scale-105' : 'hover:scale-105'}`}
              onClick={() => canVote && player.isAlive && setSelectedPlayerId(player.id)}
            >
              <PlayerCard player={player} />
              
              {/* Highlight selection */}
              {isSelected ? (
                <div className="absolute inset-0 border-2 border-[#8a0303] z-10 pointer-events-none shadow-[inset_0_0_20px_rgba(138,3,3,0.5),0_0_20px_rgba(138,3,3,0.5)]"></div>
              ) : null}

              {/* Voters avatar list */}
              {voters.length > 0 ? (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex -space-x-2 z-20 overflow-visible">
                  {voters.map((voter) => (
                    <div
                      key={voter.id}
                      className="w-8 h-8 rounded-none bg-[#030303] border border-[#aa8c55] flex items-center justify-center text-sm font-['Cinzel_Decorative',serif] font-bold text-[#aa8c55] shadow-[0_0_10px_rgba(170,140,85,0.4)] cursor-help hover:-translate-y-1 transition-all duration-300"
                      title={S.votePanel.votedTooltip(voter.name)}
                    >
                      {voter.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {phase === 'voting' && myPlayer?.isAlive ? (
        <div className="mt-12 flex justify-center border-t border-white/5 pt-8 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-linear-to-r from-transparent via-[#8a0303] to-transparent"></div>
          <Button 
            size="lg" 
            variant={hasVoted ? 'ghost' : 'primary'}
            onClick={handleVote}
            disabled={!selectedPlayerId || hasVoted}
            className="min-w-[200px]"
          >
            {hasVoted ? S.votePanel.btnVoteDone : S.votePanel.btnVote}
          </Button>
        </div>
      ) : null}
    </div>
  );
};
