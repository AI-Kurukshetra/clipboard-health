"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Building2,
  Calendar,
  FileText,
  ClipboardList,
  Clock,
  MessageSquare,
  Timer,
  Star,
  ChevronDown,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "@/components/auth/logout-button";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Shifts", href: "/shifts", icon: Calendar },
  { label: "Applications", href: "/applications", icon: FileText },
  { label: "Assignments", href: "/assignments", icon: ClipboardList },
  { label: "Availability", href: "/availability", icon: Clock, roles: ["healthcare_worker"] },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Timesheets", href: "/timesheets", icon: Timer },
  { label: "Reviews", href: "/reviews", icon: Star },
];

interface AppSidebarProps {
  email: string;
  role: string;
}

export function AppSidebar({ email, role }: AppSidebarProps) {
  const pathname = usePathname();

  const filteredItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  const initials = email
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  const roleIcon = role === "facility_admin" ? Building2 : User;
  const RoleIcon = roleIcon;

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <span className="text-xs font-bold text-primary-foreground">CH</span>
        </div>
        <span className="text-sm font-semibold">Clipboard Health</span>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-3">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator />

      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-sidebar-accent">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col items-start text-left">
                <span className="truncate text-xs font-medium">{email}</span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <RoleIcon className="h-3 w-3" />
                  {role.replace(/_/g, " ")}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <div className="p-0">
                <LogoutButton />
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
