import React, { useState } from 'react';
import { Shield, Skull, Swords } from 'lucide-react';
import { Button } from '../../UI/Button';
import { Avatar } from '../../UI/Avatar';
import { ModalOverlay } from '../../UI/ModalOverlay';
import type { Player, WitchInfo } from '../../../types/game';
import { S } from '../../../constants/strings';

interface WitchActionPanelProps {
  roleHeader: {
    title: string;
    desc: string;
    icon: React.ReactNode;
    color: string;
  };
  targets: Pick<Player, 'id' | 'name' | 'isAlive'>[];
  players: Player[];
  myPlayer?: Player;
  witchInfo: WitchInfo;
  hasConfirmed: boolean;
  onConfirm: (healTargetId: string | null, poisonTargetId: string | null) => void;
}

export const WitchActionPanel: React.FC<WitchActionPanelProps> = ({
  roleHeader,
  targets,
  players,
  myPlayer,
  witchInfo,
  hasConfirmed,
  onConfirm,
}) => {
  const [witchUseHeal, setWitchUseHeal] = useState(false);
  const [witchUsePoison, setWitchUsePoison] = useState(false);
  const [witchPoisonTargetId, setWitchPoisonTargetId] = useState<string | null>(null);

  const victimPlayer = witchInfo.werewolfVictimId ? targets.find((p) => p.id === witchInfo.werewolfVictimId) : null;

  const canConfirm = !witchUsePoison || witchPoisonTargetId !== null;

  const handleConfirmClick = () => {
    if (hasConfirmed || !canConfirm) return;
    const healTargetId = witchUseHeal && victimPlayer ? victimPlayer.id : null;
    const poisonTargetId = witchUsePoison ? witchPoisonTargetId : null;
    onConfirm(healTargetId, poisonTargetId);
  };

  return (
    <ModalOverlay opacity="deep">
      <div
        className={`w-full max-w-5xl bg-[#030303] border border-[#a855f7]/30 rounded-none p-8 md:p-12 flex flex-col gap-8 relative z-10 font-['Cormorant_Garamond',serif] shadow-[0_0_50px_rgba(168,85,247,0.2)]`}
      >
        {/* Glow background */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[200px] opacity-10 pointer-events-none transition-colors duration-1000 ${witchUsePoison ? 'bg-[#84cc16]' : witchUseHeal ? 'bg-[#aa8c55]' : 'bg-[#a855f7]'}`}
        ></div>

        {/* Edge highlights */}
        <div
          className={`absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#a855f7] to-transparent opacity-80 transition-colors ${witchUsePoison ? 'via-[#84cc16]' : witchUseHeal ? 'via-[#aa8c55]' : 'via-[#a855f7]'}`}
        ></div>

        {/* Header */}
        <div className="flex flex-col md:flex-row items-center gap-6 border-b border-[#a855f7]/20 pb-8 relative z-10">
          <div className="p-6 bg-[#0a0a0a] rounded-none border border-[#a855f7]/50 shadow-[inset_0_0_20px_rgba(168,85,247,0.3)]">
            {roleHeader.icon}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-['Cinzel_Decorative',serif] text-[#d8b4fe] tracking-widest uppercase">
              {roleHeader.title}
            </h2>
            <p className="text-gray-400 mt-2 text-xl italic max-w-2xl">"{roleHeader.desc}"</p>
          </div>
        </div>

        {/* Thông tin nạn nhân của Sói */}
        <div className="bg-[#8a0303]/10 border border-[#8a0303]/50 rounded-none p-6 flex items-center gap-6 relative z-10 shadow-[inset_0_0_20px_rgba(138,3,3,0.2)]">
          <Skull className="w-10 h-10 text-[#8a0303] shrink-0 animate-bounce" />
          <div className="border-l border-[#8a0303]/30 pl-6">
            <p className="text-sm text-[#8a0303] font-['Cinzel_Decorative',serif] tracking-[0.2em] uppercase font-bold">
              {S.witch.wolfVictimLabel}
            </p>
            <p className="font-bold text-[#ffdddd] text-2xl tracking-wider">
              {victimPlayer ? victimPlayer.name : S.witch.noPeacefulNight}
            </p>
          </div>
        </div>

        {/* Chọn hành động */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          {/* HỘP BÌNH CỨU */}
          <div
            className={`p-8 rounded-none border flex flex-col gap-6 transition-all duration-500 relative
            ${witchUseHeal ? 'bg-[#aa8c55]/10 border-[#aa8c55] shadow-[inset_0_0_30px_rgba(170,140,85,0.2)]' : 'bg-[#0a0a0a] border-white/10'}`}
          >
            {witchUseHeal && (
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-[#aa8c55]/20 to-transparent pointer-events-none"></div>
            )}

            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <Shield className={`w-8 h-8 ${witchInfo.canHeal && victimPlayer ? 'text-[#aa8c55]' : 'text-gray-600'}`} />
              <h3
                className={`font-['Cinzel_Decorative',serif] text-2xl tracking-widest uppercase ${witchInfo.canHeal && victimPlayer ? 'text-[#aa8c55]' : 'text-gray-500'}`}
              >
                {S.witch.healTitle}
              </h3>
            </div>

            {witchInfo.canHeal && victimPlayer ? (
              <div className="flex flex-col justify-between h-full gap-6 relative z-10">
                <p className="text-lg text-gray-300 leading-relaxed italic">
                  {S.witch.healStory(victimPlayer.name)}
                </p>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setWitchUseHeal(true);
                      setWitchUsePoison(false);
                      setWitchPoisonTargetId(null);
                    }}
                    className={`flex-1 py-3 rounded-none border font-['Cinzel_Decorative',serif] text-lg tracking-widest uppercase transition-all duration-300 cursor-pointer
                      ${
                        witchUseHeal
                          ? 'bg-[#aa8c55] border-[#aa8c55] text-[#030303] shadow-[0_0_15px_rgba(170,140,85,0.5)]'
                          : 'bg-transparent border-[#aa8c55]/50 text-[#aa8c55] hover:bg-[#aa8c55]/10'
                      }`}
                  >
                    {S.witch.btnHeal}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWitchUseHeal(false)}
                    className={`flex-1 py-3 rounded-none border font-['Cinzel_Decorative',serif] text-lg tracking-widest uppercase transition-all duration-300 cursor-pointer
                      ${
                        !witchUseHeal && !witchUsePoison
                          ? 'bg-[#030303] border-white/30 text-white shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]'
                          : 'bg-transparent border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300'
                      }`}
                  >
                    {S.witch.btnSkipHeal}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center h-full text-center py-6">
                <p className="text-lg text-gray-600 italic">
                  {!witchInfo.canHeal
                    ? S.witch.healUsed
                    : S.witch.healNotNeeded}
                </p>
              </div>
            )}
          </div>

          {/* HỘP BÌNH ĐỘC */}
          <div
            className={`p-8 rounded-none border flex flex-col gap-6 transition-all duration-500 relative
            ${witchUsePoison ? 'bg-[#84cc16]/10 border-[#84cc16] shadow-[inset_0_0_30px_rgba(132,204,22,0.15)]' : 'bg-[#0a0a0a] border-white/10'}`}
          >
            {witchUsePoison && (
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-[#84cc16]/20 to-transparent pointer-events-none"></div>
            )}

            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <Swords className={`w-8 h-8 ${witchInfo.canPoison ? 'text-[#84cc16]' : 'text-gray-600'}`} />
              <h3
                className={`font-['Cinzel_Decorative',serif] text-2xl tracking-widest uppercase ${witchInfo.canPoison ? 'text-[#84cc16]' : 'text-gray-500'}`}
              >
                {S.witch.poisonTitle}
              </h3>
            </div>

            {witchInfo.canPoison ? (
              <div className="flex flex-col gap-6 h-full relative z-10">
                <p className="text-lg text-gray-300 leading-relaxed italic">
                  {S.witch.poisonStory}
                </p>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setWitchUsePoison(true);
                      setWitchUseHeal(false);
                    }}
                    className={`flex-1 py-3 rounded-none border font-['Cinzel_Decorative',serif] text-lg tracking-widest uppercase transition-all duration-300 cursor-pointer
                      ${
                        witchUsePoison
                          ? 'bg-[#84cc16] border-[#84cc16] text-[#030303] shadow-[0_0_15px_rgba(132,204,22,0.5)]'
                          : 'bg-transparent border-[#84cc16]/50 text-[#84cc16] hover:bg-[#84cc16]/10'
                      }`}
                  >
                    {S.witch.btnPoison}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWitchUsePoison(false);
                      setWitchPoisonTargetId(null);
                    }}
                    className={`flex-1 py-3 rounded-none border font-['Cinzel_Decorative',serif] text-lg tracking-widest uppercase transition-all duration-300 cursor-pointer
                      ${
                        !witchUsePoison && !witchUseHeal
                          ? 'bg-[#030303] border-white/30 text-white shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]'
                          : 'bg-transparent border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300'
                      }`}
                  >
                    {S.witch.btnSkipPoison}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center h-full text-center py-6">
                <p className="text-lg text-gray-600 italic">{S.witch.poisonUsed}</p>
              </div>
            )}
          </div>
        </div>

        {/* Danh sách người chơi để đầu độc */}
        {witchUsePoison && witchInfo.canPoison && (
          <div className="border-t border-[#84cc16]/30 pt-6 flex flex-col gap-4 relative z-10 animate-fade-in">
            <p className="text-lg font-['Cinzel_Decorative',serif] text-[#84cc16] tracking-widest uppercase text-center">
              {S.witch.poisonTargetTitle}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto max-h-[30vh] pr-2 scrollbar-thin scrollbar-thumb-[#84cc16]/50 scrollbar-track-transparent pb-4">
              {targets
                .filter((p) => p.id !== witchInfo.werewolfVictimId && p.id !== myPlayer?.id)
                .map((player) => {
                  const isSelected = witchPoisonTargetId === player.id;
                  const fullPlayer = players.find((p) => p.id === player.id);
                  return (
                    <div
                      key={player.id}
                      onClick={() => setWitchPoisonTargetId(player.id)}
                      className={`relative p-4 rounded-none border transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer min-h-[120px] select-none
                      ${
                        isSelected
                          ? 'bg-[#84cc16]/20 border-[#84cc16] scale-105 shadow-[0_0_20px_rgba(132,204,22,0.4)]'
                          : 'bg-[#0a0a0a] border-white/10 hover:border-[#84cc16]/50'
                      }`}
                    >
                      <Avatar
                        name={player.name}
                        size="sm"
                        className={
                          isSelected
                            ? 'bg-[#030303] border-[#84cc16] text-[#ecfccb] shadow-[0_0_10px_rgba(132,204,22,0.8)]'
                            : 'bg-[#030303] border-white/20 text-gray-400'
                        }
                      />
                      <span
                        className={`font-['Cinzel_Decorative',serif] text-sm tracking-wider mt-3 flex items-center justify-center gap-1 ${isSelected ? 'text-[#ecfccb]' : 'text-gray-300'}`}
                      >
                        {fullPlayer?.isLover && <span className="animate-pulse text-[10px]">❤️</span>}
                        <span>{player.name}</span>
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        <div className="flex justify-center border-t border-white/10 pt-8 mt-2 relative z-10">
          <Button
            size="lg"
            variant={hasConfirmed ? 'ghost' : 'secondary'}
            disabled={hasConfirmed || !canConfirm}
            onClick={handleConfirmClick}
            className={`min-w-[300px] ${!hasConfirmed && (witchUsePoison ? 'border-[#84cc16] text-[#84cc16] hover:bg-[#84cc16]/10' : witchUseHeal ? 'border-[#aa8c55] text-[#aa8c55] hover:bg-[#aa8c55]/10' : 'border-[#a855f7] text-[#d8b4fe] hover:bg-[#a855f7]/10')}`}
          >
            {hasConfirmed ? S.witch.btnDone : S.witch.btnCast}
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
};
