const steps = [
  {
    number: 1,
    icon: "💬",
    title: "描述你的角色",
    desc: '"一只戴墨镜的猫"\n"圆脑袋火柴人围红围巾"\n用文字就够了',
  },
  {
    number: 2,
    icon: "✨",
    title: "AI 生成专属 IP",
    desc: "多个候选方案，\n选一个你最喜欢的，\n自动生成全套姿势",
  },
  {
    number: 3,
    icon: "📱",
    title: "一键生成轮播图",
    desc: "输入文字内容，\n自动排版成小红书轮播图，\n下载直接发",
  },
];

export function Steps() {
  return (
    <section className="py-20 px-6 bg-[radial-gradient(circle_at_80%_20%,rgba(255,217,61,0.15),transparent_50%),#FFF8F0]">
      <h2 className="text-3xl md:text-4xl font-black text-center mb-3">
        三步拥有你的专属 IP
      </h2>
      <p className="text-lg text-gray-400 text-center mb-12">不会画画也没关系</p>

      <div className="flex gap-8 max-w-[900px] mx-auto justify-center flex-wrap">
        {steps.map((step) => (
          <div
            key={step.number}
            className="relative flex-1 min-w-[220px] max-w-[280px] bg-white border-[2.5px] border-[#2D2D2D] rounded-2xl p-8 pt-10 text-center shadow-[4px_4px_0_#2D2D2D]"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#FF6B35] text-white rounded-full flex items-center justify-center font-black text-sm border-[2.5px] border-[#2D2D2D]">
              {step.number}
            </div>
            <div className="text-5xl mb-4">{step.icon}</div>
            <h3 className="text-lg font-black mb-2">{step.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
