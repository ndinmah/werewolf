import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { useSocket } from '../../context/SocketContext';
import { useCountdownTimer } from '../../hooks/useCountdownTimer';
import { Button } from '../UI/Button';
import { Avatar } from '../UI/Avatar';
import { ModalOverlay } from '../UI/ModalOverlay';
import { Trophy, Frown, Users, RefreshCw } from 'lucide-react';
import { getRoleName, getFactionDisplay } from '../../constants/roles';

export const GameOverScreen = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const { gameState, myPlayer } = useGame();
  const socket = useSocket();

  const isGameOver = gameState?.phase === 'gameOver';
  const secondsLeft = useCountdownTimer(
    isGameOver ? gameState?.timerDuration : undefined,
    isGameOver ? gameState?.timerStartAt : undefined,
  );

  if (!gameState || gameState.phase !== 'gameOver') return null;

  const winnerFaction = gameState.winner;
  const players = gameState.players || [];

  // Xác định xem phe của bản thân có thắng không
  const isMyFactionWinner = myPlayer?.faction === winnerFaction;

  const factionInfo = getFactionDisplay(winnerFaction);

  const handleBackToLobby = () => {
    if (socket) {
      socket.emit('RESET_ROOM', { roomId });
    } else {
      navigate(`/room/${roomId}`);
    }
  };

  return (
    <ModalOverlay opacity="dark" starsOpacity="heavy">
      <div
        className={`w-full max-w-4xl bg-dark/95 border backdrop-blur-md rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative z-10 ${factionInfo.shadow} border-gray-800`}
      >
        {/* Banner Victory/Defeat */}
        <div
          className={`p-8 rounded-2xl border text-center flex flex-col items-center justify-center ${factionInfo.bannerBg}`}
        >
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

          <h1 className="text-3xl md:text-5xl font-black tracking-widest uppercase">{factionInfo.name} Chiến Thắng</h1>
          <p className="text-sm md:text-base text-gray-300 mt-2 font-medium">
            {isMyFactionWinner
              ? 'Chúc mừng! Phe của bạn đã giành chiến thắng vang dội!'
              : 'Trận chiến đã kết thúc. Hãy may mắn hơn ở những ván đấu sau.'}
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
                {players.map((player) => {
                  const playerWon = player.faction === winnerFaction;
                  const isSelf = player.id === myPlayer?.id;

                  return (
                    <tr
                      key={player.id}
                      className={`hover:bg-darker/30 transition-colors ${isSelf ? 'bg-indigo-950/10' : ''}`}
                    >
                      <td className="py-3.5 pl-2 font-bold text-gray-200 flex items-center gap-3">
                        <Avatar name={player.name} size="xs" className="bg-slate-800 border-slate-750 text-gray-300" />
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
                      <td className="py-3.5 text-center font-bold text-gray-300">{getRoleName(player.role)}</td>
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
            // disabled={secondsLeft !== null && secondsLeft > 0}
            className="bg-indigo-600 hover:bg-indigo-700 px-10 shadow-lg shadow-indigo-600/20 font-bold tracking-wider flex items-center gap-2"
          >
            <RefreshCw
              className={`w-5 h-5 ${secondsLeft !== null && secondsLeft > 0 ? 'animate-spin text-gray-400' : ''}`}
            />
            <span>QUAY LẠI LOBBY {secondsLeft !== null && secondsLeft > 0 ? `(${secondsLeft}s)` : ''}</span>
          </Button>
          {secondsLeft !== null && secondsLeft > 0 && (
            <p className="text-gray-400 text-xs animate-pulse">
              Vui lòng đợi, hệ thống tự động quay lại lobby sau {secondsLeft} giây...
            </p>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
};
