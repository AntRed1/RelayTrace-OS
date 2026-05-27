import { SidebarProvider } from "@/contexts/sidebar.context";
import { AdminShell }      from "@/components/layouts/AdminShell";

export default function DispatcherLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminShell>{children}</AdminShell>
    </SidebarProvider>
  );
}
