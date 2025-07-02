import type React from "react";
import {
  BarChart3,
  Package,
  LogOut,
  Home,
  CircleDollarSign,
  Users,
  User,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserBranch } from "@/services/user";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function AppSidebar({
  roleType = 1,
  ...props
}: React.ComponentProps<typeof Sidebar> & { roleType?: 1 | 2 }) {
  const [branchName, setBranchName] = useState<string | null>(null);
  const navigate = useNavigate();
  const path = useLocation().pathname;

  const basePath = roleType === 2 ? "/branch-manager" : "/admin";

  const navigationItems = [
    { title: "Dashboard", url: `${basePath}`, icon: Home },
    { title: "Items", url: `${basePath}/items`, icon: Package },
    { title: "Reports", url: `${basePath}/reports`, icon: BarChart3 },
    { title: "Payroll", url: `${basePath}/payroll`, icon: CircleDollarSign },
    { title: "Profile", url: `${basePath}/profile`, icon: User },
  ];

  // Only admins see the Users tab
  if (roleType === 1) {
    navigationItems.push({
      title: "Users",
      url: `${basePath}/users`,
      icon: Users,
    });
  }

  const logout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getUserBranch().then(setBranchName).catch(console.error);
  }, []);

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <img
            src="/dayon_logo.png"
            alt="Dayon Logo"
            className="h-8 w-8 rounded object-cover"
          />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Dayon</span>
            <span className="truncate text-xs">
              {roleType === 2 ? "Branch Manager" : "Admin"}{" "}
              {branchName ? `- ${branchName}` : "Loading branch..."}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    className="w-full"
                    isActive={path === item.url}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  size="sm"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will sign you out of the system. You can log in again
                    anytime.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={logout}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
