import { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { HelpCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { PhaseTimer } from '../UI/PhaseTimer';
import { getRoleMeta } from '../../constants/roles';

interface RoleRevealScreenProps {
  onConfirm: () => void;
}

export const RoleRevealScreen = ({ onConfirm }: RoleRevealScreenProps) => {
  const { myPlayer, phase } = useGame();
  const [isFlippedByUser, setIsFlippedByUser] = useState(false);
  const [autoConfirmed, setAutoConfirmed] = useState(false);

  const isFlipped = isFlippedByUser || phase !== 'roleReveal';

  useEffect(() => {
    if (phase !== 'roleReveal' && !autoConfirmed) {
      const timer = setTimeout(() => {
        onConfirm();
        setAutoConfirmed(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase, onConfirm, autoConfirmed]);

  if (!myPlayer) return null;

  const meta = getRoleMeta(myPlayer.role);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/98 px-4 overflow-y-auto">
      <div className="absolute inset-0 stars-bg opacity-35 pointer-events-none"></div>

      <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-wider mb-2 text-center uppercase animate-fade-in">
        Vai Trò Của Bạn Đã Sẵn Sàng
      </h2>
      <div className="mb-6 flex justify-center scale-90">
        <PhaseTimer />
      </div>
      <p className="text-gray-500 text-sm md:text-base mb-8 text-center max-w-sm">
        Chạm vào lá bài bên dưới để lật và xem vai trò bí mật của bạn.
      </p>

      {/* 3D Card Container */}
      <div className="w-72 h-[420px] perspective-[1000px] cursor-pointer mb-12" onClick={() => setIsFlippedByUser(true)}>
        <div className={`relative w-full h-full duration-700 transform-3d transition-transform ${isFlipped ? 'transform-[rotateY(180deg)]' : ''}`}>
          
          {/* Card Front (Mystery) */}
          <div className="absolute inset-0 w-full h-full rounded-2xl border border-gray-800 bg-linear-to-b from-slate-900 to-indigo-950/60 flex flex-col items-center justify-center p-6 shadow-2xl backface-hidden">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center mb-6">
              <HelpCircle className="w-12 h-12 text-gray-500 animate-pulse" />
            </div>
            <p className="font-mono text-xs tracking-widest text-indigo-400 font-bold uppercase">Click để lật bài</p>
            <div className="absolute bottom-6 text-[10px] text-gray-600 font-mono">WEREWOLF GAME</div>
          </div>

          {/* Card Back (Role details) */}
          <div className={`absolute inset-0 w-full h-full rounded-2xl border bg-linear-to-b ${meta.cardBg} flex flex-col items-center justify-between p-6 backface-hidden transform-[rotateY(180deg)]`}>
            
            {/* Header */}
            <div className="w-full text-center">
              <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border tracking-widest uppercase ${meta.factionColor}`}>
                {meta.factionName}
              </span>
            </div>

            {/* Icon & Name */}
            <div className="flex flex-col items-center">
              <div className="p-4 bg-darker/60 rounded-2xl border border-gray-800/50 mb-4">
                {(() => {
                  const Icon = meta.iconComponent;
                  return <Icon className={`w-16 h-16 ${meta.color} ${meta.animateIcon ? 'animate-pulse' : ''}`} />;
                })()}
              </div>
              <h3 className="text-3xl font-black text-white uppercase tracking-wider">
                {meta.name}
              </h3>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-xs text-center leading-relaxed font-medium max-w-[240px]">
              {meta.desc}
            </p>

            <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
              Giữ bí mật tuyệt đối
            </div>
          </div>

        </div>
      </div>

      {/* Button to confirm */}
      <div className={`transition-all duration-300 ${isFlipped ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <Button 
          size="lg" 
          onClick={onConfirm}
          className="bg-indigo-600 hover:bg-indigo-700 px-10 shadow-lg shadow-indigo-600/20 font-bold tracking-wider"
        >
          {phase !== 'roleReveal' ? 'ĐANG VÀO ĐÊM...' : 'TÔI ĐÃ HIỂU'}
        </Button>
      </div>
    </div>
  );
};
