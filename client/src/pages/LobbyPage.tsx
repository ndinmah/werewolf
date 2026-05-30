import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useGame } from '../context/GameContext';
import { useToast } from '../context/ToastContext';
import { Copy, Users } from 'lucide-react';
import type { Room, Role, RoomSettings } from '../types/game';
import { AVAILABLE_ROLES } from '../constants/roles';
import { LobbyPlayerList } from '../components/Lobby/LobbyPlayerList';
import { LobbyTimerSettings } from '../components/Lobby/LobbyTimerSettings';
import { LobbyRoleDeck } from '../components/Lobby/LobbyRoleDeck';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';

export const LobbyPage = () => {
  const { id: roomId } = useParams<{ id: string }>();
  const socket = useSocket();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [room, setRoom] = useState<Room | null>(null);
  const { gameState } = useGame();

  useEffect(() => {
    if (gameState && gameState.phase && gameState.phase !== 'lobby') {
      navigate(`/room/${roomId}/game`);
    }
  }, [gameState, navigate, roomId]);

  useEffect(() => {
    if (!socket || !roomId) return;

    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        showToast('Không thể kết nối đến phòng. Vui lòng thử lại.', 'error');
        navigate('/');
      }
    }, 5000);

    socket.emit('GET_ROOM', { roomId }, (response: { success: boolean; room: Room; error?: string }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (response.success) {
        setRoom(response.room);
      } else {
        showToast(response.error || 'Phòng không tồn tại', 'error');
        navigate('/');
      }
    });

    return () => {
      settled = true;
      clearTimeout(timer);
    };
  }, [socket, roomId, navigate, showToast]);

  useEffect(() => {
    if (!socket) return;

    socket.on('ROOM_UPDATED', (updatedRoom: Room) => {
      setRoom(updatedRoom);
    });

    socket.on('KICKED', () => {
      showToast('Bạn đã bị kick khỏi phòng bởi chủ phòng.', 'warning');
      navigate('/');
    });

    return () => {
      socket.off('ROOM_UPDATED');
      socket.off('KICKED');
    };
  }, [socket, navigate, showToast]);

  if (!room) return <LoadingSpinner text="Summoning ritual circle..." />;

  const isHost = room.hostId === socket?.id;

  const handleStartGame = () => {
    const roles = room.settings?.roles || [];
    const wolfCount = roles.filter((r) => r === 'WEREWOLF').length;

    if (wolfCount < 1) {
      showToast('⚠️ Trận đấu phải có ít nhất 1 Ma Sói!', 'warning');
      return;
    }
    if (room.players.length < 2) {
      showToast('⚠️ Trận đấu phải có ít nhất 2 người chơi!', 'warning');
      return;
    }

    socket.emit('START_GAME', { roomId: room.id }, (response: { success: boolean; error?: string }) => {
      if (response && !response.success) {
        showToast(response.error || 'Lỗi không xác định khi bắt đầu game', 'error');
      }
    });
  };

  const handleUpdateSettings = (updatedFields: Partial<RoomSettings>) => {
    const updatedSettings = {
      discussionTime: room?.settings?.discussionTime ?? 120,
      voteTime: room?.settings?.voteTime ?? 60,
      dayStartDuration: room?.settings?.dayStartDuration ?? 8,
      roles: room?.settings?.roles || ['WEREWOLF', 'SEER', 'BODYGUARD', 'VILLAGER'],
      ...updatedFields,
    };
    socket.emit('UPDATE_SETTINGS', { roomId: room?.id, settings: updatedSettings });
  };

  const getRoleCounts = (): Record<string, number> => {
    const roles = room.settings?.roles || [];
    const counts: Record<string, number> = {};
    AVAILABLE_ROLES.forEach((r) => {
      counts[r.id] = roles.filter((roleId) => roleId === r.id).length;
    });
    return counts;
  };

  const handleUpdateRoleCount = (roleId: Role, delta: number) => {
    const counts = getRoleCounts();
    const currentCount = counts[roleId] || 0;
    const newCount = Math.max(0, currentCount + delta);

    const newRoles: Role[] = [];
    AVAILABLE_ROLES.forEach((r) => {
      const count = r.id === roleId ? newCount : counts[r.id] || 0;
      for (let i = 0; i < count; i++) {
        newRoles.push(r.id);
      }
    });

    handleUpdateSettings({ roles: newRoles });
  };

  const handleTimerChange = (key: keyof RoomSettings, value: string) => {
    const intVal = parseInt(value, 10);
    if (!isNaN(intVal) && intVal > 0) {
      handleUpdateSettings({ [key]: intVal });
    }
  };

  const roleCounts = getRoleCounts();
  const totalStrength = AVAILABLE_ROLES.reduce((sum, r) => sum + (roleCounts[r.id] || 0) * r.strength, 0);
  const roomSettings = room?.settings;

  return (
    <div className="min-h-screen bg-[#030303] text-[#e2e8f0] relative overflow-x-hidden font-['Cormorant_Garamond',serif] pt-28 pb-12">
      
      {/* Dark magical background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 right-0 w-[800px] h-[800px] bg-[#8a0303] rounded-full blur-[150px] opacity-10 mix-blend-screen animate-pulse duration-10000"></div>
        <div className="absolute bottom-1/4 left-0 w-[600px] h-[600px] bg-[#1a0000] rounded-full blur-[120px] opacity-30 mix-blend-screen"></div>
      </div>

      {/* Giant Typography Background */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-[0.03] z-0 select-none">
        <h1 className="text-[20vw] leading-none font-black text-transparent bg-clip-text bg-linear-to-b from-white to-transparent tracking-tighter font-['Cinzel_Decorative',serif]">
          LOBBY
        </h1>
      </div>

      <div className="container mx-auto max-w-6xl px-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b border-white/10 pb-6">
          <div className="flex flex-col">
            <span className="text-[#aa8c55] tracking-[0.3em] uppercase text-sm font-light mb-2">Ritual Chamber</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-['Cinzel_Decorative',serif] drop-shadow-[0_0_10px_rgba(138,3,3,0.3)]">
              Phòng chờ
            </h1>
            <div className="flex items-center gap-3 mt-4 text-gray-400">
              <span className="text-sm uppercase tracking-widest font-sans">Mã phòng:</span>
              <span className="text-[#aa8c55] font-['Cinzel_Decorative',serif] font-bold text-2xl tracking-widest">{room.id}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(room.id);
                  showToast('Đã chép mã nghi thức!', 'success');
                }}
                className="ml-2 p-1.5 border border-white/10 text-gray-500 hover:text-[#aa8c55] hover:border-[#aa8c55] transition-colors cursor-pointer"
                title="Copy mã phòng"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isHost ? (
            <button
              onClick={handleStartGame}
              className="relative px-12 py-4 bg-[#8a0303]/10 border border-[#8a0303] text-[#ffdddd] text-xl font-['Cinzel_Decorative',serif] tracking-[0.2em] uppercase hover:bg-[#8a0303] hover:text-white transition-all duration-500 overflow-hidden group shadow-[0_0_20px_rgba(138,3,3,0.2)]"
            >
              <span className="relative z-10">Bắt đầu nghi thức</span>
              <div className="absolute inset-0 w-0 bg-[#8a0303] group-hover:w-full transition-all duration-500 ease-in-out z-0"></div>
            </button>
          ) : (
            <div className="px-8 py-4 bg-white/5 border border-white/10 text-gray-400 text-sm tracking-[0.2em] uppercase flex items-center gap-3 font-sans">
              <Users className="w-4 h-4" />
              <span>Chờ chủ phòng bắt đầu...</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Players Column */}
          <div className="lg:col-span-2">
            <LobbyPlayerList
              players={room.players}
              hostId={room.hostId}
              myPlayerId={socket?.id}
              isHost={isHost}
              onKick={(player) => {
                socket?.emit(
                  'KICK_PLAYER',
                  { roomId: room.id, targetPlayerId: player.id },
                  (res: { success: boolean; error?: string }) => {
                    if (res && !res.success) {
                      showToast(res.error || 'Lỗi không xác định', 'error');
                    } else {
                      showToast(`Đã trục xuất ${player.name}`, 'success');
                    }
                  },
                );
              }}
            />
          </div>

          {/* Settings Column */}
          <div className="flex flex-col gap-8 h-full">
            <div className="flex flex-col space-y-2">
              <h2 className="text-xl font-['Cinzel_Decorative',serif] text-white tracking-widest uppercase">Cấu hình</h2>
              <p className="text-[#aa8c55] text-xs uppercase tracking-widest font-sans">
                {isHost ? 'Bạn đang giữ quyền định đoạt.' : 'Chỉ chủ phòng mới có thể thay đổi.'}
              </p>
            </div>
            
            <LobbyTimerSettings roomSettings={roomSettings} isHost={isHost} onTimerChange={handleTimerChange} />
            <LobbyRoleDeck
              isHost={isHost}
              roleCounts={roleCounts}
              totalStrength={totalStrength}
              onUpdateRoleCount={handleUpdateRoleCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
