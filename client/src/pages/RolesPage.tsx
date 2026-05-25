import { Shield, Eye, Users, Search } from 'lucide-react';

// Hardcode data cho trang thư viện
const ROLES_DATA = [
  {
    id: 'VILLAGER',
    name: 'Dân làng',
    faction: 'Dân làng',
    strength: 1,
    description: 'Ngủ vào ban đêm. Thức dậy vào ban ngày để thảo luận và vote.',
    icon: Users,
    color: 'bg-blue-500'
  },
  {
    id: 'WEREWOLF',
    name: 'Ma sói',
    faction: 'Ma sói',
    strength: -2,
    description: 'Thức dậy vào ban đêm để chọn một nạn nhân. Cố gắng giả làm người vào ban ngày.',
    icon: Eye,
    color: 'bg-red-600'
  },
  {
    id: 'SEER',
    name: 'Tiên tri',
    faction: 'Dân làng',
    strength: 3,
    description: 'Thức dậy mỗi đêm để soi xem một người có phải là Sói hay không.',
    icon: Search,
    color: 'bg-purple-500'
  },
  {
    id: 'BODYGUARD',
    name: 'Bảo vệ',
    faction: 'Dân làng',
    strength: 3,
    description: 'Thức dậy mỗi đêm để bảo vệ một người khỏi bị Sói cắn. Không thể bảo vệ cùng 1 người 2 đêm liên tiếp.',
    icon: Shield,
    color: 'bg-green-600'
  }
];

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
        {ROLES_DATA.map(role => (
          <div key={role.id} className="bg-dark/80 backdrop-blur border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-colors group">
            <div className={`h-2 ${role.color}`}></div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-lg ${role.color} bg-opacity-20 text-white`}>
                  <role.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{role.name}</h3>
                  <span className="text-sm text-gray-400">Phe: {role.faction}</span>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {role.description}
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
