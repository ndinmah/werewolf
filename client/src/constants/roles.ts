import React from 'react';
import { Eye, Shield, Search, Users, Target, FlaskConical, Heart, Skull, Award, ShieldAlert, Copy } from 'lucide-react';
import type { Role } from '../types/game';

export interface RoleMeta {
  id: Role;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  strength: number;
  factionName: string;
  factionColor: string;
  desc: string;
  iconComponent: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  animateIcon?: boolean;
  cardBg: string;
  nightAction?: {
    title: string;
    desc: string;
    headerColor: string;
  };
}

export const ROLE_METADATA: Record<Role, RoleMeta> = {
  WEREWOLF: {
    id: 'WEREWOLF',
    name: 'Ma Sói',
    emoji: '🐺',
    color: 'text-[#8a0303]',
    bgColor: 'bg-[#8a0303]',
    strength: -2,
    factionName: 'Phe Ma Sói',
    factionColor: 'text-[#8a0303] bg-[#8a0303]/20 border-[#8a0303]',
    desc: 'Thức dậy vào ban đêm để chọn một nạn nhân. Cố gắng ẩn mình giả làm người lành vào ban ngày để tiêu diệt dân làng.',
    iconComponent: Eye,
    animateIcon: true,
    cardBg: 'from-[#030303] via-[#0a0a0a] to-[#8a0303]/30 border-[#8a0303]/50 shadow-[inset_0_0_20px_rgba(138,3,3,0.2)]',
    nightAction: {
      title: 'Phe Ma Sói',
      desc: 'Thảo luận với bầy đàn của bạn và chọn 1 nạn nhân để giết đêm nay.',
      headerColor: 'border-[#8a0303] shadow-[0_0_20px_rgba(138,3,3,0.3)]',
    },
  },
  SEER: {
    id: 'SEER',
    name: 'Tiên Tri',
    emoji: '🔮',
    color: 'text-[#a855f7]',
    bgColor: 'bg-[#a855f7]',
    strength: 3,
    factionName: 'Phe Dân Làng',
    factionColor: 'text-[#a855f7] bg-[#a855f7]/20 border-[#a855f7]',
    desc: 'Thức dậy mỗi đêm để soi xem một người chơi có phải là Sói hay không. Hãy khéo léo đưa thông tin ra ban ngày mà không để bị lộ diện.',
    iconComponent: Search,
    cardBg: 'from-[#030303] via-[#0a0a0a] to-[#a855f7]/30 border-[#a855f7]/50 shadow-[inset_0_0_20px_rgba(168,85,247,0.2)]',
    nightAction: {
      title: 'Tiên Tri',
      desc: 'Chọn 1 người chơi để soi phe phái thực sự của họ.',
      headerColor: 'border-[#a855f7] shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    },
  },
  BODYGUARD: {
    id: 'BODYGUARD',
    name: 'Bảo Vệ',
    emoji: '🛡️',
    color: 'text-[#84cc16]',
    bgColor: 'bg-[#84cc16]',
    strength: 3,
    factionName: 'Phe Dân Làng',
    factionColor: 'text-[#84cc16] bg-[#84cc16]/20 border-[#84cc16]',
    desc: 'Thức dậy mỗi đêm để bảo vệ một người khỏi bị Sói cắn. Bạn có thể bảo vệ chính mình nhưng không thể bảo vệ cùng một người hai đêm liên tiếp.',
    iconComponent: Shield,
    cardBg: 'from-[#030303] via-[#0a0a0a] to-[#84cc16]/30 border-[#84cc16]/50 shadow-[inset_0_0_20px_rgba(132,204,22,0.2)]',
    nightAction: {
      title: 'Bảo Vệ',
      desc: 'Chọn 1 người chơi để bảo vệ khỏi bị Sói cắn đêm nay.',
      headerColor: 'border-[#84cc16] shadow-[0_0_20px_rgba(132,204,22,0.3)]',
    },
  },
  HUNTER: {
    id: 'HUNTER',
    name: 'Thợ Săn',
    emoji: '🏹',
    color: 'text-[#aa8c55]',
    bgColor: 'bg-[#aa8c55]',
    strength: 2,
    factionName: 'Phe Dân Làng',
    factionColor: 'text-[#aa8c55] bg-[#aa8c55]/20 border-[#aa8c55]',
    desc: 'Có bản năng sinh tồn mạnh mẽ. Khi bị giết bởi Sói hoặc bị dân làng treo cổ, bạn có quyền bắn chết thêm một mục tiêu đáng ngờ khác.',
    iconComponent: Target,
    animateIcon: true,
    cardBg: 'from-[#030303] via-[#0a0a0a] to-[#aa8c55]/30 border-[#aa8c55]/50 shadow-[inset_0_0_20px_rgba(170,140,85,0.2)]',
  },
  WITCH: {
    id: 'WITCH',
    name: 'Phù Thủy',
    emoji: '🧙‍♀️',
    color: 'text-[#be185d]',
    bgColor: 'bg-[#be185d]',
    strength: 3,
    factionName: 'Phe Dân Làng',
    factionColor: 'text-[#be185d] bg-[#be185d]/20 border-[#be185d]',
    desc: 'Sở hữu 2 bình thuốc mạnh mẽ: 1 bình cứu sống người bị Sói cắn và 1 bình độc để tiêu diệt bất kỳ ai bạn muốn.',
    iconComponent: FlaskConical,
    cardBg: 'from-[#030303] via-[#0a0a0a] to-[#be185d]/30 border-[#be185d]/50 shadow-[inset_0_0_20px_rgba(190,24,93,0.2)]',
    nightAction: {
      title: 'Phù Thủy',
      desc: 'Bạn có thể cứu nạn nhân bị Sói cắn (chỉ tự cứu ở Đêm 1) và/hoặc đầu độc 1 người chơi khác.',
      headerColor: 'border-[#be185d] shadow-[0_0_20px_rgba(190,24,93,0.3)]',
    },
  },
  CUPID: {
    id: 'CUPID',
    name: 'Cupid',
    emoji: '💘',
    color: 'text-[#f43f5e]',
    bgColor: 'bg-[#f43f5e]',
    strength: 2,
    factionName: 'Phe Dân Làng',
    factionColor: 'text-[#f43f5e] bg-[#f43f5e]/20 border-[#f43f5e]',
    desc: 'Lựa chọn 2 người chơi để ghép đôi làm tình nhân vào đêm đầu tiên. Nếu một người chết, người kia sẽ tự sát theo.',
    iconComponent: Heart,
    cardBg: 'from-[#030303] via-[#0a0a0a] to-[#f43f5e]/30 border-[#f43f5e]/50 shadow-[inset_0_0_20px_rgba(244,63,94,0.2)]',
  },
  VILLAGER: {
    id: 'VILLAGER',
    name: 'Dân Làng',
    emoji: '🧑',
    color: 'text-[#3b82f6]',
    bgColor: 'bg-[#3b82f6]',
    strength: 1,
    factionName: 'Phe Dân Làng',
    factionColor: 'text-[#3b82f6] bg-[#3b82f6]/20 border-[#3b82f6]',
    desc: 'Không có kỹ năng đặc biệt ban đêm. Vũ khí mạnh nhất của bạn là thảo luận và bỏ phiếu treo cổ những kẻ đáng ngờ vào ban ngày.',
    iconComponent: Users,
    cardBg: 'from-[#030303] via-[#0a0a0a] to-[#3b82f6]/30 border-[#3b82f6]/50 shadow-[inset_0_0_20px_rgba(59,130,246,0.2)]',
  },
  TANNER: {
    id: 'TANNER',
    name: 'Kẻ Chán Đời',
    emoji: '🤡',
    color: 'text-[#ea580c]',
    bgColor: 'bg-[#ea580c]',
    strength: -1,
    factionName: 'Phe Thứ Ba',
    factionColor: 'text-[#ea580c] bg-[#ea580c]/20 border-[#ea580c]',
    desc: 'Không có kỹ năng vào ban đêm. Mục tiêu duy nhất là làm mọi cách để bị nghi ngờ và bị treo cổ vào ban ngày. Nếu bị làng vote treo cổ, bạn lập tức thắng cuộc một mình và ván chơi kết thúc.',
    iconComponent: Skull,
    cardBg: 'from-[#030303] via-[#0a0a0a] to-[#ea580c]/30 border-[#ea580c]/50 shadow-[inset_0_0_20px_rgba(234,88,12,0.2)]',
  },
  ELDER: {
    id: 'ELDER',
    name: 'Già Làng',
    emoji: '🎖️',
    color: 'text-[#aa8c55]',
    bgColor: 'bg-[#aa8c55]',
    strength: 2,
    factionName: 'Phe Dân Làng',
    factionColor: 'text-[#aa8c55] bg-[#aa8c55]/20 border-[#aa8c55]',
    desc: 'Có 2 mạng trước Ma Sói. Nếu bị Làng hại chết (treo cổ, đầu độc, bắn trả), tất cả vai trò đặc biệt khác sẽ bị mất hết kỹ năng.',
    iconComponent: Award,
    cardBg: 'from-[#030303] via-[#0a0a0a] to-[#aa8c55]/30 border-[#aa8c55]/50 shadow-[inset_0_0_20px_rgba(170,140,85,0.2)]',
  },
  CURSED: {
    id: 'CURSED',
    name: 'Kẻ Bị Nguyền Rủa',
    emoji: '💀',
    color: 'text-[#71717a]',
    bgColor: 'bg-[#71717a]',
    strength: -1,
    factionName: 'Phe Dân Làng',
    factionColor: 'text-[#71717a] bg-[#71717a]/20 border-[#71717a]',
    desc: 'Ban đầu là Dân làng. Nếu bị Ma sói cắn trúng mà không có Bảo vệ cứu, sẽ không chết mà lập tức hóa thành Ma sói và về phe Sói.',
    iconComponent: ShieldAlert,
    cardBg: 'from-[#030303] via-[#0a0a0a] to-[#71717a]/30 border-[#71717a]/50 shadow-[inset_0_0_20px_rgba(113,113,122,0.2)]',
  },
  DOPPELGANGER: {
    id: 'DOPPELGANGER',
    name: 'Kẻ Nhân Bản',
    emoji: '👥',
    color: 'text-[#06b6d4]',
    bgColor: 'bg-[#06b6d4]',
    strength: -2,
    factionName: 'Phe Dân Làng',
    factionColor: 'text-[#06b6d4] bg-[#06b6d4]/20 border-[#06b6d4]',
    desc: 'Chỉ thức dậy duy nhất vào đêm đầu tiên để chọn một người chơi làm Bản gốc. Khi Bản gốc chết, bạn kế thừa vai trò và phe của họ.',
    iconComponent: Copy,
    cardBg: 'from-[#030303] via-[#0a0a0a] to-[#06b6d4]/30 border-[#06b6d4]/50 shadow-[inset_0_0_20px_rgba(6,182,212,0.2)]',
    nightAction: {
      title: 'Kẻ Nhân Bản',
      desc: 'Chọn 1 người chơi làm Bản gốc để kế thừa vai trò của họ khi họ chết.',
      headerColor: 'border-[#06b6d4] shadow-[0_0_20px_rgba(6,182,212,0.3)]',
    },
  },
};

export const AVAILABLE_ROLES: RoleMeta[] = [
  ROLE_METADATA.WEREWOLF,
  ROLE_METADATA.SEER,
  ROLE_METADATA.BODYGUARD,
  ROLE_METADATA.HUNTER,
  ROLE_METADATA.WITCH,
  ROLE_METADATA.CUPID,
  ROLE_METADATA.TANNER,
  ROLE_METADATA.ELDER,
  ROLE_METADATA.CURSED,
  ROLE_METADATA.DOPPELGANGER,
  ROLE_METADATA.VILLAGER,
];

export const getRoleName = (role?: Role): string => {
  if (!role) return 'Dân Làng';
  return ROLE_METADATA[role]?.name || 'Dân Làng';
};

export const getRoleEmoji = (role?: Role): string => {
  if (!role) return '🧑';
  return ROLE_METADATA[role]?.emoji || '🧑';
};

export const getRoleMeta = (role?: Role): RoleMeta => {
  if (!role || !ROLE_METADATA[role]) {
    return ROLE_METADATA.VILLAGER;
  }
  return ROLE_METADATA[role];
};

export interface FactionMeta {
  name: string;
  color: string;
  bannerBg: string;
  shadow: string;
}

export const FACTION_METADATA: Record<'WEREWOLF' | 'VILLAGER' | 'THIRD_PARTY', FactionMeta> = {
  WEREWOLF: {
    name: 'Phe Ma Sói',
    color: 'text-[#8a0303] bg-[#8a0303]/20 border-[#8a0303]',
    bannerBg: 'bg-[#0a0a0a] border-[#8a0303]/50 text-[#ffdddd]',
    shadow: 'shadow-[0_0_30px_rgba(138,3,3,0.3)]',
  },
  VILLAGER: {
    name: 'Phe Dân Làng',
    color: 'text-[#3b82f6] bg-[#3b82f6]/20 border-[#3b82f6]',
    bannerBg: 'bg-[#0a0a0a] border-[#3b82f6]/50 text-[#dbeafe]',
    shadow: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]',
  },
  THIRD_PARTY: {
    name: 'Phe Thứ Ba',
    color: 'text-[#a855f7] bg-[#a855f7]/20 border-[#a855f7]',
    bannerBg: 'bg-[#0a0a0a] border-[#a855f7]/50 text-[#f3e8ff]',
    shadow: 'shadow-[0_0_30px_rgba(168,85,247,0.3)]',
  },
};

export const getFactionDisplay = (faction?: 'WEREWOLF' | 'VILLAGER' | 'THIRD_PARTY' | null): FactionMeta => {
  if (!faction || !FACTION_METADATA[faction]) {
    return {
      name: 'Không rõ',
      color: 'text-gray-400 bg-[#0a0a0a] border-white/10',
      bannerBg: 'bg-[#030303] border-white/20 text-gray-300',
      shadow: '',
    };
  }
  return FACTION_METADATA[faction];
};
