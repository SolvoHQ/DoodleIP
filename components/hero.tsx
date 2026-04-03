import { WaitlistForm } from "@/components/waitlist-form";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center bg-[#FFF8F0]">
      {/* Gradient accents */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,107,53,0.08),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(0,210,140,0.08),transparent_50%)]" />

      {/* Doodle decorations */}
      <span className="absolute top-[10%] left-[8%] text-2xl opacity-50 animate-wiggle">~</span>
      <span className="absolute top-[15%] right-[12%] text-2xl opacity-50 animate-wiggle" style={{ animationDelay: "1s" }}>✦</span>
      <span className="absolute bottom-[20%] left-[15%] text-2xl opacity-50 animate-wiggle" style={{ animationDelay: "0.5s" }}>~</span>
      <span className="absolute bottom-[25%] right-[8%] text-2xl opacity-50 animate-wiggle" style={{ animationDelay: "1.5s" }}>✦</span>

      <div className="relative z-10 flex flex-col items-center">
        {/* Badge */}
        <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold text-white bg-[#FF6B35] border-[2.5px] border-[#2D2D2D] rounded-full shadow-[3px_3px_0_#2D2D2D] -rotate-2">
          DoodleIP
        </span>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4">
          不露脸，也能让
          <br />
          别人
          <span className="relative inline-block">
            记住你
            <span className="absolute bottom-0.5 -left-1 -right-1 h-3.5 bg-[#00D28C]/40 -rotate-1 rounded -z-10" />
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-500 max-w-lg mx-auto mb-10 leading-relaxed">
          给内容创作者的专属 IP 生成器。AI 帮你创造一个独一无二的涂鸦角色，从此你的内容有脸、有辨识度、被人记住。
        </p>

        <div className="mb-12">
          <WaitlistForm />
        </div>

        {/* Mockup cards */}
        <div className="flex gap-4 justify-center flex-wrap max-w-[700px]">
          {[
            { bg: "bg-[#FF6B35]", text: "text-white", rotate: "-rotate-3", label: "5个方法提升\n你的内容质量" },
            { bg: "bg-white", text: "text-[#2D2D2D]", rotate: "rotate-1", label: "方法一\n找到你的节奏" },
            { bg: "bg-[#00D28C]", text: "text-white", rotate: "-rotate-1", label: "方法二\n保持一致性" },
            { bg: "bg-[#FFD93D]", text: "text-[#2D2D2D]", rotate: "rotate-2", label: "关注我获取\n更多干货！" },
          ].map((card, i) => (
            <div
              key={i}
              className={`w-[110px] h-[147px] sm:w-[140px] sm:h-[187px] rounded-xl border-[2.5px] border-[#2D2D2D] shadow-[4px_4px_0_#2D2D2D] flex flex-col items-center justify-center p-4 text-center ${card.bg} ${card.text} ${card.rotate}`}
            >
              <div className="text-4xl mb-2">(=^.^=)</div>
              <div className="text-xs font-bold leading-snug whitespace-pre-line">
                {card.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
