export const TimerSettings = () => {
  return (
    <div className="bg-darker p-4 rounded-lg border border-gray-700">
      <h3 className="font-bold text-white mb-2">Thời gian mỗi lượt</h3>
      <div className="flex items-center gap-4">
        <input type="range" min="30" max="120" step="10" defaultValue="60" className="w-full accent-wolf" />
        <span className="text-gray-300 font-medium whitespace-nowrap">60s</span>
      </div>
    </div>
  );
};
