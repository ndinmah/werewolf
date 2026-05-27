import React from 'react';
import { Moon } from 'lucide-react';
import type { NightStatus } from '../../../types/game';
import { ModalOverlay } from '../../UI/ModalOverlay';

interface NightSleepScreenProps {
  nightStatus: NightStatus | null;
}

export const NightSleepScreen: React.FC<NightSleepScreenProps> = ({ nightStatus }) => {
  return (
    <ModalOverlay opacity="normal" starsOpacity="heavy" className="text-center flex-col">
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
    </ModalOverlay>
  );
};
