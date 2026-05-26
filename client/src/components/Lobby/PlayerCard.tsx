interface PlayerCardProps {
  player: {
    name: string;
    isHost?: boolean;
  };
}

export const PlayerCard = ({ player }: PlayerCardProps) => {
  return (
    <div className="bg-darker p-4 rounded-lg flex items-center gap-3 border border-gray-700">
      <div className="w-10 h-10 rounded-full bg-linear-to-tr from-gray-700 to-gray-600 flex items-center justify-center font-bold text-white">
        {player.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="font-medium text-gray-200">{player.name}</p>
        {player.isHost && <span className="text-xs text-yellow-500 font-bold">Chủ phòng</span>}
      </div>
    </div>
  );
};
