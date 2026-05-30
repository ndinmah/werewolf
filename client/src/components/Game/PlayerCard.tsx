import { memo } from 'react';
import { useGame } from '../../context/GameContext';
import { Avatar } from '../UI/Avatar';
import type { Player } from '../../types/game';

export const PlayerCard = memo(({ player }: { player: Player }) => {
  const { seerVisions, myPlayer } = useGame();
  const isDisconnected = player.disconnected;
  const isDead = !player.isAlive;

  const myVision = seerVisions?.find(v => v.targetId === player.id);
  const isWolfAlly = myPlayer?.role === 'WEREWOLF' && player.role === 'WEREWOLF';

  return (
    <div className={`relative bg-[#0a0a0a]/90 p-4 rounded-none border transition-all duration-500 overflow-hidden group ${
      isDead ? 'border-[#8a0303]/30 opacity-60 grayscale' : 
      isDisconnected ? 'border-white/10 opacity-50' : 
      isWolfAlly ? 'border-[#8a0303] bg-[#8a0303]/10 hover:border-[#8a0303] shadow-[0_0_15px_rgba(138,3,3,0.2)]' :
      'border-white/10 hover:border-[#aa8c55]/50 hover:bg-white/5'
    }`}>
      {/* Background slash if dead */}
      {isDead ? (
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/2 left-1/2 w-[150%] h-[2px] bg-[#8a0303] -translate-x-1/2 -translate-y-1/2 rotate-45 opacity-50"></div>
          <div className="absolute top-1/2 left-1/2 w-[150%] h-[2px] bg-[#8a0303] -translate-x-1/2 -translate-y-1/2 -rotate-45 opacity-50"></div>
          <div className="absolute inset-0 bg-[#8a0303]/10"></div>
        </div>
      ) : null}

      {/* Icon trạng thái */}
      <div className="absolute top-2 right-2 text-base z-10 flex gap-1 items-center">
        {player.isLover ? (
          <span 
            className="px-1.5 py-0.5 bg-[#030303] border border-pink-500/30 text-pink-500 text-xs font-bold animate-pulse"
            title="Người tình liên kết"
          >
            ❤️
          </span>
        ) : null}
        {isWolfAlly ? (
          <span 
            className="px-1.5 py-0.5 bg-[#030303] border border-[#8a0303]/50 text-[#8a0303] text-xs font-bold shadow-[0_0_10px_rgba(138,3,3,0.5)]"
            title="Đồng bọn Ma Sói"
          >
            🐺
          </span>
        ) : null}
        {myVision ? (
          <span 
            className={`px-1 rounded-none text-xs font-bold border ${
              myVision.isWerewolf 
                ? 'bg-[#030303] border-[#8a0303]/50 text-[#8a0303]' 
                : 'bg-[#030303] border-[#aa8c55]/50 text-[#aa8c55]'
            }`}
            title={myVision.isWerewolf ? 'Phe Sói' : 'Phe Dân'}
          >
            {myVision.isWerewolf ? '🐺' : '✅'}
          </span>
        ) : null}
        {isDead ? <span className="text-[#8a0303] drop-shadow-[0_0_5px_rgba(138,3,3,0.8)]">💀</span> : null}
        {(isDisconnected && !isDead) ? <span className="opacity-50">🔌</span> : null}
      </div>

      <div className="flex flex-col items-center relative z-10">
        <Avatar
          name={player.name}
          size="lg"
          className={`mb-3 ${isDead ? 'border-[#8a0303] text-[#8a0303] shadow-[inset_0_0_20px_rgba(138,3,3,0.5)]' : 'border-white/20 text-[#aa8c55]'}`}
        />
        <p className={`font-['Cinzel_Decorative',serif] font-bold text-center truncate w-full text-lg tracking-wider ${isDead ? 'text-[#8a0303]' : 'text-gray-200 group-hover:text-[#aa8c55] transition-colors'}`}>
          {player.name}
        </p>
      </div>
    </div>
  );
});
