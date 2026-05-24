import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Eye, Shield, Search, Users, HelpCircle, Target } from 'lucide-react';
import { Button } from '../UI/Button';

export const RoleRevealScreen = ({ onConfirm }) => {
  const { myPlayer } = useGame();
  const [isFlipped, setIsFlipped] = useState(false);

  if (!myPlayer) return null;

  const getRoleMeta = () => {
    switch (myPlayer.role) {
      case 'WEREWOLF':
        return {
          name: 'Ma Sói',
          factionName: 'Phe Ma Sói',
          factionColor: 'text-red-400 bg-red-950/60 border-red-800',
          desc: 'Thức dậy vào ban đêm để chọn một nạn nhân. Cố gắng ẩn mình giả làm người lành vào ban ngày để tiêu diệt dân làng.',
          icon: <Eye className="w-16 h-16 text-red-500 animate-pulse" />,
          cardBg: 'from-slate-900 via-zinc-950 to-red-950/50 border-red-900/50 shadow-[0_0_40px_rgba(220,38,38,0.2)]'
        };
      case 'SEER':
        return {
          name: 'Tiên Tri',
          factionName: 'Phe Dân Làng',
          factionColor: 'text-purple-400 bg-purple-950/60 border-purple-800',
          desc: 'Thức dậy mỗi đêm để soi xem một người chơi có phải là Sói hay không. Hãy khéo léo đưa thông tin ra ban ngày mà không để bị lộ diện.',
          icon: <Search className="w-16 h-16 text-purple-400" />,
          cardBg: 'from-slate-900 via-zinc-950 to-purple-950/50 border-purple-900/50 shadow-[0_0_40px_rgba(147,51,234,0.2)]'
        };
      case 'BODYGUARD':
        return {
          name: 'Bảo Vệ',
          factionName: 'Phe Dân Làng',
          factionColor: 'text-green-400 bg-green-950/60 border-green-800',
          desc: 'Thức dậy mỗi đêm để bảo vệ một người khỏi bị Sói cắn. Bạn có thể bảo vệ chính mình nhưng không thể bảo vệ cùng một người hai đêm liên tiếp.',
          icon: <Shield className="w-16 h-16 text-green-400" />,
          cardBg: 'from-slate-900 via-zinc-950 to-green-950/50 border-green-900/50 shadow-[0_0_40px_rgba(22,163,74,0.2)]'
        };
      case 'HUNTER':
        return {
          name: 'Thợ Săn',
          factionName: 'Phe Dân Làng',
          factionColor: 'text-amber-500 bg-amber-950/60 border-amber-800',
          desc: 'Có bản năng sinh tồn mạnh mẽ. Khi bị giết bởi Sói hoặc bị dân làng treo cổ, bạn có quyền bắn chết thêm một mục tiêu đáng ngờ khác.',
          icon: <Target className="w-16 h-16 text-amber-500 animate-pulse" />,
          cardBg: 'from-slate-900 via-zinc-950 to-amber-950/50 border-amber-900/50 shadow-[0_0_40px_rgba(245,158,11,0.2)]'
        };
      case 'VILLAGER':
      default:
        return {
          name: 'Dân Làng',
          factionName: 'Phe Dân Làng',
          factionColor: 'text-blue-400 bg-blue-950/60 border-blue-800',
          desc: 'Không có kỹ năng đặc biệt ban đêm. Vũ khí mạnh nhất của bạn là thảo luận và bỏ phiếu treo cổ những kẻ đáng ngờ vào ban ngày.',
          icon: <Users className="w-16 h-16 text-blue-400" />,
          cardBg: 'from-slate-900 via-zinc-950 to-blue-950/50 border-blue-900/50 shadow-[0_0_40px_rgba(59,130,246,0.2)]'
        };
    }
  };

  const meta = getRoleMeta();

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/98 px-4 overflow-y-auto">
      <div className="absolute inset-0 stars-bg opacity-35 pointer-events-none"></div>

      <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-wider mb-2 text-center uppercase animate-fade-in">
        Vai Trò Của Bạn Đã Sẵn Sàng
      </h2>
      <p className="text-gray-500 text-sm md:text-base mb-12 text-center max-w-sm">
        Chạm vào lá bài bên dưới để lật và xem vai trò bí mật của bạn.
      </p>

      {/* 3D Card Container */}
      <div className="w-72 h-[420px] perspective-[1000px] cursor-pointer mb-12" onClick={() => setIsFlipped(true)}>
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
                {meta.icon}
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
          TÔI ĐÃ HIỂU
        </Button>
      </div>
    </div>
  );
};
