import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useSocket } from '../../context/SocketContext';
import { useParams } from 'react-router-dom';

// Sub-components
import { HunterShotBanner } from './Hunter/HunterShotBanner';
import { HunterSelectionModal } from './Hunter/HunterSelectionModal';
import { SpectatorWaitOverlay } from './Hunter/SpectatorWaitOverlay';

export const HunterRetaliationModal = () => {
  const { id: roomId } = useParams();
  const socket = useSocket();
  const { myPlayer, phase, hunterPrompt, setHunterPrompt, hunterShotResult } = useGame();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const handleConfirm = () => {
    if (!selectedId || hasConfirmed) return;

    socket?.emit('HUNTER_SHOOT', { roomId, targetId: selectedId });
    setHasConfirmed(true);
    setHunterPrompt(null); // Hide prompt after shooting
  };

  const handleSkip = () => {
    if (hasConfirmed) return;
    socket?.emit('HUNTER_SKIP', { roomId });
    setHasConfirmed(true);
    setHunterPrompt(null);
  };

  // 1. Announcement of the final shot results
  if (hunterShotResult) {
    const { hunterName, targetName } = hunterShotResult;
    return <HunterShotBanner hunterName={hunterName} targetName={targetName} />;
  }

  // 2. Active Hunter's turn to shoot
  if (phase === 'hunterRetaliation' && hunterPrompt && myPlayer?.role === 'HUNTER') {
    return (
      <HunterSelectionModal
        targets={hunterPrompt.targetablePlayers}
        selectedId={selectedId}
        hasConfirmed={hasConfirmed}
        onSelect={setSelectedId}
        onConfirm={handleConfirm}
        onSkip={handleSkip}
      />
    );
  }

  // 3. Waiting overlay for other surviving players
  if (phase === 'hunterRetaliation' && myPlayer?.isAlive) {
    return <SpectatorWaitOverlay />;
  }

  return null;
};
