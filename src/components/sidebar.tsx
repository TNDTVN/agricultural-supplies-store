"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  ChevronDown,
  FileCheck,
  Home,
  Key,
  Layers,
  Search,
  ShoppingCart,
  Truck,
  User2Icon,
  UserCheck,
  Users,
  Users2,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const allItems = [
  { title: "Home", url: "/admin", icon: Home, roles: ["ADMIN", "EMPLOYEE"] },
  { title: "Account", url: "/admin/account", icon: Users2, roles: ["ADMIN"] },
  { title: "Product", url: "/admin/product", icon: Search, roles: ["ADMIN", "EMPLOYEE"] },
  { title: "Category", url: "#", icon: Layers, roles: ["ADMIN", "EMPLOYEE"] },
  { title: "Supplier", url: "#", icon: Truck, roles: ["ADMIN", "EMPLOYEE"] },
  { title: "Employee", url: "#", icon: Users, roles: ["ADMIN"] },
  { title: "Customer", url: "#", icon: UserCheck, roles: ["ADMIN", "EMPLOYEE"] },
  { title: "Order", url: "#", icon: ShoppingCart, roles: ["ADMIN", "EMPLOYEE"] },
  { title: "Approved Invoice", url: "#", icon: FileCheck, roles: ["ADMIN", "EMPLOYEE"] },
  { title: "Statistics", url: "#", icon: BarChart3, roles: ["ADMIN", "EMPLOYEE"] },
  {
    title: "User Account",
    url: "#",
    icon: User2Icon,
    roles: ["ADMIN", "EMPLOYEE"],
    subItems: [
      { title: "Change Password", url: "#", icon: Key },
      { title: "Edit Account Info", url: "#", icon: User2Icon },
    ],
  },
];

export function AppSidebar() {
  const [role, setRole] = useState<string | null>(null);
  const [isUserAccountOpen, setIsUserAccountOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const userRole = sessionStorage.getItem("role");
    const currentUsername = sessionStorage.getItem("username");
    const accountID = sessionStorage.getItem("accountID");

    setRole(userRole);
    setUsername(currentUsername || "Người dùng");

    if (accountID) {
      fetch(`http://localhost:8080/accounts/${accountID}`)
        .then((res) => res.json())
        .then((data) => {
          setUsername(data.username || "Người dùng");
          setProfileImage(data.profileImage ? `http://localhost:8080/images/${data.profileImage}` : null);
        })
        .catch((err) => {
          console.error("Lỗi khi lấy thông tin tài khoản:", err);
          setProfileImage(null);
        });
    }
  }, []);

  const items = allItems.filter((item) => item.roles.includes(role || ""));

  const handleUserAccountClick = (e: React.MouseEvent, item: typeof allItems[0]) => {
    if (item.title === "User Account") {
      e.preventDefault();
      setIsUserAccountOpen(!isUserAccountOpen);
    }
  };

  return (
    <Sidebar className="bg-green-500 text-black min-h-screen">
      <SidebarHeader className="p-4 bg-green-500 border-b border-green-300">
        <div className="flex items-center gap-2">
          {profileImage ? (
            <Image
              src={profileImage}
              alt="Profile Image"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <User2Icon className="w-10 h-10 text-black" />
          )}
          <div>
            <p className="text-lg font-semibold text-black">Xin chào</p>
            <p className="text-sm text-black">{username}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-green-500">
        <SidebarGroup>
          <SidebarGroupLabel className="text-black"></SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      onClick={(e) => handleUserAccountClick(e, item)}
                      className="flex items-center justify-between w-full p-2 text-black"
                    >
                      <span className="flex items-center">
                        <item.icon className="mr-2 h-5 w-5" />
                        <span>{item.title}</span>
                      </span>
                      {item.subItems && (
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            item.title === "User Account" && isUserAccountOpen ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </a>
                  </SidebarMenuButton>
                  {item.subItems && item.title === "User Account" && isUserAccountOpen && (
                    <SidebarMenuSub className="bg-green-500">
                      {item.subItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuButton asChild>
                            <a
                              href={subItem.url}
                              className="flex items-center p-2 text-black"
                            >
                              <subItem.icon className="mr-2 h-5 w-5" />
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}