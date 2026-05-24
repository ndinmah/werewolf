import { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useSocket } from '../../context/SocketContext';
import { useParams } from 'react-router-dom';
import { Button } from '../UI/Button';
import { Eye, Shield, Search, Moon } from 'lucide-react';

export const NightActionModal = () => {
  const { id: roomId } = useParams();
  const socket = useSocket();
  const { 
    myPlayer, 
    phase, 
    nightActionPrompt, 
    setNightActionPrompt,
    nightStatus 
  } = useGame();

  const [selectedId, setSelectedId] = useState(null);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [wolfPartnersTargets, setWolfPartnersTargets] = useState({}); // { [partnerName]: targetId }

  // Lắng nghe sự kiện Sói đồng bọn chọn mục tiêu
  useEffect(() => {
    if (!socket || myPlayer?.role !== 'WEREWOLF') return;

    const handleWolfTarget = ({ targetId, actorName }) => {
      setWolfPartnersTargets(prev => ({
        ...prev,
        [actorName]: targetId
      }));
    };

    socket.on('WOLF_TARGET_SELECTED', handleWolfTarget);

    return () => {
      socket.off('WOLF_TARGET_SELECTED', handleWolfTarget);
    };
  }, [socket, myPlayer]);

  const [prevPhase, setPrevPhase] = useState(phase);
  const [prevPrompt, setPrevPrompt] = useState(nightActionPrompt);

  if (phase !== prevPhase || nightActionPrompt !== prevPrompt) {
    setPrevPhase(phase);
    setPrevPrompt(nightActionPrompt);
    setSelectedId(null);
    setHasConfirmed(false);
    setWolfPartnersTargets({});
  }

  if (phase !== 'night' || !myPlayer?.isAlive) return null;

  const handleSelect = (playerId) => {
    if (hasConfirmed) return;
    setSelectedId(playerId);

    // Gửi tín hiệu nháp cho các Sói khác xem cùng
    if (myPlayer?.role === 'WEREWOLF') {
      socket.emit('NIGHT_ACTION', { roomId, targetId: playerId });
    }
  };

  const handleConfirm = () => {
    if (!selectedId || hasConfirmed) return;
    
    // Gửi hành động chính thức lên server
    socket.emit('NIGHT_ACTION', { roomId, targetId: selectedId });
    setHasConfirmed(true);
    setNightActionPrompt(null); // Ẩn prompt sau khi submit để chuyển sang màn hình chờ ngủ
  };

  const getRoleHeader = () => {
    switch (myPlayer?.role) {
      case 'WEREWOLF':
        return {
          title: 'Phe Ma Sói',
          desc: 'Thảo luận với bầy đàn của bạn và chọn 1 nạn nhân để giết đêm nay.',
          icon: <Eye className="w-12 h-12 text-red-500 animate-pulse" />,
          color: 'border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)]'
        };
      case 'SEER':
        return {
          title: 'Tiên tri',
          desc: 'Chọn 1 người chơi để soi phe phái thực sự của họ.',
          icon: <Search className="w-12 h-12 text-purple-400" />,
          color: 'border-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.2)]'
        };
      case 'BODYGUARD':
        return {
          title: 'Bảo vệ',
          desc: 'Chọn 1 người chơi để bảo vệ khỏi bị Sói cắn đêm nay.',
          icon: <Shield className="w-12 h-12 text-green-400" />,
          color: 'border-green-600 shadow-[0_0_20px_rgba(22,163,74,0.2)]'
        };
      default:
        return null;
    }
  };

  const roleHeader = getRoleHeader();

  // Nếu người chơi KHÔNG có prompt hành động (Dân làng hoặc đã chọn xong)
  if (!nightActionPrompt || !roleHeader) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 text-center">
        {/* Animated Background Stars */}
        <div className="absolute inset-0 stars-bg opacity-40 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

        <Moon className="w-20 h-20 text-indigo-300 animate-bounce mb-6" />
        <h2 className="text-3xl font-extrabold text-white mb-2 tracking-wide">Đêm Đã Buông Xuống...</h2>
        <p className="text-gray-400 text-lg max-w-md px-6 leading-relaxed mb-8">
          Bạn đang chìm vào giấc ngủ say. Hãy giữ im lặng để các vai trò ban đêm thực hiện kỹ năng của họ.
        </p>
        
        {nightStatus?.currentRoleName ? (
          <div className="px-6 py-3 rounded-full bg-dark/60 border border-gray-800 backdrop-blur text-sm text-yellow-500 font-medium animate-pulse">
            Chủ phòng báo cáo: Đang chờ <span className="underline font-bold">{nightStatus.currentRoleName}</span> hành động...
          </div>
        ) : (
          <div className="text-gray-500 text-sm animate-pulse">
            Vui lòng đợi giây lát...
          </div>
        )}
      </div>
    );
  }

  // Lọc danh sách người chơi có thể tương tác
  const targets = nightActionPrompt.targetablePlayers || [];
  const excludeTargetId = nightActionPrompt.excludeTargetId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/98 overflow-y-auto px-4 py-8">
      <div className="absolute inset-0 stars-bg opacity-30 pointer-events-none"></div>
      
      <div className={`w-full max-w-4xl bg-dark/95 border backdrop-blur-md rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative z-10 ${roleHeader.color}`}>
        <div className="flex flex-col md:flex-row items-center gap-4 border-b border-gray-800 pb-6">
          <div className="p-4 bg-darker rounded-2xl border border-gray-800">
            {roleHeader.icon}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-white tracking-wide">{roleHeader.title}</h2>
            <p className="text-gray-400 mt-1 max-w-2xl">{roleHeader.desc}</p>
          </div>
        </div>

        {/* Grid người chơi */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[50vh] pr-2">
          {targets.map(player => {
            const isExcluded = player.id === excludeTargetId;
            const isSelected = selectedId === player.id;
            const isSelf = player.id === myPlayer.id;

            // Xem có đồng bọn sói nào đang nhắm vào người này không
            const partnersTargeting = Object.entries(wolfPartnersTargets)
              .filter(([, targetId]) => targetId === player.id)
              .map(([actorName]) => actorName);

            return (
              <div
                key={player.id}
                onClick={() => !isExcluded && handleSelect(player.id)}
                className={`relative p-4 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center text-center select-none min-h-[120px]
                  ${isExcluded 
                    ? 'bg-darker/30 border-gray-900 opacity-40 cursor-not-allowed' 
                    : isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 scale-[1.03] shadow-[0_0_15px_rgba(99,102,241,0.2)] cursor-pointer'
                      : 'bg-darker/80 border-gray-800 hover:border-gray-700 cursor-pointer'
                  }
                `}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 border
                  ${isSelected ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-gray-800 border-gray-700 text-gray-300'}
                `}>
                  {player.name.charAt(0).toUpperCase()}
                </div>
                
                <span className="font-bold text-gray-200 text-sm truncate max-w-full">
                  {player.name}
                  {isSelf && <span className="text-xs text-indigo-400 ml-1">(Bạn)</span>}
                </span>

                {isExcluded && (
                  <span className="text-[10px] text-red-400 font-medium mt-1">
                    (Vừa được bảo vệ đêm qua)
                  </span>
                )}

                {/* Hiển thị đồng bọn sói đang chọn */}
                {partnersTargeting.length > 0 && (
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-20">
                    {partnersTargeting.map(name => (
                      <span 
                        key={name} 
                        className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded-full font-bold shadow animate-bounce"
                        title={`${name} đang ngắm`}
                      >
                        🐺 {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-4 border-t border-gray-800 pt-6 mt-2">
          <Button
            size="lg"
            disabled={!selectedId || hasConfirmed}
            onClick={handleConfirm}
            className={`px-8 font-bold tracking-wider ${
              hasConfirmed 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20'
            }`}
          >
            {hasConfirmed ? 'HÀNH ĐỘNG ĐÃ GỬI' : 'CHỐT HÀNH ĐỘNG'}
          </Button>
        </div>
      </div>
    </div>
  );
};
