import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Button } from '../components/UI/Button';
import { useGame } from '../context/GameContext';
import { useToast } from '../context/ToastContext';
import { Copy } from 'lucide-react';
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

  // Chuyển hướng sang trang game nếu game đã bắt đầu
  useEffect(() => {
    if (gameState && gameState.phase && gameState.phase !== 'lobby') {
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

  if (!room) return <LoadingSpinner text="Đang tải phòng..." />;

  const isHost = room.hostId === socket?.id;

  const handleStartGame = () => {
    // Validate bài trước khi chơi
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
    <div className="min-h-screen pt-20 px-4 container mx-auto max-w-6xl">
      <div className="stars-bg absolute inset-0 -z-10 opacity-30"></div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Phòng chờ game</h1>
          <p className="text-gray-400 flex items-center gap-2">
            Mã phòng: <span className="text-wolf-light font-mono font-bold text-xl">{room.id}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(room.id);
                showToast('Đã copy mã phòng!', 'success');
              }}
              className="p-1 rounded bg-dark border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Copy mã phòng"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </p>
        </div>
        {isHost && (
          <Button size="lg" className="px-8 shadow-lg shadow-wolf/20 font-bold" onClick={handleStartGame}>
            BẮT ĐẦU GAME
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột danh sách Người chơi */}
        <div className="lg:col-span-2 space-y-4">
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
                    showToast(`Đã trục xuất người chơi ${player.name}`, 'success');
                  }
                },
              );
            }}
          />
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
