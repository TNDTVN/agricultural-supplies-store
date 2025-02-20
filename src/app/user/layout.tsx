import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="flex top-0 flex-col min-h-screen bg-gray-100">
          <nav className="top-0 w-full flex items-center justify-between bg-green-700 p-4 text-white z-10">
                <h1 className="text-xl font-bold">FarmTech</h1>
                <a href={"/admin"}>
                    <Button variant="outline" className="border-white text-black hover:bg-white hover:text-green-700">
                        Đăng nhập
                    </Button>
                </a>
            </nav>
            <main>
              {children}
            </main>
            <footer className="bottom-0 w-full bg-green-700 p-4 text-center text-white">
                &copy; 2025 Cửa Hàng Vật Tư Nông Nghiệp
            </footer>
      </body>
    </html>
  );
}
