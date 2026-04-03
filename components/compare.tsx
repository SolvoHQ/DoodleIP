export function Compare() {
  return (
    <section className="py-20 px-6 max-w-[900px] mx-auto text-center">
      <h2 className="text-3xl md:text-4xl font-black mb-3">
        有 IP 和没 IP，差别有多大？
      </h2>
      <p className="text-lg text-gray-400 mb-12">同样的内容，完全不同的辨识度</p>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
        {/* Before */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold uppercase tracking-widest text-gray-400">
            Before
          </span>
          <div className="aspect-[4/5] max-h-[280px] mx-auto w-full rounded-xl border-[2.5px] border-[#2D2D2D] bg-[#f0f0f0] shadow-[2px_2px_0_#ccc] flex flex-col items-center justify-center p-5 gap-2">
            <span className="text-sm text-gray-400 mb-3">纯文字截图</span>
            <div className="w-4/5 flex flex-col gap-1.5">
              <div className="h-1.5 bg-[#ddd] rounded-full w-full" />
              <div className="h-1.5 bg-[#ddd] rounded-full w-[65%]" />
              <div className="h-1.5 bg-[#ddd] rounded-full w-[80%]" />
              <div className="h-1.5 bg-[#ddd] rounded-full w-[50%]" />
            </div>
            <span className="text-xs text-gray-300 mt-4">刷过就忘</span>
          </div>
        </div>

        {/* Arrow */}
        <div className="text-4xl text-[#FF6B35] md:rotate-0 rotate-90">→</div>

        {/* After */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold uppercase tracking-widest text-[#FF6B35]">
            After
          </span>
          <div className="aspect-[4/5] max-h-[280px] mx-auto w-full rounded-xl border-[2.5px] border-[#2D2D2D] bg-[#FFD93D] shadow-[4px_4px_0_#2D2D2D] flex flex-col items-center justify-center p-5">
            <div className="text-5xl mb-3">(=^.^=)</div>
            <div className="w-4/5 flex flex-col gap-1.5">
              <div className="h-1.5 bg-black/10 rounded-full w-full" />
              <div className="h-1.5 bg-black/10 rounded-full w-[65%]" />
              <div className="h-1.5 bg-black/10 rounded-full w-[80%]" />
            </div>
            <span className="text-xs font-bold mt-4">一眼认出是你</span>
          </div>
        </div>
      </div>
    </section>
  );
}
