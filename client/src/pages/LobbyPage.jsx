import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Button } from '../components/UI/Button';
import { useGame } from '../context/GameContext';

export const LobbyPage = () => {
  const { id: roomId } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const { gameState } = useGame();

  // Chuyển hướng sang trang game nếu game đã bắt đầu (gameState đã có dữ liệu và không phải lobby)
  useEffect(() => {
    if (gameState && gameState.phase && gameState.phase !== 'lobby') {
      navigate(`/room/${roomId}/game`);
    }
  }, [gameState, navigate, roomId]);

  // Fetch thông tin phòng ban đầu từ server khi vừa vào trang
  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit('GET_ROOM', { roomId }, (response) => {
      if (response.success) {
        setRoom(response.room);
      } else {
        alert(response.error || 'Phòng không tồn tại');
        navigate('/');
      }
    });
  }, [socket, roomId, navigate]);

  useEffect(() => {
    if (!socket) return;

    socket.on('ROOM_UPDATED', (updatedRoom) => {
      setRoom(updatedRoom);
    });

    return () => {
      socket.off('ROOM_UPDATED');
    };
  }, [socket]);

  if (!room) return <div className="pt-20 text-center">Đang tải phòng...</div>;

  const isHost = room.hostId === socket?.id;

  const handleStartGame = () => {
    socket.emit('START_GAME', { roomId: room.id });
  };

  return (
    <div className="min-h-screen pt-20 px-4 container mx-auto max-w-4xl">
      <div className="stars-bg absolute inset-0 -z-10 opacity-30"></div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Phòng chờ</h1>
          <p className="text-gray-400">
            Mã phòng: <span className="text-wolf-light font-mono font-bold text-xl ml-2">{room.id}</span>
          </p>
        </div>
        {isHost && (
          <Button size="lg" className="px-8 shadow-lg shadow-wolf/20" onClick={handleStartGame}>
            BẮT ĐẦU GAME
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-dark/50 p-6 rounded-xl border border-gray-800">
            <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
              Người chơi ({room.players.length})
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {room.players.map((player) => (
                <div
                  key={player.id}
                  className="bg-darker p-4 rounded-lg flex items-center gap-3 border border-gray-700"
                >
                  <div className="w-10 h-10 rounded-full bg-linear-to-tr from-gray-700 to-gray-600 flex items-center justify-center font-bold">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-200">{player.name}</p>
                    {player.id === room.hostId && <span className="text-xs text-yellow-500 font-bold">Chủ phòng</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-dark/50 p-6 rounded-xl border border-gray-800">
            <h2 className="text-xl font-bold mb-4">Cài đặt</h2>
            <p className="text-gray-400 text-sm mb-4">Chỉ chủ phòng mới có thể thay đổi.</p>
            {/* Các settings: Role Selector, Timer Settings, Strength Meter sẽ ở đây */}
            <div className="bg-darker p-4 rounded-lg border border-gray-700 text-center text-gray-500 italic">
              Đang chờ cập nhật các tính năng...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
