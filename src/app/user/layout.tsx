"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "./globals.css";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Trạng thái đăng nhập
  const router = useRouter();

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const role = sessionStorage.getItem("role");
    if (role) {
      setIsLoggedIn(true);
    }
  }, []);

  // Trong file RootLayout.jsx
  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const response = await fetch("http://localhost:8080/accounts/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username, password }),
          });

          if (!response.ok) {
              const errorText = await response.text(); // Lấy thông báo lỗi từ server
              throw new Error(errorText || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
          }

          const data = await response.json();
          const { accountID, role } = data;

          sessionStorage.setItem("accountID", accountID);
          sessionStorage.setItem("role", role);
          setIsLoggedIn(true);

          if (role === "ADMIN" || role === "EMPLOYEE") {
              router.push("/admin");
          } else if (role === "CUSTOMER") {
              alert("Đăng nhập thành công!");
              setIsLoginModalOpen(false);
          }
      } catch (err: any) {
          setError(err.message); // Hiển thị thông báo lỗi cụ thể từ server
      }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("accountID");
    sessionStorage.removeItem("role");
    setIsLoggedIn(false);
    alert("Đăng xuất thành công!");
    router.push("/user");
  };

  return (
    <html lang="vi">
      <body className="flex top-0 flex-col min-h-screen bg-white">
        <nav className="top-0 w-full flex items-center justify-between bg-green-700 p-4 text-white z-10">
          <div className="flex items-center gap-3">
            <Link href="/user" className="flex items-center gap-2">
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
          {isLoggedIn ? (
            <Button
              variant="outline"
              className="border-white text-black hover:bg-white hover:text-green-700"
              onClick={handleLogout}
            >
              Đăng xuất
            </Button>
          ) : (
            <Button
              variant="outline"
              className="border-white text-black hover:bg-white hover:text-green-700"
              onClick={() => setIsLoginModalOpen(true)}
            >
              Đăng nhập
            </Button>
          )}
        </nav>

        {/* Modal Đăng Nhập */}
        {isLoginModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-bold mb-4">Đăng Nhập</h2>
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <Input
                    placeholder="Tên đăng nhập"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <Input
                    type="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsLoginModalOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button type="submit">Đăng nhập</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <main>{children}</main>
        <footer className="bottom-0 w-full bg-green-700 p-4 text-center text-white">
          © 2025 Cửa Hàng Vật Tư Nông Nghiệp
        </footer>
      </body>
    </html>
  );
}