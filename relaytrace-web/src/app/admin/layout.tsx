import { SidebarProvider } from "@/contexts/sidebar.context";
import { AdminShell }      from "@/components/layouts/AdminShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminShell>{children}</AdminShell>
    </SidebarProvider>
  );
}
