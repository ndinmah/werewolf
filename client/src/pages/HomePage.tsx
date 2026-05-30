import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Button } from '../components/UI/Button';
import { useToast } from '../context/ToastContext';
import { PenTool } from 'lucide-react';
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
        sessionStorage.setItem(
          'werewolf_session',
          JSON.stringify({
            roomId: response.room.id,
            playerName,
          }),
        );
        navigate(`/room/${response.room.id}`);
      }
    });
  };

  const handleJoinRoom = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !roomId.trim()) return;

    socket.emit(
      'JOIN_ROOM',
      { roomId: roomId.toUpperCase(), playerName },
      (response: { success: boolean; room: { id: string }; error?: string }) => {
        if (response.success) {
          sessionStorage.setItem(
            'werewolf_session',
            JSON.stringify({
              roomId: response.room.id,
              playerName,
            }),
          );
          navigate(`/room/${response.room.id}`);
        } else {
          showToast(response.error || 'Không thể vào phòng', 'error');
        }
      },
    );
  };

  const lobbyRooms = rooms.filter((r) => r.status === 'Lobby');

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-4 bg-cover bg-center relative font-serif"
      style={{ backgroundImage: "url('/assets/images/medieval_village_bg.png')" }}
    >
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="w-full max-w-[550px] z-10 relative">
        <div className="w-full bg-[#f4e6d4] border-[8px] border-[#1e2330] rounded-lg p-10 flex flex-col items-center relative shadow-2xl">
          
          {/* Inner border */}
          <div className="absolute inset-2 border-[2px] border-[#8a6b4e] pointer-events-none rounded-md"></div>
          
          <div className="absolute top-2 left-2 w-16 h-16 border-t-[4px] border-l-[4px] border-[#1e2330] rounded-tl-md"></div>
          <div className="absolute top-2 right-2 w-16 h-16 border-t-[4px] border-r-[4px] border-[#1e2330] rounded-tr-md"></div>
          <div className="absolute bottom-2 left-2 w-16 h-16 border-b-[4px] border-l-[4px] border-[#1e2330] rounded-bl-md"></div>
          <div className="absolute bottom-2 right-2 w-16 h-16 border-b-[4px] border-r-[4px] border-[#1e2330] rounded-br-md"></div>

          {/* Banner Title */}
          <div className="relative mb-12 mt-2 w-full flex justify-center">
            <div className="bg-[#f4e6d4] border-y-[4px] border-[#1e2330] py-3 px-12 relative z-10 shadow-md">
              <h1 className="text-5xl text-[#1e2330] tracking-widest font-['Pirata_One',serif]">
                WEREWOLF GAME
              </h1>
            </div>
          </div>

          <div className="space-y-6 w-full px-8">
            <div className="text-center">
              <label className="block text-2xl font-bold text-[#2c1e16] mb-2 font-serif">Tên người chơi</label>
              <div className="relative">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#e8d5bc] border-[3px] border-[#2c1e16] text-[#2c1e16] placeholder-[#8a6b4e] focus:outline-none focus:border-[#8b5a2b] transition-all text-lg font-sans shadow-inner"
                  placeholder="Nhập tên của bạn..."
                />
                <PenTool className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2c1e16]" />
              </div>
            </div>

            <div className="text-center">
              <label className="block text-2xl font-bold text-[#2c1e16] mb-2 font-serif">Mã phòng</label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-[#e8d5bc] border-[3px] border-[#2c1e16] text-[#2c1e16] placeholder-[#8a6b4e] focus:outline-none focus:border-[#8b5a2b] transition-all text-lg font-sans uppercase shadow-inner"
                placeholder="Mã phòng..."
              />
            </div>

            <div className="flex flex-col gap-4 mt-10">
              <button 
                onClick={handleCreateRoom} 
                className="w-full py-3 bg-[#a66f38] hover:bg-[#b88047] border-[3px] border-[#2c1e16] text-[#f4e6d4] text-2xl font-['Pirata_One',serif] tracking-wider shadow-[0_4px_0_#2c1e16] hover:translate-y-[2px] hover:shadow-[0_2px_0_#2c1e16] active:translate-y-[4px] active:shadow-none transition-all rounded-sm disabled:cursor-not-allowed"
                style={{ textShadow: "1px 1px 2px black" }}
              >
                Tạo phòng
              </button>

              <button
                onClick={handleJoinRoom}
                className="w-full py-3 bg-[#1e344a] hover:bg-[#284561] border-[3px] border-[#132230] text-[#f4e6d4] text-2xl font-['Pirata_One',serif] tracking-wider shadow-[0_4px_0_#132230] hover:translate-y-[2px] hover:shadow-[0_2px_0_#132230] active:translate-y-[4px] active:shadow-none transition-all rounded-sm disabled:cursor-not-allowed"
                style={{ textShadow: "1px 1px 2px black" }}
              >
                Vào phòng
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hiển thị danh sách phòng đang chờ */}
      {lobbyRooms.length > 0 && (
        <div className="w-full max-w-md mt-6 p-1.5 bg-[#1a110c] rounded-sm shadow-2xl z-10 mb-8">
          <div className="w-full h-full bg-[#f4e4bc] border-2 border-[#5c4033] p-4 flex flex-col"
               style={{ backgroundImage: "linear-gradient(to bottom, #f4e4bc, #e8d5a5)" }}>
            <h2 className="text-xl font-bold text-[#2c1e16] mb-4 text-center border-b-2 border-[#8a6b4e] pb-2 uppercase tracking-wider">Phòng đang chờ ({lobbyRooms.length})</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#5c4033] scrollbar-track-[#e6d0a7]">
              {lobbyRooms.map((room) => (
                <div
                  key={room.id}
                  className="flex justify-between items-center p-3 bg-[#e6d0a7] border-[2px] border-[#5c4033] hover:bg-[#d4b98c] transition-colors shadow-sm"
                >
                  <div>
                    <span className="font-mono font-bold text-[#2c1e16] text-lg">{room.id}</span>
                    <p className="text-sm text-[#5c4033] mt-0.5 font-bold">{room.players.length} người chơi trong sảnh</p>
                  </div>
                  <button
                    onClick={() => {
                      setRoomId(room.id);
                      showToast(`Đã chọn mã phòng: ${room.id}`, 'info');
                    }}
                    className="px-4 py-2 bg-[#2f4f4f] hover:bg-[#3d6666] border-[2px] border-[#162626] text-sm font-bold text-[#f4e4bc] transition-all cursor-pointer shadow-[0_2px_0_#162626] active:translate-y-[2px] active:shadow-none"
                  >
                    Chọn
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
