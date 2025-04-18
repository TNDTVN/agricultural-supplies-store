"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newPassword || !confirmPassword) {
            toast.error("Vui lòng nhập đầy đủ thông tin!", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }
        
        if (newPassword.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự!", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp!", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/accounts/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Đặt lại mật khẩu thất bại!");
            }

            toast.success("Đặt lại mật khẩu thành công! Bạn sẽ được chuyển hướng trong giây lát...", {
                position: "top-right",
                autoClose: 2000,
            });
            setTimeout(() => router.push("/"), 2000);
        } catch (err: any) {
            toast.error(err.message, {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    return (
        <div className="card shadow-lg border-0" style={{ width: "100%", maxWidth: "450px" }}>
            <div className="card-header bg-success text-white text-center py-4 rounded-top-3">
                <div className="d-flex justify-content-center align-items-center">
                    <i className="fas fa-leaf me-2" style={{ fontSize: "1.5rem" }}></i>
                    <h1 className="card-title mb-0 fs-3 fw-bold">FarmTech</h1>
                </div>
                <p className="mb-0 mt-2">Cửa hàng vật tư nông nghiệp</p>
            </div>
            
            <div className="card-body p-4 p-md-5">
                <h2 className="card-title text-center text-success mb-4 fw-bold">Đặt Lại Mật Khẩu</h2>
                
                <form onSubmit={handleResetPassword}>
                    <div className="mb-4">
                        <label htmlFor="newPassword" className="form-label fw-semibold">
                            Mật khẩu mới <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control border-end-0"
                                id="newPassword"
                                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <span
                                className="input-group-text bg-white cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                            </span>
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className="form-label fw-semibold">
                            Xác nhận mật khẩu <span className="text-danger">*</span>
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            id="confirmPassword"
                            placeholder="Nhập lại mật khẩu mới"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    
                    <div className="d-grid gap-2 mt-4">
                        <button
                            type="submit"
                            className="btn btn-success btn-lg fw-semibold py-2"
                            disabled={!newPassword || !confirmPassword}
                        >
                            <i className="fas fa-key me-2"></i>
                            Đặt lại mật khẩu
                        </button>
                    </div>
                </form>
            </div>
            
            <div className="card-footer text-center text-muted py-3 bg-light">
                <p className="mb-0 small">© 2025 FarmTech - Bảo lưu mọi quyền</p>
            </div>
            
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
                theme="colored"
            />
        </div>
    );
}