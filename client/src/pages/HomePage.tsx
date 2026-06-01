import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { Sparkles, KeyRound } from 'lucide-react';
import type { Room } from '../types/game';
import { S } from '../constants/strings';

export const HomePage = () => {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const socket = useSocket();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    sessionStorage.removeItem('werewolf_session');
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('ROOM_LIST', (list: Room[]) => setRooms(list));
    return () => { socket.off('ROOM_LIST'); };
  }, [socket]);

  const handleCreateRoom = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    socket.emit('CREATE_ROOM', { playerName }, (response: { success: boolean; room: { id: string } }) => {
      if (response.success) {
        sessionStorage.setItem('werewolf_session', JSON.stringify({ roomId: response.room.id, playerName }));
        navigate(`/room/${response.room.id}`);
      }
    });
  };

  const handleJoinRoom = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !roomId.trim()) return;
    socket.emit('JOIN_ROOM', { roomId: roomId.toUpperCase(), playerName }, (response: { success: boolean; room: { id: string }; error?: string }) => {
      if (response.success) {
        sessionStorage.setItem('werewolf_session', JSON.stringify({ roomId: response.room.id, playerName }));
        navigate(`/room/${response.room.id}`);
      } else {
        showToast(response.error || S.home.toastJoinError, 'error');
      }
    });
  };

  const lobbyRooms = rooms.filter((r) => r.status === 'Lobby');

  return (
    <div className="min-h-screen w-full bg-[#030303] text-[#e2e8f0] relative overflow-hidden flex flex-col md:flex-row font-['Cormorant_Garamond',serif]">
      {/* Dark magical background effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#8a0303] rounded-full blur-[150px] opacity-20 mix-blend-screen animate-pulse duration-8000"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4a0000] rounded-full blur-[120px] opacity-30 mix-blend-screen"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#1a0000] rounded-full blur-[100px] opacity-50"></div>
      </div>

      {/* Giant Typography Background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-start overflow-hidden opacity-5 z-0 select-none">
        <h1 className="text-[25vw] leading-none font-black text-transparent bg-clip-text bg-linear-to-b from-white to-transparent tracking-tighter font-['Cinzel_Decorative',serif] -rotate-90 origin-left translate-x-[20%]">
          {S.home.title.join('')}
        </h1>
      </div>

      {/* Left Column: Brand/Title */}
      <div className="w-full md:w-1/2 min-h-[40vh] md:min-h-screen flex items-center justify-center relative z-10 p-8 md:p-16">
        <div className="flex flex-col items-start space-y-4">
          <div className="inline-block border-b border-[#8a0303] pb-2 mb-2">
            <span className="text-[#aa8c55] tracking-[0.3em] uppercase text-sm font-light">
              {S.home.tagline}
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-9xl text-white font-['Cinzel_Decorative',serif] drop-shadow-[0_0_15px_rgba(138,3,3,0.5)]">
            {S.home.title[0]}
            <br />
            {S.home.title[1]}
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-md italic mt-6 leading-relaxed border-l-2 border-[#8a0303] pl-6 py-2">
            {S.home.quote}
          </p>
        </div>
      </div>

      {/* Right Column: Interaction Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center relative z-10 p-8">
        <div className="w-full max-w-md flex flex-col gap-12">
          
          {/* Action Glass Panel */}
          <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl p-10 relative overflow-hidden group">
            {/* Edge highlights */}
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#8a0303] to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#aa8c55] to-transparent opacity-30"></div>
            
            <h2 className="text-3xl font-['Cinzel_Decorative',serif] text-white mb-10 text-center tracking-widest">
              {S.home.panelTitle}
            </h2>

            <div className="space-y-8">
              {/* Name Input */}
              <div className="relative group/input">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder={S.home.namePlaceholder}
                  className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-3 text-xl text-white placeholder-white/30 focus:ring-0 focus:border-[#8a0303] focus:outline-none transition-colors duration-300 peer"
                />
                <Sparkles className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 peer-focus:text-[#8a0303] transition-colors duration-300" />
              </div>

              {/* Room Code Input */}
              <div className="relative group/input">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder={S.home.roomCodePlaceholder}
                  className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-3 text-xl text-white placeholder-white/30 focus:ring-0 focus:border-[#aa8c55] focus:outline-none transition-colors duration-300 peer uppercase"
                />
                <KeyRound className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 peer-focus:text-[#aa8c55] transition-colors duration-300" />
              </div>

              {/* Action Buttons */}
              <div className="pt-6 space-y-4 flex flex-col">
                <button
                  onClick={handleCreateRoom}
                  disabled={!playerName.trim()}
                  className="relative w-full py-4 bg-[#8a0303]/10 border border-[#8a0303] text-[#ffdddd] text-xl font-['Cinzel_Decorative',serif] tracking-[0.2em] uppercase hover:bg-[#8a0303] hover:text-white transition-all duration-500 overflow-hidden group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10">{S.home.btnCreate}</span>
                  <div className="absolute inset-0 w-0 bg-[#8a0303] group-hover/btn:w-full transition-all duration-500 ease-in-out z-0"></div>
                </button>

                <button
                  onClick={handleJoinRoom}
                  disabled={!playerName.trim() || !roomId.trim()}
                  className="relative w-full py-4 bg-transparent border border-white/20 text-white/80 text-xl font-['Cinzel_Decorative',serif] tracking-[0.2em] uppercase hover:border-[#aa8c55] hover:text-[#aa8c55] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {S.home.btnJoin}
                </button>
              </div>
            </div>
          </div>

          {/* Lobby Rooms List (Bounties style) */}
          {lobbyRooms.length > 0 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10"></div>
                <h3 className="text-[#aa8c55] text-sm uppercase tracking-[0.2em] font-['Cinzel_Decorative',serif]">{S.home.activeRitualsLabel}</h3>
                <div className="h-px flex-1 bg-white/10"></div>
              </div>
              
              <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {lobbyRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => {
                      setRoomId(room.id);
                      showToast(S.home.toastRoomSelected(room.id), 'info');
                    }}
                    className="group cursor-pointer flex justify-between items-center p-5 bg-white/2 border border-white/5 hover:border-[#8a0303]/50 hover:bg-[#8a0303]/10 transition-all duration-300"
                  >
                    <div>
                      <span className="font-['Cinzel_Decorative',serif] text-2xl text-white group-hover:text-[#ffdddd] transition-colors">{room.id}</span>
                      <p className="text-[#aa8c55] text-sm mt-1 italic">{S.home.soulsWaiting(room.players.length)}</p>
                    </div>
                    <div className="text-white/30 group-hover:text-[#8a0303] transition-colors duration-300">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
