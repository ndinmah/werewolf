import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { useSocketEvent } from '../../hooks/useSocketEvent';
import { PlayerCard } from './PlayerCard';
import { Button } from '../UI/Button';

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
    <div className="bg-dark/50 p-6 rounded-xl border border-gray-800">
      {gameState?.villagersLostPowers && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-200 shadow-[0_0_25px_rgba(239,68,68,0.15)] animate-pulse">
          <span className="text-2xl">🚫</span>
          <div className="text-left text-xs md:text-sm">
            <p className="font-extrabold text-red-400 uppercase tracking-wide">Cơn Thịnh Nộ Của Già Làng</p>
            <p className="text-gray-400 mt-0.5">Già Làng đã bị sát hại bởi chính dân làng! Lời nguyền trỗi dậy tước đi toàn bộ sức mạnh thần bí của các vai trò đặc biệt.</p>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Danh sách người chơi</h2>
        {phase === 'voting' && (
          <div className="text-yellow-500 font-medium">
            Đang bỏ phiếu ({Object.values(voteData.tally).reduce((a,b)=>a+b, 0)}/{voteData.totalVoters})
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {gameState?.players.map(player => {
          const isSelected = selectedPlayerId === player.id;
          const voters = voteData.votersMap?.[player.id] || [];

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

              {/* Voters avatar list */}
              {voters.length > 0 && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex -space-x-1.5 z-20 overflow-visible">
                  {voters.map((voter) => (
                    <div
                      key={voter.id}
                      className="w-7 h-7 rounded-full bg-red-500 border-2 border-darker flex items-center justify-center text-xs font-extrabold text-white shadow-md cursor-help hover:scale-110 hover:-translate-y-0.5 transition-all duration-200"
                      title={`${voter.name} đã vote`}
                    >
                      {voter.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {phase === 'voting' && myPlayer?.isAlive && (
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
