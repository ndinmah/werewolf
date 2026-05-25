export const StrengthMeter = ({ strength = 0 }) => {
  return (
    <div className="bg-darker p-4 rounded-lg border border-gray-700 flex items-center justify-between">
      <h3 className="font-bold text-white">Chỉ số cân bằng:</h3>
      <span className={`text-xl font-bold ${strength > 0 ? 'text-green-400' : strength < 0 ? 'text-red-400' : 'text-gray-400'}`}>
        {strength > 0 ? `+${strength}` : strength}
      </span>
    </div>
  );
};
