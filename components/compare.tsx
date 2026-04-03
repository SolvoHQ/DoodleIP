import Image from "next/image";

export function Compare() {
  return (
    <section className="py-20 px-6 max-w-[900px] mx-auto text-center">
      <h2 className="text-3xl md:text-4xl font-black mb-3">
        有 IP 和没 IP，差别有多大？
      </h2>
      <p className="text-lg text-gray-400 mb-12">同样的内容，完全不同的辨识度</p>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-10 items-center">
        {/* Before */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold uppercase tracking-widest text-gray-400">
            Before
          </span>
          <div className="rounded-xl border-[2.5px] border-[#2D2D2D] shadow-[2px_2px_0_#ccc] overflow-hidden">
            <Image
              src="/images/before-post.png"
              alt="纯文字帖子 - 没有辨识度"
              width={400}
              height={500}
              className="w-full h-auto"
            />
          </div>
          <span className="text-xs text-gray-400">刷过就忘 😴</span>
        </div>

        {/* Arrow */}
        <div className="text-4xl text-[#FF6B35] md:rotate-0 rotate-90">→</div>

        {/* After */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold uppercase tracking-widest text-[#FF6B35]">
            After
          </span>
          <div className="rounded-xl border-[2.5px] border-[#2D2D2D] shadow-[4px_4px_0_#2D2D2D] overflow-hidden">
            <Image
              src="/images/carousel-1.png"
              alt="带 IP 角色的轮播图 - 一眼认出"
              width={400}
              height={500}
              className="w-full h-auto"
            />
          </div>
          <span className="text-xs font-bold text-[#FF6B35]">一眼认出是你 🔥</span>
        </div>
      </div>
    </section>
  );
}
