"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, Inbox, Search, Settings, User2Icon } from "lucide-react";
import { useEffect, useState } from "react";

const allItems = [
  {
    title: "Home",
    url: "#",
    icon: Home,
    roles: ["ADMIN", "EMPLOYEE"],
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
    roles: ["ADMIN", "EMPLOYEE"],
  },
  {
    title: "Account",
    url: "/admin/account",
    icon: User2Icon,
    roles: ["ADMIN"],
  },
  {
    title: "Product",
    url: "/admin/product",
    icon: Search,
    roles: ["ADMIN", "EMPLOYEE"],
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
    roles: ["ADMIN", "EMPLOYEE"],
  },
];

export function AppSidebar() {
  const [role, setRole] = useState<string | null>(null);

  // Lấy role từ sessionStorage khi component mount
  useEffect(() => {
    const userRole = sessionStorage.getItem("role");
    setRole(userRole);
  }, []);

  // Lọc các mục sidebar dựa trên role
  const items = allItems.filter((item) =>
    item.roles.includes(role || "")
  );

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}