import { AVAILABLE_ROLES } from '../constants/roles';

export const RolesPage = () => {
  return (
    <div className="min-h-screen pt-20 px-4 container mx-auto max-w-5xl">
      <div className="stars-bg absolute inset-0 -z-10 opacity-30"></div>
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Thư Viện Vai Trò</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Khám phá tất cả các vai trò trong trò chơi Ma Sói. Hiểu rõ khả năng của từng vai trò để xây dựng chiến thuật tốt nhất.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AVAILABLE_ROLES.map(role => (
          <div key={role.id} className="bg-dark/80 backdrop-blur border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-colors group">
            <div className={`h-2 ${role.bgColor}`}></div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-lg ${role.bgColor} bg-opacity-20 text-white flex items-center justify-center`}>
                  {(() => {
                    const Icon = role.iconComponent;
                    return <Icon className="w-6 h-6" />;
                  })()}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{role.name}</h3>
                  <span className="text-sm text-gray-400">Phe: {role.factionName}</span>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {role.desc}
              </p>
              <div className="flex justify-between items-center text-xs font-medium px-3 py-2 bg-darker rounded-lg">
                <span className="text-gray-400">Sức mạnh cân bằng:</span>
                <span className={role.strength > 0 ? 'text-green-400' : 'text-red-400'}>
                  {role.strength > 0 ? `+${role.strength}` : role.strength}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
