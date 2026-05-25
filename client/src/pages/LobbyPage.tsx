import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Button } from '../components/UI/Button';
import { useGame } from '../context/GameContext';
import { Plus, Minus, Clock, ShieldAlert } from 'lucide-react';
import type { Room, Role } from '../types/game';

interface RoleConfig {
  id: Role;
  name: string;
  strength: number;
  icon: string;
  color: string;
}

const AVAILABLE_ROLES: RoleConfig[] = [
  { id: 'WEREWOLF', name: 'Ma Sói', strength: -2, icon: '🐺', color: 'text-red-400' },
  { id: 'SEER', name: 'Tiên Tri', strength: 3, icon: '🔮', color: 'text-purple-400' },
  { id: 'BODYGUARD', name: 'Bảo Vệ', strength: 3, icon: '🛡️', color: 'text-green-400' },
  { id: 'HUNTER', name: 'Thợ Săn', strength: 2, icon: '🏹', color: 'text-amber-400' },
  { id: 'VILLAGER', name: 'Dân Làng', strength: 1, icon: '🧑', color: 'text-blue-400' }
];

export const LobbyPage = () => {
  const { id: roomId } = useParams<{ id: string }>();
  const socket = useSocket();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const { gameState } = useGame();

  // Chuyển hướng sang trang game nếu game đã bắt đầu
  useEffect(() => {
    if (gameState && gameState.phase && gameState.phase !== 'lobby' as string) {
      navigate(`/room/${roomId}/game`);
    }
  }, [gameState, navigate, roomId]);

  // Fetch thông tin phòng ban đầu
  useEffect(() => {
    if (!socket || !roomId) return;

    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        alert('Không thể kết nối đến phòng. Vui lòng thử lại.');
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
        alert(response.error || 'Phòng không tồn tại');
        navigate('/');
      }
    });

    return () => {
      settled = true;
      clearTimeout(timer);
    };
  }, [socket, roomId, navigate]);

  useEffect(() => {
    if (!socket) return;

    socket.on('ROOM_UPDATED', (updatedRoom: Room) => {
      setRoom(updatedRoom);
    });

    return () => {
      socket.off('ROOM_UPDATED');
    };
  }, [socket]);

  if (!room) return <div className="pt-20 text-center text-gray-400">Đang tải phòng...</div>;

  const isHost = room.hostId === socket?.id;

  const handleStartGame = () => {
    // Validate bài trước khi chơi
    const roles = room.settings?.roles || [];
    const wolfCount = roles.filter((r) => r === 'WEREWOLF').length;

    if (wolfCount < 1) {
      alert('⚠️ Trận đấu phải có ít nhất 1 Ma Sói!');
      return;
    }
    if (room.players.length < 2) {
      alert('⚠️ Trận đấu phải có ít nhất 2 người chơi!');
      return;
    }

    socket.emit('START_GAME', { roomId: room.id }, (response: { success: boolean; error?: string }) => {
      if (response && !response.success) {
        alert(response.error);
      }
    });
  };

  const handleUpdateSettings = (updatedFields: Record<string, unknown>) => {
    const s = room.settings as unknown as Record<string, unknown>;
    const updatedSettings = {
      discussionTime: s?.discussionTime ?? 120,
      voteTime: s?.voteTime ?? 60,
      dayStartDuration: s?.dayStartDuration ?? 8,
      roles: room.settings?.roles || ['WEREWOLF', 'SEER', 'BODYGUARD', 'VILLAGER'],
      ...updatedFields,
    };
    socket.emit('UPDATE_SETTINGS', { roomId: room.id, settings: updatedSettings });
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

  const handleTimerChange = (key: string, value: string) => {
    const intVal = parseInt(value, 10);
    if (!isNaN(intVal) && intVal > 0) {
      handleUpdateSettings({ [key]: intVal });
    }
  };

  const roleCounts = getRoleCounts();
  const totalStrength = AVAILABLE_ROLES.reduce(
    (sum, r) => sum + (roleCounts[r.id] || 0) * r.strength,
    0,
  );

  const roomSettings = room.settings as unknown as Record<string, unknown>;

  return (
    <div className="min-h-screen pt-20 px-4 container mx-auto max-w-6xl">
      <div className="stars-bg absolute inset-0 -z-10 opacity-30"></div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Phòng chờ game</h1>
          <p className="text-gray-400">
            Mã phòng: <span className="text-wolf-light font-mono font-bold text-xl ml-2">{room.id}</span>
          </p>
        </div>
        {isHost && (
          <Button size="lg" className="px-8 shadow-lg shadow-wolf/20 font-bold" onClick={handleStartGame}>
            BẮT ĐẦU GAME
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cột danh sách Người chơi */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-dark/50 p-6 rounded-xl border border-gray-800 backdrop-blur-xs">
            <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
              <span>Người chơi tham gia ({room.players.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {room.players.map((player) => (
                <div
                  key={player.id}
                  className="bg-darker/60 p-4 rounded-lg flex items-center gap-3 border border-gray-800 hover:border-gray-700 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-linear-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center font-bold text-white">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-200">{player.name}</p>
                    {player.id === room.hostId && <span className="text-xs text-yellow-500 font-bold">Chủ phòng</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cột Cài đặt */}
        <div className="space-y-4">
          <div className="bg-dark/50 p-6 rounded-xl border border-gray-800 backdrop-blur-xs flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold mb-1">Cài đặt phòng</h2>
              <p className="text-gray-500 text-xs">
                {isHost ? 'Bạn đang cấu hình phòng chơi này.' : 'Chỉ chủ phòng mới có thể thay đổi.'}
              </p>
            </div>

            {/* Timers settings */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Thời gian các Phase (giây)</span>
              </h3>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1">Bình minh</label>
                  <input
                    type="number"
                    disabled={!isHost}
                    value={(roomSettings?.dayStartDuration as number) || 8}
                    onChange={(e) => handleTimerChange('dayStartDuration', e.target.value)}
                    className="w-full bg-darker border border-gray-800 rounded-lg py-2 px-3 text-white text-center disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1 font-bold">Thảo luận</label>
                  <input
                    type="number"
                    disabled={!isHost}
                    value={(roomSettings?.discussionTime as number) || 120}
                    onChange={(e) => handleTimerChange('discussionTime', e.target.value)}
                    className="w-full bg-darker border border-gray-800 rounded-lg py-2 px-3 text-white text-center disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1 font-bold">Biểu quyết</label>
                  <input
                    type="number"
                    disabled={!isHost}
                    value={(roomSettings?.voteTime as number) || 60}
                    onChange={(e) => handleTimerChange('voteTime', e.target.value)}
                    className="w-full bg-darker border border-gray-800 rounded-lg py-2 px-3 text-white text-center disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Roles selector & Strength Meter */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Bộ bài (Role Deck)</span>
                </h3>
                
                {/* Strength Meter */}
                <div className={`px-2 py-0.5 rounded text-xs font-bold font-mono border
                  ${totalStrength === 0 
                    ? 'bg-green-950/40 border-green-500 text-green-400' 
                    : totalStrength > 0 
                      ? 'bg-blue-950/40 border-blue-500 text-blue-400' 
                      : 'bg-red-950/40 border-red-500 text-red-400'
                  }
                `} title="Tổng điểm sức mạnh. Cân bằng nhất là 0.">
                  Cân bằng: {totalStrength > 0 ? `+${totalStrength}` : totalStrength}
                </div>
              </div>

              <div className="space-y-2 bg-darker/60 p-3 rounded-lg border border-gray-800">
                {AVAILABLE_ROLES.map((role) => {
                  const count = roleCounts[role.id] || 0;
                  return (
                    <div key={role.id} className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{role.icon}</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-200">{role.name}</span>
                          <span className="text-[9px] text-gray-500 font-mono">Điểm: {role.strength > 0 ? `+${role.strength}` : role.strength}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isHost ? (
                          <>
                            <button
                              onClick={() => handleUpdateRoleCount(role.id, -1)}
                              className="p-1 rounded bg-dark border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm font-extrabold text-white">{count}</span>
                            <button
                              onClick={() => handleUpdateRoleCount(role.id, 1)}
                              className="p-1 rounded bg-dark border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="font-extrabold text-white px-2 py-0.5 rounded bg-dark text-xs border border-gray-800">
                            x{count}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
