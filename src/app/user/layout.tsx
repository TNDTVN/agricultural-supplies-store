"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

interface AuthContextType {
  setIsLoginModalOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Khởi tạo searchQuery từ URL khi component mount
  useEffect(() => {
    const keywordFromUrl = searchParams.get("keyword");
    if (keywordFromUrl) {
      setSearchQuery(decodeURIComponent(keywordFromUrl));
    }
  }, []);

  // Cập nhật tiêu đề trang khi route thay đổi
  const getPageTitle = (path: string) => {
    const titleMap: { [key: string]: string } = {
      "/user": "FarmTech - Trang chủ",
      "/user/product": "Chi tiết sản phẩm",
      "/user/contact": "Liên hệ",
      "/user/cart": "Giỏ hàng",
      "/user/notifications": "Thông báo",
      "/user/shop": "Cửa hàng",
      "/user/purchased-products": "Sản phẩm đã mua",
      "/user/history": "Lịch sử mua hàng",
      "/user/profile": "Thông tin cá nhân",
    };
    return (
      titleMap[path] ||
      (path.startsWith("/user/product/") ? "FarmTech - Chi tiết sản phẩm" : "FarmTech")
    );
  };

  useEffect(() => {
    document.title = getPageTitle(pathname);
  }, [pathname]);

  // Kiểm tra trạng thái đăng nhập khi tải lại trang
  useEffect(() => {
    const role = sessionStorage.getItem("role");
    if (role) {
      setIsLoggedIn(true);
      if (role === "ADMIN" || role === "EMPLOYEE") {
        router.push("/admin");
      }
    }
  }, [router]);

  useEffect(() => {
    const justLoggedOutFlag = sessionStorage.getItem("justLoggedOut");
    if (justLoggedOutFlag === "true" && pathname === "/user" && !isLoggedIn) {
      toast.success("Đăng xuất thành công!", {
        position: "top-right",
        autoClose: 3000,
      });
      sessionStorage.removeItem("justLoggedOut");
    }
  }, [pathname, isLoggedIn]);

  const handleLogout = () => {
    sessionStorage.removeItem("accountID");
    sessionStorage.removeItem("role");
    sessionStorage.setItem("justLoggedOut", "true");
    setIsLoggedIn(false);
    resetFormAndError();
    router.push("/user");
  };

