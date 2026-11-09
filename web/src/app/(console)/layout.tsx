import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Sidebar />
      <main className="main-content">
        <TopHeader />
        {children}
      </main>
    </div>
  );
}
