import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useSocket } from '../../context/SocketContext';
import { useParams } from 'react-router-dom';

// Sub-components
import { CupidSelectionModal } from './FirstNight/CupidSelectionModal';
import { LoverRevealOverlay } from './FirstNight/LoverRevealOverlay';
import { WolfRevealOverlay } from './FirstNight/WolfRevealOverlay';
import { FirstNightWaitingOverlay } from './FirstNight/FirstNightWaitingOverlay';

export const FirstNightModal = () => {
  const { id: roomId } = useParams();
  const { phase, myPlayer, wolfReveal, loverReveal, nightActionPrompt } = useGame();
  const socket = useSocket();

  const [selectedLovers, setSelectedLovers] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  if (phase !== 'firstNight') return null;

  // Handle Cupid submits choices
  const handleCupidSubmit = () => {
    if (selectedLovers.length === 2 && !hasSubmitted) {
      socket?.emit('CUPID_ACTION', {
        roomId,
        lover1Id: selectedLovers[0],
        lover2Id: selectedLovers[1],
      });
      setHasSubmitted(true);
    }
  };

  const toggleLover = (id: string) => {
    setSelectedLovers((prev) => {
      if (prev.includes(id)) {
        return prev.filter((l) => l !== id);
      }
      if (prev.length < 2) {
        return [...prev, id];
      }
      return prev;
    });
  };

  // 1. Cupid selection phase
  if (myPlayer?.role === 'CUPID' && nightActionPrompt?.role === 'CUPID' && !hasSubmitted) {
    return (
      <CupidSelectionModal
        targets={nightActionPrompt.targetablePlayers}
        selectedLovers={selectedLovers}
        onToggle={toggleLover}
        onSubmit={handleCupidSubmit}
      />
    );
  }

  // 2. Lovers identity reveal
  if (loverReveal) {
    return (
      <LoverRevealOverlay
        myPlayer={myPlayer || null}
        partnerName={loverReveal.partner?.name || null}
      />
    );
  }

  // 3. Werewolf identity reveal
  if (wolfReveal) {
    return (
      <WolfRevealOverlay
        myPlayer={myPlayer || null}
        teammates={wolfReveal.teammates}
      />
    );
  }

  // 4. Default: Spectators or other roles waiting
  return <FirstNightWaitingOverlay />;
};
