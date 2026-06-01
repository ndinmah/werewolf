export const S = {
  // ─── Trang Chủ ──────────────────────────────────────
  home: {
    tagline: 'Interactive Survival',
    title: ['WERE', 'WOLF'],
    quote: '"Trust no one. The night hides monsters wearing the faces of friends."',
    panelTitle: 'Join the Village',
    namePlaceholder: 'Enter thy name...',
    roomCodePlaceholder: 'Enter ritual code (optional)...',
    btnCreate: 'Create Ritual',
    btnJoin: 'Enter Village',
    activeRitualsLabel: 'Active Rituals',
    soulsWaiting: (n: number) => `${n} souls waiting`,
    toastRoomSelected: (id: string) => `Ritual code selected: ${id}`,
    toastJoinError: 'Không thể vào phòng',
  },

  // ─── Sảnh Chờ ────────────────────────────────────────
  lobby: {
    bgWatermark: 'LOBBY',
    tagline: 'Ritual Chamber',
    title: 'Phòng chờ',
    roomCodeLabel: 'Mã phòng:',
    btnStart: 'Bắt đầu nghi thức',
    waitingForHost: 'Chờ chủ phòng bắt đầu...',
    settingsTitle: 'Cấu hình',
    settingsHostDesc: 'Bạn đang giữ quyền định đoạt.',
    settingsGuestDesc: 'Chỉ chủ phòng mới có thể thay đổi.',
    toastCopyCode: 'Đã chép mã nghi thức!',
    toastConnectError: 'Không thể kết nối đến phòng. Vui lòng thử lại.',
    toastKicked: 'Bạn đã bị kick khỏi phòng bởi chủ phòng.',
    toastKickSuccess: (name: string) => `Đã trục xuất ${name}`,
    toastNoWolf: '⚠️ Trận đấu phải có ít nhất 1 Ma Sói!',
    toastMinPlayers: '⚠️ Trận đấu phải có ít nhất 2 người chơi!',
    loading: 'Summoning ritual circle...',
  },

  // ─── Thư Viện Vai Trò ────────────────────────────────
  rolesPage: {
    bgWatermark: 'GRIMOIRE',
    tagline: 'The Book of Souls',
    title: 'Thư Viện Vai Trò',
    quote: '"Khám phá những bản ngã ẩn giấu trong màn đêm. Kẻ là Sói, người là Cừu."',
    balanceLabel: 'Cân bằng:',
  },

  // ─── Màn Chơi Chính ──────────────────────────────────
  game: {
    roomLabel: 'Phòng:',
    dayLabel: (n: number | undefined) => `Ngày thứ ${n || 0}`,
    playerIdentityLabel: 'Định danh',
    loading: 'Đang tải...',
    lostPowerBadge: '🚫 Mất dị năng',
    elderShieldActive: '🛡️ Hộ thể: 1/1',
    elderShieldBroken: '🛡️ Hộ thể: Vỡ nát',
    doppelgangerOriginLabel: (name: string) => `👥 Gốc: ${name}`,
    unknownOrigin: 'Vô danh',
  },

  // ─── Overlay Sự Kiện ─────────────────────────────────
  events: {
    elderCurse: {
      title: 'LỜI NGUYỀN GIÀ LÀNG!',
      story:
        '"Kẻ ngu ngốc đã sát hại đấng tối cao! Cơn thịnh nộ giáng xuống, tước đi mọi quyền năng của những kẻ mang dị năng."',
      detail: '⚠️ Tiên tri, Bảo vệ, Phù thủy, Thợ săn, Cupid đều đã thành Dân Thường.',
      btnAck: 'TUÂN LỆNH',
    },
    doppelgangerInherit: {
      title: 'KẾ THỪA DI CHÚC',
      story: '"Bản gốc đã đổ máu. Lời nguyền nhân bản hoàn tất. Ngươi sẽ gánh vác sứ mệnh và tội lỗi của kẻ đi trước."',
      btnAck: 'CHẤP NHẬN SỐ PHẬN',
    },
  },

  // ─── Màn Lật Bài (RoleReveal) ────────────────────────
  roleReveal: {
    title: 'Định Mệnh Của Ngươi',
    instruction: '"Chạm vào lá bài để mở khóa bản ngã thực sự của ngươi. Bí mật này không được phép tiết lộ."',
    cardFrontLabel: 'Click để xem',
    cardFrontBrand: 'Werewolf Ritual',
    cardBackSecret: 'Giữ bí mật tuyệt đối',
    btnReady: 'Đã rõ định mệnh',
    btnNightFalling: 'Màn đêm buông xuống...',
  },

  // ─── Bình Minh Ló Dạng (Narrator) ───────────────────
  narrator: {
    title: 'Bình Minh Ló Dạng',
    storyWithDeaths: '"Mặt trời mọc không thể xóa nhòa vết máu trong đêm. Một linh hồn đã vĩnh viễn rời bỏ trần thế."',
    storyNoDeaths: '"Ánh sáng thanh tẩy xua tan bóng tối. Không một ai phải đổ máu đêm qua. Phép màu đã xuất hiện."',
    victimListLabel: 'Danh sách tử nạn:',
    countdownLabel: (s: number) => `Hội đồng phán xét bắt đầu sau ${s} giây...`,
    countdownLoading: 'Đang triệu tập hội đồng...',
  },

  // ─── Kết Quả Bỏ Phiếu (VotingResultBanner) ──────────
  votingResult: {
    titleEliminated: 'Lệnh Hành Quyết',
    titleTie: 'Hội Đồng Bất Phân',
    storyEliminated: (name: string) =>
      `Linh hồn của ${name} đã bị thiêu rụi trên giàn hỏa thiêu. Màn đêm sẽ định đoạt phần còn lại.`,
    storyTie:
      'Không một lời phán xét nào được thi hành. Thần linh quyết định tha mạng cho tất cả mọi người hôm nay, nhưng bóng tối vẫn đang chờ đợi.',
    storyNoVote: 'Sự im lặng bao trùm quảng trường. Ngày hôm nay kết thúc trong yên lặng đáng sợ.',
  },

  // ─── Màn Đêm – Ngủ (NightSleepScreen) ───────────────
  nightSleep: {
    title: 'Màn Đêm Tĩnh Lặng',
    quote: '"Đừng mở mắt, đừng hé môi. Trong bóng tối, những kẻ săn mồi đang thức giấc..."',
    statusLabel: 'Tiếng động trong đêm',
    waitingFor: (roleName: string) => `Đang chờ ${roleName}`,
    fogText: 'Sương mù đang phủ kín lối đi...',
  },

  // ─── Hành Động Đêm – Chung ───────────────────────────
  nightAction: {
    lostPowerTitle: 'MẤT NĂNG LỰC',
    lostPowerStory: '"Quyền năng của bạn đã bị tước đoạt do sự phẫn nộ từ cái chết oan uổng của Già Làng."',
    lostPowerDetail: '⚠️ Các nút bấm chọn mục tiêu đã bị khóa. Bạn không thể hành động trong đêm nay.',
    lostPowerBtn: 'CHẤP NHẬN',
    badgeYou: 'Ngươi',
    badgeWolfAlly: '🐺 Đồng loại',
    badgeInviolable: 'Bất Khả Xâm Phạm',
    badgeLover: '❤️',
  },

  // ─── Hành Động Đêm – Ma Sói ──────────────────────────
  werewolf: {
    badgeWolfAim: (name: string) => `🐺 ${name} đang nhắm tới`,
    badgeWolfAimShort: (name: string) => `🐺 ${name}`,
    badgeLocked: (name: string) => `🩸 ${name} đã chốt`,
    badgeLockedShort: (name: string) => `🩸 ${name}`,
    badgeYou: 'Ngươi',
    badgePartner: 'Đồng bọn',
    btnBite: 'CẮN XÉ',
    btnWaitingAllies: 'ĐÃ NHUỐM MÁU (CHỜ ĐỒNG LOẠI)',
    btnWaitingOthers: 'ĐÃ NHUỐM MÁU (CHỜ CÁC THẾ LỰC KHÁC)',
  },

  // ─── Hành Động Đêm – Tiên Tri ────────────────────────
  seer: {
    btnReveal: 'SOI SÁNG DANH TÍNH',
    btnDone: 'ĐÃ NHÌN THẤY TƯƠNG LAI',
    resultTitle: 'Tương Lai Đã Mở',
    resultLoading: 'Đang rẽ sương mù...',
    resultNarrative: (name: string) => `Linh hồn của ${name} là:`,
    resultWerewolf: '🐺 MA SÓI',
    resultVillager: '✅ LƯƠNG DÂN',
    btnClose: 'KHÉP LẠI TẦM NHÌN',
    badgeWerewolf: '🐺 Ma Sói',
    badgeVillager: '✅ Lương Dân',
  },

  // ─── Hành Động Đêm – Vai mặc định (Bảo vệ, v.v.) ────
  defaultAction: {
    btnConfirm: 'XÁC NHẬN MỤC TIÊU',
    btnDone: 'HÀNH ĐỘNG ĐÃ NIÊM PHONG',
  },

  // ─── Hành Động Đêm – Phù Thủy ────────────────────────
  witch: {
    wolfVictimLabel: 'Dấu vết của quỷ:',
    noPeacefulNight: '(Đêm nay bình yên)',
    healTitle: 'Hồi Sinh Nhan',
    healStory: (name: string) => `Sử dụng bình tiên để cứu rỗi linh hồn ${name} khỏi nanh vuốt cái chết.`,
    btnHeal: 'Ban Sự Sống',
    btnSkipHeal: 'Mặc Kệ',
    healUsed: '"Lọ thuốc cứu mạng đã vỡ nát từ lâu..."',
    healNotNeeded: '"Màn đêm tĩnh lặng, không một ai đổ máu."',
    poisonTitle: 'Tịch Diệt Lộ',
    poisonStory: 'Nhỏ một giọt kịch độc để đoạt mạng bất kỳ kẻ nào ngáng đường. Cái chết là tuyệt đối.',
    btnPoison: 'Đầu Độc',
    btnSkipPoison: 'Khoan Dung',
    poisonUsed: '"Chai thuốc độc chỉ còn lại cặn bã vô hại."',
    poisonTargetTitle: 'Tế Đàn Tuyệt Mệnh',
    btnCast: 'THI TRIỂN QUYỀN NĂNG',
    btnDone: 'PHÉP THUẬT ĐÃ BAN',
  },

  // ─── Đêm Đầu Tiên – Cupid ────────────────────────────
  cupid: {
    title: 'Tơ Hồng Định Mệnh',
    story:
      '"Hai sinh mệnh. Một cái chết. Hãy chọn lấy hai linh hồn để kết nối tơ duyên, và chứng kiến họ chết cùng nhau."',
    btnReady: (n: number) => (n === 2 ? 'KẾT NỐI LINH HỒN' : `ĐÃ CHỌN ${n}/2`),
  },

  // ─── Đêm Đầu Tiên – Chờ ──────────────────────────────
  firstNightWaiting: {
    title: 'Đêm Đầu Tiên',
    quote: '"Xin hãy khép hờ đôi mắt. Trong màn đêm sâu thẳm, những thế lực cổ xưa đang rục rịch tỉnh giấc..."',
  },

  // ─── Đêm Đầu Tiên – Tình Nhân ────────────────────────
  loverReveal: {
    title: 'Duyên Định Mệnh',
    story:
      '"Sinh cùng sinh, tử cùng tử." Sợi chỉ đỏ đã buộc chặt linh hồn hai người. Nếu không cùng phe, các ngươi phải giẫm lên xác của tất cả để tồn tại.',
    youLabel: '(Ngươi)',
    noPartner: 'Không tìm thấy tri kỷ...',
  },

  // ─── Đêm Đầu Tiên – Ma Sói Lộ Diện ─────────────────
  wolfReveal: {
    title: 'Bầy Đàn Thức Giấc',
    soloWolf: 'Ngươi là con sói độc hành trong đêm nay...',
    youLabel: '(Ngươi)',
  },

  // ─── Thợ Săn Trả Thù ─────────────────────────────────
  hunter: {
    selectionTitle: 'Phát Đạn Báo Thù',
    selectionStory:
      '"Ngươi sắp trút hơi thở cuối cùng, nhưng họng súng vẫn còn một viên đạn bạc. Hãy mang kẻ thủ ác xuống mồ cùng ngươi."',
    urgencyLabel: 'Nhanh lên, máu đang cạn dần!',
    btnSilent: 'CHẾT TRONG IM LẶNG',
    btnShoot: 'BÓP CÒ',
    btnDone: 'ĐẠN ĐÃ LÊN NÒNG',
    bannerTitle: 'Đoạt Mệnh Lệnh!',
    bannerStoryTemplate: (hunterName: string, targetName: string) =>
      `Thợ săn ${hunterName} trong phút hấp hối đã bóp cò, găm viên đạn bạc xuyên thẳng qua tim của ${targetName}!`,
    spectatorTitle: 'Phút Giây Sinh Tử',
    spectatorStory:
      'Thợ Săn đang trút hơi thở cuối cùng, ngón tay vẫn siết chặt cò súng. Hãy cầu nguyện bóng đêm che chở cho bạn...',
  },

  // ─── Bỏ Phiếu Ban Ngày (VotePanel) ──────────────────
  votePanel: {
    title: 'Sổ Tử Thần',
    votingStatus: (cast: number, total: number) => `Đang Phán Xét (${cast}/${total})`,
    btnVote: 'Kết Liễu',
    btnVoteDone: 'Đã Niêm Phong',
    elderCurseTitle: 'Cơn Thịnh Nộ Của Già Làng',
    elderCurseStory:
      '"Già Làng đã chết trong sự ngu ngốc của dân làng! Lời nguyền trỗi dậy tước đi toàn bộ sức mạnh thần bí."',
    votedTooltip: (name: string) => `${name} đã bỏ phiếu`,
  },

  // ─── Kết Thúc Game (GameOverScreen) ─────────────────
  gameOver: {
    winnerLabel: 'Chiến Thắng',
    winStory: '"Ánh sáng vinh quang chiếu rọi. Phe của bạn đã sống sót và làm chủ vận mệnh."',
    lossStory: '"Bóng tối nuốt chửng tất cả. Thất bại là cái giá phải trả bằng máu."',
    tableTitle: 'Cuốn sổ tử thần',
    colSoul: 'Linh hồn',
    colStatus: 'Trạng thái',
    colRole: 'Chân tướng',
    colFate: 'Định mệnh',
    statusAlive: 'Sống sót',
    statusDead: 'Tử nạn',
    fateWin: 'Thắng',
    fateLoss: 'Thua',
    youLabel: '(Ngươi)',
    btnRestart: (s: number | null) => `Luân Hồi${s !== null && s > 0 ? ` (${s}s)` : ''}`,
  },

  // ─── Lỗi & Ngoại Lệ (ErrorBoundary) ───────────────────
  error: {
    title: 'Đã Xảy Ra Sự Cố',
    story: '"Thế giới hắc ám đã bị gián đoạn. Xin hãy triệu hồi lại."',
    btnRetry: 'Triệu hồi lại',
    btnHome: 'Về trang chủ',
  },

  // ─── Sảnh Chờ - UI Sub-components ─────────────────────
  lobbyUI: {
    playerListTitle: (count: number) => `Souls Gathered (${count})`,
    hostBadge: 'Ritual Master',
    kickTooltip: 'Banish Soul',
    roleDeckTitle: 'Role Deck',
    balanceTooltip: 'Tổng điểm sức mạnh. Cân bằng nhất là 0.',
    balanceLabel: (score: number) => `Cân bằng: ${score > 0 ? `+${score}` : score}`,
    scoreLabel: (score: number) => `ĐIỂM: ${score > 0 ? `+${score}` : score}`,
    timerTitle: 'Sands of Time (s)',
    timerDayStart: 'Bình minh',
    timerDiscuss: 'Thảo luận',
    timerVote: 'Biểu quyết',
  },

  // ─── Thẻ Người Chơi (PlayerCard) ──────────────────────
  playerCard: {
    tooltipLover: 'Người tình liên kết',
    tooltipWolfAlly: 'Đồng bọn Ma Sói',
    tooltipSeerWolf: 'Phe Sói',
    tooltipSeerVillager: 'Phe Dân',
  },

  // ─── Khung Chat (ChatPanel) ───────────────────────────
  chat: {
    tabGeneral: 'Quảng Trường',
    tabWolves: 'Hang Sói',
    tabGhost: 'Cõi Âm',
    placeholderDisabled: 'Im lặng là vàng...',
    placeholderActive: 'Thì thầm...',
    btnSend: 'Gửi',
  },
};
