import { Hero } from "@/components/hero";
import { Gallery } from "@/components/gallery";
import { Compare } from "@/components/compare";
import { Steps } from "@/components/steps";
import { WaitlistForm } from "@/components/waitlist-form";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Gallery />
      <Compare />
      <Steps />

      {/* Bottom CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-black mb-3">首批用户免费体验</h2>
        <p className="text-gray-500 mb-8 text-lg">
          留下邮箱，产品上线第一时间通知你
        </p>
        <div className="flex justify-center">
          <WaitlistForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
