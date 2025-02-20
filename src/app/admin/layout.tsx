import { AppSidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Admin Dashboard",
    description: "Trang quản trị FarmTech",
};
export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <html>
        <body className="flex top-0 flex-col min-h-screen bg-gray-100">
            <SidebarProvider>
            <AppSidebar />
            <div className="flex-row w-full">
                <nav className="top-0 w-full flex items-center justify-between bg-green-700 p-4 text-white z-10">
                <h1 className="text-xl font-bold">FarmTech</h1>
                <a href={"/user"}>
                    <Button variant="outline" className="border-white text-black hover:bg-white hover:text-green-700">
                    Thoát
                    </Button>
                </a>
                </nav>
                <main>
                <SidebarTrigger />
                {children}
                </main>
                <footer className="bottom-0 w-full bg-green-700 p-4 text-center text-white">
                &copy; 2025 Cửa Hàng Vật Tư Nông Nghiệp
                </footer>
            </div>
            </SidebarProvider>
        </body>
        </html>
    );
}