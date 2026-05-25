export const FACTIONS = {
  VILLAGER: 'VILLAGER',
  WEREWOLF: 'WEREWOLF',
  THIRD_PARTY: 'THIRD_PARTY'
};

export const ROLES = {
  VILLAGER: {
    id: 'VILLAGER',
    name: 'DÃ¢n lÃ ng',
    faction: FACTIONS.VILLAGER,
    strength: 1,
    priority: 0,
    description: 'Ngá»§ vÃ o ban Ä‘Ãªm. Thá»©c dáº­y vÃ o ban ngÃ y Ä‘á»ƒ tháº£o luáº­n vÃ  vote.',
    icon: 'Users'
  },
  WEREWOLF: {
    id: 'WEREWOLF',
    name: 'Ma sÃ³i',
    faction: FACTIONS.WEREWOLF,
    strength: -2,
    priority: 10,
    description: 'Thá»©c dáº­y vÃ o ban Ä‘Ãªm Ä‘á»ƒ chá»n má»™t náº¡n nhÃ¢n. Cá»‘ gáº¯ng giáº£ lÃ m ngÆ°á»i vÃ o ban ngÃ y.',
    icon: 'Eye'
  },
  SEER: {
    id: 'SEER',
    name: 'TiÃªn tri',
    faction: FACTIONS.VILLAGER,
    strength: 3,
    priority: 20,
    description: 'Thá»©c dáº­y má»—i Ä‘Ãªm Ä‘á»ƒ soi xem má»™t ngÆ°á»i cÃ³ pháº£i lÃ  SÃ³i hay khÃ´ng.',
    icon: 'Search'
  },
  BODYGUARD: {
    id: 'BODYGUARD',
    name: 'Báº£o vá»‡',
    faction: FACTIONS.VILLAGER,
    strength: 3,
    priority: 30,
    description: 'Tháº­y dáº­y má»—i Ä‘Ãªm Ä‘á»ƒ báº£o vá»‡ má»™t ngÆ°á»i khá»i bá»‹ SÃ³i cáº¯n. KhÃ´ng thá»ƒ báº£o vá»‡ cÃ¹ng 1 ngÆ°á»i 2 Ä‘Ãªm liÃªn tiáº¿p.',
    icon: 'Shield'
  },
  HUNTER: {
    id: 'HUNTER',
    name: 'Thá»£ sÄƒn',
    faction: FACTIONS.VILLAGER,
    strength: 2,
    priority: 0,
    description: 'Khi cháº¿t, Ä‘Æ°á»£c báº¯n cháº¿t 1 ngÆ°á»i khÃ¡c.',
    icon: 'Target'
  }
};

export const getRoleById = (id) => ROLES[id];
