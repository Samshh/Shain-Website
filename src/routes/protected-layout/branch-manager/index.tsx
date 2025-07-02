import { Outlet, useLocation } from "react-router-dom";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "../../../components/app-sidebar";
import { Separator } from "@/components/ui/separator";

export default function BranchManager() {
  const { pathname } = useLocation();

  let pageTitle = "Dashboard Overview";

  if (pathname === "/admin") pageTitle = "Dashboard";
  else if (pathname.startsWith("/branch-manager/items")) pageTitle = "Items";
  else if (pathname.startsWith("/branch-manager/reports"))
    pageTitle = "Reports";
  else if (pathname.startsWith("/branch-manager/payroll"))
    pageTitle = "Payroll";
  else if (pathname.startsWith("/branch-manager/users")) pageTitle = "Users";

  return (
    <SidebarProvider>
      <AppSidebar roleType={2} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-white z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">
            Branch Manager - {pageTitle}
          </h1>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
