const styles = [
  {
    name: "简笔画",
    desc: "极简线条，一眼记住",
    bg: "bg-white",
    border: "border-[#2D2D2D]",
    shadow: "shadow-[4px_4px_0_#2D2D2D]",
    visual: (
      <svg viewBox="0 0 80 80" className="w-16 h-16 mb-3">
        <circle cx="40" cy="30" r="18" fill="none" stroke="#2D2D2D" strokeWidth="3.5" />
        <circle cx="34" cy="27" r="2.5" fill="#2D2D2D" />
        <circle cx="46" cy="27" r="2.5" fill="#2D2D2D" />
        <path d="M35 35 Q40 40 45 35" fill="none" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="40" y1="48" x2="40" y2="65" stroke="#2D2D2D" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="40" y1="55" x2="30" y2="50" stroke="#2D2D2D" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="40" y1="55" x2="50" y2="50" stroke="#2D2D2D" strokeWidth="3.5" strokeLinecap="round" />
        <polygon points="38,46 42,46 40,42" fill="#FF3B30" />
      </svg>
    ),
  },
  {
    name: "像素风",
    desc: "复古游戏，8-bit 怀旧",
    bg: "bg-[#1a1a2e]",
    border: "border-[#1a1a2e]",
    shadow: "shadow-[4px_4px_0_#0d0d1a]",
    textColor: "text-white",
    visual: (
      <div className="grid grid-cols-5 gap-0.5 mb-3 w-16 h-16 items-center justify-items-center">
        {[
          0,0,1,0,0,
          0,1,1,1,0,
          1,2,1,2,1,
          0,1,1,1,0,
          0,0,1,0,0,
        ].map((v, i) => (
          <div key={i} className={`w-3 h-3 rounded-[1px] ${v === 2 ? "bg-cyan-400" : v === 1 ? "bg-green-400" : "bg-transparent"}`} />
        ))}
      </div>
    ),
  },
  {
    name: "扁平插画",
    desc: "几何形状，现代简洁",
    bg: "bg-[#E8F5E9]",
    border: "border-[#2D2D2D]",
    shadow: "shadow-[4px_4px_0_#2D2D2D]",
    visual: (
      <svg viewBox="0 0 80 80" className="w-16 h-16 mb-3">
        <circle cx="40" cy="30" r="20" fill="#FF6B35" />
        <circle cx="34" cy="27" r="3" fill="white" />
        <circle cx="46" cy="27" r="3" fill="white" />
        <rect x="35" y="50" width="10" height="20" rx="3" fill="#FF6B35" />
        <rect x="26" y="52" width="8" height="4" rx="2" fill="#FF6B35" />
        <rect x="46" y="52" width="8" height="4" rx="2" fill="#FF6B35" />
      </svg>
    ),
  },
  {
    name: "水彩手绘",
    desc: "柔和温暖，文艺气质",
    bg: "bg-[#FFF0F5]",
    border: "border-[#e8b4c8]",
    shadow: "shadow-[4px_4px_0_#e8b4c8]",
    visual: (
      <svg viewBox="0 0 80 80" className="w-16 h-16 mb-3">
        <circle cx="40" cy="35" r="22" fill="#f8c8dc" opacity="0.7" />
        <circle cx="35" cy="38" r="18" fill="#c8e8f8" opacity="0.5" />
        <circle cx="45" cy="38" r="16" fill="#f8e0c8" opacity="0.5" />
        <circle cx="36" cy="32" r="2" fill="#666" />
        <circle cx="46" cy="32" r="2" fill="#666" />
        <path d="M38 38 Q41 42 44 38" fill="none" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "潮玩 3D",
    desc: "泡泡玛特风，超级可爱",
    bg: "bg-gradient-to-br from-[#a78bfa] to-[#818cf8]",
    border: "border-[#6d5dca]",
    shadow: "shadow-[4px_4px_0_#5145a8]",
    textColor: "text-white",
    visual: (
      <svg viewBox="0 0 80 80" className="w-16 h-16 mb-3">
        <ellipse cx="40" cy="38" rx="24" ry="26" fill="white" opacity="0.9" />
        <ellipse cx="40" cy="38" rx="22" ry="24" fill="white" />
        <circle cx="33" cy="35" r="5" fill="#1a1a2e" />
        <circle cx="47" cy="35" r="5" fill="#1a1a2e" />
        <circle cx="35" cy="33" r="2" fill="white" />
        <circle cx="49" cy="33" r="2" fill="white" />
        <ellipse cx="28" cy="42" rx="4" ry="3" fill="#ffb3c1" opacity="0.6" />
        <ellipse cx="52" cy="42" rx="4" ry="3" fill="#ffb3c1" opacity="0.6" />
        <path d="M37 43 Q40 46 43 43" fill="none" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "漫画线稿",
    desc: "二次元风，活泼动感",
    bg: "bg-white",
    border: "border-[#2D2D2D]",
    shadow: "shadow-[4px_4px_0_#2D2D2D]",
    visual: (
      <svg viewBox="0 0 80 80" className="w-16 h-16 mb-3">
        <path d="M25 45 Q25 15 40 15 Q55 15 55 45" fill="none" stroke="#2D2D2D" strokeWidth="2.5" />
        <circle cx="34" cy="38" r="6" fill="white" stroke="#2D2D2D" strokeWidth="2" />
        <circle cx="46" cy="38" r="6" fill="white" stroke="#2D2D2D" strokeWidth="2" />
        <circle cx="35" cy="37" r="3" fill="#2D2D2D" />
        <circle cx="47" cy="37" r="3" fill="#2D2D2D" />
        <circle cx="36" cy="36" r="1" fill="white" />
        <circle cx="48" cy="36" r="1" fill="white" />
        <path d="M38 46 Q40 48 42 46" fill="none" stroke="#2D2D2D" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M22 30 L28 33" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
        <path d="M58 30 L52 33" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
        <path d="M30 50 Q40 58 50 50" fill="none" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function Gallery() {
  return (
    <section className="py-20 px-6 bg-[#FFF8F0]">
      <h2 className="text-3xl md:text-4xl font-black text-center mb-3">
        选择你喜欢的风格
      </h2>
      <p className="text-lg text-gray-400 text-center mb-12">
        AI 可以生成各种风格的 IP 角色
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 max-w-[900px] mx-auto">
        {styles.map((style) => (
          <div
            key={style.name}
            className={`${style.bg} ${style.textColor || "text-[#2D2D2D]"} border-[2.5px] ${style.border} ${style.shadow} rounded-2xl p-4 flex flex-col items-center text-center transition-transform hover:-translate-y-1 hover:scale-105`}
          >
            {style.visual}
            <h3 className="text-sm font-black mb-1">{style.name}</h3>
            <p className={`text-xs ${style.textColor ? "opacity-70" : "text-gray-400"} leading-snug`}>
              {style.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
