import { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useSocket } from '../../context/SocketContext';
import { useParams } from 'react-router-dom';
import { getRoleMeta } from '../../constants/roles';
import { useSocketEvent } from '../../hooks/useSocketEvent';

// Sub-components
import { NightSleepScreen } from './NightAction/NightSleepScreen';
import { WerewolfActionPanel } from './NightAction/WerewolfActionPanel';
import { SeerActionPanel } from './NightAction/SeerActionPanel';
import { WitchActionPanel } from './NightAction/WitchActionPanel';
import { DefaultActionPanel } from './NightAction/DefaultActionPanel';

export const NightActionModal = () => {
  const { id: roomId } = useParams();
  const socket = useSocket();
  const {
    myPlayer,
    phase,
    nightActionPrompt,
    setNightActionPrompt,
    nightStatus,
    players,
    seerVisions,
  } = useGame();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  
  // Werewolf specific states
  const [wolfPartnersTargets, setWolfPartnersTargets] = useState<Record<string, string>>({});
  const [wolfVotes, setWolfVotes] = useState<{ votes: Record<string, string>; submitted: string[] }>({
    votes: {},
    submitted: [],
  });

  // Listen to Werewolf collaborative events
  const wolfSocket = myPlayer?.role === 'WEREWOLF' ? socket : null;

  useSocketEvent(wolfSocket, 'WOLF_TARGET_SELECTED', (data: { targetId: string; actorName: string }) => {
    setWolfPartnersTargets((prev) => ({
      ...prev,
      [data.actorName]: data.targetId,
    }));
  });

  useSocketEvent(wolfSocket, 'WOLF_VOTE_UPDATED', (data: { votes: Record<string, string>; submitted: string[] }) => {
    setWolfVotes(data);
  });

  // Auto-close Wolf prompt when Wolf turn concludes on the server
  useEffect(() => {
    if (phase === 'night' && myPlayer?.role === 'WEREWOLF' && hasConfirmed) {
      if (
        nightStatus?.currentRoleName &&
        nightStatus.currentRoleName !== 'Ma sói' &&
        nightStatus.currentRoleName !== 'WEREWOLF' &&
        nightStatus.currentRoleName !== 'các vai trò đặc biệt'
      ) {
        setNightActionPrompt(null);
      }
    }
  }, [nightStatus?.currentRoleName, phase, myPlayer?.role, hasConfirmed, setNightActionPrompt]);

  if (!['night', 'firstNight'].includes(phase as string) || !myPlayer?.isAlive) return null;

  // Trong đêm đầu, các role như CUPID, WEREWOLF đã được xử lý bởi FirstNightModal. 
  // Chỉ dùng NightActionModal cho các role khác (như DOPPELGANGER). Tránh render NightSleepScreen đè lên FirstNightWaitingOverlay.
  if (phase === 'firstNight' && (!nightActionPrompt || ['CUPID', 'WEREWOLF'].includes(nightActionPrompt.role))) {
    return null;
  }

  const getRoleHeader = () => {
    if (!myPlayer?.role) return null;
    const meta = getRoleMeta(myPlayer.role);
    if (!meta.nightAction) return null;

    const Icon = meta.iconComponent;
    return {
      title: meta.nightAction.title,
      desc: meta.nightAction.desc,
      icon: <Icon className={`w-12 h-12 ${meta.color} ${meta.animateIcon ? 'animate-pulse' : ''}`} />,
      color: meta.nightAction.headerColor,
    };
  };

  const roleHeader = getRoleHeader();

  // If player has no night action prompt or is Villager
  if (!nightActionPrompt || !roleHeader) {
    return <NightSleepScreen nightStatus={nightStatus} />;
  }

  const targets = nightActionPrompt.targetablePlayers || [];
  const excludeTargetId = nightActionPrompt.excludeTargetId;
  const witchInfo = nightActionPrompt.witchInfo;

  // Xử lý Giao diện Mất Năng Lực do Lời Nguyền Già Làng
  const { villagersLostPowers } = useGame().gameState || {};
  const isSpecialVillager = ['SEER', 'WITCH', 'BODYGUARD', 'HUNTER'].includes(myPlayer?.role || '');
  if (villagersLostPowers && isSpecialVillager) {
    return (
      <ModalOverlay opacity="deep">
        <div className="bg-[#0a0a0a] border border-[#8a0303] rounded-none p-8 md:p-12 max-w-2xl w-full text-center shadow-[0_0_80px_rgba(138,3,3,0.5)] transform scale-100 transition-all duration-300 relative overflow-hidden font-['Cormorant_Garamond',serif]">
            <h2 className="text-4xl font-['Cinzel_Decorative',serif] text-[#8a0303] mb-4 tracking-[0.2em] uppercase">MẤT NĂNG LỰC</h2>
            <p className="text-gray-300 text-2xl italic leading-relaxed mb-8">
              "Quyền năng của bạn đã bị tước đoạt do sự phẫn nộ từ cái chết oan uổng của Già Làng."
            </p>
            <div className="text-gray-400 text-lg py-4 px-6 bg-[#030303] border border-[#8a0303]/30 mb-8 max-w-md mx-auto">
              ⚠️ Các nút bấm chọn mục tiêu đã bị khóa. Bạn không thể hành động trong đêm nay.
            </div>
            <button 
              onClick={() => {
                socket?.emit('NIGHT_ACTION', { roomId, targetId: null, role: myPlayer?.role });
                setHasConfirmed(true);
                setNightActionPrompt(null);
              }}
              className="w-full max-w-xs bg-transparent hover:bg-[#8a0303]/20 text-[#ffdddd] font-['Cinzel_Decorative',serif] py-4 px-8 rounded-none border border-[#8a0303] transition-all duration-300 hover:scale-105 active:scale-95 uppercase tracking-widest cursor-pointer text-xl"
            >
              CHẤP NHẬN
            </button>
        </div>
      </ModalOverlay>
    );
  }

  // 1. Witch UI Panel
  if (myPlayer?.role === 'WITCH' && witchInfo) {
    return (
      <WitchActionPanel
        roleHeader={roleHeader}
        targets={targets}
        players={players}
        myPlayer={myPlayer}
        witchInfo={witchInfo}
        hasConfirmed={hasConfirmed}
        onConfirm={(healTargetId, poisonTargetId) => {
          socket?.emit('WITCH_ACTION', { roomId, healTargetId, poisonTargetId });
          setHasConfirmed(true);
          setNightActionPrompt(null);
        }}
      />
    );
  }

  // 2. Werewolf UI Panel
  if (myPlayer?.role === 'WEREWOLF') {
    return (
      <WerewolfActionPanel
        roleHeader={roleHeader}
        targets={targets}
        players={players}
        myPlayer={myPlayer}
        selectedId={selectedId}
        onSelect={(targetId) => {
          setSelectedId(targetId);
          socket?.emit('WOLF_DRAFT_TARGET', { roomId, targetId });
        }}
        onConfirm={() => {
          if (!selectedId) return;
          socket?.emit('NIGHT_ACTION', { roomId, targetId: selectedId });
          setHasConfirmed(true);
        }}
        hasConfirmed={hasConfirmed}
        wolfPartnersTargets={wolfPartnersTargets}
        wolfVotes={wolfVotes}
      />
    );
  }

  // 3. Seer UI Panel
  if (myPlayer?.role === 'SEER') {
    return (
      <SeerActionPanel
        roleHeader={roleHeader}
        targets={targets}
        players={players}
        myPlayer={myPlayer}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onConfirm={() => {
          if (!selectedId) return;
          socket?.emit('NIGHT_ACTION', { roomId, targetId: selectedId });
          setHasConfirmed(true);
        }}
        hasConfirmed={hasConfirmed}
        seerVisions={seerVisions}
        onCloseResult={() => setNightActionPrompt(null)}
      />
    );
  }

  // 4. Default Action Panel (Bodyguard, Cupid, etc.)
  return (
    <DefaultActionPanel
      roleHeader={roleHeader}
      targets={targets}
      players={players}
      myPlayer={myPlayer}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onConfirm={() => {
        if (!selectedId) return;
        socket?.emit('NIGHT_ACTION', { roomId, targetId: selectedId });
        setHasConfirmed(true);
        setNightActionPrompt(null);
      }}
      hasConfirmed={hasConfirmed}
      excludeTargetId={excludeTargetId}
    />
  );
};