  const resetFormAndError = () => {
    setError("");
    setUsername("");
    setPassword("");
    setFullName("");
    setPhone("");
    setEmail("");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Đang xử lý, vui lòng đợi...", {
      position: "top-right",
    });

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
      setIsLoginModalOpen(false);
      resetFormAndError();

      toast.update(toastId, {
        render: "Đăng nhập thành công!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      if (role === "ADMIN" || role === "EMPLOYEE") {
        sessionStorage.setItem("justLoggedIn", "true");
        router.push("/admin");
      }
    } catch (err: any) {
      toast.update(toastId, {
        render: err.message,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      setError(err.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Đang xử lý, vui lòng đợi...", {
      position: "top-right",
    });

    try {
      const response = await fetch("http://localhost:8080/accounts/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, fullName, phone, email }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
      }

      toast.update(toastId, {
        render: "Đăng ký thành công! Vui lòng đăng nhập.",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      setIsRegisterModalOpen(false);
      setIsLoginModalOpen(true);
      resetFormAndError();
    } catch (err: any) {
      toast.update(toastId, {
        render: err.message,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      setError(err.message);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Đang xử lý, vui lòng đợi...", {
      position: "top-right",
    });

    try {
      const response = await fetch("http://localhost:8080/accounts/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, phone }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không tìm thấy email.");
      }

      toast.update(toastId, {
        render: "Link đặt lại mật khẩu đã được gửi qua email!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      setIsForgotPasswordModalOpen(false);
      setIsLoginModalOpen(true);
      resetFormAndError();
    } catch (err: any) {
      toast.update(toastId, {
        render: err.message,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      setError(err.message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Đang xử lý, vui lòng đợi...", {
      position: "top-right",
    });

    if (newPassword !== confirmPassword) {
      toast.update(toastId, {
        render: "Mật khẩu mới và xác nhận mật khẩu không khớp!",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
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

      toast.update(toastId, {
        render: "Đổi mật khẩu thành công!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      setIsChangePasswordModalOpen(false);
      resetFormAndError();
    } catch (err: any) {
      toast.update(toastId, {
        render: err.message,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      setError(err.message);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
        const params = new URLSearchParams();
        params.set("keyword", searchQuery.trim());
        router.push(`/user/shop?${params.toString()}`);
    } else {
        toast.info("Vui lòng nhập từ khóa tìm kiếm!", {
            position: "top-right",
            autoClose: 3000,
        });
    }
  };

  return (
    <AuthContext.Provider value={{ setIsLoginModalOpen, searchQuery, setSearchQuery }}>
      <html lang="vi">
        <body className="flex flex-col min-h-screen bg-white">
          <nav className="fixed top-0 left-0 w-full flex items-center justify-between bg-green-700 p-4 text-white z-10 shadow-md">
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
              <Link href={"/user"}><button className="hover:underline">Trang chủ</button></Link>
              <Link href={"/user/shop"}><button className="hover:underline">Cửa hàng</button></Link>
              {isLoggedIn && (
                <>
                  <Link href={"/user/cart"}>
                    <button className="hover:underline">Giỏ hàng</button>
                  </Link>
                  <Link href="/user/history">
                    <button className="hover:underline">Lịch sử mua hàng</button>
                  </Link>
                  <Link href="/user/purchased-products">
                    <button className="hover:underline">Sản phẩm đã mua</button>
                  </Link>
                </>
              )}
              <Link href={"/user/contact"}><button className="hover:underline">Liên hệ</button></Link>
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
                        <Link href="/user/profile">
                          <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Thông tin cá nhân</button>
                        </Link>
                        <Link href={"/user/notifications"}>
                          <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Thông Báo</button>
                        </Link>
                        <button
                          onClick={() => {
                            setIsChangePasswordModalOpen(true);
                            setIsAccountMenuOpen(false);
                            resetFormAndError();
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
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
                            resetFormAndError();
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Đăng nhập
                        </button>
                        <button
                          onClick={() => {
                            setIsRegisterModalOpen(true);
                            setIsAccountMenuOpen(false);
                            resetFormAndError();
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Đăng ký
                        </button>
                        <button
                          onClick={() => {
                            setIsForgotPasswordModalOpen(true);
                            setIsAccountMenuOpen(false);
                            resetFormAndError();
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
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
                  <div className="mb-4 relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {error && <p className="text-red-500 mb-4">{error}</p>}
                  <div className="flex justify-between mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoginModalOpen(false);
                        setIsForgotPasswordModalOpen(true);
                        resetFormAndError();
                      }}
                      className="text-blue-500 hover:underline"
                    >
                      Quên mật khẩu?
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoginModalOpen(false);
                        setIsRegisterModalOpen(true);
                        resetFormAndError();
                      }}
                      className="text-blue-500 hover:underline"
                    >
                      Đăng ký
                    </button>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsLoginModalOpen(false);
                        resetFormAndError();
                      }}
                    >
                      Hủy
                    </Button>
                    <Button type="submit">Đăng nhập</Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Đăng Ký */}
          {isRegisterModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Đăng Ký</h2>
                <form onSubmit={handleRegister}>
                  <div className="mb-4">
                    <Input
                      placeholder="Tên đăng nhập"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="mb-4 relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                  <div className="mb-4">
                    <Input
                      placeholder="Họ tên"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <Input
                      placeholder="Số điện thoại"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <Input
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-red-500 mb-4">{error}</p>}
                  <div className="flex justify-between mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterModalOpen(false);
                        setIsLoginModalOpen(true);
                        resetFormAndError();
                      }}
                      className="text-blue-500 hover:underline"
                    >
                      Đã có tài khoản? Đăng nhập
                    </button>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsRegisterModalOpen(false);
                        resetFormAndError();
                      }}
                    >
                      Hủy
                    </Button>
                    <Button type="submit">Đăng ký</Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Quên Mật Khẩu */}
          {isForgotPasswordModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Quên Mật Khẩu</h2>
                <form onSubmit={handleForgotPassword}>
                  <div className="mb-4">
                    <Input
                      placeholder="Tên đăng nhập"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <Input
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <Input
                      placeholder="Số điện thoại"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-red-500 mb-4">{error}</p>}
                  <div className="flex justify-between mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPasswordModalOpen(false);
                        setIsLoginModalOpen(true);
                        resetFormAndError();
                      }}
                      className="text-blue-500 hover:underline"
                    >
                      Quay lại đăng nhập
                    </button>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsForgotPasswordModalOpen(false);
                        resetFormAndError();
                      }}
                    >
                      Hủy
                    </Button>
                    <Button type="submit">Gửi yêu cầu</Button>
                  </div>
                </form>
              </div>
            </div>
          )}

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
                      {showOldPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500" />
                      )}
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
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500" />
                      )}
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
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500" />
                      )}
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

          <main className="pt-[96px]">{children}</main>
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
          <footer className="bottom-0 w-full bg-green-700 p-4 text-center text-white">
            © 2025 Cửa Hàng Vật Tư Nông Nghiệp
          </footer>
        </body>
      </html>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContext.Provider");
  }
  return context;
}