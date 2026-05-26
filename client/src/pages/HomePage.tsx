import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Button } from '../components/UI/Button';
import { useToast } from '../context/ToastContext';
import type { Room } from '../types/game';

export const HomePage = () => {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const socket = useSocket();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Dọn dẹp session khi quay về trang chủ
  useEffect(() => {
    sessionStorage.removeItem('werewolf_session');
  }, []);

  // Lắng nghe danh sách phòng từ server
  useEffect(() => {
    if (!socket) return;

    socket.on('ROOM_LIST', (list: Room[]) => {
      setRooms(list);
    });

    return () => {
      socket.off('ROOM_LIST');
    };
  }, [socket]);

  const handleCreateRoom = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    socket.emit('CREATE_ROOM', { playerName }, (response: { success: boolean; room: { id: string } }) => {
      if (response.success) {
        sessionStorage.setItem('werewolf_session', JSON.stringify({
          roomId: response.room.id,
          playerName
        }));
        navigate(`/room/${response.room.id}`);
      }
    });
  };

  const handleJoinRoom = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !roomId.trim()) return;

    socket.emit('JOIN_ROOM', { roomId: roomId.toUpperCase(), playerName }, (response: { success: boolean; room: { id: string }; error?: string }) => {
      if (response.success) {
        sessionStorage.setItem('werewolf_session', JSON.stringify({
          roomId: response.room.id,
          playerName
        }));
        navigate(`/room/${response.room.id}`);
      } else {
        showToast(response.error || 'Không thể vào phòng', 'error');
      }
    });
  };

  const lobbyRooms = rooms.filter(r => r.status === 'Lobby');

  return (
    <div className="min-h-screen pt-20 flex flex-col items-center justify-center px-4">
      <div className="stars-bg absolute inset-0 -z-10 opacity-30"></div>

      <div className="w-full max-w-md p-8 rounded-2xl bg-dark/80 backdrop-blur border border-gray-800 shadow-2xl">
        <h1 className="text-4xl font-bold text-center mb-8 bg-linear-to-r from-wolf-light to-wolf-dark text-transparent bg-clip-text">
          Werewolf Game
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Tên người chơi</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-darker border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-wolf focus:border-transparent transition-all"
              placeholder="Nhập tên của bạn..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button onClick={handleCreateRoom} disabled={!playerName.trim()} className="w-full">
              Tạo phòng
            </Button>

            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 rounded-lg bg-darker border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-villager focus:border-transparent transition-all"
                placeholder="Mã phòng..."
              />
              <Button
                variant="villager"
                onClick={handleJoinRoom}
                disabled={!playerName.trim() || !roomId.trim()}
                className="w-full py-2"
              >
                Vào phòng
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hiển thị danh sách phòng đang chờ */}
      {lobbyRooms.length > 0 && (
        <div className="w-full max-w-md mt-6 p-6 rounded-2xl bg-dark/65 backdrop-blur-sm border border-gray-800/80 shadow-2xl">
          <h2 className="text-lg font-bold text-gray-200 mb-4">Phòng đang chờ ({lobbyRooms.length})</h2>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {lobbyRooms.map((room) => (
              <div key={room.id} className="flex justify-between items-center p-3 rounded-xl bg-darker/50 border border-gray-800 hover:border-gray-700 transition-all duration-300">
                <div>
                  <span className="font-mono font-bold text-wolf-light text-base">{room.id}</span>
                  <p className="text-xs text-gray-400 mt-0.5">{room.players.length} người chơi trong sảnh</p>
                </div>
                <button
                  onClick={() => {
                    setRoomId(room.id);
                    showToast(`Đã chọn mã phòng: ${room.id}`, 'info');
                  }}
                  className="px-4 py-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-650 hover:opacity-90 text-xs font-bold text-white transition-all cursor-pointer"
                >
                  Chọn
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
