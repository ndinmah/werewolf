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
        nightStatus.currentRoleName !== 'WEREWOLF'
      ) {
        setNightActionPrompt(null);
      }
    }
  }, [nightStatus?.currentRoleName, phase, myPlayer?.role, hasConfirmed, setNightActionPrompt]);

  if (phase !== 'night' || !myPlayer?.isAlive) return null;

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

  // 1. Witch UI Panel
  if (myPlayer?.role === 'WITCH' && witchInfo) {
    return (
      <WitchActionPanel
        roleHeader={roleHeader}
        targets={targets}
        players={players}
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
