import { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useSocket } from '../../context/SocketContext';
import { useParams } from 'react-router-dom';
import { Button } from '../UI/Button';
import { Shield, Search, Moon, Skull, Swords } from 'lucide-react';
import { getRoleMeta } from '../../constants/roles';

export const NightActionModal = () => {
  const { id: roomId } = useParams();
  const socket = useSocket();
  const { myPlayer, phase, nightActionPrompt, setNightActionPrompt, nightStatus, players, seerVisions } = useGame();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [wolfPartnersTargets, setWolfPartnersTargets] = useState<Record<string, string>>({}); // { [partnerName]: targetId }
  const [wolfVotes, setWolfVotes] = useState<{ votes: Record<string, string>; submitted: string[] }>({
    votes: {},
    submitted: [],
  });

  // WITCH specific state
  const [witchUseHeal, setWitchUseHeal] = useState(false);
  const [witchUsePoison, setWitchUsePoison] = useState(false);
  const [witchPoisonTargetId, setWitchPoisonTargetId] = useState<string | null>(null);

  // Lắng nghe sự kiện Sói đồng bọn chọn mục tiêu (nháp và chốt)
  useEffect(() => {
    if (!socket || myPlayer?.role !== 'WEREWOLF') return;

    const handleWolfTarget = ({ targetId, actorName }: { targetId: string; actorName: string }) => {
      setWolfPartnersTargets((prev) => ({
        ...prev,
        [actorName]: targetId,
      }));
    };

    const handleWolfVoteUpdated = (data: { votes: Record<string, string>; submitted: string[] }) => {
      setWolfVotes(data);
    };

    socket.on('WOLF_TARGET_SELECTED', handleWolfTarget);
    socket.on('WOLF_VOTE_UPDATED', handleWolfVoteUpdated);

    return () => {
      socket.off('WOLF_TARGET_SELECTED', handleWolfTarget);
      socket.off('WOLF_VOTE_UPDATED', handleWolfVoteUpdated);
    };
  }, [socket, myPlayer]);

  // Tự động đóng prompt của Sói khi lượt Ma Sói kết thúc trên server
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

  const [prevPhase, setPrevPhase] = useState(phase);
  const [prevPrompt, setPrevPrompt] = useState(nightActionPrompt);

  if (phase !== prevPhase || nightActionPrompt !== prevPrompt) {
    setPrevPhase(phase);
    setPrevPrompt(nightActionPrompt);
    setSelectedId(null);
    setHasConfirmed(false);
    setWolfPartnersTargets({});
    setWolfVotes({ votes: {}, submitted: [] });
    setWitchUseHeal(false);
    setWitchUsePoison(false);
    setWitchPoisonTargetId(null);
  }

  if (phase !== 'night' || !myPlayer?.isAlive) return null;

  const handleSelect = (playerId: string) => {
    if (hasConfirmed) return;
    setSelectedId(playerId);

    // Gửi tín hiệu nháp cho các Sói khác xem cùng
    if (myPlayer?.role === 'WEREWOLF' && socket) {
      socket.emit('WOLF_DRAFT_TARGET', { roomId, targetId: playerId });
    }
  };

  const handleConfirm = () => {
    if (hasConfirmed) return;

    if (myPlayer?.role === 'WITCH') {
      const witchInfo = nightActionPrompt?.witchInfo;
      const targets = nightActionPrompt?.targetablePlayers || [];
      const victimPlayer = witchInfo?.werewolfVictimId
        ? targets.find((p) => p.id === witchInfo.werewolfVictimId)
        : null;

      const healTargetId = witchUseHeal && victimPlayer ? victimPlayer.id : null;
      const poisonTargetId = witchUsePoison ? witchPoisonTargetId : null;

      socket.emit('WITCH_ACTION', { roomId, healTargetId, poisonTargetId });
      setHasConfirmed(true);
      setNightActionPrompt(null);
      return;
    }

    if (!selectedId) return;

    // Gửi hành động chính thức lên server
    socket.emit('NIGHT_ACTION', { roomId, targetId: selectedId });
    setHasConfirmed(true);

    if (myPlayer?.role !== 'SEER' && myPlayer?.role !== 'WEREWOLF') {
      setNightActionPrompt(null); // Ẩn prompt sau khi submit để chuyển sang màn hình chờ ngủ
    }
  };

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

  // Nếu người chơi KHÔNG có prompt hành động (Dân làng hoặc đã chọn xong)
  if (!nightActionPrompt || !roleHeader) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 text-center">
        {/* Animated Background Stars */}
        <div className="absolute inset-0 stars-bg opacity-40 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

        <Moon className="w-20 h-20 text-indigo-300 animate-bounce mb-6" />
        <h2 className="text-3xl font-extrabold text-white mb-2 tracking-wide">Đêm Đã Buông Xuống...</h2>
        <p className="text-gray-400 text-lg max-w-md px-6 leading-relaxed mb-8">
          Bạn đang chìm vào giấc ngủ say. Hãy giữ im lặng để các vai trò ban đêm thực hiện kỹ năng của họ.
        </p>

        {nightStatus?.currentRoleName ? (
          <div className="px-6 py-3 rounded-full bg-dark/60 border border-gray-800 backdrop-blur text-sm text-yellow-500 font-medium animate-pulse">
            Chủ phòng báo cáo: Đang chờ <span className="underline font-bold">{nightStatus.currentRoleName}</span> hành
            động...
          </div>
        ) : (
          <div className="text-gray-500 text-sm animate-pulse">Vui lòng đợi giây lát...</div>
        )}
      </div>
    );
  }

  // Lọc danh sách người chơi có thể tương tác
  const targets = nightActionPrompt.targetablePlayers || [];
  const excludeTargetId = nightActionPrompt.excludeTargetId;
  const witchInfo = nightActionPrompt.witchInfo;

  // ----- WITCH UI đặc biệt -----
  if (myPlayer?.role === 'WITCH' && witchInfo) {
    const victimPlayer = witchInfo.werewolfVictimId ? targets.find((p) => p.id === witchInfo.werewolfVictimId) : null;

    const canConfirm = !witchUsePoison || witchPoisonTargetId !== null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/98 overflow-y-auto px-4 py-8">
        <div className="absolute inset-0 stars-bg opacity-30 pointer-events-none"></div>

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
                    Sử dụng bình cứu để hồi sinh <span className="font-bold text-red-400">{victimPlayer.name}</span>{' '}
                    khỏi cái chết đêm nay.
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
                      onClick={() => {
                        setWitchUsePoison(true);
                      }}
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
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1.5 border text-xs
                        ${isSelected ? 'bg-purple-600 border-purple-400 text-white' : 'bg-gray-850 border-gray-700 text-gray-300'}`}
                        >
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-200 text-xs truncate max-w-full flex items-center justify-center gap-1">
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
              onClick={handleConfirm}
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
      </div>
    );
  }

  // ----- UI thông thường (WEREWOLF, SEER, BODYGUARD) -----
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/98 overflow-y-auto px-4 py-8">
      <div className="absolute inset-0 stars-bg opacity-30 pointer-events-none"></div>

      <div
        className={`w-full max-w-4xl bg-dark/95 border backdrop-blur-md rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative z-10 ${roleHeader.color}`}
      >
        <div className="flex flex-col md:flex-row items-center gap-4 border-b border-gray-800 pb-6">
          <div className="p-4 bg-darker rounded-2xl border border-gray-800">{roleHeader.icon}</div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-white tracking-wide">{roleHeader.title}</h2>
            <p className="text-gray-400 mt-1 max-w-2xl">{roleHeader.desc}</p>
          </div>
        </div>

        {/* Grid người chơi */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[50vh] pr-2">
          {targets.map((player) => {
            const isExcluded = player.id === excludeTargetId;
            const isSelected = selectedId === player.id;
            const isSelf = player.id === myPlayer.id;

            const fullPlayer = players.find((p) => p.id === player.id);
            const isWolfAlly = myPlayer?.role === 'WEREWOLF' && fullPlayer?.role === 'WEREWOLF';
            const isWolfRole = myPlayer?.role === 'WEREWOLF';

            // Xem có đồng bọn sói nào đang nhắm vào người này không
            const isSeerInvestigated = myPlayer?.role === 'SEER' && seerVisions?.some((v) => v.targetId === player.id);
            const investigatedVision = myPlayer?.role === 'SEER' && seerVisions?.find((v) => v.targetId === player.id);

            // Xem có đồng bọn sói nào đang nhắm vào người này không (nháp)
            const partnersTargeting = Object.entries(wolfPartnersTargets)
              .filter(([actorName, targetId]) => {
                const wolfPlayer = players.find((x) => x.name === actorName);
                const hasLocked = wolfPlayer && wolfVotes.submitted.includes(wolfPlayer.id);
                return targetId === player.id && !hasLocked;
              })
              .map(([actorName]) => actorName);

            // Danh sách Sói đã chốt (locked) mục tiêu này
            const lockedVotesForPlayer = Object.entries(wolfVotes.votes)
              .filter(([wolfId, targetId]) => targetId === player.id && wolfVotes.submitted.includes(wolfId))
              .map(([wolfId]) => {
                const p = players.find((x) => x.id === wolfId);
                return wolfId === myPlayer.id ? 'Bạn' : p ? p.name : 'Đồng bọn';
              });

            return (
              <div
                key={player.id}
                onClick={() => !isExcluded && handleSelect(player.id)}
                className={`relative p-4 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center text-center select-none min-h-[120px]
                  ${
                    isExcluded
                      ? 'bg-darker/30 border-gray-900 opacity-40 cursor-not-allowed'
                      : isSelected
                        ? isWolfRole
                          ? 'bg-red-950/40 border-red-500 scale-[1.03] shadow-[0_0_15px_rgba(239,68,68,0.25)] cursor-pointer'
                          : 'bg-indigo-950/40 border-indigo-500 scale-[1.03] shadow-[0_0_15px_rgba(99,102,241,0.2)] cursor-pointer'
                        : isWolfAlly
                          ? 'bg-red-950/20 border-red-900/50 hover:border-red-750 shadow-[0_0_10px_rgba(239,68,68,0.1)] cursor-pointer'
                          : isSeerInvestigated
                            ? 'bg-purple-950/20 border-purple-900/50 hover:border-purple-750 shadow-[0_0_10px_rgba(168,85,247,0.15)] cursor-pointer'
                            : 'bg-darker/80 border-gray-800 hover:border-gray-700 cursor-pointer'
                  }
                `}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 border
                  ${
                    isSelected
                      ? isWolfRole
                        ? 'bg-red-650 border-red-400 text-white'
                        : 'bg-indigo-600 border-indigo-400 text-white'
                      : isWolfAlly
                        ? 'bg-red-950 border-red-800 text-red-200'
                        : isSeerInvestigated
                          ? 'bg-purple-950 border-purple-800 text-purple-200'
                          : 'bg-gray-800 border-gray-700 text-gray-300'
                  }
                `}
                >
                  {player.name.charAt(0).toUpperCase()}
                </div>

                <span className="font-bold text-gray-200 text-sm truncate max-w-full flex flex-col items-center gap-1">
                  <span>{player.name}</span>
                  <span className="flex gap-1 flex-wrap justify-center">
                    {fullPlayer?.isLover && (
                      <span className="text-[10px] bg-pink-950/80 border border-pink-500/20 text-pink-400 px-1 py-0.5 rounded font-bold animate-pulse">
                        ❤️ Người tình
                      </span>
                    )}
                    {isSelf && (
                      <span className="text-[10px] bg-indigo-950/80 border border-indigo-500/20 text-indigo-400 px-1 py-0.5 rounded font-semibold">
                        (Bạn)
                      </span>
                    )}
                    {isWolfAlly && !isSelf && (
                      <span className="text-[10px] bg-red-950/80 border border-red-500/20 text-red-400 px-1 py-0.5 rounded font-bold">
                        🐺 Đồng minh
                      </span>
                    )}
                    {isWolfAlly && isSelf && (
                      <span className="text-[10px] bg-red-950/80 border border-red-500/20 text-red-400 px-1 py-0.5 rounded font-bold">
                        🐺
                      </span>
                    )}
                    {isSeerInvestigated && investigatedVision && (
                      <span className="text-[10px] bg-purple-950/85 border border-purple-500/25 text-purple-400 px-1.5 py-0.5 rounded font-bold shadow-sm">
                        {investigatedVision.isWerewolf ? '🐺 Sói' : '✅ Dân'}
                      </span>
                    )}
                  </span>
                </span>

                {isExcluded && (
                  <span className="text-[10px] text-red-400 font-medium mt-1">(Vừa được bảo vệ đêm qua)</span>
                )}

                {/* Hiển thị đồng bọn sói đang chọn (nháp) */}
                {partnersTargeting.length > 0 && (
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-20">
                    {partnersTargeting.map((name) => (
                      <span
                        key={name}
                        className="text-[9px] bg-red-600/90 text-white px-1.5 py-0.5 rounded-full font-bold shadow animate-bounce"
                        title={`${name} đang ngắm`}
                      >
                        🐺 {name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Hiển thị đồng bọn sói đã chốt */}
                {lockedVotesForPlayer.length > 0 && (
                  <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-20">
                    {lockedVotesForPlayer.map((name) => (
                      <span
                        key={name}
                        className="text-[9px] bg-red-800 border border-red-600 text-white px-1.5 py-0.5 rounded-full font-bold shadow"
                        title={`${name} đã chốt`}
                      >
                        🗳️ {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-4 border-t border-gray-800 pt-6 mt-2">
          <Button
            size="lg"
            disabled={!selectedId || hasConfirmed}
            onClick={handleConfirm}
            className={`px-8 font-bold tracking-wider ${
              hasConfirmed
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20'
            }`}
          >
            {hasConfirmed
              ? myPlayer?.role === 'WEREWOLF'
                ? 'ĐÃ CHỐT (ĐANG CHỜ ĐỒNG ĐỘI...)'
                : 'HÀNH ĐỘNG ĐÃ GỬI'
              : 'CHỐT HÀNH ĐỘNG'}
          </Button>
        </div>
      </div>

      {/* Popup kết quả cho Tiên tri */}
      {hasConfirmed && myPlayer?.role === 'SEER' && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-dark border-2 border-purple-500 rounded-2xl p-6 shadow-[0_0_30px_rgba(147,51,234,0.3)] text-center flex flex-col items-center gap-5">
            <div className="p-4 bg-purple-950/50 rounded-full border border-purple-500/30">
              <Search className="w-12 h-12 text-purple-400 animate-pulse" />
            </div>

            {seerVisions?.find((v) => v.targetId === selectedId) ? (
              (() => {
                const vision = seerVisions.find((v) => v.targetId === selectedId)!;
                return (
                  <>
                    <h3 className="text-2xl font-bold text-white tracking-wide">Kết quả Tiên Tri</h3>
                    <div className="py-4 px-6 w-full rounded-xl bg-darker border border-gray-800 flex flex-col gap-2">
                      <p className="text-gray-400 text-sm">
                        Người chơi <span className="font-bold text-white">{vision.targetName}</span> thuộc phe:
                      </p>
                      <p
                        className={`text-2xl font-black uppercase tracking-widest ${vision.isWerewolf ? 'text-red-500 animate-pulse' : 'text-green-400'}`}
                      >
                        {vision.isWerewolf ? '🐺 MA SÓI' : '✅ DÂN LÀNG'}
                      </p>
                    </div>
                    <Button
                      size="lg"
                      onClick={() => setNightActionPrompt(null)}
                      className="w-full bg-purple-600 hover:bg-purple-700 font-bold tracking-wider"
                    >
                      XÁC NHẬN & ĐI NGỦ
                    </Button>
                  </>
                );
              })()
            ) : (
              <>
                <h3 className="text-xl font-bold text-white animate-pulse">Đang soi danh tính...</h3>
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
