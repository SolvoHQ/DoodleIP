import Image from "next/image";
import { WaitlistForm } from "@/components/waitlist-form";

const slides = [
  { src: "/images/carousel-1.png", alt: "封面 - 5个方法提升你的内容质量" },
  { src: "/images/carousel-2.png", alt: "方法一 - 找到你的节奏" },
  { src: "/images/carousel-3.png", alt: "方法二 - 保持一致性" },
  { src: "/images/carousel-4.png", alt: "关注我获取更多干货" },
];

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

        {/* Real carousel mockup */}
        <div className="flex gap-3 sm:gap-4 justify-center flex-wrap max-w-[800px]">
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`w-[130px] sm:w-[160px] rounded-xl border-[2.5px] border-[#2D2D2D] shadow-[4px_4px_0_#2D2D2D] overflow-hidden ${
                ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"][i]
              }`}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                width={160}
                height={200}
                className="w-full h-auto"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
