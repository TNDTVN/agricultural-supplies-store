"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Bell,
  ChevronDown,
  Eye,
  EyeOff,
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
  Users2
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const allItems = [
  { title: "Home", url: "/admin", icon: Home, roles: ["ADMIN", "EMPLOYEE"] },
  { title: "Account", url: "/admin/account", icon: Users2, roles: ["ADMIN"] },
  { title: "Product", url: "/admin/product", icon: Search, roles: ["ADMIN", "EMPLOYEE"] },
  { title: "Category", url: "/admin/category", icon: Layers, roles: ["ADMIN", "EMPLOYEE"] },
  { title: "Supplier", url: "/admin/supplier", icon: Truck, roles: ["ADMIN", "EMPLOYEE"] },
  { title: "Employee", url: "/admin/employee", icon: Users, roles: ["ADMIN"] },
  { title: "Customer", url: "/admin/customer", icon: UserCheck, roles: ["ADMIN", "EMPLOYEE"] },
  { title: "Order", url: "/admin/orders", icon: ShoppingCart, roles: ["ADMIN", "EMPLOYEE"] },
  { title: "Approved Invoice", url: "/admin/approvedinvoice", icon: FileCheck, roles: ["ADMIN", "EMPLOYEE"] },
  { title: "Statistics", url: "/admin/statistics", icon: BarChart3, roles: ["ADMIN", "EMPLOYEE"] },
  { title: "Notifications", url: "/admin/notifications", icon: Bell, roles: ["ADMIN", "EMPLOYEE"] },
  {
    title: "User Account",
    url: "#",
    icon: User2Icon,
    roles: ["ADMIN", "EMPLOYEE"],
    subItems: [
      { title: "Change Password", url: "#", icon: Key },
      { title: "Edit Account Info", url: "/admin/profile", icon: User2Icon },
    ],
  },
];

export function AppSidebar() {
  const [role, setRole] = useState<string | null>(null);
  const [isUserAccountOpen, setIsUserAccountOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const resetFormAndError = () => {
    setError("");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }
    try {
      const accountID = sessionStorage.getItem("accountID");
      const response = await fetch("http://localhost:8080/accounts/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountID, oldPassword, newPassword }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Đổi mật khẩu thất bại!");
      }

      alert("Đổi mật khẩu thành công!");
      setIsChangePasswordModalOpen(false);
      resetFormAndError();
    } catch (err: any) {
      setError(err.message);
    }
  };

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
                              onClick={(e) => {
                                if (subItem.title === "Change Password") {
                                  e.preventDefault();
                                  setIsChangePasswordModalOpen(true);
                                  resetFormAndError();
                                }
                              }}
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

      {/* Modal Đổi Mật Khẩu */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Đổi Mật Khẩu</h2>
            <form onSubmit={handleChangePassword}>
              <div className="mb-4 relative">
                <Input
                  type={showOldPassword ? "text" : "password"}
                  placeholder="Mật khẩu cũ"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowOldPassword((prev) => !prev)}
                >
                  {showOldPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                </button>
              </div>
              <div className="mb-4 relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                </button>
              </div>
              <div className="mb-4 relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                </button>
              </div>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsChangePasswordModalOpen(false);
                    resetFormAndError();
                  }}
                >
                  Hủy
                </Button>
                <Button type="submit">Xác nhận</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Sidebar>
  );
}