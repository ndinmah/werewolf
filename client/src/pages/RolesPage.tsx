import { AVAILABLE_ROLES } from '../constants/roles';
import { S } from '../constants/strings';

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
          {S.rolesPage.bgWatermark}
        </h1>
      </div>

      <div className="container mx-auto max-w-6xl px-6 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-16 space-y-4 text-center">
          <div className="inline-block border-b border-[#8a0303] pb-2 mb-2">
            <span className="text-[#aa8c55] tracking-[0.3em] uppercase text-sm font-light">{S.rolesPage.tagline}</span>
          </div>
          <h1 className="text-5xl md:text-6xl text-white font-['Cinzel_Decorative',serif] drop-shadow-[0_0_15px_rgba(138,3,3,0.5)]">
            {S.rolesPage.title}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl italic mt-6 leading-relaxed border-l-2 border-r-2 border-[#8a0303] px-6 py-2">
            {S.rolesPage.quote}
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {AVAILABLE_ROLES.map((role) => (
            <div
              key={role.id}
              className="group relative bg-[#0a0a0a] border border-white/10 p-5 overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(138,3,3,0.4)] flex flex-col h-[420px] rounded-sm cursor-pointer"
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-50 group-hover:opacity-90 mix-blend-luminosity group-hover:mix-blend-normal"
                style={{ backgroundImage: `url(${role.image})` }}
              ></div>
              
              {/* Dark overlay for readability */}
              <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent opacity-90"></div>
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500"></div>

              {/* Edge highlights */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-[#8a0303] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10"></div>
              <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#aa8c55] to-transparent opacity-50 z-10"></div>
              <div className="absolute inset-0 bg-linear-to-b from-[#8a0303]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"></div>

              {/* Content Container (pushed to bottom) */}
              <div className="relative z-10 mt-auto flex flex-col justify-end">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-none border border-[#aa8c55]/50 bg-black/60 backdrop-blur-md flex items-center justify-center group-hover:border-[#8a0303] transition-colors duration-500 shadow-[0_0_15px_rgba(0,0,0,0.8)] shrink-0">
                    {(() => {
                      const Icon = role.iconComponent;
                      return (
                        <Icon
                          className="w-7 h-7 text-[#aa8c55] group-hover:text-[#ffdddd] group-hover:scale-110 transition-all duration-500"
                          strokeWidth={1.5}
                        />
                      );
                    })()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-['Cinzel_Decorative',serif] text-white tracking-wider group-hover:text-red-400 transition-colors duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                      {role.name}
                    </h3>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-[#aa8c55] font-sans font-bold drop-shadow-md block mt-1">
                      {role.factionName}
                    </span>
                  </div>
                </div>

                <div className="overflow-hidden h-[0px] group-hover:h-[80px] transition-all duration-500 ease-in-out opacity-0 group-hover:opacity-100 mb-0 group-hover:mb-4">
                  <p className="text-gray-300 text-sm leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,1)] font-medium">
                    {role.desc}
                  </p>
                </div>

                <div className="flex justify-between items-center text-xs font-sans tracking-widest px-4 py-2 border border-white/20 bg-black/80 backdrop-blur-sm group-hover:border-[#aa8c55]/50 transition-colors duration-300">
                  <span className="text-gray-400 uppercase">{S.rolesPage.balanceLabel}</span>
                  <span className={`font-bold text-sm ${role.strength > 0 ? 'text-[#aa8c55]' : 'text-[#8a0303]'}`}>
                    {role.strength > 0 ? `+${role.strength}` : role.strength}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
