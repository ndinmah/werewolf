import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { PlayerCard } from './PlayerCard';
import { Button } from '../UI/Button';

export const VotePanel = () => {
  const { id: roomId } = useParams();
  const socket = useSocket();
  const { gameState, myPlayer, phase } = useGame();
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteData, setVoteData] = useState({ tally: {}, totalVoters: 0 });

  useEffect(() => {
    if (!socket) return;
    
    socket.on('VOTE_UPDATED', (data) => {
      setVoteData(data);
    });

    return () => {
      socket.off('VOTE_UPDATED');
    };
  }, [socket]);

  const [currentPhase, setCurrentPhase] = useState(phase);

  if (phase !== currentPhase) {
    setCurrentPhase(phase);
    if (phase !== 'VotingPhase') {
      setSelectedPlayerId(null);
      setHasVoted(false);
      setVoteData({ tally: {}, totalVoters: 0 });
    }
  }

  const handleVote = () => {
    if (!selectedPlayerId || hasVoted || phase !== 'VotingPhase' || !myPlayer?.isAlive) return;
    
    socket.emit('CAST_VOTE', { roomId, targetId: selectedPlayerId });
    setHasVoted(true);
  };

  const canVote = phase === 'VotingPhase' && myPlayer?.isAlive && !hasVoted;

  return (
    <div className="bg-dark/50 p-6 rounded-xl border border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Danh sách người chơi</h2>
        {phase === 'VotingPhase' && (
          <div className="text-yellow-500 font-medium">
            Đang bỏ phiếu ({Object.values(voteData.tally).reduce((a,b)=>a+b, 0)}/{voteData.totalVoters})
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {gameState?.players.map(player => {
          const isSelected = selectedPlayerId === player.id;
          const votesReceived = voteData.tally[player.id] || 0;

          return (
            <div 
              key={player.id} 
              className={`relative cursor-pointer transition-transform ${isSelected ? 'scale-105' : ''}`}
              onClick={() => canVote && player.isAlive && setSelectedPlayerId(player.id)}
            >
              <PlayerCard player={player} />
              
              {/* Highlight selection */}
              {isSelected && (
                <div className="absolute inset-0 rounded-xl border-2 border-wolf-light z-10 pointer-events-none shadow-[0_0_15px_rgba(100,200,255,0.3)]"></div>
              )}

              {/* Vote count badge */}
              {votesReceived > 0 && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center font-bold text-white border-2 border-darker z-20">
                  {votesReceived}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {phase === 'VotingPhase' && myPlayer?.isAlive && (
        <div className="mt-8 flex justify-center">
          <Button 
            size="lg" 
            onClick={handleVote}
            disabled={!selectedPlayerId || hasVoted}
            className={hasVoted ? 'bg-gray-600' : 'bg-red-600 hover:bg-red-700'}
          >
            {hasVoted ? 'ĐÃ BỎ PHIẾU' : 'CHỐT BỎ PHIẾU'}
          </Button>
        </div>
      )}
    </div>
  );
};
