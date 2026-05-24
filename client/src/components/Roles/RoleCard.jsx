export const RoleCard = ({ role }) => {
  return (
    <div className="bg-darker p-4 rounded-lg border border-gray-700">
      <h3 className="font-bold text-white">{role.name}</h3>
      <p className="text-sm text-gray-400">{role.description}</p>
    </div>
  );
};
