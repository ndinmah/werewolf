import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Button } from '../components/UI/Button';

export const HomePage = () => {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const socket = useSocket();
  const navigate = useNavigate();

  // Dọn dẹp session khi quay về trang chủ
  useEffect(() => {
    sessionStorage.removeItem('werewolf_session');
  }, []);

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    socket.emit('CREATE_ROOM', { playerName }, (response) => {
      if (response.success) {
        sessionStorage.setItem('werewolf_session', JSON.stringify({
          roomId: response.room.id,
          playerName
        }));
        navigate(`/room/${response.room.id}`);
      }
    });
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!playerName.trim() || !roomId.trim()) return;

    socket.emit('JOIN_ROOM', { roomId: roomId.toUpperCase(), playerName }, (response) => {
      if (response.success) {
        sessionStorage.setItem('werewolf_session', JSON.stringify({
          roomId: response.room.id,
          playerName
        }));
        navigate(`/room/${response.room.id}`);
      } else {
        alert(response.error);
      }
    });
  };

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
    </div>
  );
};
