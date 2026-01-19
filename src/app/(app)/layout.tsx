import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="container max-w-7xl mx-auto p-4 md:p-6">
            {children}
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
