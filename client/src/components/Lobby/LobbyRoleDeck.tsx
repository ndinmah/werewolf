import React from 'react';
import { Minus, Plus, ShieldAlert } from 'lucide-react';
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4" />
          <span>Bộ bài (Role Deck)</span>
        </h3>

        {/* Strength Meter */}
        <div
          className={`px-2 py-0.5 rounded text-xs font-bold font-mono border
            ${
              totalStrength === 0
                ? 'bg-green-950/40 border-green-500 text-green-400'
                : totalStrength > 0
                  ? 'bg-blue-950/40 border-blue-500 text-blue-400'
                  : 'bg-red-950/40 border-red-500 text-red-400'
            }
          `}
          title="Tổng điểm sức mạnh. Cân bằng nhất là 0."
        >
          Cân bằng: {totalStrength > 0 ? `+${totalStrength}` : totalStrength}
        </div>
      </div>

      <div className="space-y-2 bg-darker/60 p-3 rounded-lg border border-gray-800">
        {AVAILABLE_ROLES.map((role) => {
          const count = roleCounts[role.id] || 0;
          return (
            <div
              key={role.id}
              className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{role.emoji}</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-200">{role.name}</span>
                  <span className="text-[9px] text-gray-500 font-mono">
                    Điểm: {role.strength > 0 ? `+${role.strength}` : role.strength}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isHost ? (
                  <>
                    <button
                      onClick={() => onUpdateRoleCount(role.id as Role, -1)}
                      className="p-1 rounded bg-dark border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-extrabold text-white">{count}</span>
                    <button
                      onClick={() => onUpdateRoleCount(role.id as Role, 1)}
                      className="p-1 rounded bg-dark border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <span className="font-extrabold text-white px-2 py-0.5 rounded bg-dark text-xs border border-gray-800">
                    x{count}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
