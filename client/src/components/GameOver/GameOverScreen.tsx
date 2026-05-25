import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { useSocket } from '../../context/SocketContext';
import { Button } from '../UI/Button';
import { Trophy, Frown, Users, RefreshCw } from 'lucide-react';

export const GameOverScreen = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const { gameState, myPlayer } = useGame();
  const socket = useSocket();
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!gameState || gameState.phase !== 'gameOver' || !gameState.timerDuration || !gameState.timerStartAt) {
      setSecondsLeft(null);
      return;
    }

    const timerDuration = gameState.timerDuration;
    const timerStartAt = gameState.timerStartAt;

    const updateTimer = () => {
      const elapsed = Date.now() - timerStartAt;
      const remaining = Math.max(0, timerDuration - elapsed);
      setSecondsLeft(Math.ceil(remaining / 1000));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 500);

    return () => clearInterval(interval);
  }, [gameState]);

  if (!gameState || gameState.phase !== 'gameOver') return null;

  const winnerFaction = gameState.winner;
  const players = gameState.players || [];

  // Xác định xem phe của bản thân có thắng không
  const isMyFactionWinner = myPlayer?.faction === winnerFaction;

  const getFactionDisplay = (faction: string | null | undefined) => {
    switch (faction) {
      case 'WEREWOLF':
        return {
          name: 'Phe Ma Sói',
          color: 'text-red-500 bg-red-950/60 border-red-800',
          bannerBg: 'bg-red-950/80 border-red-500/30 text-red-100',
          shadow: 'shadow-[0_0_50px_rgba(220,38,38,0.15)]'
        };
      case 'VILLAGER':
        return {
          name: 'Phe Dân Làng',
          color: 'text-green-400 bg-green-950/60 border-green-800',
          bannerBg: 'bg-green-950/80 border-green-500/30 text-green-100',
          shadow: 'shadow-[0_0_50px_rgba(34,197,94,0.15)]'
        };
      case 'THIRD_PARTY':
        return {
          name: 'Phe Thứ Ba',
          color: 'text-purple-400 bg-purple-950/60 border-purple-800',
          bannerBg: 'bg-purple-950/80 border-purple-500/30 text-purple-100',
          shadow: 'shadow-[0_0_50px_rgba(168,85,247,0.15)]'
        };
      default:
        return {
          name: 'Không rõ',
          color: 'text-gray-400 bg-gray-900 border-gray-800',
          bannerBg: 'bg-gray-900 border-gray-800 text-gray-400',
          shadow: ''
        };
    }
  };

  const factionInfo = getFactionDisplay(winnerFaction);

  const getRoleName = (roleId?: string): string => {
    switch (roleId) {
      case 'WEREWOLF': return 'Ma Sói';
      case 'SEER': return 'Tiên Tri';
      case 'BODYGUARD': return 'Bảo Vệ';
      case 'VILLAGER': return 'Dân Làng';
      default: return roleId ?? '';
    }
  };

  const handleBackToLobby = () => {
    if (socket) {
      socket.emit('RESET_ROOM', { roomId });
    } else {
      navigate(`/room/${roomId}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/98 px-4 py-8 overflow-y-auto">
      <div className="absolute inset-0 stars-bg opacity-35 pointer-events-none"></div>

      <div className={`w-full max-w-4xl bg-dark/95 border backdrop-blur-md rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative z-10 ${factionInfo.shadow} border-gray-800`}>
        
        {/* Banner Victory/Defeat */}
        <div className={`p-8 rounded-2xl border text-center flex flex-col items-center justify-center ${factionInfo.bannerBg}`}>
          <div className="mb-4">
            {isMyFactionWinner ? (
              <div className="p-4 bg-yellow-500/20 text-yellow-500 rounded-full border border-yellow-500/30 animate-bounce">
                <Trophy className="w-16 h-16" />
              </div>
            ) : (
              <div className="p-4 bg-slate-800/80 text-gray-400 rounded-full border border-slate-700/50">
                <Frown className="w-16 h-16" />
              </div>
            )}
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black tracking-widest uppercase">
            {factionInfo.name} Chiến Thắng
          </h1>
          <p className="text-sm md:text-base text-gray-300 mt-2 font-medium">
            {isMyFactionWinner 
              ? 'Chúc mừng! Phe của bạn đã giành chiến thắng vang dội!'
              : 'Trận chiến đã kết thúc. Hãy may mắn hơn ở những ván đấu sau.'
            }
          </p>
        </div>

        {/* Players List Table */}
        <div className="bg-darker/50 border border-gray-800/80 rounded-xl p-4 md:p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Tổng kết người chơi</span>
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Người chơi</th>
                  <th className="pb-3 text-center">Trạng thái</th>
                  <th className="pb-3 text-center">Vai trò thật</th>
                  <th className="pb-3 text-right pr-2">Kết quả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50 text-sm">
                {players.map(player => {
                  const playerWon = player.faction === winnerFaction;
                  const isSelf = player.id === myPlayer?.id;

                  return (
                    <tr key={player.id} className={`hover:bg-darker/30 transition-colors ${isSelf ? 'bg-indigo-950/10' : ''}`}>
                      <td className="py-3.5 pl-2 font-bold text-gray-200 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs">
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate max-w-[150px]">
                          {player.name}
                          {isSelf && <span className="text-xs text-indigo-400 ml-1.5">(Bạn)</span>}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        {player.isAlive ? (
                          <span className="text-xs font-bold text-green-400 bg-green-950/30 px-2 py-0.5 rounded-full border border-green-900/50">
                            Còn sống
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-red-400 bg-red-950/30 px-2 py-0.5 rounded-full border border-red-900/50">
                            💀 Đã chết
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-center font-bold text-gray-300">
                        {getRoleName(player.role)}
                      </td>
                      <td className="py-3.5 text-right pr-2 font-black">
                        {playerWon ? (
                          <span className="text-yellow-400">THẮNG 🏆</span>
                        ) : (
                          <span className="text-gray-500">THUA</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center gap-3 border-t border-gray-800 pt-6">
          <Button
            size="lg"
            onClick={handleBackToLobby}
            disabled={secondsLeft !== null && secondsLeft > 0}
            className="bg-indigo-600 hover:bg-indigo-700 px-10 shadow-lg shadow-indigo-600/20 font-bold tracking-wider flex items-center gap-2"
          >
            <RefreshCw className={`w-5 h-5 ${secondsLeft !== null && secondsLeft > 0 ? 'animate-spin text-gray-400' : ''}`} />
            <span>QUAY LẠI LOBBY {secondsLeft !== null && secondsLeft > 0 ? `(${secondsLeft}s)` : ''}</span>
          </Button>
          {secondsLeft !== null && secondsLeft > 0 && (
            <p className="text-gray-400 text-xs animate-pulse">
              Vui lòng đợi, hệ thống tự động quay lại lobby sau {secondsLeft} giây...
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
