import { AVAILABLE_ROLES } from '../constants/roles';

export const RolesPage = () => {
  return (
    <div className="min-h-screen bg-[#030303] text-[#e2e8f0] relative overflow-hidden font-['Cormorant_Garamond',serif] pt-28 pb-12">
      
      {/* Dark magical background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#8a0303] rounded-full blur-[150px] opacity-10 mix-blend-screen animate-pulse duration-10000"></div>
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[#1a0000] rounded-full blur-[120px] opacity-30 mix-blend-screen"></div>
      </div>

      {/* Giant Typography Background */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-5 z-0 select-none">
        <h1 className="text-[15vw] leading-none font-black text-transparent bg-clip-text bg-linear-to-b from-white to-transparent tracking-widest font-['Cinzel_Decorative',serif]">
          GRIMOIRE
        </h1>
      </div>

      <div className="container mx-auto max-w-6xl px-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-16 space-y-4 text-center">
          <div className="inline-block border-b border-[#8a0303] pb-2 mb-2">
            <span className="text-[#aa8c55] tracking-[0.3em] uppercase text-sm font-light">
              The Book of Souls
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl text-white font-['Cinzel_Decorative',serif] drop-shadow-[0_0_15px_rgba(138,3,3,0.5)]">
            Thư Viện Vai Trò
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl italic mt-6 leading-relaxed border-l-2 border-r-2 border-[#8a0303] px-6 py-2">
            "Khám phá những bản ngã ẩn giấu trong màn đêm. Kẻ là Sói, người là Cừu."
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {AVAILABLE_ROLES.map(role => (
            <div 
              key={role.id} 
              className="group relative bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 p-6 overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(138,3,3,0.15)] flex flex-col h-full"
            >
              {/* Edge highlights */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-[#8a0303] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#aa8c55] to-transparent opacity-30"></div>
              <div className="absolute inset-0 bg-linear-to-b from-[#8a0303]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              <div className="flex items-center gap-5 mb-6 relative z-10">
                <div className="w-14 h-14 rounded-none border border-[#aa8c55]/30 bg-[#030303] flex items-center justify-center group-hover:border-[#8a0303] transition-colors duration-500 shadow-[inset_0_0_10px_rgba(0,0,0,1)]">
                  {(() => {
                    const Icon = role.iconComponent;
                    return <Icon className="w-7 h-7 text-[#aa8c55] group-hover:text-[#ffdddd] group-hover:scale-110 transition-all duration-500" strokeWidth={1.5} />;
                  })()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-['Cinzel_Decorative',serif] text-white tracking-wider group-hover:text-[#8a0303] transition-colors duration-300">
                    {role.name}
                  </h3>
                  <span className="text-xs tracking-[0.2em] uppercase text-[#aa8c55]/80 font-sans">
                    {role.factionName}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-300 text-lg leading-relaxed mb-6 grow relative z-10 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                {role.desc}
              </p>
              
              <div className="flex justify-between items-center text-sm font-sans tracking-widest px-4 py-3 border border-white/10 bg-black/50 relative z-10 group-hover:border-[#aa8c55]/30 transition-colors duration-300">
                <span className="text-gray-500 uppercase text-xs">Cân bằng:</span>
                <span className={`font-bold ${role.strength > 0 ? 'text-[#aa8c55]' : 'text-[#8a0303]'}`}>
                  {role.strength > 0 ? `+${role.strength}` : role.strength}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
