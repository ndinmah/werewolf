import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { useSocket } from '../../context/SocketContext';
import { useCountdownTimer } from '../../hooks/useCountdownTimer';
import { Button } from '../UI/Button';
import { Avatar } from '../UI/Avatar';
import { ModalOverlay } from '../UI/ModalOverlay';
import { Crown, Skull, RefreshCw } from 'lucide-react';
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
        className="w-full max-w-5xl bg-[#030303] border border-white/10 p-8 md:p-12 flex flex-col gap-8 relative z-10 font-['Cormorant_Garamond',serif] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Glow Effects */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] blur-[100px] opacity-20 -z-10 ${isMyFactionWinner ? 'bg-[#aa8c55]' : 'bg-[#8a0303]'}`}></div>

        {/* Banner Victory/Defeat */}
        <div
          className={`relative p-12 border text-center flex flex-col items-center justify-center bg-black/50 ${isMyFactionWinner ? 'border-[#aa8c55]/30' : 'border-[#8a0303]/30'}`}
        >
          {/* Edge Line */}
          <div className={`absolute top-0 left-0 w-full h-px ${isMyFactionWinner ? 'bg-linear-to-r from-transparent via-[#aa8c55] to-transparent' : 'bg-linear-to-r from-transparent via-[#8a0303] to-transparent'}`}></div>

          <div className="mb-6 relative">
            <div className={`absolute inset-0 blur-[20px] opacity-50 ${isMyFactionWinner ? 'bg-[#aa8c55]' : 'bg-[#8a0303]'}`}></div>
            {isMyFactionWinner ? (
              <div className="relative p-6 bg-[#030303] text-[#aa8c55] rounded-none border border-[#aa8c55]/50 shadow-[inset_0_0_20px_rgba(170,140,85,0.3)]">
                <Crown className="w-16 h-16" />
              </div>
            ) : (
              <div className="relative p-6 bg-[#030303] text-[#8a0303] rounded-none border border-[#8a0303]/50 shadow-[inset_0_0_20px_rgba(138,3,3,0.3)]">
                <Skull className="w-16 h-16" />
              </div>
            )}
          </div>

          <h1 className={`text-5xl md:text-6xl font-['Cinzel_Decorative',serif] tracking-widest uppercase text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]`}>
            {factionInfo.name} <br/><span className={isMyFactionWinner ? 'text-[#aa8c55]' : 'text-[#8a0303]'}>Chiến Thắng</span>
          </h1>
          <p className="text-xl text-gray-400 mt-6 italic border-l border-r border-white/20 px-6">
            {isMyFactionWinner
              ? '"Ánh sáng vinh quang chiếu rọi. Phe của bạn đã sống sót và làm chủ vận mệnh."'
              : '"Bóng tối nuốt chửng tất cả. Thất bại là cái giá phải trả bằng máu."'}
          </p>
        </div>

        {/* Players List */}
        <div className="bg-[#0a0a0a]/80 border border-white/5 p-6 md:p-8 relative">
          <h2 className="text-2xl font-['Cinzel_Decorative',serif] text-white tracking-widest uppercase mb-6 flex items-center justify-between">
            <span>Cuốn sổ tử thần</span>
          </h2>

          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 text-xs font-sans uppercase tracking-[0.2em]">
                  <th className="pb-4 pl-4 font-normal">Linh hồn</th>
                  <th className="pb-4 text-center font-normal">Trạng thái</th>
                  <th className="pb-4 text-center font-normal">Chân tướng</th>
                  <th className="pb-4 text-right pr-4 font-normal">Định mệnh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-lg">
                {players.map((player) => {
                  const playerWon = player.faction === winnerFaction;
                  const isSelf = player.id === myPlayer?.id;

                  return (
                    <tr
                      key={player.id}
                      className={`hover:bg-white/5 transition-colors ${isSelf ? 'bg-[#aa8c55]/10' : ''}`}
                    >
                      <td className="py-4 pl-4 font-['Cinzel_Decorative',serif] text-white flex items-center gap-4">
                        <Avatar name={player.name} size="sm" className="border-white/10" />
                        <span className="tracking-wider text-xl">
                          {player.name}
                          {isSelf ? <span className="text-xs text-[#aa8c55] ml-3 uppercase font-sans tracking-[0.2em]">(Ngươi)</span> : null}
                        </span>
                      </td>
                      <td className="py-4 text-center font-sans">
                        {player.isAlive ? (
                          <span className="text-xs tracking-[0.2em] text-[#aa8c55] uppercase">
                            Sống sót
                          </span>
                        ) : (
                          <span className="text-xs tracking-[0.2em] text-[#8a0303] uppercase">
                            Tử nạn
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-center font-bold text-gray-300 font-['Cinzel_Decorative',serif] tracking-wider text-xl">
                        {getRoleName(player.role)}
                      </td>
                      <td className="py-4 text-right pr-4">
                        {playerWon ? (
                          <span className="text-[#aa8c55] font-['Cinzel_Decorative',serif] text-xl tracking-widest uppercase">Thắng</span>
                        ) : (
                          <span className="text-gray-600 font-['Cinzel_Decorative',serif] text-xl tracking-widest uppercase">Thua</span>
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
        <div className="flex flex-col items-center gap-4 pt-4">
          <Button
            size="lg"
            variant="secondary"
            onClick={handleBackToLobby}
            className="w-full md:w-auto min-w-[300px]"
          >
            <RefreshCw className={`w-5 h-5 mr-3 ${secondsLeft !== null && secondsLeft > 0 ? 'animate-spin' : ''}`} />
            Luân Hồi {secondsLeft !== null && secondsLeft > 0 ? `(${secondsLeft}s)` : ''}
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
};
