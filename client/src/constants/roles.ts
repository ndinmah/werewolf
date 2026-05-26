import React from 'react';
import { Eye, Shield, Search, Users, Target, FlaskConical, Heart } from 'lucide-react';
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
  iconComponent: React.ComponentType<{ className?: string }>;
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
    color: 'text-red-400',
    bgColor: 'bg-red-600',
    strength: -2,
    factionName: 'Phe Ma Sói',
    factionColor: 'text-red-400 bg-red-950/60 border-red-800',
    desc: 'Thức dậy vào ban đêm để chọn một nạn nhân. Cố gắng ẩn mình giả làm người lành vào ban ngày để tiêu diệt dân làng.',
    iconComponent: Eye,
    animateIcon: true,
    cardBg: 'from-slate-900 via-zinc-950 to-red-950/50 border-red-900/50 shadow-[0_0_40px_rgba(220,38,38,0.2)]',
    nightAction: {
      title: 'Phe Ma Sói',
      desc: 'Thảo luận với bầy đàn của bạn và chọn 1 nạn nhân để giết đêm nay.',
      headerColor: 'border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)]',
    },
  },
  SEER: {
    id: 'SEER',
    name: 'Tiên Tri',
    emoji: '🔮',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500',
    strength: 3,
    factionName: 'Phe Dân Làng',
    factionColor: 'text-purple-400 bg-purple-950/60 border-purple-800',
    desc: 'Thức dậy mỗi đêm để soi xem một người chơi có phải là Sói hay không. Hãy khéo léo đưa thông tin ra ban ngày mà không để bị lộ diện.',
    iconComponent: Search,
    cardBg: 'from-slate-900 via-zinc-950 to-purple-950/50 border-purple-900/50 shadow-[0_0_40px_rgba(147,51,234,0.2)]',
    nightAction: {
      title: 'Tiên Tri',
      desc: 'Chọn 1 người chơi để soi phe phái thực sự của họ.',
      headerColor: 'border-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.2)]',
    },
  },
  BODYGUARD: {
    id: 'BODYGUARD',
    name: 'Bảo Vệ',
    emoji: '🛡️',
    color: 'text-green-400',
    bgColor: 'bg-green-600',
    strength: 3,
    factionName: 'Phe Dân Làng',
    factionColor: 'text-green-400 bg-green-950/60 border-green-800',
    desc: 'Thức dậy mỗi đêm để bảo vệ một người khỏi bị Sói cắn. Bạn có thể bảo vệ chính mình nhưng không thể bảo vệ cùng một người hai đêm liên tiếp.',
    iconComponent: Shield,
    cardBg: 'from-slate-900 via-zinc-950 to-green-950/50 border-green-900/50 shadow-[0_0_40px_rgba(22,163,74,0.2)]',
    nightAction: {
      title: 'Bảo Vệ',
      desc: 'Chọn 1 người chơi để bảo vệ khỏi bị Sói cắn đêm nay.',
      headerColor: 'border-green-600 shadow-[0_0_20px_rgba(22,163,74,0.2)]',
    },
  },
  HUNTER: {
    id: 'HUNTER',
    name: 'Thợ Săn',
    emoji: '🏹',
    color: 'text-amber-400',
    bgColor: 'bg-amber-600',
    strength: 2,
    factionName: 'Phe Dân Làng',
    factionColor: 'text-amber-500 bg-amber-950/60 border-amber-800',
    desc: 'Có bản năng sinh tồn mạnh mẽ. Khi bị giết bởi Sói hoặc bị dân làng treo cổ, bạn có quyền bắn chết thêm một mục tiêu đáng ngờ khác.',
    iconComponent: Target,
    animateIcon: true,
    cardBg: 'from-slate-900 via-zinc-950 to-amber-950/50 border-amber-900/50 shadow-[0_0_40px_rgba(245,158,11,0.2)]',
  },
  WITCH: {
    id: 'WITCH',
    name: 'Phù Thủy',
    emoji: '🧙‍♀️',
    color: 'text-pink-400',
    bgColor: 'bg-pink-650',
    strength: 3,
    factionName: 'Phe Dân Làng',
    factionColor: 'text-pink-400 bg-pink-950/60 border-pink-800',
    desc: 'Sở hữu 2 bình thuốc mạnh mẽ: 1 bình cứu sống người bị Sói cắn và 1 bình độc để tiêu diệt bất kỳ ai bạn muốn.',
    iconComponent: FlaskConical,
    cardBg: 'from-slate-900 via-zinc-950 to-pink-950/50 border-pink-900/50 shadow-[0_0_40px_rgba(244,114,182,0.2)]',
    nightAction: {
      title: 'Phù Thủy',
      desc: 'Bạn có thể cứu nạn nhân bị Sói cắn (chỉ tự cứu ở Đêm 1) và/hoặc đầu độc 1 người chơi khác.',
      headerColor: 'border-pink-600 shadow-[0_0_20px_rgba(236,72,153,0.2)]',
    },
  },
  CUPID: {
    id: 'CUPID',
    name: 'Cupid',
    emoji: '💘',
    color: 'text-rose-300',
    bgColor: 'bg-rose-500',
    strength: 2,
    factionName: 'Phe Dân Làng',
    factionColor: 'text-rose-400 bg-rose-950/60 border-rose-800',
    desc: 'Lựa chọn 2 người chơi để ghép đôi làm tình nhân vào đêm đầu tiên. Nếu một người chết, người kia sẽ tự sát theo.',
    iconComponent: Heart,
    cardBg: 'from-slate-900 via-zinc-950 to-rose-950/50 border-rose-900/50 shadow-[0_0_40px_rgba(251,113,133,0.2)]',
  },
  VILLAGER: {
    id: 'VILLAGER',
    name: 'Dân Làng',
    emoji: '🧑',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500',
    strength: 1,
    factionName: 'Phe Dân Làng',
    factionColor: 'text-blue-400 bg-blue-950/60 border-blue-800',
    desc: 'Không có kỹ năng đặc biệt ban đêm. Vũ khí mạnh nhất của bạn là thảo luận và bỏ phiếu treo cổ những kẻ đáng ngờ vào ban ngày.',
    iconComponent: Users,
    cardBg: 'from-slate-900 via-zinc-950 to-blue-950/50 border-blue-900/50 shadow-[0_0_40px_rgba(59,130,246,0.2)]',
  },
  DOCTOR: {
    id: 'DOCTOR',
    name: 'Bác Sĩ',
    emoji: '🩺',
    color: 'text-teal-400',
    bgColor: 'bg-teal-600',
    strength: 2,
    factionName: 'Phe Dân Làng',
    factionColor: 'text-teal-400 bg-teal-950/60 border-teal-800',
    desc: 'Thức dậy mỗi đêm để chọn một người để cứu chữa.',
    iconComponent: Shield,
    cardBg: 'from-slate-900 via-zinc-950 to-teal-950/50 border-teal-900/50 shadow-[0_0_40px_rgba(20,184,166,0.2)]',
    nightAction: {
      title: 'Bác Sĩ',
      desc: 'Chọn 1 người chơi để cứu chữa đêm nay.',
      headerColor: 'border-teal-600 shadow-[0_0_20px_rgba(20,184,166,0.2)]',
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
    color: 'text-red-400 bg-red-950/60 border-red-800',
    bannerBg: 'bg-red-950/80 border-red-500/30 text-red-100',
    shadow: 'shadow-[0_0_50px_rgba(220,38,38,0.15)]',
  },
  VILLAGER: {
    name: 'Phe Dân Làng',
    color: 'text-green-400 bg-green-950/60 border-green-800',
    bannerBg: 'bg-green-950/80 border-green-500/30 text-green-100',
    shadow: 'shadow-[0_0_50px_rgba(34,197,94,0.15)]',
  },
  THIRD_PARTY: {
    name: 'Phe Thứ Ba',
    color: 'text-purple-400 bg-purple-950/60 border-purple-800',
    bannerBg: 'bg-purple-950/80 border-purple-500/30 text-purple-100',
    shadow: 'shadow-[0_0_50px_rgba(168,85,247,0.15)]',
  },
};

export const getFactionDisplay = (faction?: string | null): FactionMeta => {
  if (!faction || !FACTION_METADATA[faction as keyof typeof FACTION_METADATA]) {
    return {
      name: 'Không rõ',
      color: 'text-gray-400 bg-gray-900 border-gray-800',
      bannerBg: 'bg-gray-900 border-gray-800 text-gray-400',
      shadow: '',
    };
  }
  return FACTION_METADATA[faction as keyof typeof FACTION_METADATA];
};
