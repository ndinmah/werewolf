import React, { useState } from 'react';
import { Shield, Skull, Swords } from 'lucide-react';
import { Button } from '../../UI/Button';
import { Avatar } from '../../UI/Avatar';
import { ModalOverlay } from '../../UI/ModalOverlay';
import type { Player, WitchInfo } from '../../../types/game';

interface WitchActionPanelProps {
  roleHeader: {
    title: string;
    desc: string;
    icon: React.ReactNode;
    color: string;
  };
  targets: Pick<Player, 'id' | 'name' | 'isAlive'>[];
  players: Player[];
  witchInfo: WitchInfo;
  hasConfirmed: boolean;
  onConfirm: (healTargetId: string | null, poisonTargetId: string | null) => void;
}

export const WitchActionPanel: React.FC<WitchActionPanelProps> = ({
  roleHeader,
  targets,
  players,
  witchInfo,
  hasConfirmed,
  onConfirm,
}) => {
  const [witchUseHeal, setWitchUseHeal] = useState(false);
  const [witchUsePoison, setWitchUsePoison] = useState(false);
  const [witchPoisonTargetId, setWitchPoisonTargetId] = useState<string | null>(null);

  const victimPlayer = witchInfo.werewolfVictimId
    ? targets.find((p) => p.id === witchInfo.werewolfVictimId)
    : null;

  const canConfirm = !witchUsePoison || witchPoisonTargetId !== null;

  const handleConfirmClick = () => {
    if (hasConfirmed || !canConfirm) return;
    const healTargetId = witchUseHeal && victimPlayer ? victimPlayer.id : null;
    const poisonTargetId = witchUsePoison ? witchPoisonTargetId : null;
    onConfirm(healTargetId, poisonTargetId);
  };

  return (
    <ModalOverlay opacity="dark">
      <div
        className={`w-full max-w-4xl bg-dark/95 border backdrop-blur-md rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative z-10 ${roleHeader.color}`}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center gap-4 border-b border-gray-800 pb-6">
          <div className="p-4 bg-darker rounded-2xl border border-gray-800">{roleHeader.icon}</div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-white tracking-wide">{roleHeader.title}</h2>
            <p className="text-gray-400 mt-1 max-w-2xl">{roleHeader.desc}</p>
          </div>
        </div>

        {/* Thông tin nạn nhân của Sói */}
        <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-4 flex items-center gap-3">
          <Skull className="w-6 h-6 text-red-400 shrink-0" />
          <div>
            <p className="text-sm text-gray-400">Sói đã chọn giết đêm nay:</p>
            <p className="font-bold text-red-300 text-lg">
              {victimPlayer ? victimPlayer.name : '(Sói chưa chọn / không có nạn nhân)'}
            </p>
          </div>
        </div>

        {/* Chọn hành động */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* HỘP BÌNH CỨU */}
          <div
            className={`p-5 rounded-2xl border flex flex-col gap-4 bg-darker/60 backdrop-blur-sm transition-all duration-300
            ${witchUseHeal ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-gray-800'}`}
          >
            <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
              <Shield
                className={`w-6 h-6 ${witchInfo.canHeal && victimPlayer ? 'text-green-400' : 'text-gray-600'}`}
              />
              <h3 className="font-bold text-lg text-gray-200">Bình Cứu (Hồi sinh)</h3>
            </div>

            {witchInfo.canHeal && victimPlayer ? (
              <div className="flex flex-col justify-between h-full gap-4">
                <p className="text-sm text-gray-400 leading-relaxed">
                  Sử dụng bình cứu để hồi sinh <span className="font-bold text-red-400">{victimPlayer.name}</span> khỏi
                  cái chết đêm nay.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setWitchUseHeal(true)}
                    className={`flex-1 py-2.5 rounded-xl border font-bold text-sm transition-all duration-200 cursor-pointer
                      ${
                        witchUseHeal
                          ? 'bg-green-600 border-green-500 text-white'
                          : 'bg-dark border-gray-850 text-gray-400 hover:border-green-700 hover:text-green-400'
                      }`}
                  >
                    Cứu
                  </button>
                  <button
                    type="button"
                    onClick={() => setWitchUseHeal(false)}
                    className={`flex-1 py-2.5 rounded-xl border font-bold text-sm transition-all duration-200 cursor-pointer
                      ${
                        !witchUseHeal
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-dark border-gray-850 text-gray-400 hover:border-gray-650'
                      }`}
                  >
                    Không cứu
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center h-full text-center py-4">
                <p className="text-sm text-gray-500 italic">
                  {!witchInfo.canHeal
                    ? 'Bình Cứu đã được sử dụng trước đó hoặc bạn không thể tự cứu vào lúc này.'
                    : 'Không có nạn nhân bị Sói cắn đêm nay.'}
                </p>
              </div>
            )}
          </div>

          {/* HỘP BÌNH ĐỘC */}
          <div
            className={`p-5 rounded-2xl border flex flex-col gap-4 bg-darker/60 backdrop-blur-sm transition-all duration-300
            ${witchUsePoison ? 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'border-gray-800'}`}
          >
            <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
              <Swords className={`w-6 h-6 ${witchInfo.canPoison ? 'text-purple-400' : 'text-gray-600'}`} />
              <h3 className="font-bold text-lg text-gray-200">Bình Độc (Đầu độc)</h3>
            </div>

            {witchInfo.canPoison ? (
              <div className="flex flex-col gap-4 h-full">
                <p className="text-sm text-gray-400 leading-relaxed">
                  Sử dụng bình độc để loại bỏ 1 người chơi bất kỳ ngay lập tức.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setWitchUsePoison(true)}
                    className={`flex-1 py-2.5 rounded-xl border font-bold text-sm transition-all duration-200 cursor-pointer
                      ${
                        witchUsePoison
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-dark border-gray-850 text-gray-400 hover:border-purple-700 hover:text-purple-400'
                      }`}
                  >
                    Đầu độc
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWitchUsePoison(false);
                      setWitchPoisonTargetId(null);
                    }}
                    className={`flex-1 py-2.5 rounded-xl border font-bold text-sm transition-all duration-200 cursor-pointer
                      ${
                        !witchUsePoison
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-dark border-gray-850 text-gray-400 hover:border-gray-650'
                      }`}
                  >
                    Không dùng
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center h-full text-center py-4">
                <p className="text-sm text-gray-500 italic">Bình Độc đã được sử dụng trước đó.</p>
              </div>
            )}
          </div>
        </div>

        {/* Danh sách người chơi để đầu độc */}
        {witchUsePoison && witchInfo.canPoison && (
          <div className="border-t border-gray-800 pt-4 flex flex-col gap-3">
            <p className="text-sm font-bold text-purple-300">Chọn người chơi muốn đầu độc:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 overflow-y-auto max-h-[30vh] pr-2 custom-scrollbar">
              {targets
                .filter((p) => p.id !== witchInfo.werewolfVictimId)
                .map((player) => {
                  const isSelected = witchPoisonTargetId === player.id;
                  const fullPlayer = players.find((p) => p.id === player.id);
                  return (
                    <div
                      key={player.id}
                      onClick={() => setWitchPoisonTargetId(player.id)}
                      className={`relative p-3 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer min-h-[90px] select-none
                      ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-500 scale-[1.03] shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                          : 'bg-dark border-gray-850 hover:border-gray-750'
                      }`}
                    >
                      <Avatar
                        name={player.name}
                        size="xs"
                        className={
                          isSelected
                            ? 'bg-purple-600 border-purple-400 text-white'
                            : 'bg-gray-850 border-gray-700 text-gray-300'
                        }
                      />
                      <span className="font-bold text-gray-200 text-xs truncate max-w-full flex items-center justify-center gap-1 mt-1.5">
                        {fullPlayer?.isLover && <span className="animate-pulse">❤️</span>}
                        <span>{player.name}</span>
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4 border-t border-gray-800 pt-6 mt-2">
          <Button
            size="lg"
            disabled={hasConfirmed || !canConfirm}
            onClick={handleConfirmClick}
            className={`px-8 font-bold tracking-wider ${
              hasConfirmed
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-pink-700 hover:bg-pink-800 shadow-md shadow-pink-700/20'
            }`}
          >
            {hasConfirmed ? 'ĐÃ THỰC HIỆN' : 'CHỐT HÀNH ĐỘNG'}
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
};
