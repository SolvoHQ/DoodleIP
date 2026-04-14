export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fbf7ef]">
      <header className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <a href="/app" className="text-xl font-black">DoodleIP</a>
      </header>
      <main>{children}</main>
    </div>
  );
}
