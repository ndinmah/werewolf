export const PlayerCard = ({ player }) => {
  const isDisconnected = player.disconnected;
  const isDead = !player.isAlive;

  return (
    <div className={`relative bg-darker p-4 rounded-xl border transition-all duration-300 ${
      isDead ? 'border-red-900 opacity-50 grayscale' : 
      isDisconnected ? 'border-gray-700 opacity-70' : 
      'border-gray-700 hover:border-gray-500'
    }`}>
      {/* Icon trạng thái */}
      <div className="absolute top-2 right-2 text-xl z-10">
        {isDead && '💀'}
        {isDisconnected && !isDead && '🔌'}
      </div>

      <div className="flex flex-col items-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl mb-2
          ${isDead ? 'bg-red-900 text-red-200' : 'bg-linear-to-tr from-gray-700 to-gray-600 text-white'}
        `}>
          {player.name.charAt(0).toUpperCase()}
        </div>
        <p className="font-medium text-gray-200 text-center truncate w-full">{player.name}</p>
      </div>
    </div>
  );
};
