import { Sidebar } from "@/components/layouts/Sidebar";

export default function DispatcherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-60 flex flex-col min-h-screen overflow-hidden">
        {children}
      </div>
    </div>
  );
}
