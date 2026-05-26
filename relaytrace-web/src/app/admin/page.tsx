import { redirect } from "next/navigation";
import { ROUTES } from "@/config/constants";
export default function AdminPage() {
  redirect(ROUTES.ADMIN.DASHBOARD);
}
