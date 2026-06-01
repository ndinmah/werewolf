import { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { HelpCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { PhaseTimer } from '../UI/PhaseTimer';
import { ModalOverlay } from '../UI/ModalOverlay';
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
  const IconComponent = meta.iconComponent;

  // Custom colors for factions
  const borderFaction = meta.factionColor.replace('bg-', 'border-').replace('100', '800').replace('800', '800');

  return (
    <ModalOverlay opacity="dark" className="flex-col font-['Cormorant_Garamond',serif]">
      <h2 className="text-3xl md:text-5xl font-['Cinzel_Decorative',serif] text-white tracking-[0.2em] mb-4 text-center uppercase animate-fade-in drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
        Định Mệnh Của Ngươi
      </h2>
      <div className="mb-8 flex justify-center scale-100">
        <PhaseTimer />
      </div>
      <p className="text-gray-400 text-lg md:text-xl mb-12 text-center max-w-md italic border-l border-r border-white/10 px-6">
        "Chạm vào lá bài để mở khóa bản ngã thực sự của ngươi. Bí mật này không được phép tiết lộ."
      </p>

      {/* 3D Card Container */}
      <div className="w-80 h-[480px] perspective-[1500px] cursor-pointer mb-14 group" onClick={() => setIsFlippedByUser(true)}>
        <div className={`relative w-full h-full duration-1500 transform-3d transition-transform ${isFlipped ? 'transform-[rotateY(180deg)]' : ''}`}>
          
          {/* Card Front (Mystery) */}
          <div className="absolute inset-0 w-full h-full rounded-none border border-white/20 bg-[#030303] flex flex-col items-center justify-center p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] backface-hidden group-hover:border-white/40 transition-colors">
            {/* Edge details */}
            <div className="absolute top-2 left-2 right-2 bottom-2 border border-white/5 pointer-events-none"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-linear-to-r from-transparent via-white/30 to-transparent"></div>
            
            <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center mb-8 relative shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]">
              <div className="absolute inset-0 bg-white/5 rounded-full animate-ping opacity-20"></div>
              <HelpCircle className="w-12 h-12 text-gray-500 animate-pulse" />
            </div>
            <p className="font-sans text-xs tracking-[0.3em] text-gray-400 font-bold uppercase">Click để xem</p>
            <div className="absolute bottom-8 text-[10px] text-[#aa8c55] font-sans tracking-[0.4em] uppercase">Werewolf Ritual</div>
          </div>

          {/* Card Back (Role details) */}
          <div 
            className={`absolute inset-0 w-full h-full rounded-none border ${borderFaction} bg-[#0a0a0a] flex flex-col items-center justify-between p-8 backface-hidden transform-[rotateY(180deg)] shadow-[0_0_50px_rgba(0,0,0,0.9)]`}
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(10, 10, 10, 0.7), rgba(10, 10, 10, 0.95)), url(${meta.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Inner border */}
            <div className={`absolute top-2 left-2 right-2 bottom-2 border ${borderFaction} opacity-50 pointer-events-none`}></div>
            
            {/* Header */}
            <div className="w-full text-center relative z-10 mt-2">
              <span className={`text-xs font-sans px-4 py-1.5 border tracking-[0.3em] uppercase ${meta.factionColor}`}>
                {meta.factionName}
              </span>
            </div>

            {/* Icon & Name */}
            <div className="flex flex-col items-center relative z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-black blur-2xl -z-10"></div>
              <div className={`p-6 bg-[#030303] rounded-none border ${borderFaction} mb-6 shadow-[inset_0_0_30px_rgba(0,0,0,1)]`}>
                <IconComponent className={`w-20 h-20 ${meta.color} ${meta.animateIcon ? 'animate-pulse' : ''}`} />
              </div>
              <h3 className={`text-4xl font-['Cinzel_Decorative',serif] ${meta.color.replace('text-', 'text-')} uppercase tracking-widest text-center`}>
                {meta.name}
              </h3>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-lg text-center leading-relaxed italic max-w-[260px] relative z-10 mb-4">
              "{meta.desc}"
            </p>

            <div className="text-[10px] text-[#8a0303] font-sans uppercase tracking-[0.4em] relative z-10 font-bold">
              Giữ bí mật tuyệt đối
            </div>
          </div>

        </div>
      </div>

      {/* Button to confirm */}
      <div className={`transition-all duration-1000 ${isFlipped ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <Button 
          size="lg" 
          variant={phase !== 'roleReveal' ? 'ghost' : 'primary'}
          onClick={onConfirm}
          className="min-w-[250px]"
        >
          {phase !== 'roleReveal' ? 'Màn đêm buông xuống...' : 'Đã rõ định mệnh'}
        </Button>
      </div>
    </ModalOverlay>
  );
};
