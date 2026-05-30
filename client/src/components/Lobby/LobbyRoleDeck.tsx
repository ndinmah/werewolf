import React from 'react';
import { Minus, Plus, Scroll } from 'lucide-react';
import { AVAILABLE_ROLES } from '../../constants/roles';
import type { Role } from '../../types/game';

interface LobbyRoleDeckProps {
  isHost: boolean;
  roleCounts: Record<string, number>;
  totalStrength: number;
  onUpdateRoleCount: (roleId: Role, delta: number) => void;
}

export const LobbyRoleDeck: React.FC<LobbyRoleDeckProps> = ({
  isHost,
  roleCounts,
  totalStrength,
  onUpdateRoleCount,
}) => {
  return (
    <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 p-6 relative overflow-hidden flex flex-col flex-1">
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#8a0303] to-transparent opacity-50"></div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-['Cinzel_Decorative',serif] uppercase tracking-[0.2em] text-[#aa8c55] flex items-center gap-2">
          <Scroll className="w-4 h-4" />
          <span>Role Deck</span>
        </h3>

        {/* Strength Meter */}
        <div
          className={`px-3 py-1 text-[10px] uppercase tracking-widest font-sans border
            ${
              totalStrength === 0
                ? 'bg-transparent border-white/30 text-gray-400'
                : totalStrength > 0
                  ? 'bg-transparent border-[#aa8c55]/50 text-[#aa8c55]'
                  : 'bg-transparent border-[#8a0303]/50 text-[#8a0303]'
            }
          `}
          title="Tổng điểm sức mạnh. Cân bằng nhất là 0."
        >
          Cân bằng: {totalStrength > 0 ? `+${totalStrength}` : totalStrength}
        </div>
      </div>

      <div className="space-y-1">
        {AVAILABLE_ROLES.map((role) => {
          const count = roleCounts[role.id] || 0;
          return (
            <div
              key={role.id}
              className="group/role flex items-center justify-between py-2 border-b border-white/5 hover:border-[#8a0303]/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl opacity-80 group-hover/role:opacity-100 transition-opacity">{role.emoji}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-300 font-['Cinzel_Decorative',serif] tracking-wider group-hover/role:text-white transition-colors">
                    {role.name}
                  </span>
                  <span className="text-[10px] text-gray-600 font-sans tracking-widest uppercase">
                    ĐIỂM: {role.strength > 0 ? `+${role.strength}` : role.strength}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isHost ? (
                  <>
                    <button
                      onClick={() => onUpdateRoleCount(role.id as Role, -1)}
                      className="p-1 border border-white/10 text-gray-400 hover:text-[#ffdddd] hover:bg-[#8a0303] hover:border-[#8a0303] transition-all cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-4 text-center text-lg font-['Cinzel_Decorative',serif] text-white">{count}</span>
                    <button
                      onClick={() => onUpdateRoleCount(role.id as Role, 1)}
                      className="p-1 border border-white/10 text-gray-400 hover:text-[#aa8c55] hover:border-[#aa8c55] transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <span className="text-lg font-['Cinzel_Decorative',serif] text-white px-2">x{count}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
