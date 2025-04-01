"use client";
import { AppSidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { CustomSidebarTrigger } from "@/components/ui/CustomSidebarTrigger";
import { SidebarProvider } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

export default function AdminLayout({
    children,
    }: {
    children: React.ReactNode;
    }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [justLoggedIn, setJustLoggedIn] = useState(false);
    const [justLoggedOut, setJustLoggedOut] = useState(false);

    // Cập nhật tiêu đề trang khi route thay đổi
    const getPageTitle = (path: string) => {
        const titleMap: { [key: string]: string } = {
        "/admin": "Quản trị",
        "/admin/account": "Quản lý tài khoản",
        "/admin/category": "Quản lý danh mục",
        "/admin/product": "Quản lý sản phẩm",
        "/admin/supplier": "Quản lý nhà cung cấp",
        };

        return (
        titleMap[path] ||
        (path.startsWith("/admin/product/") ? "Quản lý sản phẩm" : "FarmTech")
        );
    };

    useEffect(() => {
        document.title = getPageTitle(pathname);
    }, [pathname]);

    useEffect(() => {
        const role = sessionStorage.getItem("role");
        if (role === "ADMIN" || role === "EMPLOYEE") {
        setIsLoggedIn(true);
        // Kiểm tra nếu vừa đăng nhập từ RootLayout
        const justLoggedInFlag = sessionStorage.getItem("justLoggedIn");
        if (justLoggedInFlag === "true") {
            setJustLoggedIn(true);
            sessionStorage.removeItem("justLoggedIn"); // Xóa cờ sau khi sử dụng
        }
        } else {
        router.push("/user");
        }
    }, [router]);

    const handleLogout = () => {
        sessionStorage.removeItem("accountID");
        sessionStorage.removeItem("role");
        sessionStorage.setItem("justLoggedOut", "true"); // Đặt cờ tạm thời trong sessionStorage
        setIsLoggedIn(false);
        router.push("/user"); // Chuyển hướng về trang chủ sau khi đăng xuất
    };

    // Cập nhật useEffect (chỉ giữ logic đăng nhập)
    useEffect(() => {
        if (pathname === "/admin" && isLoggedIn && justLoggedIn) {
            toast.success("Đăng nhập thành công!", {
            position: "top-right",
            autoClose: 3000,
            });
            setJustLoggedIn(false); // Reset trạng thái sau khi hiển thị toast
        }
    }, [pathname, isLoggedIn, justLoggedIn]);

    return (
        <html>
        <body className="flex flex-col min-h-screen bg-gray-100">
            <SidebarProvider>
            <AppSidebar />
            <div className="flex flex-col flex-1 w-full">
                <nav className="w-full flex items-center justify-between bg-green-700 p-4 text-white z-10">
                <div className="flex items-center gap-3">
                    <CustomSidebarTrigger />
                    <Link href="/admin" className="flex items-center gap-2">
                    <div className="relative w-16 h-16 ml-1 mr-1">
                        <Image
                        src="/images/trans_bg.png"
                        alt="Logo FarmTech"
                        width={64}
                        height={64}
                        className="object-contain rounded-full"
                        />
                    </div>
                    <h1 className="text-2xl font-bold">FarmTech</h1>
                    </Link>
                </div>
                {isLoggedIn && (
                    <Button
                    variant="outline"
                    className="border-white text-black hover:bg-white hover:text-green-700"
                    onClick={handleLogout}
                    >
                    Đăng xuất
                    </Button>
                )}
                </nav>
                <main className="flex-1">{children}</main>
                <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                />
                <footer className="w-full bg-green-700 p-4 text-center text-white">
                © 2025 Cửa Hàng Vật Tư Nông Nghiệp
                </footer>
            </div>
            </SidebarProvider>
        </body>
        </html>
    );
}