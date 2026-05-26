export const FACTIONS = {
  VILLAGER: 'VILLAGER',
  WEREWOLF: 'WEREWOLF',
  THIRD_PARTY: 'THIRD_PARTY'
};

export const ROLES = {
  VILLAGER: {
    id: 'VILLAGER',
    name: 'Dân làng',
    faction: FACTIONS.VILLAGER,
    strength: 1,
    priority: 0,
    description: 'Ngủ vào ban đêm. Thức dậy vào ban ngày để thảo luận và vote.',
    icon: 'Users'
  },
  WEREWOLF: {
    id: 'WEREWOLF',
    name: 'Ma sói',
    faction: FACTIONS.WEREWOLF,
    strength: -2,
    priority: 10,
    description: 'Thức dậy vào ban đêm để chọn một nạn nhân. Cố gắng giả làm người vào ban ngày.',
    icon: 'Eye'
  },
  SEER: {
    id: 'SEER',
    name: 'Tiên tri',
    faction: FACTIONS.VILLAGER,
    strength: 3,
    priority: 20,
    description: 'Thức dậy mỗi đêm để soi xem một người có phải là Sói hay không.',
    icon: 'Search'
  },
  BODYGUARD: {
    id: 'BODYGUARD',
    name: 'Bảo vệ',
    faction: FACTIONS.VILLAGER,
    strength: 3,
    priority: 30,
    description: 'Thậy dậy mỗi đêm để bảo vệ một người khỏi bị Sói cắn. Không thể bảo vệ cùng 1 người 2 đêm liên tiếp.',
    icon: 'Shield'
  },
  HUNTER: {
    id: 'HUNTER',
    name: 'Thợ săn',
    faction: FACTIONS.VILLAGER,
    strength: 2,
    priority: 0,
    description: 'Khi chết, được bắn chết 1 người khác.',
    icon: 'Target'
  }
};

export const getRoleById = (id: keyof typeof ROLES) => ROLES[id];
