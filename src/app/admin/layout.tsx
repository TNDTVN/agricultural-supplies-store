import { AppSidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { CustomSidebarTrigger } from "@/components/ui/CustomSidebarTrigger";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
                    <Link href={"/user"}>
                        <Button variant="outline" className="border-white text-black hover:bg-white hover:text-green-700">
                            Thoát
                        </Button>
                    </Link>
                </nav>
                <main>
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