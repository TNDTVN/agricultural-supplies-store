"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Thêm useRouter
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter(); // Khởi tạo router

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const role = sessionStorage.getItem("role");
    if (role) {
      setIsLoggedIn(true);
      // Nếu đã đăng nhập và là ADMIN/EMPLOYEE, chuyển hướng ngay lập tức
      if (role === "ADMIN" || role === "EMPLOYEE") {
        router.push("/admin");
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/accounts/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }

      const data = await response.json();
      const { accountID, role } = data;

      sessionStorage.setItem("accountID", accountID);
      sessionStorage.setItem("role", role);
      setIsLoggedIn(true);
      alert("Đăng nhập thành công!");
      setIsLoginModalOpen(false);

      // Chuyển hướng nếu là ADMIN hoặc EMPLOYEE
      if (role === "ADMIN" || role === "EMPLOYEE") {
        router.push("/admin");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("accountID");
    sessionStorage.removeItem("role");
    setIsLoggedIn(false);
    alert("Đăng xuất thành công!");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Tìm kiếm: ${searchQuery}`);
    }
  };

  return (
    <html lang="vi">
      <body className="flex flex-col min-h-screen bg-white">
        <nav className="w-full flex items-center justify-between bg-green-700 p-4 text-white z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
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
            </div>
            <button className="hover:underline">Trang chủ</button>
            <button className="hover:underline">Cửa hàng</button>
            <button className="hover:underline">Giỏ hàng</button>
            {isLoggedIn && (
              <>
                <button className="hover:underline">Lịch sử mua hàng</button>
                <button className="hover:underline">Sản phẩm đã mua</button>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="flex items-center">
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-black w-64 bg-white"
              />
              <Button type="submit" className="ml-2 bg-white text-green-700 hover:bg-gray-200">
                Tìm
              </Button>
            </form>

            <div className="relative">
              <Button
                variant="outline"
                className="border-white text-black hover:bg-white hover:text-green-700"
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              >
                Tài khoản
              </Button>

              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg z-20">
                  {isLoggedIn ? (
                    <>
                      <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                        Profile
                      </button>
                      <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                        Đổi mật khẩu
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setIsLoginModalOpen(true);
                          setIsAccountMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Đăng nhập
                      </button>
                      <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                        Đăng ký
                      </button>
                      <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                        Quên mật khẩu
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
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