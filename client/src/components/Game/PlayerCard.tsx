import { useGame } from '../../context/GameContext';
import type { Player } from '../../types/game';

export const PlayerCard = ({ player }: { player: Player }) => {
  const { seerVisions, myPlayer } = useGame();
  const isDisconnected = player.disconnected;
  const isDead = !player.isAlive;

  // Kiểm tra xem Tiên tri đã soi người này chưa
  const myVision = seerVisions?.find(v => v.targetId === player.id);
  const isWolfAlly = myPlayer?.role === 'WEREWOLF' && player.role === 'WEREWOLF';

  return (
    <div className={`relative bg-darker p-4 rounded-xl border transition-all duration-300 ${
      isDead ? 'border-red-900 opacity-50 grayscale' : 
      isDisconnected ? 'border-gray-700 opacity-70' : 
      isWolfAlly ? 'border-red-700 bg-red-950/5 hover:border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.15)]' :
      'border-gray-700 hover:border-gray-500'
    }`}>
      {/* Icon trạng thái */}
      <div className="absolute top-2 right-2 text-base z-10 flex gap-1 items-center">
        {player.isLover && (
          <span 
            className="px-1.5 py-0.5 rounded bg-pink-950/80 border border-pink-500/30 text-pink-400 text-xs font-bold animate-pulse"
            title="Người tình liên kết"
          >
            ❤️
          </span>
        )}
        {isWolfAlly && (
          <span 
            className="px-1.5 py-0.5 rounded bg-red-950/80 border border-red-500/30 text-red-400 text-xs font-bold"
            title="Đồng bọn Ma Sói"
          >
            🐺
          </span>
        )}
        {myVision && (
          <span 
            className={`px-1 rounded-full text-xs font-bold border ${
              myVision.isWerewolf 
                ? 'bg-red-950/80 border-red-500/30 text-red-400' 
                : 'bg-green-950/80 border-green-500/30 text-green-400'
            }`}
            title={myVision.isWerewolf ? 'Phe Sói' : 'Phe Dân'}
          >
            {myVision.isWerewolf ? '🐺' : '✅'}
          </span>
        )}
        {isDead && '💀'}
        {isDisconnected && !isDead && '🔌'}
      </div>

      <div className="flex flex-col items-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl mb-2
          ${isDead ? 'bg-red-900 text-red-200' : 'bg-linear-to-tr from-gray-700 to-gray-600 text-white'}
        `}>
          {player.name.charAt(0).toUpperCase()}
        </div>
        <p className="font-medium text-gray-200 text-center truncate w-full">{player.name}</p>
      </div>
    </div>
  );
};
